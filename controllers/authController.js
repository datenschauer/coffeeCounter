'use strict';

const crypto = require("crypto");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const sendgridMailer = require("@sendgrid/mail");
const { validationResult } = require("express-validator")
const { registeredMessage, passwordResetMessage } = require("../util/messages");
const { timeIntervals } = require("../util/constants");
const passwordValidator = require("password-validator");
sendgridMailer.setApiKey(process.env.SENDGRID_API_KEY);
// reusable variable for state of forms and errors on register site
const registerContext = function(req) {
  return {
    path: "/register",
    firstname: req.flash("firstname")[0],
    lastname: req.flash("lastname")[0],
    emailTaken: req.flash("emailTaken")[0],
    emailValidationError: req.flash("emailValidationError")[0],
    email: req.flash("email")[0],
    passwordValidationError: req.flash("passwordValidationError")[0],
    tokenError: req.flash("tokenError")[0]
  };
};

exports.getLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("auth/login", {
      path: "/login",
      pageTitle: "Login Café Sedanstraße",
      matchError: req.flash("matchError")[0],
      loginError: req.flash("loginError")[0],
      justRegistered: req.flash("justRegistered")[0],
      resetMessage: req.flash("resetMessage")[0],
      passwordSavedMessage: req.flash("passwordSavedMessage")[0],
      emailConfirmed: req.flash("emailConfirmed")[0],
      userDeactivated: req.flash("userDeactivated")[0],
    });
  }
};

exports.postLogin = (req, res, next) => {
  // find user by email
  User.findOne(
    { email: req.body.email },
    {
      firstname: 1,
      lastname: 1,
      isAdmin: 1,
      hashedPassword: 1,
      isActive: 1,
    }
  ).then((user) => {
    if (!user) {
      req.flash("matchError", true);
      return res.redirect("/login");
    } else if (!user.isActive) {
      req.flash("userDeactivated", true);
      return res.redirect("/login");
    }
    // check if transmitted password is equal to stored password
    bcrypt
      .compare(req.body.password, user.hashedPassword)
      .then((doMatch) => {
        if (doMatch) {
          // save a new session
          req.session.user = user;
          req.session.isLoggedIn = true;
          req.session.save((err) => {
            console.log(err);
          });
          // set the current Date as last login
          user.lastLogin = new Date();
          return user
            .save()
            .then((_) => {
              // finally redirect the logged in user to /home
              res.redirect("/home");
            })
            .catch((err) => console.log(err));
        }
        // if passwords don't match, redirect to /login
        req.flash("matchError", true);
        res.redirect("/login");
      })
      // if anything goes wrong: redirect to /login
      .catch((err) => {
        req.flash("loginError", true);
        res.redirect("/login");
        console.log(err);
      });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getRegister = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("auth/register", registerContext(req));
  }
};

exports.postRegister = (req, res, next) => {
  const passwordSchema = new passwordValidator();
  passwordSchema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces()
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;
  const department = req.body.department;
  const salt = 12;
  let confirmToken;
  // validate Password
  if (!passwordSchema.validate(password)) {
    req.flash("passwordValidationError", true);
    setKeepNamesAndEmail(req, firstname, lastname, email);
    // set errors and redirect to register
    return setErrorStatusAndRedirect(req, res);
  }
  // validate E-Mail
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("emailValidationError", true);
    setKeepNamesAndEmail(req, firstname, lastname, email);
    // set errors and redirect to register
    return setErrorStatusAndRedirect(req, res);
  }
  User.findOne({ email: email })
    .then((userDocExists) => {
      // check if a user with this email already exists
      if (userDocExists) {
        req.flash("emailTaken", true);
        setKeepNamesAndEmail(req, firstname, lastname, email);
        return res.redirect("/register");
      }
      // generate the password hash
      return bcrypt
        .hash(password, salt)
        .then((hashedPassword) => {
          // We use nodes crypto library to generate a token.
          // Unfortunately, as 'randomBytes' is a void function, every
          // code following (like user creation, sending email) is wrapped
          // inside this function to keep asynchronicity.
          // Haven't found better solution still...
           crypto.randomBytes(32, (err, buffer) => {
            if (err) {
              console.log(err);
              req.flash("error", true);
              return res.redirect("/reset");
            }
            confirmToken = buffer.toString("hex");
            const user = new User({
              firstname: firstname,
              lastname: lastname,
              email: email,
              department: department,
              hashedPassword: hashedPassword,
              isAdmin: false,
              isActive: false,
              confirmToken: confirmToken,
              currentBalanceInCent: 0,
              cupsSinceLastPayment: 0,
            });
             req.flash("justRegistered", true);
             res.redirect("/login");
             const emailMessage = registeredMessage(email, firstname, lastname, confirmToken);
             sendgridMailer.send(emailMessage).then(
               (_) => {},
               (error) => {
                 console.log(error);
                 if (error.response) {
                   console.log(error.response.body);
                 }
               }
             );
          return user.save();
        })
        })
    })
    .catch((err) => console.log(err));
};

exports.getConfirm = (req, res, next) => {
  const token = req.params.token;
  console.log(token);
  User.findOne({ confirmToken: token }).then(
    user => {
      if (!user) {
        req.flash("tokenError", true);
        return res.redirect("/register");
      } else {
        user.isActive = true;
        user.confirmToken = undefined;
        return user.save();
      }
    }
  )
    .then(_ => {
      req.flash("emailConfirmed", true);
      res.redirect("/login");
    })
    .catch(err => console.log(err));
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/resetpassword",
    matchError: req.flash("matchError")[0],
    error: req.flash("error")[0],
    expiredError: req.flash("expiredError")[0],
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      req.flash("error", true);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    let resetUser;
    User.findOne({ email: req.body.email })
      .then((user) => {
        resetUser = user;
        if (!resetUser) {
          req.flash("matchError", true);
          res.redirect("/resetpassword");
        } else {
          resetUser.resetToken = token;
          resetUser.tokenExpirationDate =
            Date.now() + timeIntervals.MINUTE * 30;
          return user.save();
        }
      })
      .then((_) => {
        if (resetUser) {
          req.flash("resetMessage", true);
          res.redirect("/login");
          const emailMessage = passwordResetMessage(req.body.email, token);
          sendgridMailer.send(emailMessage).then(
            (_) => {},
            (error) => {
              console.log(error);
              if (error.response) {
                console.log(error.response.body);
              }
            }
          );
        }
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, tokenExpirationDate: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("expiredError", true);
        return res.redirect("/resetpassword");
      } else {
        res.render("auth/new-password", {
          path: "/new-password",
          error: req.flash("error")[0],
          userId: user._id.toString(),
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.newpassword;
  const userId = req.body.userId;
  let resetUser;
  User.findOne({ _id: userId })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.hashedPassword = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.tokenExpirationDate = undefined;
      return resetUser.save();
    })
    .then((_) => {
      req.flash("passwordSavedMessage", true);
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

/**
 * wrapper for setting status 422 and redirecting to register site
 * @param req Request
 * @param res Response
 * @returns set status 422 (Error) and redirect to register site
 */
function setErrorStatusAndRedirect(req, res) {
  return res.status(422).render("auth/register", registerContext(req));
}

/**
 * wrapper to keep firstname, lastname and email when redirecting to register site
 * @param req Request
 * @param firstname First Name
 * @param lastname Last Name
 * @param email E-Mail address
 */
function setKeepNamesAndEmail(req, firstname, lastname, email) {
  req.flash("firstname", firstname);
  req.flash("lastname", lastname);
  req.flash("email", email);
}
