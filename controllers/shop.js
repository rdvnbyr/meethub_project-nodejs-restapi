const Product = require('../models/products');
const User = require('../models/user');

exports.getProducts = async (req, res, next) => {
    try {
        // const page = req.query.page;
        // const limit = req.body.limit;
        // console.log(page,limit)

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

exports.getProductsWithStates = async (req, res, next) => {
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
        const product = await Product.findById(prodId).populate({path: 'reviews', populate: {path: 'reviewer', model: 'User'}});
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

exports.createReview = async (req, res, next) => {
    try {
        const { rating, comment, title } = req.body;
        const prodId = req.params.productId;
        const userId = req.userId;
        
        //
        const product = await Product.findById(prodId);
        const user = await User.findById(userId);
        if( !user && !product ) {
            const error = new Error('Product or user not found');
            error.statusCode = 404;
            throw error;
        };

        //
        const alreadyReviewed = product.reviews.find( f => f.reviewer.toString() === userId);
        if( alreadyReviewed ) {
            const error = new Error('Product already reviwed by user');
            error.statusCode = 400;
            throw error;
        };

        //
        const newReview = {
            reviewer: userId,
            rating: Number(rating),
            title: title,
            comment: comment
        };
        product.reviews.push(newReview);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.status(200).json({message: "Product successfully reviewed by user"});

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};

exports.addProductToWishlist = async (req, res, next) => {
    try {
        const productId = req.params.productId
        const userId = req.userId;

        const user = await User.findById(userId);
        const product = await Product.findById(productId);
        if( !user || !product ) {
            const error = new Error('Product or user not found');
            error.statusCode = 404;
            throw error;
        };

        const alreadyAdd = user.wishlist.find( p => p.product.toString() === product._id.toString() );
        if(alreadyAdd){
            const updateWishlist = user.wishlist.filter( p => p.product !== alreadyAdd.product);
            user.wishlist = updateWishlist;
            await user.save();
            res.status(200).json({message: "Product successfuly removed in your wishlist"});
        } else {
            user.wishlist.push({product: product._id});
            await user.save();
            res.status(200).json({message: "Product successfuly added in your wishlist"});
        };
        
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};