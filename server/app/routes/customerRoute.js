const express = require("express");

const customerController = require("../controllers/customerController");
const CustomerAuthController = require("../controllers/auth/CustomerAuthController");
const userController = require("./../controllers/userController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/register", CustomerAuthController.customerRegister);
Router.post("/login", CustomerAuthController.customerLogin);
Router.post("/verify", userController.verifyOTP);

Router.get("/", userAuthCheck(['admin']), customerController.getAllCustomer);
Router.get("/:id", userAuthCheck(['admin', 'customer']), customerController.getCustomerById);

// Profile 
Router.get("/profile", userAuthCheck(['customer']), userController.fetchProfile);
Router.patch("/password", userAuthCheck(['customer']), userController.updatePassword);

Router.put("/:id", userAuthCheck(['customer']), customerController.updateCustomer);
Router.patch("/:id", userAuthCheck(['admin']), userController.blockUnblockUser);
Router.delete("/:id", userAuthCheck(['admin', 'customer']), customerController.deleteCustomer);

module.exports = Router;