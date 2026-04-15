const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const otpSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "serviceBooking",
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m'
    }
}, {
    timestamps: true,
    versionKey: false
});

const otpModel = mongoose.model("serviceCompletionOtp", otpSchema);
module.exports = otpModel;