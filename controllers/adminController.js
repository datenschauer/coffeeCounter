'use strict';

const crypto = require("crypto");
const User = require("../models/user");
const { timeIntervals } = require("../util/constants")
const { receiveBill } = require("../util/messages");
const sendgridMailer = require("@sendgrid/mail");
const mongoose = require("mongoose");
sendgridMailer.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * find all users which are billable (are active and have a balance > 0)
 * @param fieldsString "field1 field2 ..." => fields which should be returned from db
 * @returns mongooseSchema
 */
const getBillableUsers = (fieldsString) => {
  return User.find({
    isActive: true,
    currentBalanceInCent: { $gt: 0 },
  }, fieldsString) // string of fields to be returned by db
};

/**
 * find all users which have a payment pending
 * @param fieldsString "field1 field2 ..." => fields which should be returned from db
 * @returns mongooseSchema
 */
const getUsersWithPaymentPending = (fieldsString) => {
  return User.find({
    isActive: true,
    paymentPending: true,
  }, fieldsString) // string of fields to be returned by db
};

exports.getAdminUserManagement = (req, res, next) => {
  // get all users, which are active and have a currentBalanceInCent > 0
  getBillableUsers("firstname lastname department currentBalanceInCent")
    .then((billableUsers) => {
   getUsersWithPaymentPending("firstname lastname department payments")
     .then((pendingUsers) => {
       res.render("admin/users", {
         path: "/admin/users",
         billableUsers: billableUsers,
         pendingUsers: pendingUsers,
       });
     }
   ).catch(err => console.log(err));
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
          user.currentBalanceInCent = 0;
          user.paymentPending = true;
          user.payments.push({
            billDate: new Date(),
            amount: currentBalanceInCent,
            payed: false,
          });
          user.save();
      }
        return res.redirect("/admin/users");
    }).catch(err => console.log(err));
};

exports.postUserPayed = (req, res, next) => {
  const userId = req.params.userid;
  const paymentId = req.params.paymentid;
  User.findById(userId).then((user) => {
    const result = user.payments.find(({ _id }) => String(_id) === paymentId);
    result.payed = true;
    result.payedDate = new Date();
    const anyOpenPayments = user.payments.find(({ payed }) => !payed);
    if (!anyOpenPayments) {
      user.paymentPending = false;
    }
    user.save().then((_) => {
      res.redirect("/admin/users");
    }).catch(err => console.log(err))
  }).catch(err => console.log(err));
};