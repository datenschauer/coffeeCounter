const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/home", (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render("home", { session: req.session });
  } else {
    res.redirect("/");
  }
});

router.post("/add-coffee", userController.postAddCoffee);

router.get("/status", userController.getUserStatus);

router.get("/", (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("index", { session: req.session });
  }
});

module.exports = router;
