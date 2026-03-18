const express = require("express");

const providerController = require("./../controllers/providerController");
const Upload = require("../utils/uploadDoc");

const Router = express.Router();

Router.post('/register', Upload('document'), providerController.providerRegister);
Router.post('/login', providerController.providerLogin);

module.exports = Router;