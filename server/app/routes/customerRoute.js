const express = require("express");

const customerController = require("../controllers/customerController");
const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

// Auth
Router.post("/register", customerController.customerRegister);
Router.post("/login", customerController.customerLogin);

// Profile
Router.get("/", userAuthCheck(['customer']), customerController.getCustomer);
Router.get("/:id", userAuthCheck(['customer']), customerController.getCustomerById);
Router.put("/:id", userAuthCheck(['customer']), customerController.updateCustomer);
Router.delete("/:id", userAuthCheck(['customer']), customerController.deleteCustomer);

module.exports = Router;