'use strict';

require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGO_TESTDB_URI;
const User = require("./models/user");
const casual = require("casual");
const user_amount = 15;

mongoose.connect(MONGODB_URI).then((_) => {
  for (let i = 0; i < user_amount; i++) {
    const cups = casual.integer(3, 30);
    const balance = cups * 25;
    let user = new User({
      firstname: casual.first_name,
      lastname: casual.last_name,
      email: casual.email,
      department: "hilbert",
      hashedPassword: casual.password,
      isAdmin: false,
      isActive: true,
      confirmToken: casual.word,
      currentBalanceInCent: balance,
      cupsSinceLastPayment: cups,
    });
    user.save();
  }
}).catch(err => console.log(err));
