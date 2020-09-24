const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get( '/get-products', isAuth, shopController.getProducts );

router.get('/get-products/:productId',isAuth, shopController.getOneProduct);

module.exports = router;