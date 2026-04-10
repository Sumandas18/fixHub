const express = require("express");


const AdminAuthController = require("../controllers/auth/AdminAuthController");
const adminController = require("../controllers/adminController");
const userController = require("./../controllers/userController");
const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

// Auth
Router.post("/register", AdminAuthController.adminRegister);
Router.post("/login", AdminAuthController.adminLogin);

Router.get("/", userAuthCheck(['admin']), adminController.getAllAdmins);
Router.delete("/delete/:id", userAuthCheck(['admin']), adminController.deleteAdmin);

module.exports = Router;