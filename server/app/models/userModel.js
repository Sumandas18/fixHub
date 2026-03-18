const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'provider', 'customer'],
        default: 'customer',
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        houseOrFlatNo: {
            type: String,
            required: true
        },
        buildingName: {
            type: String
        },
        street: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        landmark: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        district: {
            type: String
        },
        state: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: "India"
        }
    },
    doc_url: {
        type: String
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);