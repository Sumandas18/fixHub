const express = require("express");

const serviceProviderController = require("./../controllers/serviceProviderController");
const UploadProfilePic = require("../utils/upload/uploadProfilePic");

const userAuthCheck = require("../middleware/userAuthCheck");
const userController = require("../controllers/userController");

const Router = express.Router();

Router.post('/add', userAuthCheck(['provider']), UploadProfilePic.single('profile-pic'), serviceProviderController.addServiceProvider);
Router.patch('/complete-profile', userAuthCheck(['provider']), UploadProfilePic.single('profile-pic'), serviceProviderController.completeProfile);

Router.get('/all', serviceProviderController.getAllServiceProvider);
Router.get('/', userAuthCheck(['admin', 'provider', 'customer']), serviceProviderController.getProviderORServiceWiseServiceProvider);

Router.get('/single/:serviceProviderId', serviceProviderController.getSpecificServiceProvider);

Router.put('/update/:serviceProviderId', UploadProfilePic.single('profile-pic'), userAuthCheck(['provider']), serviceProviderController.updateServiceProvider);
Router.patch('/update/status/:serviceProviderId', userAuthCheck(['admin', 'provider']), serviceProviderController.updateServiceProviderAvailability);
Router.put("/status/:id", userAuthCheck(['admin']), userController.blockUnblockUser);

Router.delete('/delete/:serviceProviderId', userAuthCheck(['admin', 'provider']), serviceProviderController.deleteServiceProviderById);
Router.delete('/delete', userAuthCheck(['admin']), serviceProviderController.deleteServiceProvider);

module.exports = Router;