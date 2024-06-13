import { db } from '../db.js';
import { verify } from 'argon2';
import { randomBytes } from 'crypto';

/**
 * This type mess is needed due to broken 
 * Express type RequestHandler in case of async function
 * 
 * @typedef {import('express').RequestHandler} RequestHandler
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {{
 * 		(req: Request, res: Response, next: NextFunction): Promise<void>
 * }} AsyncRequestHandler
 * @type {AsyncRequestHandler}
 */
export default async function (req, res, next) {
	if (!req.query.username || !req.query.password) {
		res.status(400).send('missing username or password');
		return next();
	}

	const user = db.users.find(({ username }) => username === req.query.username);

	if (!user) {
		res.status(401).send("user doesn' exist in database");
	} else {
		const password_is_correct = await verify(user.password, String(req.query.password));

		if (password_is_correct) {
			const token = randomBytes(26).toString('hex');

			res.cookie('token', token, {
				// cookies valid for week
				maxAge: 1000 * 60 * 24 * 7,
				httpOnly: true,
				// signed: true, // for testing purposed, sign is disabled, in production it would be enabled
				path: '/'
			});

			res.status(200).send();

			user.tokens.push({
				value: token,
				time: Date.now()
			});
		} else {
			res.status(401).send('wrong password');
		}
	}

	return Promise.resolve()
}
