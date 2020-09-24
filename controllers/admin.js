const { validationResult } = require('express-validator');
const Product = require('../models/products');

exports.getProducts = async (req, res, next) => {
    try {
        const allProducts = await Product.find();
        if (!allProducts) {
            const errors = new Error('Products not found');
            errors.statusCode = 404;
            throw errors
        };
        res.status(200).json(allProducts);
    } catch(error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

exports.getOneProduct = async (req, res, next) => {
    try {
        const prodId = req.body._id;
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

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

// old data fetching
exports.getUpdateProduct = async (req, res, next) => {
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

// update product
exports.editProduct = async (req, res, next) => {

    try {
        // const prodId = req.params.productId;
        const prodId = req.body._id;
        const updatedTitle = req.body.title;
        const updatedDetails = req.body.details;
        const updatedImage = req.body.image;
        const updatedPrice = req.body.price;
        const updatedCategory = req.body.category;

        const product = await Product.findById(prodId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        };
        product.title = updatedTitle;
        product.details = updatedDetails;
        product.image = updatedImage;
        product.price = updatedPrice;
        product.category = updatedCategory;
        const updatedProduct  = new Product(product);
        await updatedProduct.save();
        res.status(200).json(updatedProduct);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const prodId = req.body._id;
        console.log(prodId);
        const product = await Product.findByIdAndDelete(prodId);
        res.status(200).json({
            message: 'Product successfully deleted',
            data: product
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    };
};

