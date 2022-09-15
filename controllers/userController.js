'use strict';

const User = require("../models/user");
const Purchase = require("../models/purchases");
const { validationResult } = require("express-validator")
const { calcPrice, formatCurrency, convertStringToCent } = require("../util/calc");
const { PRICE_PER_CUP, PRICE_FOR_MILK, timeIntervals } = require("../util/constants")

exports.getUserStatus = (req, res, next) => {
  User.findOne({ _id: req.session.user._id }).then((user) => {
    const anyPayments = getOpenPayments(user.payments);
    let payments;
    if (anyPayments) {
      payments = anyPayments;
    }  else {
      payments = [];
    }
    res.render("status", {
      balance: formatCurrency(user.currentBalanceInCent),
      cups: user.cupsSinceLastPayment,
      priceCoffee: formatCurrency(PRICE_PER_CUP),
      priceMilk: formatCurrency(PRICE_FOR_MILK),
      paymentPending: user.paymentPending,
      payments: payments,
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
      let dt = new Date();
      dt = new Date(dt.getTime() + timeIntervals.HOUR * 2);
      user.drinks.push({
        date: dt,
        cups: cups,
        withMilk: milk,
        priceInCent: price,
      });
      user.cupsSinceLastPayment = currentCups + cups;
      user.currentBalanceInCent = currentBalance + price;
      user.save().then(res.redirect("/status"));
    })
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

exports.getPurchase = (req, res) => {
  res.render("purchase", {
    firstname: req.session.user.firstname,
    priceError: req.flash("priceError")[0],
  })
};

exports.postPurchase = (req, res) => {
  const description = req.body.description;
  const priceString = req.body.price;
  if (!priceString.match(/(^\d+[,.]\d{1,2}$)|(^\d+$)/)) {
    req.flash("priceError", true);
    return res.redirect("/purchase");
  } else {
    let dt = new Date();
    dt = new Date(dt.getTime() + timeIntervals.HOUR * 2);
    let price = null;
    try {
      if (priceString.includes(",")) {
        price = convertStringToCent(priceString);
      } else {
        price = convertStringToCent(priceString, ".");
      }
    } catch (e) {
      console.log(e);
    }
    User.findOne({ _id: req.session.user._id }).then((user) => {
      const purchase = new Purchase({
        description: description,
        price: price,
        date: dt,
        userName: `${user.firstname} ${user.lastname}`,
        userId: user._id,
        userDepartment: user.department,
        paid: false,
      });
      return purchase.save()
        .then(_ => res.redirect("/home"))
        .catch(err => console.log(err));
    }).catch(err => console.log(err));
  }};

/**
 * A function to find open payments of an individual user
 */
function getOpenPayments(payments) {
  const openPayments = payments.find((payment) => {
    return !payment.payed;
  })
  return openPayments ? openPayments : undefined;
}