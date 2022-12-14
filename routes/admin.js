"use strict";

const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.get("/admin", isAdmin, (req, res, next) => {
  res.redirect("/admin/users");
});

router.get("/admin/users", isAdmin, adminController.getAdminUserManagement);

router.post("/admin/bill-users", isAdmin, adminController.postBillUsers);

router.post("/admin/user-payed/:userid/:paymentid", isAdmin, adminController.postUserPayed);

router.get("/admin/purchases", isAdmin, adminController.getAdminPurchaseManagement);

router.post("/admin/payed-user-for/:purchaseid", isAdmin, adminController.postPurchasePayed);

// TEMP!
router.get("/admin/add-coffee", isAdmin, adminController.getAdminAddCoffee);
router.post("/admin/add-coffee/:userid", isAdmin, adminController.postAdminAddCoffee);

module.exports = router;