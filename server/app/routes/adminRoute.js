const express = require("express");

const adminController = require("../controllers/AdminController");
const authCheck = require("../middleware/authCheck");

const Router = express.Router();

// Auth
Router.post("/register", adminController.adminRegister);
Router.post("/login", adminController.adminLogin);

// Users
Router.get("/users", authCheck, adminController.getAllUsers);
Router.put("/block/:id", authCheck, adminController.blockUnblockUser);
Router.delete("/delete-user/:id", authCheck, adminController.deleteUser);

// Services
Router.post("/service", authCheck, adminController.createService);
Router.get("/services", authCheck, adminController.getAllServices);
Router.put("/service-toggle/:id", authCheck, adminController.toggleService);
Router.delete("/service/:id", authCheck, adminController.deleteService);

// Providers
Router.put("/approve-provider/:id", authCheck, adminController.approveProvider);
Router.get("/providers", authCheck, adminController.getAllProviders);

// Bookings
Router.get("/bookings", authCheck, adminController.getAllBookings);
Router.put("/booking-status/:id", authCheck, adminController.updateBookingStatus);

// Ratings
Router.get("/ratings", authCheck, adminController.getAllRatings);
Router.delete("/rating/:id", authCheck, adminController.deleteRating);

module.exports = Router;