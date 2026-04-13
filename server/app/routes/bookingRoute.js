const express = require("express");

const bookingController = require("../controllers/BookingController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();

Router.post("/", userAuthCheck(['customer']), bookingController.createBooking);

Router.get("/", userAuthCheck(['admin']), bookingController.getAllBookings);
Router.get("/provider", userAuthCheck(['provider']), bookingController.getProviderBookings);
Router.get("/customer", userAuthCheck(['customer']), bookingController.getCustomerBookings);

Router.put("/cancel/:id", userAuthCheck(['provider', 'customer']), bookingController.cancelBooking);

Router.put("/status/:id", userAuthCheck(['provider']), bookingController.updateBookingStatus);

Router.put("/resend-otp", userAuthCheck(['provider']), bookingController.resendBookingOTP);
Router.put("/verify-otp", userAuthCheck(['provider']), bookingController.verifyBookingOTP);

Router.patch("/:id", userAuthCheck(['admin']), bookingController.patchBookingStatus);

module.exports = Router;