const express = require("express");

const providerController = require("../controllers/providerController");
const Upload = require("../utils/upload/uploadDoc");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Auth
Router.post("/register", Upload.single("document"), providerController.providerRegister);
Router.post("/login", providerController.providerLogin);

// Profile
Router.get("/", userAuthCheck(['provider']), providerController.getProvider);
Router.get("/:id", userAuthCheck(['provider']), providerController.getProviderById);
Router.put("/:id", userAuthCheck(['provider']), Upload.single("document"), providerController.updateProvider);
Router.delete("/:id", userAuthCheck(['provider']), providerController.deleteProvider);


module.exports = Router;