// const express = require("express");


// const AdminAuthController = require("../controllers/auth/AdminAuthController");
// const adminController = require("../controllers/adminController");
// const userController = require("./../controllers/userController");
// const userAuthCheck = require("../middleware/userAuthCheck");


// const Router = express.Router();

// // Auth
// Router.post("/register", AdminAuthController.adminRegister);
// Router.post("/login", AdminAuthController.adminLogin);

// Router.get("/", userAuthCheck(['admin']), adminController.getAllAdmins);
// Router.delete("/delete/:id", userAuthCheck(['admin']), adminController.deleteAdmin);

// Router.post("/verify", adminController.verifyAdminOTP);
// Router.post("/resend", adminController.adminResendOTP);

// // Profile 
// Router.patch("/password", userAuthCheck(['admin']), adminController.updateAdminPassword);

// Router.put("/status/:id", userAuthCheck(['admin']), adminController.blockUnblockAdmin);

// module.exports = Router;





const express = require("express");

const AdminAuthController = require("../controllers/auth/AdminAuthController");
const adminController = require("../controllers/AdminController");
const userAuthCheck = require("../middleware/userAuthCheck");

const Router = express.Router();
const Upload = require("../utils/upload/uploadDoc");


// ================== AUTH ==================

// Register Admin
Router.post("/register", Upload.fields([{ name: 'profile_img', maxCount: 1 }, { name: 'signature_img', maxCount: 1 }]), AdminAuthController.adminRegister);

// Login Admin
Router.post("/login", AdminAuthController.adminLogin);

// Verify OTP
Router.post("/verify", adminController.verifyAdminOTP);

// Resend OTP
Router.post("/resend", adminController.adminResendOTP);


// ================== ADMIN PROTECTED ==================

Router.get("/", userAuthCheck(['admin']), adminController.getAllAdmins);

Router.delete("/delete/:id", userAuthCheck(['admin']), adminController.deleteAdmin);

// Update Password
Router.patch("/password", userAuthCheck(['admin']), adminController.updateAdminPassword);

// Block / Unblock
Router.put("/status/:id", userAuthCheck(['admin']), adminController.blockUnblockAdmin);


module.exports = Router;