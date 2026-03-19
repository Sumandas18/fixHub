const express = require("express");

const adminController = require("../controllers/AdminController");
const userAuthCheck = require("../middleware/userAuthCheck");


const Router = express.Router();

// Auth
Router.post("/register", adminController.adminRegister);
Router.post("/login", adminController.adminLogin);

// Users
Router.get("/users", userAuthCheck(['admin']), adminController.getAllUsers);
Router.put("/block/:id", userAuthCheck(['admin']), adminController.blockUnblockUser);
Router.delete("/delete-user/:id", userAuthCheck(['admin']), adminController.deleteUser);

// Services
Router.post("/service", userAuthCheck(['admin']), adminController.createService);
Router.get("/services", userAuthCheck(['admin']), adminController.getAllServices);
Router.put("/service-toggle/:id", userAuthCheck(['admin']), adminController.toggleService);
Router.delete("/service/:id", userAuthCheck(['admin']), adminController.deleteService);

// Providers
Router.put("/approve-provider/:id", userAuthCheck(['admin']), adminController.approveProvider);
Router.get("/providers", userAuthCheck(['admin']), adminController.getAllProviders);

// Bookings
Router.get("/bookings", userAuthCheck(['admin']), adminController.getAllBookings);
Router.put("/booking-status/:id", userAuthCheck(['admin']), adminController.updateBookingStatus);

// Ratings
Router.get("/ratings", userAuthCheck(['admin']), adminController.getAllRatings);
Router.delete("/rating/:id", userAuthCheck(['admin']), adminController.deleteRating);

module.exports = Router;