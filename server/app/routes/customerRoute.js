const express = require("express");

const customerController = require("../controllers/customerController");
const authCheck = require("../middleware/authCheck");

const Router = express.Router();

// Auth
Router.post("/register", customerController.customerRegister);
Router.post("/login", customerController.customerLogin);

// Profile
Router.get("/", authCheck, customerController.getCustomer);
Router.get("/:id", authCheck, customerController.getCustomerById);
Router.put("/:id", authCheck, customerController.updateCustomer);
Router.delete("/:id", authCheck, customerController.deleteCustomer);

module.exports = Router;