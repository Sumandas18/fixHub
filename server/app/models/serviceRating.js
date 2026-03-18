
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceRatingSchema = new schema({
    customer_id:{
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    provider_id:{
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    booking_id:{
        type: schema.Types.ObjectId,
        ref: 'serviceBooking'
    },
    stars:{
        type:Number,
        required:true
    },
    service_description:{
        type:String,
    },
    service_image:{
        type:String,
        default: "image.png"
    },
},{timestamps:true, versionKey:false})

const serviceRatingModel = mongoose.model('serviceRating',serviceRatingSchema)
module.exports = serviceRatingModel