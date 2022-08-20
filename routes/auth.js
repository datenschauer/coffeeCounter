const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/register", authController.getRegister);

router.post("/register", check("email").isEmail(), authController.postRegister);

router.post("/logout", isLoggedIn, authController.postLogout);

router.get("/resetpassword", authController.getReset);

router.post("/resetpassword", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
