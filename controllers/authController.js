const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("auth/login", {
      path: "/login",
      pageTitle: "Login Café Sedanstraße",
      session: req.session,
    });
  }
};

exports.postLogin = (req, res, next) => {
  User.findOne(
    { email: req.body.email },
    {
      firstname: 1,
      lastname: 1,
      isAdmin: 1,
    }
  ).then((user) => {
    user.lastLogin = Date();
    user.save();
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      console.log(err);
      res.redirect("/home");
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
      session: req.session,
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
      if (userDocExists) {
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
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};
