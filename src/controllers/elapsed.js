import { db } from '../db.js';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 * @type {RequestHandler}
 */

export default function (req, res, next) {
	if (!req.query.username || !req.query.activity) {
		res.status(400).send('missing parameters');
		return next();
	}

	const user = db.users.find(({ username }) => username === req.query.username);
	const activity_object = user?.activities.find(({ activity }) => activity == req.query.activity);

	if (activity_object) {
		const end_time =
			activity_object.status === 'stopped' ? activity_object.executions?.end ?? 0 : Date.now();

		const time = end_time - activity_object.executions.start;

		res.status(200).send({
			status: activity_object.status,
			time
		});
	} else {
		res.status(404).send("activity doesn't exist");
	}
}
