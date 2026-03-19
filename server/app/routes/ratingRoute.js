const express = require("express");

const ratingController = require("../controllers/RatingController");
const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

// Customer
Router.post("/", userAuthCheck(['customer']), ratingController.giveRating);

// Public / Provider
Router.get("/:providerId", ratingController.getRatingsByProvider);

module.exports = Router;