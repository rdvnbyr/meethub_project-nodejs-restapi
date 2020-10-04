const express = require('express');

const router = express.Router();

const cartController = require('../controllers/cart');

router.post('/add-cart', cartController.postCart);

module.exports = router;