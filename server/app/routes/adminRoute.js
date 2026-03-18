const express = require("express");

const adminController = require("./../controllers/adminController");

const Router = express.Router();

Router.post('/register',adminController.adminRegister);
Router.post('/login',adminController.adminLogin);

module.exports = Router;