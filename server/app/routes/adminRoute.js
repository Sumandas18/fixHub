const express = require("express");

const AdminAuthController = require("../controllers/auth/AdminAuthController");
const adminController = require("../controllers/adminController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/register", AdminAuthController.adminRegister);
Router.post("/login", AdminAuthController.adminLogin);

Router.get("/", userAuthCheck(['admin']), adminController.getAllAdmins);
Router.delete("/delete/:id", userAuthCheck(['admin']), adminController.deleteAdmin);

Router.post("/verify", adminController.verifyAdminOTP);
Router.post("/resend", adminController.adminResendOTP);

// Profile 
Router.patch("/password", userAuthCheck(['admin']), adminController.updateAdminPassword);

Router.put("/status/:id", userAuthCheck(['admin']), adminController.blockUnblockAdmin);

module.exports = Router;