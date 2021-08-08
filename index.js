const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const express = require('express');
const app = express();
const cors = require('cors');

let tmpDB = []; // dummy data
const ejs = require('ejs');
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

const SERVER_ENDPOINT = 'http://localhost:80';

const transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.NODEMAIL_EMAIL,
    pass: process.env.NODEMAIL_PWD
  }
}));

app.post('/signup', (req, res) => {
	const { email, password } = req.body;
	const authCode = String(Math.random().toString(36).slice(2));

	tmpDB.push({ user_email: email, user_password: password, authCode, emailauth: 0 }); // DB.create
	setTimeout(() => {
		let user = tmpDB.filter((user) => user.authCode === authCode)[0]; // DB.find
		if (user) {
			if (user.emailauth === 0) {
				for (let i = 0; i < tmpDB.length; i++) if (tmpDB[i].authCode === authCode) tmpDB.splice(i, 1); // DB.delete
			}
		}
	}, 30 * 60 * 1000); // 30 minutes

	let authMailForm;
	ejs.renderFile(__dirname + '/authMail.ejs', { SERVER_ENDPOINT, authCode }, (err, data) => {
		if (err) console.log(err);
		authMailForm = data;
	})

	transporter.sendMail({
		from: 'DEVzine:port <devzineport@gmail.com>',
		to: email,
		subject: '회원가입 수락하삼[nodemailer]',
		html: authMailForm
	}, (err, info) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Email sent: ' + info.response);
			transporter.close();
		}
	});

	res.status(200).send({ message: 'plz accept mail' });
});

app.get('/authmail/:id', (req, res) => {
	const authCode = req.params.id;
	
	let user = tmpDB.filter((user) => user.authCode === authCode)[0]; // DB.find
	if (user) {
		user.emailauth = 1; // DB.update
	}
	// ++ redirect code
	res.status(200).send({ message: 'success signup' });
});

app.post('/signin', (req, res) => {
	const { email, password } = req.body;
	let user = tmpDB.filter((user) => user.user_email === email && user.user_password === password)[0]; // DB.find
	if (user) {
		if (user.emailauth === 0) {
			return res.status(200).send({ message: 'plz accept mail' });
		} else {
			return res.status(200).send({ message: 'success signin' });
		}
	}
	res.status(200).send({ message: 'fail signin' });
});

app.get('/', (req, res) => {
	res.status(200).send(tmpDB);
});

const HTTPS_PORT = process.env.HTTPS_PORT || 80;

app.listen(HTTPS_PORT, () => console.log('http server success'));