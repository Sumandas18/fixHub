const express = require("express");

const providerController = require("../controllers/providerController");
const Upload = require("../utils/uploadDoc");
const authCheck = require("../middleware/authCheck");

const Router = express.Router();

// Auth
Router.post("/register", Upload("document"), providerController.providerRegister);
Router.post("/login", providerController.providerLogin);

// Profile
Router.get("/", authCheck, providerController.getProvider);
Router.get("/:id", authCheck, providerController.getProviderById);
Router.put("/:id", authCheck, Upload("document"), providerController.updateProvider);
Router.delete("/:id", authCheck, providerController.deleteProvider);

module.exports = Router;