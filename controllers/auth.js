const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransporter({
    auth: {
        api_key: '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'
    }
}));

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
            message: 'User created successfully',
            data: user
        });
        transporter.sendMail({
            to: email,
            from: 'test@webdevscope.com',
            subject: 'kayit islemi basari ile gerceklesmistir.',
            html: `<h1>MERHABA</h1><h3>${username}</h3>`
        });
    } catch(error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const status = req.body.status;
        // status control for admin
        if ((status || status === "") && status !== 'admin') {
            const error = new Error('Only the admin user can access');
            error.statusCode = 401;
            throw error;
        };
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        };

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('password does not match');
            error.statusCode = 401;
            throw error;
        };
        const token = jwt.sign(
            {
                email: user.email,
                userid: user._id.toString()
            },
            'jwt_secret_key',
            { expiresIn: '3h' }
        );
        res.status(200).json({
            token: token,
            userId: user._id.toString(),
            user: user
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    };
};