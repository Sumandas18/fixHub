const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const serviceProviderModel = require("../models/serviceProviderModel");
const checkUpdateProviderValidate = require("./../utils/validation/update/checkUpdateProviderValidation");
const sendOTPMails = require("../utils/sendMail");
class ProviderController {

  async getAllProvider(req, res) {
    try {
      const providers = await userModel.find({ user_role: "provider" });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "All available providers",
        count: providers.length,
        data: providers
      });

    }
    catch (error) {
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

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Specific provider details",
        data: provider
      });

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProvider(req, res) {
    try {
      const providerId = req.params.id;

      if (req.user.user_role !== "provider" || req.user._id.toString() !== providerId) {
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

      const updatedProvider = await userModel.findByIdAndUpdate(
        providerId, req.body, { new: true, runValidators: true });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Updated successfully"
      });

    }
    catch (error) {
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

      if (
        req.user.user_role !== "provider" ||
        req.user._id.toString() !== providerId
      ) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await userModel.findByIdAndDelete(providerId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Provider deleted successfully",
      });

    }
    catch (error) {
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
      const provider = await serviceProviderModel.findOne({ provider_id: user._id })

      if (!user || user.user_role !== "provider" || !provider) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider not found"
        });
      }

      provider.status = status;
      await provider.save();

      await sendOTPMails({ user: provider, provider: { ...provider, status }, type: "providerStatus" });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Provider ${status} successfully`
      });

    }
    catch (error) {
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
        })
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

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

}

module.exports = new ProviderController();