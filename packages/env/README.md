# packages/env - Access Platform environment variable validator

This package is used by Access Platform services to ensure that environment variables are set correctly when they are run. The code for this validation is found at `src/index.ts`. Validation is performed using [Zod](https://github.com/colinhacks/zod).

## Required variables

You will need to set these yourself:

- `NODE_ENV`: set this to `production` if running in production
- `URL_EXTERNAL`: public-facing URL serving the admin tools (e.g. `https://access.canadiana.ca`)
- `AUTH_JWT_SECRET`: secret for verifying platform JWTs
- `COUCHDB_URL`: URL serving CouchDB (e.g. `http://jarlsberg.tor.c7a.ca:5984`)
- `COUCHDB_PASSWORD`: the CouchDB admin user's password
- `LAPIN_URL`: network-internal URL serving lapin RPC API(i.e., something the admin tools has access to)
- `HARE_URL`: network-internal URL serving hare REST API (i.e., something the admin tools has access to)
- `NOID_URL`: URL pointing to the Noid minting service (e.g. `http://noid.c7a.ca`)
- `SWIFT_URL`: URL pointing to a Swift endpoint (e.g. `http://swift-tor.canadiana.ca`)
- `SWIFT_USER`: Swift username
- `SWIFT_PASSWORD`: Swift password

## Optional variables

You may not need to change these, and they have default values.

- `AUTH_URL`: URL serving the the platform authentication service (default: `https://auth.canadiana.ca`)
- `COUCHDB_USER`: name of the CouchDB admin user (default: `admin`)
- `SWIFT_ACCOUNT`: name of the Swift account in which content is stored (default: `AUTH_crkn`)

## Default ports

- `admin`: 4747
- `lapin`: 5858
