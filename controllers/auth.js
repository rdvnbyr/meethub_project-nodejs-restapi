const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        };

        const email = req.body.email;
        const password = req.body.password;
        const username = req.body.username;
        const status = req.body.status;
        // crypt password
        const cryptedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: cryptedPassword,
            username: username,
            status: status
        });
        await user.save();
        res.status(200).json({
            message: 'user created successfully',
            data: user
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        };
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error('User not found');
            error.statusCode(401);
            throw error;
        };
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('password does not match');
            error.statusCode(401);
            throw error;
        };
        const token = jwt.sign(
            {
                email: user.email,
                userid: user._id.toString()
            },
            'jwt_secret_key',
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token: token,
            userId: user._id.toString(),
            data: user
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
};