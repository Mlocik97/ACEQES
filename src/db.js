import { hash } from 'argon2';

/**
 * @typedef {{
 * 		username: string,
 * 		activity: string,
 * 		status: 'running' | 'stopped',
 * 		executions: {
 * 			start: number,
 * 			end?: number
 * 		}
 * }} Activity
 */

export const db = {
	// this object will be our "replacement" for database
	users: [
		{
			username: 'gabriel',
			password: await hash('correct_password'), // we would normally save salted hash of password (like with argon2 alghoritm) to database.
			/**
			 * @type {{
			 * 		value: string,
			 * 		time: number
			 * }[]}
			 */
			tokens: [],
			/**
			 * @type {Activity[]}
			 */
			activities: []
		}
	]
};
