# packages/env - Access Platform environment variable validator

This package is used by Access Platform services to ensure that environment variables are set correctly when they are run. The code for this validation is found at `src/index.ts`. Validation is performed using [Zod](https://github.com/colinhacks/zod).

## Required variables

You will need to set these yourself:

- `ADMIN_URL_EXTERNAL`: external URL serving the admin tools (e.g. `https://access.canadiana.ca`)
- `AUTH_JWT_SECRET`: secret for verifying platform JWTs
- `COUCHDB_PASSWORD`: the CouchDB admin user's password

## Optional variables

You may not need to change these, and they have default values.

- `AUTH_URL`: URL serving the the platform authentication service (default: `https://auth.canadiana.ca`)
- `COUCHDB_URL`: URL serving CouchDB (default: `http://couch:5984`)
- `COUCHDB_USER`: name of the CouchDB admin user (default: `admin`)

## Internal variables

Access platform services assume that they are being run inside a Docker network with the appropriate aliases configured (e.g. `lapin` for [the lapin service](../../services/lapin)). This is also controlled by environment variables:

- `LAPIN_URL_INTERNAL`: URL serving lapin (default: `http://lapin:5858`)

## Default ports

- `admin`: 4747
- `lapin`: 5858