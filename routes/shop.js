const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get( '/get-products', isAuth, shopController.getProducts );

module.exports = router;