
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceBookingSchema = new schema({
    scheduled_date: {
        type: Date,
        required: true
    },
    scheduled_time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    }
},{timestamps:true, versionKey:false})

const serviceBookingModel = mongoose.model('serviceBookings',serviceBookingSchema)
module.exports = serviceBookingModel