const mongoose = require('mongoose');
const StatusCode = require("../utils/statusCode");
const bookingModel = require("../models/serviceBookingModel");
const serviceOTPModel = require("../models/serviceOtp");
const sendOTPMails = require("../utils/sendMail");
const generateOTP = require("../helper/generateOTP");
const serviceModel = require('../models/serviceModel');
const userModel = require('../models/userModel');

class BookingController {

  async createBooking(req, res) {
    try {
      const { service_provider_id, serviceId, scheduled_date, scheduled_time } = req.body;

      // Ensure at least one target is provided
      if (!service_provider_id && !serviceId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Either service_provider_id or serviceId is required",
        });
      }

      let existingBooking = null;

      if (service_provider_id && scheduled_date && scheduled_time) {
        existingBooking = await bookingModel.findOne({
          service_provider_id,
          scheduled_date: new Date(scheduled_date),
          scheduled_time,
          status: { $in: ["pending", "confirmed", "accepted"] }
        });

        if (existingBooking) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Service provider is already booked for this date and time",
          });
        }
      }

      const bookingData = {
        customer_id: req.user.user_id,
        status: 'pending' // default, but making it explicit for clarity
      };

      if (service_provider_id) {
        bookingData.service_provider_id = service_provider_id;
        bookingData.scheduled_date = scheduled_date;
        bookingData.scheduled_time = scheduled_time;
      }
      if (serviceId) {
        bookingData.service_id = serviceId;
      }

      const serviceName = await serviceModel.findById(serviceId);

      const bookingObj = new bookingModel(bookingData);
      const bookingDetails = await bookingObj.save();

      const booking = { ...bookingDetails._doc, serviceName }

      const customerUser = { user_email: req.user.user_email, user_name: req.user.user_name };
      try {
        await sendOTPMails({ user: customerUser, booking, type: "newBooking" });
      } catch (emailErr) {
        console.error('[BookingController] newBooking email failed:', emailErr);
      }

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
      const provider_id = new mongoose.Types.ObjectId(req.user.user_id);

      if (!req.user.user_id) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "Unauthorised access"
        })
      }

      // Return ALL bookings for this provider (pending, accepted, rejected)
      const bookings = await bookingModel.aggregate([
        {
          $match: {
            service_provider_id: provider_id
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "customer_id",
            foreignField: "_id",
            as: "customer"
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
          $unwind: "$customer"
        },
        {
          $unwind: "$service"
        }
      ])

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
      const { cancellation_reason } = req.body;

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

      if ((booking.customer_id.toString() !== req.user.user_id.toString()) && req.user.user_role === 'customer') {
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
        if (cancellation_reason) {
          booking.cancellation_reason = cancellation_reason;
        }
        await booking.save();

        const userDetails = await userModel.findById(booking.customer_id);
        const serviceDetails = await serviceModel.findById(booking.service_id);
        console.log(userDetails, booking)
        try {
          await sendOTPMails({ user: userDetails, booking, service: serviceDetails, reason: cancellation_reason, type: "cancelBooking" });
        } catch (emailErr) {
          console.error('[BookingController] cancelBooking email failed:', emailErr);
        }

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Booking cancelled",
        });
      }
    } catch (error) {
      console.log(error)
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
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Status not available",
        });
      }
      const booking = await bookingModel.findById(booking_id).populate('customer_id');

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (status == "completed") {
        const otp = generateOTP();
        const user = await userModel.findById(booking.customer_id);

        const otpObj = new serviceOTPModel({ bookingId: booking._id, otp });
        await otpObj.save();

        await sendOTPMails({ user, booking, otp, type: "taskComplete" });

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: `OTP has been sent successfully`
        });

      }
      else {
        const service = await serviceModel.findById(booking.service_id);
        const provider = await userModel.findById(booking.service_provider_id);

        booking.status = status;
        await booking.save();

        if (status == "confirmed") {
          sendOTPMails({ user: booking.customer_id, provider, booking, service, type: "confirmBooking" }).catch(console.error);
        }

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: `Booking is ${status == "cancelled" ? 'cancelled' : 'confirmed'} successfully`,
          data: booking
        });
      }

    } catch (error) {
      console.log(error)
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async patchBookingStatus(req, res) {
    try {
      const { status, reason } = req.body;
      const booking_id = req.params.id;

      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Valid status ('accepted' or 'rejected') is required",
        });
      }

      const booking = await bookingModel.findById(booking_id).populate('customer_id');

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      booking.status = status;
      await booking.save();

      try {
        if (status === 'accepted') {
          await sendOTPMails({ user: booking.customer_id, booking, type: "confirmBooking" });
        } else if (status === 'rejected') {
          await sendOTPMails({ user: booking.customer_id, booking, type: "cancelBooking", reason: reason || "Provider rejected the request" });
        }
      } catch (err) {
        console.error("Error sending booking status email:", err);
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Booking has been ${status}`,
        data: booking
      });
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
        return res.status(StatusCode.BAD_REQUEST).json({
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
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Service already completed",
        });
      }
      else {

        const checkOTP = await serviceOTPModel.findOne({ bookingId }).sort({ createdAt: -1 });

        if (!checkOTP) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "OTP not found or has expired",
          });
        }

        if (checkOTP.otp !== otp) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid OTP",
          });
        }

        const now = Date.now();
        const otpTime = checkOTP.createdAt.getTime();
        const timeDiff = now - otpTime;

        // Valid for 5 minutes (300000 ms)
        if (timeDiff > 300000) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "OTP has expired",
          });
        }

        booking.status = "completed";
        await booking.save();

        await serviceOTPModel.deleteMany({ bookingId });

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: `Service completed successfully`
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

  async resendBookingOTP(req, res) {
    try {

      const { bookingId } = req.body;

      if (!bookingId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Booking ID is required",
        });
      }
      const booking = await bookingModel.findById(bookingId).populate('customer_id');

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.status == "completed") {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Service already completed",
        });
      }
      else {

        const otp = generateOTP();

        const otpObj = new serviceOTPModel({ bookingId: booking._id, otp });
        await otpObj.save();

        sendOTPMails({ user: booking.customer_id, booking, otp, type: "resendBookingOTP" }).catch(console.error);

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