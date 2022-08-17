const User = require("../models/user");

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
  console.log(req.body);
  User.findOne({ email: req.body.email }).then((user) => {
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
