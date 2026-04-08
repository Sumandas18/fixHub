require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, 
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, 
  },
})

module.exports = transporter;