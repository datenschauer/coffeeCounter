'use strict';

const mongoose = require("mongoose");
// const Int32 = require('mongoose-int32');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  lastLogin: Date,
  confirmToken: String,
  resetToken: String,
  tokenExpirationDate: Date,
  lastPayment: Date,
  paymentPending: Boolean,
  currentBalanceInCent: Number,
  cupsSinceLastPayment: Number,
  department: String,
  drinks: [
    {
      date: {
        type: Date,
        required: true,
      },
      cups: {
        type: Number,
        required: true,
      },
      withMilk: {
        type: Boolean,
        required: true,
      },
      priceInCent: {
        type: Number,
        required: true,
      },
    },
  ],
  payments: [
    {
      billDate: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      payed: {
        type: Boolean,
        default:  false,
      },
      payedDate: Date,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
