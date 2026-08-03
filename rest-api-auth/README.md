# REST API with Authentication

A small, self-contained Node.js/Express REST API demonstrating JWT-based
authentication and role-based authorization. It has no external database
dependency (users are kept in an in-memory store), so it can be run and
tested with nothing more than `npm install`.

## Features

- User registration (`/api/auth/register`) with hashed passwords (bcrypt)
- Login (`/api/auth/login`) issuing signed JWT access tokens
- Protected route (`/api/auth/me`) that returns the current user's profile
- Role-based authorization example (`/api/users`, admin-only)
- Request validation (`express-validator`)
- Security hardening: `helmet`, `cors`, and rate limiting on auth endpoints
- Centralized error handling
- Test suite with Jest + Supertest

## Getting started

```bash
cd rest-api-auth
npm install
cp .env.example .env   # then edit JWT_SECRET etc. as needed
npm start               # starts the server on http://localhost:3001
```

For local development with automatic restarts on file changes:

```bash
npm run dev
```

## Running tests

```bash
npm test
```

## Project structure

```
rest-api-auth/
├── src/
│   ├── app.js                 # Express app: middleware + routes
│   ├── server.js              # Entrypoint that starts the HTTP server
│   ├── config/env.js          # Environment variable loading/defaults
│   ├── controllers/           # Route handlers
│   ├── data/userStore.js      # In-memory "database" of users
│   ├── middleware/            # auth, validation, error handling
│   ├── models/User.js         # Registration, credential checks, hashing
│   ├── routes/                # Express routers
│   └── utils/                 # JWT signing/verification, asyncHandler
└── tests/                     # Jest + Supertest test suite
```

## API reference

### `POST /api/auth/register`

Registers a new user and returns an access token.

Request body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "supersecret"
}
```

Responses:

- `201 Created` — `{ "token": "...", "user": { "id", "name", "email", "role", "createdAt" } }`
- `400 Bad Request` — validation failed (missing name, invalid email, or password shorter than 8 characters)
- `409 Conflict` — a user with that email already exists

### `POST /api/auth/login`

Authenticates an existing user and returns a new access token.

Request body:

```json
{
  "email": "ada@example.com",
  "password": "supersecret"
}
```

Responses:

- `200 OK` — `{ "token": "...", "user": { ... } }`
- `400 Bad Request` — validation failed
- `401 Unauthorized` — invalid email or password

### `GET /api/auth/me`

Returns the profile of the currently authenticated user.

Headers:

```
Authorization: Bearer <token>
```

Responses:

- `200 OK` — `{ "user": { ... } }`
- `401 Unauthorized` — missing/invalid/expired token

### `GET /api/users` (admin only)

Lists all registered users. Requires a valid token belonging to a user with
the `admin` role.

Responses:

- `200 OK` — `{ "users": [ ... ] }`
- `401 Unauthorized` — missing/invalid token
- `403 Forbidden` — authenticated but not an admin

> Note: the public registration endpoint always creates users with the
> `user` role. Promoting a user to `admin` (e.g. via a seed script, database
> migration, or an internal admin tool) is intentionally left outside the
> scope of this sample to avoid a self-service privilege escalation
> vulnerability.

## Configuration

Environment variables (see `.env.example`):

| Variable             | Description                                    | Default              |
| -------------------- | ----------------------------------------------- | --------------------- |
| `PORT`               | HTTP port the server listens on                 | `3001`                 |
| `JWT_SECRET`         | Secret used to sign/verify JWTs                 | dev-only placeholder  |
| `JWT_EXPIRES_IN`     | Access token lifetime (jsonwebtoken format)     | `1h`                   |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor for password hashing         | `10`                   |

**Always set a strong, random `JWT_SECRET` before deploying this outside of
local development or testing.**

## Swapping in a real database

User persistence is isolated behind `src/data/userStore.js`. To back this
API with a real database, replace that module's implementation (keeping the
same function signatures: `findByEmail`, `findById`, `create`, `all`,
`reset`) with calls to your database/ORM of choice — the rest of the
application does not need to change.
