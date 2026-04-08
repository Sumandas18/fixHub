const StatusCode = require("../utils/statusCode");
const bookingModel = require("../models/serviceBookingModel");
const serviceOTPModel = require("../models/serviceOtp");
const sendOTPMails = require("../utils/sendMail");

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

      const existingBooking = await bookingModel.findOne({
        service_provider_id,
        scheduled_date: new Date(scheduled_date),
        scheduled_time,
        status: { $in: ["pending", "confirmed"] }
      });

      if (existingBooking) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Service provider is already booked for this date and time",
        });
      }

      const bookingObj = new bookingModel({
        customer_id: req.user.user_id,
        service_provider_id,
        scheduled_date,
        scheduled_time
      });

      const booking = await bookingObj.save();

      await sendOTPMails({ user, booking, type: "newBooking" });

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

  async getAllBookings(req, res) {
    try {
      const bookings = await bookingModel.find()
        .populate("customer_id").populate("service_provider_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "All available bookings",
        data: bookings
      });

    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProviderBookings(req, res) {
    try {
      const provider_id = req.user.user_id;

      if (!provider_id) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorised access"
        })
      }
      const bookings = await bookingModel.find({ provider_id })
        .populate("customer_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Available bookings of a specific provider",
        data: bookings
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCustomerBookings(req, res) {
    try {
      const customer_id = req.user.user_id;

      if (!customer_id) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorised access"
        })
      }
      const bookings = await bookingModel.find({ customer_id })
        .populate("service_provider_id");

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Available bookings of a specific customer",
        data: bookings
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
      const booking_id = req.params.id;

      if (!booking_id) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking ID not available"
        })
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
      else if (booking.status !== 'pending' && req.user.user_role === 'provider') {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorized access",
        });
      }
      else {
        booking.status = "cancelled";
        await booking.save();

        await sendOTPMails({ user, booking, type: "cancelBooking" });

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Booking cancelled",
        });
      }
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { status, reason } = req.body;
      const booking_id = req.params.id;

      if (!status) {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "Status not available",
        });
      }
      const booking = await bookingModel.findById(booking_id);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (status == "completed") {
        const otp = Math.floor(1000 + Math.random() * 9000);

        const otpObj = new serviceOTPModel({ bookingId: booking._id, otp });
        await otpObj.save();

        await sendOTPMails({ user, booking, otp, type: "taskComplete" });

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: `OTP has been sent successfully`
        });

      }
      else {
        booking.status = status;
        await booking.save();

        if (status == "cancelled") {
          await sendOTPMails({ user, booking, reason, type: "cancelBooking" });
        }
        if (status == "confirmed") {
          await sendOTPMails({ user, booking, type: "confirmBooking" });
        }

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: `Booking is ${status == "cancelled" ? 'cancelled' : 'confirmed'} successfully`,
          data: booking
        });
      }

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async verifyBookingOTP(req, res) {
    try {
      const { otp, bookingId } = req.body;

      if (!otp || !bookingId) {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "All fields are required",
        });
      }
      const booking = await bookingModel.findById(bookingId);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.status == "completed") {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "Service already completed",
        });
      }
      else {

        const checkOTP = await serviceOTPModel.findOne({ bookingId, otp });

        if (!checkOTP) {
          return res.status(StatusCode.BAD_GATEWAY).json({
            success: false,
            message: "Invalid OTP",
          });
        }
        else {

          booking.status = "completed";
          await booking.save();

          await serviceOTPModel.deleteMany({ bookingId });

          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: `Service completed successfully`
          });

        }
      }
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async resendBookingOTP(req, res) {
    try {

      const { bookingId } = req.body;

      if (!otp || !bookingId) {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "All fields are required",
        });
      }
      const booking = await bookingModel.findById(bookingId);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.status == "completed") {
        return res.status(StatusCode.BAD_GATEWAY).json({
          success: false,
          message: "Service already completed",
        });
      }
      else {

        const otp = Math.floor(1000 + Math.random() * 9000);

        const otpObj = new serviceOTPModel({ bookingId: booking._id, otp });
        await otpObj.save();

        await sendOTPMails({ user, booking, otp, type: "resendBookingOTP" });

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "OTP re-send successfully",
        });
      }
    }
    catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

}

module.exports = new BookingController();