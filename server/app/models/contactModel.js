
const mongoose = require('mongoose')
const schema = mongoose.Schema

const contactSchema = new schema({
    contactId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    repliedAt: {
        type: Date
    }
}, { timestamps: true, versionKey: false })

const contactModel = mongoose.model('contact', contactSchema);
module.exports = contactModel