'use strict';

const User = require("../models/user");
const Register = require("../models/register");
const Purchase = require("../models/purchases");
const { receiveBill } = require("../util/messages");
const sendgridMailer = require("@sendgrid/mail");
const { convertStringToCent } = require("../util/calc");
const { timeIntervals, PRICE_PER_CUP, PRICE_FOR_MILK } = require("../util/constants");
sendgridMailer.setApiKey(process.env.SENDGRID_API_KEY);

exports.getAdminUserManagement = (req, res) => {
  Promise.all([
    getBillableUsers("firstname lastname department currentBalanceInCent"),
    getUsersWithPaymentPending("firstname lastname department payments")
  ]).then(([billableUsers, pendingUsers]) => {
            res.render("admin/users", {
              path: "/admin/users",
              billableUsers: billableUsers,
              pendingUsers: pendingUsers,
            });
          }).catch(err => console.log(err));
};

exports.postBillUsers = (req, res) => {
  getBillableUsers("firstname email currentBalanceInCent cupsSinceLastPayment payments")
    .then((users) => {
      for (let user of users) {
        const firstname = user.firstname;
        const email = user.email;
        const cupsSinceLastPayment = user.cupsSinceLastPayment;
        const billedAmountInCent = user.currentBalanceInCent;
        const emailMessage = receiveBill(
          firstname,
          email,
          cupsSinceLastPayment,
          billedAmountInCent,
        );
          sendgridMailer.send(emailMessage).then(
            (_) => {},
            (error) => {
              console.log(error);
              if (error.response) {
                console.log(error.response.body);
              }
            }
          );
          user.cupsSinceLastPayment = 0;
          user.currentBalanceInCent = 0;
          user.paymentPending = true;
          user.payments.push({
            billDate: new Date(),
            amount: billedAmountInCent,
            payed: false,
          });
          user.save().then(res.redirect("/admin/users"));
      }
    }).catch(err => console.log(err));
};

exports.postUserPayed = (req, res) => {
  const userId = req.params.userid;
  const paymentId = req.params.paymentid;
  const amount = convertStringToCent(req.body.amount);
  User.findById(userId)
  .then(user => {
    const result = user.payments.find(({ _id }) => String(_id) === paymentId);
    result.payed = true;
    result.payedDate = new Date();
    const anyOpenPayments = user.payments.find(({ payed }) => !payed);
    if (!anyOpenPayments) {
      user.paymentPending = false;
    }
    user.save()
      .then(_ => {
        Register.findOne({name: "Coffee Cup"})
          .then(register => {
            let dt = new Date()
            register.balance += amount;
            const payment = {
              date: new Date(dt.getTime() + timeIntervals.HOUR * 2),
              amount: amount,
              paymentType: "DEPOSIT",
              userId: user._id,
              userName: `${user.firstname} ${user.lastname}`,
              userDepartment: user.department,
            }
            register.payments.push(payment);
            register.save()
              .then(_ => {
                return res.redirect("/admin/users");
              }).catch(err => console.log(err))
          })
      })
  }).catch(err => console.log(err));
};

exports.getAdminPurchaseManagement = (req, res) => {
  Purchase.find({ paid: false })
    .then(purchases => {
      console.log(purchases);
      res.render("admin/purchases", {
        path: "/admin/purchases",
        purchases: purchases,
      });
    })
    .catch(err => console.log(err));
}

// temp!
exports.getAdminAddCoffee = (req, res) => {
  res.render("admin/add-coffee", {
    path: "/admin/add-coffee",
  })
}

exports.postAdminAddCoffee = (req, res) => {
  User.findById(String(req.params.userid)).then(user => {
    const drink = {
      date: new Date(req.body.date),
      cups: Number(req.body.amount),
      withMilk: true,
      priceInCent: Number(req.body.amount) * (PRICE_PER_CUP + PRICE_FOR_MILK),
    }
    user.currentBalanceInCent += drink.priceInCent;
    user.cupsSinceLastPayment += drink.cups;
    user.drinks.push(drink);
    user.save().then(_ => {
      return res.redirect("/home");
    })
  }).catch(err => {console.log(err)})
}

/**
 * find all users which are billable (are active and have a balance > 0)
 * @param fieldsString "field1 field2 ..." => fields which should be returned from db
 * @returns mongooseSchema
 */
function getBillableUsers(fieldsString) {
  return User.find({
    isActive: true,
    currentBalanceInCent: { $gt: 0 },
    paymentPending: false,
  }, fieldsString) // string of fields to be returned by db
}

/**
 * find all users which have a payment pending
 * @param fieldsString "field1 field2 ..." => fields which should be returned from db
 * @returns mongooseSchema
 */
function getUsersWithPaymentPending(fieldsString) {
  return User.find({
    isActive: true,
    paymentPending: true,
  }, fieldsString) // string of fields to be returned by db
}