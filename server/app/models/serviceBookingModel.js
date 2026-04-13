
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceBookingSchema = new schema({
    customer_id: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    service_id: {
        type: schema.Types.ObjectId,
        ref: 'service'
    },
    service_provider_id: {
        type: schema.Types.ObjectId,
        ref: 'serviceProvider'
    },
    scheduled_date: {
        type: Date
    },
    scheduled_time: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true, versionKey: false })

const serviceBookingModel = mongoose.model('serviceBooking', serviceBookingSchema)
module.exports = serviceBookingModel