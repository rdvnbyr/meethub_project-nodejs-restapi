const Product = require('../models/products');

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        if (!products) {
            const error = new Error('Products not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'all data has been send',
            data: products
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        };
        next(err);
    };
};