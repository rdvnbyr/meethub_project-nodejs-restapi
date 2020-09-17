const { validationResult } = require('express-validator');
const Product = require('../models/products');

exports.postProducts = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        };
        const title = req.body.title;
        const details = req.body.details;
        const image = req.body.image;
        const price = req.body.price;
        const category = req.body.category;

        const product = new Product({
            title: title,
            details: details,
            image: image,
            price: price,
            category: category
        })

        await product.save();

        res.status(200).json({
            message: 'Product successfully created by admin',
            data: product
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        };
        next(err);
    };
};



