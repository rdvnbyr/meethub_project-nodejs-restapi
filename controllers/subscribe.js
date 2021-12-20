const Subscribe = require("../models/subscribe");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgridTransporter = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASS, // naturally, replace both with your real credentials or an application-specific password
  },
});

exports.contactUs = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const { email, firstName, lastName, subject, message } = req.body;
  
    const subs = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      subject: subject,
      message: message,
    };
  
    const subscribeObject = new Subscribe(subs);
  
    await subscribeObject.save();
    res.status(200).json({ message: "Message sended successfully" });
  
    const mailOptions = {
      from: "test@webdevscope.com",
      to: email,
      subject: `Hello ${firstName} ${lastName}`,
      text: "Your message has been received. We will get back to you as soon as possible. Thank you",
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    throw error;
  }

};
