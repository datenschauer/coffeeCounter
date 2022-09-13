'use strict';

const crypto = require("crypto");
const User = require("../models/user");
const { timeIntervals } = require("../util/constants")
const { receiveBill } = require("../util/messages");
const sendgridMailer = require("@sendgrid/mail");
const mongoose = require("mongoose");
const { convertStringToCent } = require("../util/calc");
sendgridMailer.setApiKey(process.env.SENDGRID_API_KEY);

exports.getAdminUserManagement = (req, res, next) => {
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

exports.postBillUsers = (req, res, next) => {
  getBillableUsers("firstname email currentBalanceInCent cupsSinceLastPayment payments")
    .then((users) => {
      for (let user of users) {
        const firstname = user.firstname;
        const email = user.email;
        const cupsSinceLastPayment = user.cupsSinceLastPayment;
        const currentBalanceInCent = user.currentBalanceInCent;
        const emailMessage = receiveBill(
          firstname,
          email,
          cupsSinceLastPayment,
          currentBalanceInCent,
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
          user.paymentPending = true;
          user.payments.push({
            billDate: new Date(),
            amount: currentBalanceInCent,
            payed: false,
          });
          user.save().then(res.redirect("/admin/users"));
      }
    }).catch(err => console.log(err));
};

exports.postUserPayed = (req, res, next) => {
  const userId = req.params.userid;
  const paymentId = req.params.paymentid;
  const amount = convertStringToCent(req.body.amount);
  User.findById(userId).then((user) => {
    const result = user.payments.find(({ _id }) => String(_id) === paymentId);
    result.payed = true;
    result.payedDate = new Date();
    const anyOpenPayments = user.payments.find(({ payed }) => !payed);
    if (!anyOpenPayments) {
      user.paymentPending = false;
    }
    const currentBalance = user.currentBalanceInCent;
    user.currentBalanceInCent = currentBalance - amount;
    user.save().then((_) => {
      return res.redirect("/admin/users");
    }).catch(err => console.log(err))
  }).catch(err => console.log(err));
};

/**
 * find all users which are billable (are active and have a balance > 0)
 * @param fieldsString "field1 field2 ..." => fields which should be returned from db
 * @returns mongooseSchema
 */
function getBillableUsers(fieldsString) {
  return User.find({
    isActive: true,
    currentBalanceInCent: { $gt: 0 },
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
