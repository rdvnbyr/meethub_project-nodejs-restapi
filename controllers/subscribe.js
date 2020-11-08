const Subscribe = require('../models/subscribe');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransporter({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

exports.contactUs = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    };
    const {
        email,
        firstName,
        lastName,
        subject,
        message
      } = req.body;

      const subs = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        subject: subject,
        message: message
      }

    const subscribeObject = new Subscribe(subs);

    await subscribeObject.save();
    res.status(200).json({message: "Message sended successfully"});

    transporter.sendMail({
        to: 'rdvnbyr34@gmail.com',
        from: process.env.SEND_EMAIL_FROM,
        subject: subject || 'kayit islemi basari ile gerceklesmistir.',
        html: `<h1>${subject}</h1><h3>${message}</h3>`
    });
};