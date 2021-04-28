# Access admin tools

    $ pnpm install
    $ pnpm run dev

The cookie parser is expecting this to be at a \*.canadiana.ca domain. For development we might want to replace that with a mock user.

## .env template

A `.env` file is expected with a few values listed.

- `PORT`: port the server will run on (e.g. `3060`)
- `AUTH`: authentication endpoint. You will likely want to use `https://auth.canadiana.ca/` unless you are working on the auth service locally.
- `HOST`: protocol/domain/port the auth server can redirect back to (e.g. `http://access-dev.canadiana.ca:3060`)
- `JWT_SECRET`: authentication JWT secret. Find it in our password manager.
