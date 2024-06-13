import { test } from 'uvu';
import * as assert from 'uvu/assert';
import '../src/index.js';

/**
 * @typedef {import('../src/controllers/results.js').Activities_result} Activities_result
 */

const domain = `http://localhost:${process.env.PORT}`;

/** @type {string} */
let auth_token;

/* endpoint - login */

test('LOGIN: invalid or missing parameters', async () => {
	const response = await fetch(`${domain}/login`);
	assert.is(response.status, 400);
});

test('LOGIN: incorrect password', async () => {
	const response = await fetch(`${domain}/login?username=gabriel&password=wrong_password`);
	assert.is(response.status, 401);
	const cookies = response.headers.getSetCookie();
	assert.is(cookies.length, 0); // there isn't any cookie with token
});

test('LOGIN: correct password', async () => {
	const response = await fetch(`${domain}/login?username=gabriel&password=correct_password`);
	assert.is(response.status, 200);
	const [token_cookie] = response.headers.getSetCookie();

	const [token_name, token_value] = token_cookie.split(';')[0].trim().split('='); // this is dumb, and should rewrite it

	assert.is(token_name, 'token'); // "token=<random string>" -> is token included?
	assert.is(token_value.length, 52); // token value should be 52

	auth_token = token_value;
});

/* endpoint - start */

test('START: invalid or missing parameters', async () => {
	const response = await fetch(`${domain}/start`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 400);
});

test('START: unauthentificated', async () => {
	const response = await fetch(`${domain}/start?username=gabriel&activity=programming`);
	assert.is(response.status, 401);
});

test('START: authentificated', async () => {
	const response1 = await fetch(`${domain}/start?username=gabriel&activity=reading`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});

	const response2 = await fetch(`${domain}/start?username=gabriel&activity=programming`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});

	assert.is(response1.status, 200);
	assert.is(response2.status, 200);
});

/* endpoint - stop */

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await wait(1000); // emulate 1 second of "activity running", in elapsed time will be higher as it takes small time to recieve stop request.

test('STOP: invalid or missing parameters', async () => {
	const response = await fetch(`${domain}/stop`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 400);
});

test('STOP: unauthentificated', async () => {
	const response = await fetch(`${domain}/stop?username=gabriel&activity=programming`);
	assert.is(response.status, 401);
});

test('STOP: authentificated', async () => {
	const response = await fetch(`${domain}/stop?username=gabriel&activity=programming`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 200);
});

test("STOP: authentificated but activity doesn't exist", async () => {
	const response = await fetch(`${domain}/stop?username=gabriel&activity=non_existing_activity`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 404);
});

/* endpoint - elapsed */

test('ELAPSED: invalid parameters', async () => {
	const response = await fetch(`${domain}/elapsed`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 400); // missing parameters
});

test('ELAPSED:  unauthentificated', async () => {
	const response = await fetch(`${domain}/elapsed?username=gabriel&activity=programming`);
	assert.is(response.status, 401);
});

test('ELAPSED:  authentificated, but never did run', async () => {
	const response = await fetch(
		`${domain}/elapsed?username=gabriel&activity=non_existing_activity`,
		{
			credentials: 'include',
			headers: {
				Cookie: `token=${auth_token}`
			}
		}
	);
	assert.is(response.status, 404);
});

/*
		Toto je otázne, lebo v jednom bode sa píše "vrátiť informáciu či aktivita beží alebo je zastavená" 
		a v druhom bode (pre elapsed) že mám vrátiť chybu ak nebeží 
		(predpokladám že má byť len situácia kedy nikdy nebežala 
		a len v texte chýba spojka "a" čím by bolo jasné že oba podmienky musia byť splnené pre vrátenie chyby). 
		Za normálnej situácie by som sa samozrejme opýtal aby sa upresnila požiadavka.
		Keďže programming bežala tak namiesto chyby vrátim výsledok
	*/
test('ELAPSED:  authentificated, but is not running', async () => {
	const response = await fetch(`${domain}/elapsed?username=gabriel&activity=programming`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 200);

	/** @type {{ time: number, status: 'running' | 'stopped' }} */
	const object = await response.json();

	assert.ok(object.time > 0);
	assert.is(object.status, 'stopped');
});

test('ELAPSED:  authentificated, if is running', async () => {
	const response = await fetch(`${domain}/elapsed?username=gabriel&activity=reading`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 200);

	/** @type {{ time: number, status: 'running' | 'stopped' }} */
	const object = await response.json();
	assert.ok(object.time > 0);
	assert.is(object.status, 'running');
});

/* endpoint - results */

test('RESULTS: invalid parameters', async () => {
	const response = await fetch(`${domain}/results`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 400); // missing parameters
});

test('RESULTS:  unauthentificated', async () => {
	const response = await fetch(`${domain}/results?sort=username`);
	assert.is(response.status, 401);
});

test('RESULTS:  authentificated, sorted by username', async () => {
	const response = await fetch(`${domain}/results?sort=username`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 200);

	/**
	 * @type {Activities_result}
	 */
	const objects = await response.json();

	const objects_without_time = objects.map(({ time, ...o }) => o);

	assert.equal(objects_without_time, [
		{
			activity: 'reading',
			username: 'gabriel',
			status: 'running'
		},
		{
			activity: 'programming',
			username: 'gabriel',
			status: 'stopped'
		}
	]);

	objects.forEach(({ time }) => assert.ok(time > 1));
});

test('RESULTS:  authentificated, sorted by activity', async () => {
	const response = await fetch(`${domain}/results?sort=activity`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 200);

	/**
	 * @type {Activities_result}
	 */
	const objects = await response.json();

	const objects_without_time = objects.map(({ time, ...o }) => o);

	assert.equal(objects_without_time, [
		{
			activity: 'reading',
			username: 'gabriel',
			status: 'running'
		},
		{
			activity: 'programming',
			username: 'gabriel',
			status: 'stopped'
		}
	]);

	objects.forEach(({ time }) => assert.ok(time > 1));
});

test('RESULTS:  authentificated, sorted by time', async () => {
	const response = await fetch(`${domain}/results?sort=time`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 200);

	/**
	 * @type {Activities_result}
	 */
	const objects = await response.json();

	objects.forEach(({ time }) => assert.ok(time > 1));

	assert.ok(objects[0].time < objects[1].time);
});

/*
 Toto je tiež otázne, pravdepodobne by sa poslalo nezoradené pole 
 (či už by parameter chýbal alebo bol invalid) 
 Ale na demo je to jedno,...
 */
test('RESULTS:  authentificated, sorted by invalid parameter value', async () => {
	const response = await fetch(`${domain}/results?sort=invalid_value`, {
		credentials: 'include',
		headers: {
			Cookie: `token=${auth_token}`
		}
	});
	assert.is(response.status, 400);
});

test.run();
