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
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

exports.getProductsWeeksDeal = async (req, res, next) => {
    try {
        const state = req.body.state;
        const products = await Product.find({state: state});
        if (!products) {
            const error = new Error('Products not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(products);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

exports.getOneProduct = async (req, res, next) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        };
        res.status(200).json(product);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};