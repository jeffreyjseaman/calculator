Calculator.js: a node.js Demonstration Project
==============================================
An example node.js project, including tests with mocha, that behaves like
a pocket calculator.

The project contains a simple node.js application that exposes REST APIs
to perform arithmetic on integers, JWT-based authentication, and a test
suite with mocha and chai.  The `mocha-junit-reporters` package is included
to provide XML output that can be presented in a continuous integration tool
like [Azure DevOps](https://azure.com/devops).

## Quick start

1. Run `npm install` to install dependencies.
2. Run `npm start` to start the API on port 3000 (or `PORT`).
3. Run `npm test` to run Mocha and execute the unit tests.

Optional environment variables:

- `JWT_SECRET` — secret used to sign tokens (default: `dev-secret-change-me`)
- `JWT_EXPIRES_IN` — token lifetime (default: `24h`)
- `PORT` — HTTP port (default: `3000`)

## Authentication

Users are stored in memory for this demo. Passwords are hashed with bcrypt,
and successful register/login responses include a JWT.

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret12"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret12"}'
```

### Current user

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token>"
```

## Arithmetic (protected)

The calculator endpoint requires a Bearer token:

```bash
curl 'http://localhost:3000/arithmetic?operation=add&operand1=21&operand2=21' \
  -H "Authorization: Bearer <token>"
```

Supported operations: `add`, `subtract`, `multiply`, `divide`.
