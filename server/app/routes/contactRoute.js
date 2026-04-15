const express = require("express");

const contactController = require("../controllers/contactController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

// Public: submit a contact message
Router.post("/add", contactController.createContact);

// Admin: fetch messages
Router.get("/:status", contactController.getAllContactMessage);
Router.get("/message/:messageId", contactController.getSpecificContactMessage);

// Admin: reply to a message — messageId now in URL params
Router.put("/reply/:messageId", userAuthCheck(['admin']), contactController.addComment);

// Admin: deny a message
Router.put("/deny/:messageId", userAuthCheck(['admin']), contactController.denyComment);

module.exports = Router;