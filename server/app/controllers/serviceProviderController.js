const cloudinary = require("cloudinary");

const StatusCode = require('../utils/statusCode');
const createServiceProviderValidation = require('../utils/validation/create/checkCreateServiceProviderValidation');
const updateServiceProviderValidation = require('../utils/validation/update/checkUpdateServiceProviderValidation');
const serviceProviderModel = require('./../models/serviceProviderModel');

class ServiceProviderController {

    async addServiceProvider(req, res) {
        try {
            let profile_img, profile_img_url;

            const { service_id, service_area_zip, experience, charges_per_hour } = req.body;
            const provider = req.user;

            if (!service_id || !service_area_zip || !experience || !charges_per_hour) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            if (!provider) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not available"
                });
            }

            const { data, error } = createServiceProviderValidation.validate({ service_area_zip, experience, charges_per_hour })
            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            if (req.file) {
                profile_img = req.file.filename;
                profile_img_url = req.file.path;
            }

            const serviceProviderObj = new serviceProviderModel({
                provider_id: provider.user_id, service_id, service_area_zip, profile_img, profile_img_url, experience, charges_per_hour
            });

            const serviceProvider = await serviceProviderObj.save();

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Service added successfully"
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getAllServiceProvider(req, res) {
        try {
            const allServiceProvider = await serviceProviderModel.find();

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "All available service-provider",
                count: allServiceProvider.length,
                data: allServiceProvider
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getProviderORServiceWiseServiceProvider(req, res) {
        try {
            let fetchServiceProvider;
            const { provider_id, service_id } = req.body;

            if (provider_id) {
                fetchServiceProvider = await serviceProviderModel.find({ provider_id });
            }

            if (service_id) {
                fetchServiceProvider = await serviceProviderModel.find({ service_id });
            }

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Filter wise available service-provider",
                count: fetchServiceProvider.length,
                data: fetchServiceProvider
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getSpecificServiceProvider(req, res) {
        try {
            const serviceProviderId = req.params.serviceProviderId;

            if (!serviceProviderId) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: 'Service provider ID not available'
                });
            }

            const specificServiceProvider = await serviceProviderModel.findById(serviceProviderId);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "specific service-provider details",
                data: specificServiceProvider
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async updateServiceProvider(req, res) {
        try {

            let profile_img, profile_img_url, serviceProviderObj;

            const serviceProviderId = req.params.serviceProviderId;

            if (!serviceProviderId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Service-provider ID not available"
                });
            }

            const { data, error } = updateServiceProviderValidation.validate(req.body);
            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            const specificServiceProvider = await serviceProviderModel.findById(serviceProviderId);

            serviceProviderObj = req.body;

            if (req.file) {
                await cloudinary.uploader.destroy(specificServiceProvider.profile_img);

                profile_img = req.file.filename;
                profile_img_url = req.file.path;

                serviceProviderObj = { ...serviceProviderObj, profile_img_url, profile_img };
            }

            const serviceProvider = await serviceProviderModel.findByIdAndUpdate(serviceProviderId, serviceProviderObj, { new: true });

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Service updated successfully"
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async updateServiceProviderAvailability(req, res) {
        try {
            const serviceProviderId = req.params.serviceProviderId;

            if (!serviceProviderId) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: 'Service provider ID not available'
                });
            }

            const serviceProvider = await serviceProviderModel.findById(serviceProviderId);

            serviceProvider.isAvailable = !serviceProvider.isAvailable;

            serviceProvider.save();

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Service status updated successfully"
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async deleteServiceProviderById(req, res) {
        try {
            const serviceProviderId = req.params.serviceProviderId;

            if (!serviceProviderId) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Service-provider ID not available"
                });
            }

            const specificServiceProvider = await serviceProviderModel.findById(serviceProviderId);

            if (!specificServiceProvider) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "Invalid service-provider ID"
                });
            }

            await cloudinary.uploader.destroy(specificServiceProvider.profile_img);
            await serviceProviderModel.findByIdAndDelete(serviceProviderId);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Service-provider deleted successfully"
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async deleteServiceProvider(req, res) {
        try {
            const { provider_id, service_id } = req.body;

            if (provider_id) {
                await serviceProviderModel.deleteMany({ provider_id });
            }

            if (service_id) {
                await serviceProviderModel.deleteMany({ service_id });
            }

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Service-provider deleted successfully"
            });
        }
        catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = new ServiceProviderController();