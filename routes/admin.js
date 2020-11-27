const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/get-products',isAuth, adminController.getProducts);

router.get('/get-update-product/:productId', isAuth, adminController.getUpdateProduct);

router.post('/get-product-details', isAuth, adminController.getOneProduct);// ????

router.patch(
    '/update-product/:productId',
    [
        body('title').isString(),
        body('details').isString().isLength({max: 400}),
        body('price').isNumeric(),
        body('brand').isString()
    ],
    isAuth,
    adminController.editProduct
);

router.delete('/delete-product/:productId',isAuth, adminController.deleteProduct);

router.post(
    '/add-products',
    [
        body('title').isString(),
        body('details').isString(),
        body('brand').isString()
    ],
    isAuth,
    adminController.postProducts
);

module.exports = router;