const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter valid email')
            .custom(async ( value, {req} ) => {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('Email already existed');
                };
            }),
        body('password').trim().isLength({min: 5}),
        body('username').trim().not().isEmpty()
    ],
    authController.signup
);

router.post('/login', authController.login);

router.get('/get-user', isAuth, authController.getUserWishlist);

router.post('/logout', isAuth, authController.logout);

module.exports = router;