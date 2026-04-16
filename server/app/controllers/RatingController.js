const StatusCode = require("../utils/statusCode");
const ratingModel = require("../models/serviceRatingModel");
const bookingModel = require("../models/serviceBookingModel");

class RatingController {

  async giveRating(req, res) {
    try {
      const { booking_id, stars, service_description } = req.body;

      if (!booking_id || !stars || !service_description) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "All fields are required",
        });
      }

      const booking = await bookingModel.findById(booking_id);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.customer_id.toString() !== req.user.user_id.toString()) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      if (booking.status !== "completed") {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Service not completed yet",
        });
      }

      const ratingObj = new ratingModel({
        customer_id: req.user.user_id,
        provider_id: booking.service_provider_id,
        booking_id,
        stars,
        service_description
      })

      const rating = await ratingObj.save();

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Rating submitted successfully",
        data: rating,
      });

    } catch (error) {
      console.log(error)
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getRatingsByProvider(req, res) {
    try {
      const provider_id = req.params.providerId;

      const ratings = await ratingModel.find({ provider_id }).populate("customer_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Provider wise rating",
        data: ratings
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllRatings(req, res) {
    try {
      const ratings = await ratingModel.find()
        .populate("customer_id").populate("provider_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "All available ratings",
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
      const ratingId = req.params.id;

      await ratingModel.findByIdAndDelete(ratingId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Rating deleted successfully"
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RatingController();