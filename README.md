Calculator.js: a node.js Demonstration Project
==============================================
An example node.js project, including tests with mocha, that behaves like
a pocket calculator.

The project contains a simple node.js application that exposes REST APIs
to perform arithmetic on integers, and provides a test suite with mocha
and chai.  The `mocha-junit-reporters` package is included to provide XML
output that can be presented in a continuous integration tool like
[Azure DevOps](https://azure.com/devops).

To build, simply:

1. Runs `npm install` to install dependencies.
2. Runs `npm test` to run Mocha and execute the unit tests.

Run the server with `npm start` (listens on `PORT`, default 3000).

Authentication
--------------
The API supports JWT-based authentication (via `jsonwebtoken` and
`bcryptjs`). Users are kept in a simple in-memory store
(`api/models/userModel.js`), which can be swapped for a database-backed
implementation without changing the controllers.

Configuration is read from environment variables:

* `JWT_SECRET` — secret used to sign tokens (set this in production).
* `JWT_EXPIRES_IN` — token lifetime (default `1h`).

### Endpoints

| Method | Path             | Auth   | Description                            |
|--------|------------------|--------|----------------------------------------|
| POST   | `/auth/register` | none   | Register; returns the user and a token |
| POST   | `/auth/login`    | none   | Log in; returns the user and a token   |
| GET    | `/users/me`      | Bearer | Return the authenticated user          |
| GET    | `/arithmetic`    | none   | Calculator API (unchanged)             |

### Example

```sh
# Register (also returns a token)
curl -X POST localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"a long password"}'

# Log in
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"a long password"}' | jq -r .token)

# Call a protected endpoint
curl localhost:3000/users/me -H "Authorization: Bearer $TOKEN"
```

Passwords must be at least 8 characters and are stored only as bcrypt
hashes. Protected routes expect an `Authorization: Bearer <token>`
header and respond with `401` when the token is missing, malformed,
expired, or refers to a user that no longer exists.

