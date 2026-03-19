const express = require("express");

const ratingController = require("../controllers/RatingController");
const authCheck = require("../middleware/authCheck");

const Router = express.Router();

// Customer
Router.post("/", authCheck, ratingController.giveRating);

// Public / Provider
Router.get("/:providerId", ratingController.getRatingsByProvider);

module.exports = Router;