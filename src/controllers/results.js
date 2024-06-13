import { db } from '../db.js';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 * @typedef {{
 * 		username: string,
 * 		activity: string,
 * 		time: number,
 * 		status: 'running' | 'stopped'
 * }[]} Activities_result
 */

/**
 * @type {RequestHandler}
 */
export default function (req, res, next) {
	if (!req.query.sort) {
		res.status(400).send('missing parameters');
		return next();
	}

	/**
	 * @typedef {'username' | 'activity' | 'time'} Sort
	 */

	/**
	 * @type {Sort[]}
	 */
	const valid_sorts = ['activity', 'time', 'username'];

	if (!valid_sorts.includes(/** @type {Sort} */ (req.query.sort))) {
		res.status(400).send('invalid parameter sort');
		return next();
	}

	const activities = db.users.reduce((acc, user) => {
		user.activities.forEach((activity_object) => {
			const end_time = activity_object.executions.end ?? Date.now();

			acc.push({
				activity: activity_object.activity,
				username: user.username,
				status: activity_object.status,
				time: end_time - activity_object.executions.start
			});
		});
		return acc;
	}, /** @type {Activities_result} */ ([]));

	activities.sort((a, b) => {
		switch (/** @type {Sort} */ (req.query.sort)) {
			case 'username': {
				return a.username > b.username ? -1 : 1;
			}
			case 'activity': {
				return a.activity > b.activity ? -1 : 1;
			}
			case 'time': {
				return a.time - b.time;
			}
		}
	});

	res.status(200).send(activities);
}
