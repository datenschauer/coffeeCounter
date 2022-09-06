'use strict';

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/register", authController.getRegister);

router.post("/register",
  [
    body("firstname").trim(),
    body("lastname").trim(),
    body('email')
      .isEmail()
      .withMessage('Bitte gib eine gültige E-Mail Adresse ein.')
      .normalizeEmail(),
    body("password").trim(),
  ],
  authController.postRegister);

router.post("/logout", isLoggedIn, authController.postLogout);

router.get("/resetpassword", authController.getReset);

router.post("/resetpassword", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.get("/confirm/:token", authController.getConfirm);

module.exports = router;
