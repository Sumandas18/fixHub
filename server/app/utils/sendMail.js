const nodemailer = require("nodemailer");

const registerOtpEmail = require("./mail/registerOtpEmail");
const resendOtpEmail = require("./mail/resendOtpEmail");
const providerApproveRejectEmail = require("./mail/providerApproveRejectEmail");
const blockUnblockAccountEmail = require("./mail/blockUnblockAccountEmail");
const bookingCancelledEmail = require("./mail/booking/bookingCancelledEmail");
const bookingConfirmedEmail = require("./mail/booking/bookingConfirmedEmail");
const bookingPlacedEmail = require("./mail/booking/bookingPlacedEmail");
const resendTaskOtpEmail = require("./mail/booking/resendTaskOtpEmail");
const taskCompletedOtpEmail = require("./mail/booking/taskCompletedOtpEmail");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: (process.env.EMAIL_USER || "").trim(),
        pass: (process.env.EMAIL_PASS || "").trim(),
    },
});

const sendOTPMails = async ({ user, provider, booking, isBlocked, reason, type, otp }) => {
    try {
        let subject, html;
        const loginUrl = `http://localhost:${process.env.PORT || 4000}`;

        if (type == "newRegister") {
            subject = "Email verification";
            html = registerOtpEmail(user, otp);
        }
        else if (type == "resendOTP") {
            subject = "Re-send OTP for email verification";
            html = resendOtpEmail(user, otp);
        }
        else if (type == "providerStatus") {
            subject = provider.status === "approved"
                ? "Provider Account Approved"
                : provider.status === "rejected"
                    ? "Provider Account Rejected"
                    : "Provider Account Under Review";
            html = providerApproveRejectEmail(user, provider);
        }
        else if (type == "blockunblockAccount") {
            subject = isBlocked ? 'Your Fixhub Account Has Been Blocked' : 'Your Fixhub Account Has Been Unblocked';
            html = blockUnblockAccountEmail(user, isBlocked, type = null);
        }
        else if (type == "cancelBooking") {
            subject = "Booking cancel";
            html = bookingCancelledEmail(user, booking, reason);
        }
        else if (type == "confirmBooking") {
            subject = "Booking confirmed";
            html = bookingConfirmedEmail(user, booking);
        }
        else if (type == "newBooking") {
            subject = "Booking order placed";
            html = bookingPlacedEmail(user, booking);
        }
        else if (type == "resendBookingOTP") {
            subject = "OTP re-send for servicing";
            html = resendTaskOtpEmail(user, booking, otp);
        }
        else if (type == "taskComplete") {
            subject = "OTP for finalizing the service";
            html = taskCompletedOtpEmail(user, booking, otp);
        }
        else {
            throw new Error('Invalid email type');
        }

        await transporter.sendMail({
            from: `"Fixhub" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html
        });
    }
    catch (err) {
        console.error("Error while sending mail:", err);
    }
}

module.exports = sendOTPMails;
