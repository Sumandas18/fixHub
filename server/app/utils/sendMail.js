const transporter = require("./../config/emailConfig");
const registerOtpEmail = require("./mail/registerOtpEmail");
const resendOtpEmail = require("./mail/resendOtpEmail");
const providerApproveRejectEmail = require("./mail/providerApproveRejectEmail");
const blockUnblockAccountEmail = require("./mail/blockUnblockAccountEmail");
const bookingCancelledEmail = require("./mail/booking/bookingCancelledEmail");
const bookingConfirmedEmail = require("./mail/booking/bookingConfirmedEmail");
const bookingPlacedEmail = require("./mail/booking/bookingPlacedEmail");
const resendTaskOtpEmail = require("./mail/booking/resendTaskOtpEmail");
const taskCompletedOtpEmail = require("./mail/booking/taskCompletedOtpEmail");
const contactPlacedEmail = require("./mail/contact/contactPlacedEmail");
const contactReplyEmail = require("./mail/contact/contactReplyEmail");
const passwordChangedEmail = require("./mail/passwordChangedEmail");

const sendOTPMails = async ({ user, provider, booking, service, isBlocked, reason, type, otp, contact }) => {
    try {
        let subject, html;
        const email = user?.user_email || contact?.email;

        if (!email) {
            console.error('[sendMail] No recipient email found — skipping mail send.');
            return;
        }

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
                    ? "Your FixHub Provider Application Status"
                    : "Provider Account Under Review";
            html = providerApproveRejectEmail(user, provider);
        }
        else if (type == "blockunblockAccount") {
            subject = isBlocked ? 'Your Fixhub Account Has Been Blocked' : 'Your Fixhub Account Has Been Unblocked';
            html = blockUnblockAccountEmail(user, isBlocked, type = null);
        }
        else if (type == "cancelBooking") {
            subject = "Booking cancel";
            html = bookingCancelledEmail(user, booking, service, reason);
        }
        else if (type == "confirmBooking") {
            subject = "Booking confirmed";
            html = bookingConfirmedEmail(user, provider, booking, service);
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
        else if (type == "messageReceived") {
            subject = "Fixhub Support – Query Received";
            html = contactPlacedEmail(contact);
        }
        else if (type == "replySent") {
            subject = "Fixhub Support – Response to Your Query";
            html = contactReplyEmail(contact);
        }
        else if (type == "updatePassword") {
            subject = "Fixhub - Password Updated";
            html = passwordChangedEmail(user);
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
