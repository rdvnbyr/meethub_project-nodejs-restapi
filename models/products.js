const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewsSchema = new Schema(
    {
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const productsSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            default: 0
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0
        },
        countInStock: {
            type: Number,
            required: true,
            default: 0
        },
        reviews: [reviewsSchema],
        state: {
            type: String,
            required: true,
            default: 'none'
        }
    }, 
    {
        timestamps: true
    });

module.exports = mongoose.model('Products', productsSchema);