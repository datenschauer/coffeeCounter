'use strict';

const User = require("../models/user");
const { validationResult } = require("express-validator")
const { calcPrice, formatCurrency } = require("../util/calc");
const { PRICE_PER_CUP, PRICE_FOR_MILK } = require("../util/constants")

exports.getUserStatus = (req, res, next) => {
  User.findOne({ _id: req.session.user._id }).then((user) => {
    res.render("status", {
      balance: formatCurrency(user.currentBalanceInCent),
      cups: user.cupsSinceLastPayment,
      priceCoffee: formatCurrency(PRICE_PER_CUP),
      priceMilk: formatCurrency(PRICE_FOR_MILK),
    });
  });
};

exports.postAddCoffee = (req, res, next) => {
  const cups = Number(req.body.coffee);
  const milk = !!req.body.milk;
  const price = calcPrice(cups, milk);
  User.findOne({ _id: req.session.user._id })
    .then((user) => {
      const currentBalance = Number(user.currentBalanceInCent);
      const currentCups = Number(user.cupsSinceLastPayment);
      user.drinks.push({
        date: Date(),
        cups: cups,
        withMilk: milk,
        priceInCent: price,
      });
      user.cupsSinceLastPayment = currentCups + cups;
      user.currentBalanceInCent = currentBalance + price;
      return user.save();
    })
    .then(res.redirect("/status"))
    .catch((err) => console.log(err));
};

exports.getUserAccount = (req, res, next) => {
  User.findOne({ _id: req.session.user._id }).then((user) => {
      res.render("account", {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        department: user.department,
        emailTaken: req.flash("emailTaken")[0],
        emailValidationError: req.flash("emailValidationError")[0],
        success: req.flash("success")[0],
      })
    }
  ).catch(err => console.log(err));
};

exports.postUserAccount = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("emailValidationError", true);
    return res.redirect("/account")
  } else {
    User.findOne({email: req.body.email}).then((userExists) => {
      // check if new email is taken by someone else
      if (String(userExists._id) !== String(req.session.user._id)) {
        req.flash("emailTaken", true);
        return res.redirect("/account")
      } else {
        User.findOne({_id: req.session.user._id}).then((user) => {
          user.firstname = req.body.firstname;
          user.lastname = req.body.lastname;
          user.email = req.body.email;
          user.department = req.body.department;
          return user.save().then(_ => {
            // renew session
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save((err) => {
              console.log(err);
            });
            req.flash("success", true);
            res.redirect("/account")
          });
        }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  }
};
