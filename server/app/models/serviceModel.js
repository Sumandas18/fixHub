
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceSchema = new schema({
    service_name:{
        type:String,
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

const serviceModel = mongoose.model('services',serviceSchema)
module.exports = serviceModel