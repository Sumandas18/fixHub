const cloudinary = require("cloudinary");
const mongoose = require('mongoose');

const StatusCode = require('../utils/statusCode');
const createServiceProviderValidation = require('../utils/validation/create/checkCreateServiceProviderValidation');
const updateServiceProviderValidation = require('../utils/validation/update/checkUpdateServiceProviderValidation');
const userModel = require('./../models/userModel');
const serviceProviderModel = require('./../models/serviceProviderModel');
const sendOTPMails = require("../utils/sendMail");

class ServiceProviderController {

    async addServiceProvider(req, res) {
        try {
            let profile_img, profile_img_url;

            let { service_id, service_area_zip, experience, charges_per_hour } = req.body;
            const provider = req.user;

            const user = await userModel.findById(provider.user_id);

            if (!service_id || !service_area_zip || !experience || !charges_per_hour) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            if (!provider || !user || user.user_role != 'provider') {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider not available"
                });
            }

            if (typeof service_area_zip === "string") {
                service_area_zip = [service_area_zip];
            }

            const { data, error } = createServiceProviderValidation.validate({ service_area_zip, experience, charges_per_hour })
            if (error) {
                console.log(error)
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            if (req.file) {
                profile_img = req.file.filename;
                profile_img_url = req.file.path;
            }

            const existingServiceProvider = await serviceProviderModel.findOne({ provider_id: provider.user_id });
            console.log('provider', existingServiceProvider);

            existingServiceProvider.service_id = service_id;
            existingServiceProvider.service_area_zip = service_area_zip;
            existingServiceProvider.profile_img = profile_img;
            existingServiceProvider.profile_img_url = profile_img_url;
            existingServiceProvider.experience = experience;
            existingServiceProvider.charges_per_hour = charges_per_hour;

            const updatedProvider = await existingServiceProvider.save();

            await sendOTPMails({ user, provider: updatedProvider, type: "providerStatus" });

            return res.status(StatusCode.CREATED).json({
                success: true,
                message: "Service added successfully",
                data: updatedProvider
            });
        }
        catch (err) {
            console.log(err);

            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async completeProfile(req, res) {
        try {
            const provider_id = req.user.user_id || req.user._id;
            const { service_id, service_area_zip, experience, charges_per_hour } = req.body;
            let profile_img, profile_img_url;

            if (!service_id || !service_area_zip || !experience || !charges_per_hour) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All required fields must be filled"
                });
            }

            const { data, error } = updateServiceProviderValidation.validate({ service_area_zip, experience, charges_per_hour });
            if (error) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: error.details.map(err => err.message)
                });
            }

            let serviceProviderObj = {
                service_id, service_area_zip, experience, charges_per_hour, isProfileCompleted: true, status: 'pending'
            };

            if (req.file) {
                profile_img = req.file.filename;
                profile_img_url = req.file.path;
                serviceProviderObj = { ...serviceProviderObj, profile_img, profile_img_url };
            }

            // The profile should already exist from registration
            const serviceProvider = await serviceProviderModel.findOneAndUpdate(
                { provider_id },
                serviceProviderObj,
                { new: true }
            );

            if (!serviceProvider) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Provider profile not found"
                });
            }

            // Dispatch Email indicating it's under review
            const sendOTPMails = require("../utils/sendMail");
            sendOTPMails({ user: req.user, provider: serviceProvider, type: "providerStatus" }).catch(console.error);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Profile completed successfully. Awaiting admin approval.",
                data: serviceProvider
            });

        } catch (err) {
            res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }


    async getAllServiceProvider(req, res) {
        try {
            const allServiceProvider = await serviceProviderModel.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "provider_id",
                        foreignField: "_id",
                        as: "provider"
                    }
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service_id",
                        foreignField: "_id",
                        as: "service"
                    }
                },
                {
                    $unwind: "$provider"
                },
                {
                    $unwind: "$service"
                }
            ])

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
            // Default to empty array — GET requests carry no body,
            // so provider_id / service_id may both be absent.
            let fetchServiceProvider = [];

            // Handle null provider by checking req.user if it is a provider
            let provider_id = req.user?.user_role === 'provider' ? (req.user.user_id || req.user._id) : (req.query?.provider_id || req.body?.provider_id);
            let service_id = req.query?.service_id || req.body?.service_id;

            if (provider_id) {
                fetchServiceProvider = await serviceProviderModel
                    .find({ provider_id })
                    .populate('service_id') || [];
            } else if (service_id) {
                // For users requesting providers by service, only show approved providers with completed profiles
                fetchServiceProvider = await serviceProviderModel.aggregate([
                    {
                        $match: {
                            service_id: new mongoose.Types.ObjectId(service_id)
                        }
                    },
                    {
                        $match: {
                            status: "approved"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "provider_id",
                            foreignField: "_id",
                            as: "provider"
                        }
                    },
                    {
                        $lookup: {
                            from: "services",
                            localField: "service_id",
                            foreignField: "_id",
                            as: "service"
                        }
                    },
                    {
                        $unwind: "$provider"
                    },
                    {
                        $unwind: "$service"
                    },
                    {
                        $lookup: {
                            from: "serviceratings",
                            localField: "provider_id",
                            foreignField: "provider_id",
                            as: "ratings"
                        }
                    },
                    {
                        $addFields: {
                            averageRating: { $avg: "$ratings.stars" },
                            ratingsCount: { $size: "$ratings" }
                        }
                    }
                ])
            }

            // console.log('fetchServiceProvider', fetchServiceProvider);
            // Always return empty array if no services
            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Filter wise available service-provider",
                count: fetchServiceProvider?.length || 0,
                data: fetchServiceProvider || []
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

            await serviceProvider.save();

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