const express = require("express");

const ProviderAuthController = require("../controllers/auth/ProviderAuthController");
const providerController = require("../controllers/providerController");
const Upload = require("../utils/upload/uploadDoc");
const userAuthCheck = require("../middleware/userAuthCheck");
const userController = require("../controllers/userController");

const Router = express.Router();

// ── Auth (no file upload at registration anymore) ──
Router.post("/register",Upload.single("document"), ProviderAuthController.providerRegister);
Router.post("/login", ProviderAuthController.providerLogin);
Router.patch("/password", userAuthCheck(['provider']), userController.updatePassword);

// ── All providers ──
Router.get("/", userAuthCheck(['admin']), providerController.getAllProvider);
Router.get("/:id", userAuthCheck(['admin', 'provider']), providerController.getProviderById);

Router.put("/:id", userAuthCheck(['provider']), providerController.updateProvider);
Router.delete("/:id", userAuthCheck(['admin', 'provider']), providerController.deleteProvider);

// ── Status / Approval ──
Router.patch("/approve/:id/:status", userAuthCheck(['admin']), providerController.approveProvider);
Router.patch("/available-status/:id", userAuthCheck(['provider']), providerController.availableUnavailableProvider);
Router.patch("/:id", userAuthCheck(['admin']), providerController.patchProviderStatus);

module.exports = Router;