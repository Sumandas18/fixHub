const express = require("express");

const serviceProviderController = require("./../controllers/serviceProviderController");
const UploadProfilePic = require("../utils/upload/uploadProfilePic");

const Router = express.Router();

Router.post('/add', UploadProfilePic.single('profile-pic'), serviceProviderController.addServiceProvider);
Router.get('/all', serviceProviderController.getAllServiceProvider);
Router.get('/', serviceProviderController.getProviderORServiceWiseServiceProvider);
Router.get('/single/:serviceProviderId', serviceProviderController.getSpecificServiceProvider);
Router.put('/update/:serviceProviderId', UploadProfilePic.single('profile-pic'), serviceProviderController.updateServiceProvider);
Router.patch('/update/status/:serviceProviderId', serviceProviderController.updateServiceProviderStatusAndAvailability);
Router.delete('/delete/:serviceProviderId', serviceProviderController.deleteServiceProviderById);
Router.delete('/delete', serviceProviderController.deleteServiceProvider);

module.exports = Router;