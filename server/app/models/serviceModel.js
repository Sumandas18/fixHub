
const mongoose = require('mongoose')
const schema = mongoose.Schema

const serviceSchema = new schema({
    service_name: {
        type: String,
        required: true
    },
    service_description: {
        type: String,
        required:true
    },
    service_image: {
        type: String,
        default: "image.png"
    },
    service_image_url: {
        type: String,
        default: "image.png"
    },
    is_active: {
        type: Boolean,
        default: true
    }

}, { timestamps: true, versionKey: false })

const serviceModel = mongoose.model('service', serviceSchema)
module.exports = serviceModel