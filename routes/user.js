'use strict';

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/home", isLoggedIn, (req, res, next) => {
  res.render("home", {user: req.session.user});
});

router.post("/add-coffee", isLoggedIn, userController.postAddCoffee);

router.get("/status", isLoggedIn, userController.getUserStatus);

router.get("/account", isLoggedIn, userController.getUserAccount);

router.post("/account", isLoggedIn, userController.postUserAccount);

router.get("/", (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("index");
  }
});

module.exports = router;
