const express = require("express");

const userController = require("./../controllers/userController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/verify", userController.verifyOTP);

// Profile 
Router.get("/profile", userAuthCheck(['admin', 'provider', 'customer']), userController.fetchProfile);
Router.patch("/password", userAuthCheck(['admin', 'provider', 'customer']), userController.updatePassword);

Router.put("/status/:id", userAuthCheck(['admin']), userController.blockUnblockUser);

module.exports = Router;