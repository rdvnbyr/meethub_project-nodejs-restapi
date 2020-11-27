const express = require('express');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const cartController = require('../controllers/cart');

router.post( '/get-cart',isAuth, cartController.getCart );

router.get( '/get-purchased-cart',isAuth, cartController.getPurchasedCart );

router.post('/add-cart',isAuth, cartController.createCart);

router.post('/update-cart',isAuth, cartController.updateCart);

router.post('/update-shipping',isAuth, cartController.updateShipping);

router.post('/payment', cartController.payment);

router.post('/create-payment-intent', cartController.payment);

router.post('/payment-end', cartController.paymentEnd);

router.put('/archived-order', isAuth, cartController.sendCartToArchive);

router.post('/delete-cart', isAuth, cartController.deleteCart);

module.exports = router;