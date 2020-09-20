const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

const router = express.Router();

router.post(
    '/add-products',
    [
        body('title').isString(),
        body('details').isString().isLength({max: 400}),
        body('image').isString(),
        body('price').isNumeric(),
        body('category').isString()
    ],
    isAuth,
    adminController.postProducts
);

module.exports = router;