const express = require("express");

const adminRoute = require("./adminRoute");
const customerRoute = require("./customerRoute");
const providerRoute = require("./providerRoute");
const serviceProviderRoute = require("./serviceProviderRoute");

const Router = express.Router();

Router.use('/admin', adminRoute);
Router.use('/customer', customerRoute);
Router.use('/provider', providerRoute);
Router.use('/service-provider', serviceProviderRoute);

module.exports = Router;