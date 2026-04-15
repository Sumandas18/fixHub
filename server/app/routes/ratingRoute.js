const express = require("express");

const ratingController = require("../controllers/RatingController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

Router.post("/create", userAuthCheck(['customer']), ratingController.giveRating);
Router.get("/", ratingController.getAllRatings);
Router.get("/:providerId", ratingController.getRatingsByProvider);
Router.delete("/rating/:id", userAuthCheck(['admin']), ratingController.deleteRating);

module.exports = Router;