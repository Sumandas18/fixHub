const express = require("express");

const bookingController = require("../controllers/BookingController");
const authCheck = require("../middleware/authCheck");

const Router = express.Router();

// Customer
Router.post("/", authCheck, bookingController.createBooking);
Router.get("/my", authCheck, bookingController.getMyBookings);
Router.put("/cancel/:id", authCheck, bookingController.cancelBooking);

// Provider
Router.put("/status/:id", authCheck, bookingController.updateBookingStatus);

module.exports = Router;