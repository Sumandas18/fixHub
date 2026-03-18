
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceProviderSchema = new schema({
    service_area_zip:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    charges_per_hour:{
        type:String,
        required:true
    },
    isAvailable: {
        type:Boolean,
        default:true
    }
},{timestamps:true, versionKey:false})

const serviceProviderModel = mongoose.model('serviceProviders',serviceProviderSchema)
module.exports = serviceProviderModel