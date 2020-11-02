const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        price: {
            type: Number,
            required: true
        }
    }
);

const cartSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [productsSchema],
        shippingAddress: {
            firstname: {type: String},
            lastname: {type: String},
            address: {type: String},
            city: {type: String},
            region: {type: String, default: 'none'},
            postCode: {type: Number, default: 0},
            country: {type: String}
        },
        paymentMethod: {type: String, default: ''},
        paymentResult: {
            id: {type: String},
            status: {type: String},
            update_time: {type: String},
            email_adress: {type: String}
        },
        totalPrice: {type: Number, default: 0},
        shippingPrice: {type: Number, default: 0},
        taxPrice: {type: Number, default: 0},
        shippingAt: {type: Date},
        paidAt: {type: Date},
        deliveredAt: {type: Date},
        isPaid: {type: Boolean, default: false},
        isDelivered: {type: Boolean, default: false},
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Cart', cartSchema);