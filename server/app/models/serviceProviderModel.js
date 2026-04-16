const mongoose = require('mongoose');
const schema = mongoose.Schema;

const serviceProviderSchema = new schema({
    provider_id: {
        type: schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    service_id: {
        type: schema.Types.ObjectId,
        ref: 'service',
        default: null
    },
    service_area_zip: {
        type: [String],
        default: []           // empty until profile is completed
    },
    profile_img: {
        type: String,
        default: null         // optional until profile is completed
    },
    profile_img_url: {
        type: String,
        default: null
    },
    experience: {
        type: String,
        default: null         // optional until profile is completed
    },
    charges_per_hour: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAvailable: {
        type: Boolean,
        // default: false
        default: true
    },
    rejection_reason: {
        type: String,
        default: null
    },
    isProfileCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, versionKey: false });

const serviceProviderModel = mongoose.model('serviceProvider', serviceProviderSchema);
module.exports = serviceProviderModel;