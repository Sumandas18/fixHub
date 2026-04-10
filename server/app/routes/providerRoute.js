const express = require("express");

const ProviderAuthController = require("../controllers/auth/ProviderAuthController");
const providerController = require("../controllers/providerController");
const Upload = require("../utils/upload/uploadDoc");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/register", Upload.single("document"), ProviderAuthController.providerRegister);
Router.post("/login", ProviderAuthController.providerLogin);

// All 
Router.get("/", userAuthCheck(['admin']), providerController.getAllProvider);
Router.get("/:id", userAuthCheck(['admin', 'provider']), providerController.getProviderById);


Router.put("/:id", userAuthCheck(['provider']), providerController.updateProvider);
Router.delete("/:id", userAuthCheck(['admin', 'provider']), providerController.deleteProvider);

// Status 
Router.patch("/approve/:id/:status", userAuthCheck(['admin']), providerController.approveProvider);
Router.patch("/available-status/:id", userAuthCheck(['provider']), providerController.availableUnavailableProvider);


module.exports = Router;