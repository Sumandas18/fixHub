const StatusCode = require("../utils/statusCode");
const userModel = require("../models/userModel");
const serviceModel = require("../models/serviceModel");
const serviceProviderModel = require("../models/serviceProviderModel");
const bookingModel = require("../models/serviceBookingModel");
const ratingModel = require("../models/serviceRatingModel");

class AdminController {

  async getAllUsers(req, res) {
    try {
      const users = await userModel.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: users
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async blockUnblockUser(req, res) {
    try {
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found"
        });
      }

      user.isBlocked = !user.isBlocked;
      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `User ${user.isBlocked ? "blocked" : "unblocked"}`
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await userModel.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "User deleted"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async createService(req, res) {
    try {
      const { service_name, service_description } = req.body;

      if (!service_name) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Service name required"
        });
      }

      const service = await serviceModel.create({
        service_name,
        service_description,
        service_image: req.file ? req.file.path : undefined
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        data: service
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllServices(req, res) {
    try {
      const services = await serviceModel.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: services
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async toggleService(req, res) {
    try {
      const service = await serviceModel.findById(req.params.id);

      if (!service) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Service not found"
        });
      }

      service.is_active = !service.is_active;
      await service.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Service ${service.is_active ? "activated" : "deactivated"}`
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteService(req, res) {
    try {
      await serviceModel.findByIdAndDelete(req.params.id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Service deleted"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async approveProvider(req, res) {
    try {
      const user = await userModel.findById(req.params.id);

      if (!user || user.user_role !== "provider") {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Provider not found"
        });
      }

      user.isApproved = true;
      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Provider approved"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllProviders(req, res) {
    try {
      const providers = await serviceProviderModel.find()
        .populate("provider_id")
        .populate("service_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: providers
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllBookings(req, res) {
    try {
      const bookings = await bookingModel.find()
        .populate("customer_id")
        .populate("service_provider_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: bookings
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { status } = req.body;

      const booking = await bookingModel.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: booking
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllRatings(req, res) {
    try {
      const ratings = await ratingModel.find()
        .populate("customer_id")
        .populate("provider_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: ratings
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRating(req, res) {
    try {
      await ratingModel.findByIdAndDelete(req.params.id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Rating deleted"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AdminController();