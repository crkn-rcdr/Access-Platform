# Canadiana Access Platform

This repository contains documentation, specifications, and APIs for the Canadiana Access Platform.

## Directory

### [Glossary.md](Glossary.md)

A glossary of the terms we're using to describe access objects.

### Packages

#### [env](packages/env)

Environment variable validator.

#### [data](packages/data)

Validators and parsers for Access Platform data. Parsers and TypeScript type definitions are generated using the [Zod library](https://github.com/colinhacks/zod).

#### [couch-utils](packages/couch-utils)

Wrapper around [nano](https://github.com/apache/couchdb-nano) that exposes functionality useful for Access Platform operations.

#### [lapin-router](packages/lapin-router)

Router and context for the [lapin](#lapin) service. Defined here so that the router's type definition can be used in multiple services.

### Services

#### [haproxy](services/haproxy) (dev-only)

HAProxy configuration for the Access Platform development environment.

#### [couchdb](services/couchdb) (dev-only)

Access Platform metadata is stored in CouchDB. This directory contains our CouchDB database configuration. We use [Kivik](https://github.com/crkn-rcdr/kivik) to update and test this configuration.

#### [lapin](services/lapin)

An HTTP service providing an API for front-end tools and scripts to interact with Access Platform data.
Uses [tRPC](https://trpc.io) to define the interface.

#### [admin](services/admin)

Access Platform admin tools, built with [SvelteKit](https://kit.svelte.dev).

## Technical instructions

### Prerequisites

To build the production images, all you need is Docker.

For development, updating JavaScript dependencies and running anything on your machine without Docker, you will need to [install NodeJS 16 and pnpm](docs/node_pnpm.md). Further instructions will assume you can run pnpm on your machine.

### pnpm Docker convenience scripts

There are a bunch of convenience scripts for invoking docker-compose in [package.json](package.json). The most helpful are:

- `pnpm down`: brings down the Docker environment
- `pnpm dev`: brings down the Docker environment, brings up the development environment
- `pnpm prod`: brings down the Docker environment, brings up the production environment

The development and production environments use the same port mappings and as such cannot be run simultaneously.

### Running the development environment

The development environment runs the services defined in [docker-compose.yaml](docker-compose.yaml) with profile `dev`. These are:

- `haproxy`: proxy between host connections and services
- `couchdb`: a fresh CouchDB instance
- `noid`: an ephemeral [noid](https://github.com/crkn-rcdr/noid) service for minting unique access object identifiers
- `packages`: watches for changes in all `packages` directories, runs tests, and rebuilds the packages
- `kivik`: service that initializes the CouchDB instance, deploys our CouchDB configuration to it, and then watches for changes to that configuration
- `lapin`: API server, which reloads if its dependencies have changed
- `admin`: Admin tools, running in with `svelte-kit dev`

To set it up, first do the following:

1. Connect to the Canadiana VPN.
2. Ensure you are logged into our private Docker registry at `docker.c7a.ca`. The username and password can be found in the shared development 1Password vault. Log in by running the following:

   $ docker login docker.c7a.ca

3. If you are using the [HAProxy confguration found at the old repository](https://github.com/crkn-rcdr/haproxy), make sure it isn't running and either copy the `certs` directory and `pass.txt` into `./services/haproxy`, or re-run the certificate generation script. If you haven't used it before, follow the instructions in [the haproxy service directory](services/haproxy) to generate SSL certificates.
4. Fetch the production CouchDB password and the platform authentication JWT secret from the shared development 1Password vault. If you don't have access to this, let Sascha know.
   1. Copy `.env.secret.example` into `.env.secret` and add the values there.
   2. Copy `kivikrc.example.json` to `kivikrc.json` and add the CouchDB password where asked.

Build the repository on your host machine. As things stand right now the development environment creates a blanket Docker volume for the entire codebase (i.e. `.:/repo`). If you haven't built packages on your host machine, when this volume is instantiated, the image's build will be thrown away.

    $ pnpm build

If this is your first time running the dev environment, you will need to be connected to the Canadiana VPN to pull the noid service image. Build and run the environment with

    $ pnpm dev

This will start the devvelopment environment services in detached mode. Use `docker-compose logs` to examine log output. You can view the output of specific services by running, for example,

    $ docker-compose logs -f admin

to attach your terminal to the logged output of the admin service.

The vast majority of editing performed on your host machine should cause these services to update automatically. The primary exception is updating package dependencies. After changing the dependency, rerun `pnpm dev` to rebuild the development image.

The `haproxy` service is configured to handle passing requests to particular domains to particular services. If you add the following records to `/etc/hosts`:

    127.0.0.1    couch-dev.canadiana.ca
    127.0.0.1    access-dev.canadiana.ca

visiting <https://couch-dev.canadiana.ca/_utils> should bring you to the development CouchDB instance, and visiting <https://access-dev.canadiana.ca> should bring you to the admin tools. By default the services' ports will not be directly accessible to your host machine.

### Adding new functionality

Access platform functionality passes through lapin, an HTTP service with a router defined by [tRPC](https://trpc.io). [Read more on how this works here](docs/creating_lapin_routes.md).

### Testing

Work on a comprehensive testing image is forthcoming. Plans are to add a test watcher to the development environment and to create a test stage for potential CI use.

### Running and deploying the production environment

Ensure that you are connected to the Canadiana VPN. Run

    $ pnpm prod

to build and run the production environment on your machine. Differences between this and the development environment:

- Files are not watched for changes
- Live production CouchDB and noid services are used
- Only `haproxy-prod`, `lapin-prod`, and `admin-prod` are started

There is no automated deploy of CouchDB configuration to production CouchDB. If you've made changes to files in `services/couchdb` you will need to deploy them yourself. You can do this by running

    $ pnpm exec -C services/couchdb kivik deploy production

Avoid doing this frivolously, as changes to these files could cause hours-long database index updates.

The production image is tagged `access-platform:prod`. When you're satisfied with how the production containers look, follow the not-yet-established standard procedure for deploying the image to our private Docker registry. TODO: establish this procedure!

### Production environment variables

More information about what environment variables are expected can be found in [the env package](packages/env).
