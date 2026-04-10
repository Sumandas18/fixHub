const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema(
    {
        user_name: {
            type: String,
            required: true
        },
        user_email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        user_password: {
            type: String,
            required: true
        },
        user_role: {
            type: String,
            default: "admin",
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        lastLogin: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: new Date()
        },
    },
    {
        timestamps: true,
        versionKey: false
    },
);

const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;
