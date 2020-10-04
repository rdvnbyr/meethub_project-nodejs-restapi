const express = require('express');

const shopController = require('../controllers/shop');
// const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get( '/get-products', shopController.getProducts );

router.post( '/get-products', shopController.getProductsWeeksDeal );

router.get('/get-products/:productId', shopController.getOneProduct);

module.exports = router;