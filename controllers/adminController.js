'use strict';

const User = require("../models/user");

/**
 * find all users which are billable (are active and have a balance > 0)
 * @param fieldsString => fields which should be returned from db
 * @returns mongooseSchema
 */
const getBillableUsers = (fieldsString) => {
  return User.find({
    isActive: true,
    currentBalanceInCent: { $gt: 0 },
  }, fieldsString) // string of fields to be returned by db
}

exports.getAdminUserManagement = (req, res, next) => {
  // get all users, which are active and have a currentBalanceInCent > 0
  getBillableUsers("firstname lastname department currentBalanceInCent paymentPending")
    .then((users) => {
    res.render("admin/users", {
      path: "/admin/users",
      users: users,
    })
  }).catch(err => console.log(err));
};

exports.postBillUsers = (req, res, next) => {
  getBillableUsers("firstname email currentBalanceInCent cupsSinceLastPayment")
    .then((users) =>{

    }).catch(err => console.log(err));
};