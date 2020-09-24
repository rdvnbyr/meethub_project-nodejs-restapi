const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/get-products',isAuth, adminController.getProducts);

router.get('/get-update-product/:productId', isAuth, adminController.getUpdateProduct);

router.get('/get-product-details', isAuth, adminController.getOneProduct);

router.patch('/update-product',isAuth, adminController.editProduct);

router.delete('/delete-product',isAuth, adminController.deleteProduct);

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