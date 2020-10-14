const express = require('express');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const cartController = require('../controllers/cart');

router.post( '/get-cart',isAuth, cartController.getCart );

router.post('/add-cart',isAuth, cartController.createCart);

router.post('/update-cart',isAuth, cartController.updateCart);

// router.post('/delete-product', isAuth, cartController.deleteItemFromCart);

router.delete('/delete-cart', isAuth, cartController.deleteCart);

module.exports = router;