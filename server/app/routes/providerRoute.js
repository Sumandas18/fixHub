const express = require("express");

const providerController = require("./../controllers/providerController");
const UploadDoc = require("../utils/upload/uploadDoc");

const Router = express.Router();

Router.post('/register', UploadDoc.single('document'), providerController.providerRegister);
Router.post('/login', providerController.providerLogin);

module.exports = Router;