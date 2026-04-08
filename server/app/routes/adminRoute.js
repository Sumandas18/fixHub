const express = require("express");


const AdminAuthController = require("../controllers/auth/AdminAuthController");
const adminController = require("../controllers/adminController");
const userController = require("./../controllers/userController");
const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

// Auth
Router.post("/register", AdminAuthController.adminRegister);
Router.post("/login", AdminAuthController.adminLogin);
Router.post("/verify", userController.verifyOTP);

// Profile 
Router.get("/profile", userAuthCheck(['admin']), userController.fetchProfile);
Router.patch("/password", userAuthCheck(['admin']), userController.updatePassword);

Router.get("/", userAuthCheck(['admin']), adminController.getAllAdmins);
Router.put("/status/:id", userAuthCheck(['admin']), userController.blockUnblockUser);
Router.delete("/delete/:id", userAuthCheck(['admin']), adminController.deleteAdmin);

module.exports = Router;