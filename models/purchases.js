'use strict';

const mongoose = require("mongoose");
// const Int32 = require('mongoose-int32');

const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  userName: String,
  userId: mongoose.Schema.Types.ObjectId,
  userDepartment: String,
  paid: {
    type: Boolean,
    required: true,
    default: false,
  }
});

module.exports = mongoose.model("Purchase", purchaseSchema);
