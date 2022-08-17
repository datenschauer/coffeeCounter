const express = require("express");
const router = express.Router();

router.get("/home", (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render("home", { session: req.session });
  } else {
    res.redirect("/");
  }
});

router.post("/add-coffee", (req, res, next) => {
  console.log(req.body);
  res.redirect("/thanks", { session: req.session });
});

router.get("/thanks", (req, res, next) => {
  res.send("THANKS");
});

router.get("/", (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.redirect("/home");
  } else {
    res.render("index", { session: req.session });
  }
});

module.exports = router;
