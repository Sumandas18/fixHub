const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        require: true
    },
    token: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const tokenModel = mongoose.model('user_token', tokenSchema);

module.exports = tokenModel;