const StatusCode = require("../utils/statusCode");
const bookingModel = require("../models/serviceBookingModel");
const serviceProviderModel = require("../models/serviceProviderModel");

class BookingController {

  async createBooking(req, res) {
    try {
      const { service_provider_id, scheduled_date, scheduled_time } = req.body;

      if (!service_provider_id || !scheduled_date || !scheduled_time) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "All fields are required",
        });
      }

      const booking = await bookingModel.create({
        customer_id: req.user._id,
        service_provider_id,
        scheduled_date,
        scheduled_time,
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyBookings(req, res) {
    try {
      const bookings = await bookingModel.find({
        customer_id: req.user._id,
      })
        .populate("service_provider_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        data: bookings,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelBooking(req, res) {
    try {
      const booking = await bookingModel.findById(req.params.id);

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

      booking.status = "cancelled";
      await booking.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Booking cancelled",
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { status } = req.body;

      const booking = await bookingModel.findById(req.params.id);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      booking.status = status;
      await booking.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Booking status updated",
        data: booking,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new BookingController();