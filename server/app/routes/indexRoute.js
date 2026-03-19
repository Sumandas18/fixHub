const express = require("express");

const adminRoute = require("./adminRoute");
const customerRoute = require("./customerRoute");
const providerRoute = require("./providerRoute");
const bookingRoute = require("./bookingRoute");
const ratingRoute = require("./ratingRoute");

const Router = express.Router();

Router.use("/admin", adminRoute);
Router.use("/customer", customerRoute);
Router.use("/provider", providerRoute);
Router.use("/booking", bookingRoute);
Router.use("/rating", ratingRoute);


module.exports = Router;