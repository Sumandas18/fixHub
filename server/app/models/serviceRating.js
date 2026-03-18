
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceRatingSchema = new schema({
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

const serviceRatingModel = mongoose.model('serviceRatings',serviceRatingSchema)
module.exports = serviceRatingModel