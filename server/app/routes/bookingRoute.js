const express = require("express");

const bookingController = require("../controllers/BookingController");
const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

// Customer
Router.post("/", userAuthCheck(['customer']), bookingController.createBooking);
Router.get("/my", userAuthCheck(['customer']), bookingController.getMyBookings);
Router.put("/cancel/:id", userAuthCheck(['customer']), bookingController.cancelBooking);

// Provider
Router.put("/status/:id", userAuthCheck(['provider']), bookingController.updateBookingStatus);

module.exports = Router;