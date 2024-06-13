# ACESEQ

Interview task

## How to start

First, we will need to install dependencies with `npm i` command, then we can execute `npm run start` to run the server.

With `npm run test` we can execute unit tests and check if all endpoints work correctly.

## Project structure

Project contains two important folders, rest are just configuration files.

- `./src/`: Contain application source codes
- `./__tests__/`: Contain unit test codes

### `./src/`:

Includes files:

- `./src/index.js` that creates server and register endpoints.
- `./src/middleware.js` contains logic used for all requests (verifying cookie token)
- `./src/db.js` emulates database, resp. hold all data that would be in database

And includes folder `./src/controllers/` that contain files, each containing logic for specific endpoint.
