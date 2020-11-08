const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const subscribesSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    subject: {type: String},
    message: {
        type: String,
        required: true
    }

}, {timestamps: true}
);

module.exports = mongoose.model('Subscribes', subscribesSchema);