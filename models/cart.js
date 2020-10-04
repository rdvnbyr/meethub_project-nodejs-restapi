const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    carts: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    isActive: {
        type: Boolean,
        required: true
    }
    
}, {timestamps: true});

module.exports = mongoose.model('Cart', cartSchema);