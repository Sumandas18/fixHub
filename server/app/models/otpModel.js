const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const otpSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    otp: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: '5m'
    }
});

const otpModel = mongoose.model('emailVerification', otpSchema);

module.exports = otpModel;