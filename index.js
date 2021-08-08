const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const express = require('express');
import ejs from 'ejs';
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  })
);

const transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.NODEMAIL_EMAIL,
    pass: process.env.NODEMAIL_PWD
  }
}));

var mailOptions = {
  from: 'DEVzine:port <somerealemail@gmail.com>',
  to: 'idhyo0o@naver.com',
  subject: 'Sending Email using Node.js[nodemailer]',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(err, info){
  if (err) {
    console.log(err);
  } else {
    console.log('Email sent: ' + info.response);
		transporter.close();
  }
});