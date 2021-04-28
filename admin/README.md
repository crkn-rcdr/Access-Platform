# Access admin tools

    $ pnpm install
    $ pnpm run dev

## Authentication

Production installations will redirect users to [our auth service](https://auth.canadiana.ca/) before authorizing them. For development, this process is mocked. See the relevant environment variables.

## Environment variables

The admin server reads a number of environment variables.

### Development

These have defaults, but you should set them how you like.

- `DEV_USER_NAME`: The mock user's name.
- `DEV_USER_EMAIL`: The mock user's email address.

### Production

- `HOST`: Public endpoint where this service can be found. (e.g. `https://access.canadiana.ca`)
- `AUTH_ENDPOINT`: Authentication service endpoint. You will likely want to use `https://auth.canadiana.ca/` unless you are working on the auth service locally.
- `AUTH_SECRET`: Authentication JWT secret.
