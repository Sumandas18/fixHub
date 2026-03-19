const StatusCode = require("../utils/statusCode");
const ratingModel = require("../models/serviceRatingModel");
const bookingModel = require("../models/serviceBookingModel");

class RatingController {

  async giveRating(req, res) {
    try {
      const { booking_id, stars, service_description } = req.body;

      if (!booking_id || !stars) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Booking and stars required",
        });
      }

      const booking = await bookingModel.findById(booking_id);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.customer_id.toString() !== req.user._id.toString()) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (booking.status !== "completed") {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Service not completed yet",
        });
      }

      const rating = await ratingModel.create({
        customer_id: req.user._id,
        provider_id: booking.service_provider_id,
        booking_id,
        stars,
        service_description,
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Rating submitted",
        data: rating,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getRatingsByProvider(req, res) {
    try {
      const ratings = await ratingModel.find({
        provider_id: req.params.providerId,
      }).populate("customer_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: ratings,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new RatingController();