const express = require("express");

const serviceProviderController = require("./../controllers/serviceProviderController");
const UploadProfilePic = require("../utils/upload/uploadProfilePic");

const providerAuthCheck = require("../middleware/providerAuthCheck");
const userAuthCheck = require("../middleware/userAuthCheck");
const adminAuthCheck = require("../middleware/adminAuthCheck");

const Router = express.Router();

Router.post('/add', UploadProfilePic.single('profile-pic'), providerAuthCheck, serviceProviderController.addServiceProvider);
Router.get('/all', serviceProviderController.getAllServiceProvider);
Router.get('/', userAuthCheck(['admin', 'provider']), serviceProviderController.getProviderORServiceWiseServiceProvider);
Router.get('/single/:serviceProviderId', serviceProviderController.getSpecificServiceProvider);
Router.put('/update/:serviceProviderId', UploadProfilePic.single('profile-pic'), providerAuthCheck, serviceProviderController.updateServiceProvider);
Router.patch('/update/status/:serviceProviderId', userAuthCheck(['admin', 'provider']), serviceProviderController.updateServiceProviderStatusAndAvailability);
Router.delete('/delete/:serviceProviderId', userAuthCheck(['admin', 'provider']), serviceProviderController.deleteServiceProviderById);
Router.delete('/delete', adminAuthCheck, serviceProviderController.deleteServiceProvider);

module.exports = Router;