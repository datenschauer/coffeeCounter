'use strict';

exports.isLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect("/login");
  }
  next();
};

exports.setLocalVariables = (req, res, next) => {
  res.locals.session = req.session;
  res.locals.csrfToken = req.csrfToken();
  next();
};
