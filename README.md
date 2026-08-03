Authenticated Notes REST API
============================

A Node.js/Express REST API with JWT authentication and a user-owned notes
resource. The original `/arithmetic` calculator endpoint remains available.

Getting started
---------------

```sh
npm install
JWT_SECRET='replace-with-a-long-random-secret' npm start
```

`JWT_SECRET` is required for a safe deployment. When it is absent, the app
uses a development-only fallback so local development and tests work; never
use that fallback in production. Tokens expire after one hour by default.
Set `JWT_EXPIRES_IN` to change that duration.

Authentication endpoints
------------------------

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ "email", "password" }` | Creates a user and returns a JWT |
| `POST` | `/api/auth/login` | `{ "email", "password" }` | Returns a JWT |
| `GET` | `/api/auth/me` | — | Returns the authenticated user |

Passwords must be at least eight characters. Password hashes are created with
bcrypt and are never included in API responses.

Notes endpoints
---------------

Send the token returned by register or login on every notes request:

```http
Authorization: Bearer <token>
```

| Method | Path | Body |
| --- | --- | --- |
| `GET` | `/api/notes` | — |
| `POST` | `/api/notes` | `{ "title", "content" }` |
| `GET` | `/api/notes/:id` | — |
| `PUT` | `/api/notes/:id` | `{ "title", "content" }` |
| `DELETE` | `/api/notes/:id` | — |

All notes are scoped to their owning user. Data is stored in memory and is
lost when the server restarts; replace `api/models/store.js` with a
database-backed repository before deploying or running multiple instances.

Testing
-------

```sh
npm test
```

