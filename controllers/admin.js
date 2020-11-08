const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Product = require('../models/products');
const User = require('../models/user');

exports.getProducts = async (req, res, next) => {
    try {
        const state = req.body.state;
        let allProducts;
        if (state) {
            allProducts = await Product.find({state: state});
        } else {
            allProducts = await Product.find();
        }
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
        if (!req.file) {
            const error = new Error('No image uploaded');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const {
            title,
            details,
            price,
            brand,
            state,
            _id
        } = req.body;
        const image = req.file.path;

        const user = await User.findById(_id);
        if(user) {
            const product = new Product({
                title: title,
                details: details,
                image: image,
                price: price,
                brand: brand,
                state: state,
                creator: user._id
            });
            await product.save();
            res.status(200).json({
                message: 'Product successfully created by admin',
                data: product
            });
        } else {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.data = errors.array();
            throw error;
        }

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
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     const error = new Error('Validation failed');
        //     error.statusCode = 422;
        //     error.data = errors.array();
        //     throw error;
        // };
        // const prodId = req.params.productId;
        const prodId = req.params.productId;
        const updatedTitle = req.body.title;
        const updatedDetails = req.body.details;
        const updatedPrice = req.body.price;
        const updatedCategory = req.body.category;
        const updatedState = req.body.state;
        let updatedImage = req.body.image;
        if (req.file) {
            updatedImage = req.file.path;
        };
        if (!updatedImage) {
            const error = new Error('No file Pict');
            error.statusCode = 422;
            throw error;
        };

        const product = await Product.findById(prodId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        };
        if ( updatedImage !== product.image ) {
            deleteImage(product.image);
        };
        product.title = updatedTitle;
        product.details = updatedDetails;
        product.image = updatedImage;
        product.price = updatedPrice;
        product.category = updatedCategory;
        product.state = updatedState;
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
        const prodId = req.params.productId;
        // console.log(prodId);
        const product = await Product.findByIdAndDelete(prodId);
        deleteImage(product.image);
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


const deleteImage = filePath => {
    filePath = path.join(__dirname + '..', filePath );
    fs.unlink( filePath, error => console.log(error) );
};