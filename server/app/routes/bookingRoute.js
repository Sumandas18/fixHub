const express = require("express");

const bookingController = require("../controllers/BookingController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

Router.post("/", userAuthCheck(['customer']), bookingController.createBooking);

Router.get("/", userAuthCheck(['admin']), bookingController.getAllBookings);
Router.get("/provider", userAuthCheck(['provider']), bookingController.getProviderBookings);
Router.get("/customer", userAuthCheck(['customer']), bookingController.getCustomerBookings);

Router.put("/cancel/:id", userAuthCheck(['provider','customer']), bookingController.cancelBooking);

Router.put("/status/:id", userAuthCheck(['provider']), bookingController.updateBookingStatus);

module.exports = Router;