const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get( '/get-products', shopController.getProducts );

router.post( '/get-products', shopController.getProductsWithStates );

router.get('/get-products/:productId', shopController.getOneProduct);

router.put('/create-review/:productId',isAuth, shopController.createReview);

router.put('/add-product-wishlist/:productId', isAuth, shopController.addProductToWishlist);

module.exports = router;