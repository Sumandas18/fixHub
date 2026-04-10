const express = require("express");

const customerController = require("../controllers/customerController");
const CustomerAuthController = require("../controllers/auth/CustomerAuthController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/register", CustomerAuthController.customerRegister);
Router.post("/login", CustomerAuthController.customerLogin);

Router.get("/", userAuthCheck(['admin']), customerController.getAllCustomer);
Router.get("/:id", userAuthCheck(['admin', 'customer']), customerController.getCustomerById);

Router.put("/:id", userAuthCheck(['customer']), customerController.updateCustomer);
Router.delete("/:id", userAuthCheck(['admin', 'customer']), customerController.deleteCustomer);

module.exports = Router;