'use strict';

exports.get404 = (req, res, next) => {
  res.status(404).render("coffee-not-found", { session: req.session });
};

exports.get500 = (req, res, next) => {
  return res.status(500).render("something-went-wrong", { session: req.session });
}
