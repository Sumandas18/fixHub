const express = require("express");

const adminRoute = require("./adminRoute");
const customerRoute = require("./customerRoute");
const providerRoute = require("./providerRoute");
const userRoute = require("./userRoute");
const serviceRoute = require("./serviceRoute");
const serviceProviderRoute = require("./serviceProviderRoute");
const bookingRoute = require("./bookingRoute");
const ratingRoute = require("./ratingRoute");
const tokenRoute = require("./tokenRoute");

const Router = express.Router();

Router.use("/admin", adminRoute);
Router.use("/customer", customerRoute);
Router.use("/provider", providerRoute);
Router.use("/user", userRoute);
Router.use("/service", serviceRoute);
Router.use("/service-provider", serviceProviderRoute);
Router.use("/booking", bookingRoute);
Router.use("/rating", ratingRoute);
Router.use("/token", tokenRoute);

module.exports = Router;