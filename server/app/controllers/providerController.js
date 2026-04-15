const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const serviceProviderModel = require("../models/serviceProviderModel");
const checkUpdateProviderValidate = require("./../utils/validation/update/checkUpdateProviderValidation");
const sendOTPMails = require("../utils/sendMail");

class ProviderController {

  async getAllProvider(req, res) {
    try {
      // ── STEP 5 FIX: Only show providers who have completed their profile ──
      // Providers with isProfileCompleted = false are hidden from admin panel
      // until they submit their service/experience/rates via "Complete Profile"
      const providers = await userModel.aggregate([
        {
          $match: { user_role: "provider" }
        },
        {
          $lookup: {
            from: "serviceproviders",
            localField: "_id",
            foreignField: "provider_id",
            as: "service"
          }
        },
        {
          $unwind: "$service"
        },
        {
          // Only include providers who have completed their profile
          $match: { "service.isProfileCompleted": true }
        }
      ]);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "All available providers",
        count: providers.length,
        data: providers
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProviderById(req, res) {
    try {
      const providerId = req.params.id;
      if (!providerId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider ID not found"
        });
      }

      const provider = await userModel.findById(providerId);
      if (!provider) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider not found",
        });
      }

      // Also fetch service-provider profile
      const spProfile = await serviceProviderModel.findOne({ provider_id: providerId }).populate('service_id');

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Specific provider details",
        data: { ...provider.toObject(), serviceProfile: spProfile }
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProvider(req, res) {
    try {
      const providerId = req.params.id;

      if (req.user.user_role !== "provider" || req.user.user_id.toString() !== providerId) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { data, error } = checkUpdateProviderValidate.validate(req.body);
      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details.map(err => err.message)
        });
      }

      await userModel.findByIdAndUpdate(providerId, req.body, { new: true, runValidators: true });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Updated successfully"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteProvider(req, res) {
    try {
      const providerId = req.params.id;
      if (!providerId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider ID not found"
        });
      }

      if (req.user.user_role !== "admin" && req.user.user_id.toString() !== providerId) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await userModel.findByIdAndDelete(providerId);
      await serviceProviderModel.deleteMany({ provider_id: providerId });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Provider deleted successfully",
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async approveProvider(req, res) {
    try {
      const statusType = ["approved", "rejected"];
      const providerId = req.params.id;
      const status = req.params.status;

      if (!providerId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider ID not found"
        });
      }

      if (!statusType.includes(status)) {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "Invalid status type"
        });
      }

      const user = await userModel.findById(providerId);
      const provider = await serviceProviderModel.findOne({ provider_id: user._id });

      if (!user || user.user_role !== "provider" || !provider) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider not found"
        });
      }

      provider.status = status;
      await provider.save();

      // Non-blocking email
      sendOTPMails({ user, provider: { ...provider.toObject(), status }, type: "providerStatus" }).catch(console.error);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Provider ${status} successfully`
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async availableUnavailableProvider(req, res) {
    try {
      const providerId = req.params.id;
      if (!providerId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider ID is required"
        });
      }

      const provider = await userModel.findById(providerId);
      if (!provider) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider not found"
        });
      }

      if (provider.user_role !== 'provider') {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthenticated"
        });
      }

      provider.isAvailable = !provider.isAvailable;
      await provider.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Provider is ${provider.isAvailable ? "available" : "unavailable"}`
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async patchProviderStatus(req, res) {
    try {
      const providerId = req.params.id;
      const { status } = req.body;

      if (!providerId) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider ID not found"
        });
      }

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid status"
        });
      }

      const user = await userModel.findById(providerId);
      const provider = await serviceProviderModel.findOne({ provider_id: user?._id });

      if (!user || user.user_role !== "provider" || !provider) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider not found"
        });
      }

      provider.status = status;
      await provider.save();

      // Non-blocking email
      sendOTPMails({ user, provider: { ...provider.toObject(), status }, type: "providerStatus" }).catch(console.error);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Provider ${status} successfully`,
        data: provider
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = new ProviderController();