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

Endpoints
---------

    GET  /arithmetic       perform a calculation
    POST /auth/register    create an account
    POST /auth/login       exchange credentials for an access token
    GET  /auth/me          the account the request is authenticated as

`/arithmetic` is open to everybody.  `/auth/me` is there to show what a
route looks like once it sits behind the authentication middleware.

Authentication
--------------

An account is created from an email and a password of at least eight
characters:

    curl -X POST http://localhost:3000/auth/register \
        -H 'Content-Type: application/json' \
        -d '{"email":"ada@example.com","password":"a-long-enough-password"}'

Presenting those credentials returns a signed token:

    curl -X POST http://localhost:3000/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"ada@example.com","password":"a-long-enough-password"}'

    {
      "tokenType": "Bearer",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "user": { "id": 1, "email": "ada@example.com", "name": null }
    }

That token is what reaches a protected route:

    curl http://localhost:3000/auth/me \
        -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

To guard a route of your own, name the middleware ahead of the handler.
It answers `401` unless the request carries a token this server signed
that still names an existing account, and gives the handler that account
as `req.user`:

    var authenticate = require("./middleware/authenticate");

    app.route("/arithmetic").get(authenticate, arithmetic.calculate);

Configuration
-------------

`JWT_SECRET` is the key tokens are signed with.  Leaving it unset makes
the server generate one at startup so that the sample runs without any
configuration; the cost is that every restart invalidates the tokens
already handed out, and that a second instance cannot verify the first
one's tokens.  In production the variable is required and a missing one
stops the server rather than being papered over.

`JWT_TTL` is how many seconds a token stays valid, an hour by default,
and `PORT` is the port to listen on.

Notes on the sample
-------------------

Accounts are held in memory, so they are gone when the process stops and
are not shared between instances.  Putting a database behind
`api/models/userModel.js` is the change that makes the rest of this
usable.

Two more things a real deployment needs.  The login route accepts
guesses as fast as they arrive, so it wants rate limiting before it
faces the open internet.  And a bearer token is worth exactly as much as
the password to anyone who can read it in transit, which makes HTTPS the
difference between authentication and the appearance of it.

Registration does report that an email is already taken, which tells an
anonymous caller whether an address has an account here.  That is the
usual trade for being able to explain the failure to the person typing;
login gives nothing away, answering an unknown email and a wrong
password identically and taking the same time over both.

