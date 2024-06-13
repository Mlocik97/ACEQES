import { db } from './db.js';
import { verify } from 'argon2';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 * @type {RequestHandler}
 */

export default function (req, res, next) {
	if (req.path === '/login') return next();

	const token = req.cookies.token ? String(req.cookies.token).trim() : '';

	if (!token) {
		res.status(401).send('unauthentificated');
		return;
	}

	// check against db if user with specified token exists (note that I would also check username but it's not part of request in results endpoint)
	const user = db.users.find(({ tokens }) => {
		return tokens.find(({ value }) => value === token);
	});

	if (user) return next();

	res.status(401).send('invalid token'); // res.redirect('/login'); or would redirect if /login would be actual page
}
