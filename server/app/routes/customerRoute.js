const express = require("express");

const customerController = require("./../controllers/customerController");

const Router = express.Router();

Router.post('/register',customerController.customerRegister);
Router.post('/login',customerController.customerLogin);

module.exports = Router;