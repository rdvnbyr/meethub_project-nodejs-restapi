const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();

router.post(
    '/add-products',
    [
        body('title').isString(),
        body('details').isString().isLength({max: 200}),
        body('image').isString(),
        body('price').isNumeric(),
        body('category').isString()
    ],
    adminController.postProducts
);

module.exports = router;