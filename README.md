# Authenticated Calculator REST API

An Express REST API with JWT authentication and calculator operations.

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
JWT_SECRET="replace-with-a-long-random-secret" npm start
```

The server listens on `PORT` or port 3000 by default. `JWT_SECRET` is required
when `NODE_ENV=production`; a development-only fallback is used otherwise.
Users are stored in memory, so accounts are cleared whenever the process
restarts. Replace `api/services/userStore.js` with durable storage before using
the service in production.

## API

All request and response bodies use JSON.

### Register

```http
POST /api/auth/register
Content-Type: application/json

{"email":"user@example.com","password":"a-secure-password"}
```

Returns `201` with the user and a one-hour bearer token.

### Log in

```http
POST /api/auth/login
Content-Type: application/json

{"email":"user@example.com","password":"a-secure-password"}
```

### Current user

```http
GET /api/users/me
Authorization: Bearer <token>
```

### Calculate

```http
GET /api/arithmetic?operation=add&operand1=20&operand2=22
Authorization: Bearer <token>
```

Supported operations are `add`, `subtract`, `multiply`, and `divide`. The
original public `/arithmetic` route remains available for backward
compatibility.

## Test

```sh
npm test
```

