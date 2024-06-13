import { db } from '../db.js';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 * @typedef {import('../db.js').Activity} Activity
 */

/**
 * @type {RequestHandler}
 */

export default function (req, res, next) {
	if (!req.query.username || !req.query.activity) {
		res.status(400);
		res.send('missing parameters');
		return next();
	}

	const user = db.users.find(({ username }) => username === req.query.username);
	const activity_object = user?.activities.find(({ activity }) => activity == req.query.activity);

	if (activity_object) {
		activity_object.executions = {
			start: Date.now()
		};
		res.status(200).send('OK');
	} else if (req.query.activity) {
		/**
		 * @type {Activity}
		 */
		const new_acitivity = {
			username: String(req.query.username),
			activity: String(req.query.activity),
			status: 'running',
			executions: {
				start: Date.now()
			}
		};
		user?.activities.push(new_acitivity); // create new
		res.status(200).send('OK');
	}
}
