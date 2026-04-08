const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
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
            enum: ["admin", "provider", "customer"],
            default: "customer",
            required: true
        },
        user_contact: {
            type: String
        },
        user_address: {
            houseOrFlatNo: {
                type: String
            },
            buildingName: {
                type: String
            },
            street: {
                type: String
            },
            area: {
                type: String
            },
            landmark: {
                type: String
            },
            city: {
                type: String
            },
            district: {
                type: String
            },
            state: {
                type: String
            },
            pinCode: {
                type: String
            },
            country: {
                type: String,
                default: "India"
            },
        },
        doc_url: {
            type: String
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        isAvailable: {
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

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
