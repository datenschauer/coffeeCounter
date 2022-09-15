'use strict';

const mongoose = require("mongoose");
// const Int32 = require('mongoose-int32');

const Schema = mongoose.Schema;

const registerSchema = new Schema({
  balance: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: "Coffee Cup"
  },
  payments: [
    {
      date: Date,
      amount: Number,
      paymentType: {
        type: String,
        enum: ["DEPOSIT", "WITHDRAWAL"],
        required: true,
      },
      description: String,
      userId: String,
      userName: String,
      userDepartment: String,
    }
  ]
});

module.exports = mongoose.model("Register", registerSchema);


