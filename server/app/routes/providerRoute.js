const express = require("express");

const ProviderAuthController = require("../controllers/auth/ProviderAuthController");
const providerController = require("../controllers/providerController");
const Upload = require("../utils/upload/uploadDoc");
const userController = require("../controllers/userController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/register", Upload.single("document"), ProviderAuthController.providerRegister);
Router.post("/login", ProviderAuthController.providerLogin);

// All 
Router.get("/", userAuthCheck(['admin']), providerController.getAllProvider);
Router.get("/:id", userAuthCheck(['admin', 'provider']), providerController.getProviderById);

// Profile
Router.get("/profile", userAuthCheck(['provider']), userController.fetchProfile);
Router.patch("/password", userAuthCheck(['provider']), userController.updatePassword);

Router.put("/:id", userAuthCheck(['provider']), providerController.updateProvider);
Router.delete("/:id", userAuthCheck(['admin', 'provider']), providerController.deleteProvider);

// Status 
Router.patch("/approve/:id", userAuthCheck(['admin']), providerController.approveProvider);
Router.patch("/status/:id", userAuthCheck(['admin']), providerController.blockUnblockProvider);
Router.patch("/available-status/:id", userAuthCheck(['provider']), providerController.availableUnavailableProvider);


module.exports = Router;