
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceProviderSchema = new schema({
    provider_id: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    service_id: {
        type: schema.Types.ObjectId,
        ref: 'service'
    },
    service_area_zip: {
        type: [String],
        required: true
    },
    profile_img: {
        type: String,
        required: true
    },
    profile_img_url: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    charges_per_hour: {
        type: String,
        required: true
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
        default: false
    },
    rejection_reason: {
        type: String,
        default: null
    }
}, { timestamps: true, versionKey: false })

const serviceProviderModel = mongoose.model('serviceProvider', serviceProviderSchema)
module.exports = serviceProviderModel