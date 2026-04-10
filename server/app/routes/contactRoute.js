const express = require("express");

const contactController = require("../controllers/contactController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

Router.post("/add", contactController.createContact);

Router.get("/:status", contactController.getAllContactMessage);
Router.get("/message/:messageId", contactController.getSpecificContactMessage);

Router.put("/reply", userAuthCheck(['admin']), contactController.addComment);

Router.put("/deny/:messageId", userAuthCheck(['admin']), contactController.denyComment);

module.exports = Router;