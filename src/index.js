import express from 'express';
import cookieParser from 'cookie-parser';

import middleware from './middleware.js';

/*
 We could actually import it with asnyc import() in loop
 to get those modules from controllers directory and practicaly make
 filesystem router (like most modern frameworks offer)
*/
import login from './controllers/login.js';
import start from './controllers/start.js';
import stop from './controllers/stop.js';
import elapsed from './controllers/elapsed.js';
import results from './controllers/results.js';

const app = express();

app.use(cookieParser('SECRET')); // there we would pass secret from environment variables, or even could generate secret

app.use(middleware);

app.get('/login', login);
app.get('/start', start);
app.get('/stop', stop);
app.get('/elapsed', elapsed);
app.get('/results', results);

app.listen(process.env.PORT);
