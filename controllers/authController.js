const crypto = require("crypto");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const sendgridMailer = require("@sendgrid/mail");
const { registeredMessage, passwordResetMessage } = require("../util/messages");
const { timeIntervals } = require("../util/constants");
sendgridMailer.setApiKey(process.env.SENDGRID_API_KEY);

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
    }
  ).then((user) => {
    if (!user) {
      req.flash("matchError", true);
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
    res.render("auth/register", {
      path: "/register",
      firstname: req.flash("firstname")[0],
      lastname: req.flash("lastname")[0],
      emailTaken: req.flash("emailTaken")[0],
      email: req.flash("email")[0],
    });
  }
};

exports.postRegister = (req, res, next) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;
  const salt = 12;
  User.findOne({ email: email })
    .then((userDocExists) => {
      // check if a user with this email already exists
      if (userDocExists) {
        req.flash("emailTaken", true);
        req.flash("firstname", firstname);
        req.flash("lastname", lastname);
        req.flash("email", email);
        return res.redirect("/register");
      }
      return bcrypt
        .hash(password, salt)
        .then((hashedPassword) => {
          const user = new User({
            firstname: firstname,
            lastname: lastname,
            email: email,
            hashedPassword: hashedPassword,
            isAdmin: false,
            currentBalanceInCent: 0,
            cupsSinceLastPayment: 0,
          });
          return user.save();
        })
        .then((_) => {
          req.flash("justRegistered", true);
          res.redirect("/login");
          const emailMessage = registeredMessage(email, firstname, lastname);
          sendgridMailer.send(emailMessage).then(
            (_) => {},
            (error) => {
              console.log(error);
              if (error.response) {
                console.log(error.response.body);
              }
            }
          );
        });
    })
    .catch((err) => console.log(err));
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
