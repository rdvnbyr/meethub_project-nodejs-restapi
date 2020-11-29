const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// const transporter = nodemailer.createTransport(sendgridTransporter({
//     auth: {
//         api_key: process.env.SENDGRID_API_KEY
//     }
// }));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASS // naturally, replace both with your real credentials or an application-specific password
    }
  });

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        };

        const {email, password, username } = req.body;
        // crypt password
        const cryptedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: cryptedPassword,
            username: username
        });
        await user.save();
        res.status(200).json({
            message: 'User created successfully'
        });
        const mailOptions = {
            from: 'test@webdevscope.com',
            to: email,
            subject: `Welcome ${email}`,
            text: 'Have a nice shopping'
          };
    
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        // transporter.sendMail({
        //     to: email,
        //     from: 'test@webdevscope.com',
        //     subject: 'kayit islemi basari ile gerceklesmistir.',
        //     html: `<h1>MERHABA</h1><h3>${username}</h3>`
        // });
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
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        };

        const status = user.status;
        // // status control for admin
        // if ((status || status === "") && status !== 'admin') {
        //     const error = new Error('Only the admin user can access');
        //     error.statusCode = 401;
        //     throw error;
        // };

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
            process.env.JWT_SECRET_KEY,
            { expiresIn: '7d' }
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

exports.logout = async (req,res,next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        };
        res.status(204).json({message: "User successfully signed out"});

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getUserWishlist = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate({path: 'wishlist', populate: {path: 'product', model: 'Products'}});
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        };
        res.status(200).json(user.wishlist);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};