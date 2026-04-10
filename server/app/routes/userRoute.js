const express = require("express");

const userController = require("./../controllers/userController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/resend", userController.resendOTP);
Router.post("/verify", userController.verifyOTP);
Router.get("/logout", userController.userLogout);

// Profile 
Router.get("/profile", userAuthCheck(['provider', 'customer']), userController.fetchProfile);
Router.patch("/password", userAuthCheck(['provider', 'customer']), userController.updatePassword);

Router.put("/status/:id", userAuthCheck(['admin']), userController.blockUnblockUser);

module.exports = Router;