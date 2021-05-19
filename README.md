# Canadiana Access Platform

This repository contains documentation, specifications, and APIs for the Canadiana Access Platform.

## Directory

### [Glossary.md](Glossary.md)

A glossary of the terms we're using to describe access objects.

### Packages

#### [data](packages/data)

A JavaScript library that validates Access Platform data.

#### [accessor](packages/accessor)

A JavaScript library for interacting with access objects.

### Services

#### [couchdb](services/couchdb)

Access Platform metadata is stored in CouchDB. This directory contains our CouchDB database configuration. We use [Kivik](https://github.com/crkn-rcdr/kivik) to update and test this configuration.

#### [lapin](services/lapin)

An HTTP service that exposes accessor functionality for interoperability with tools written in other languages.

#### [admin](services/admin)

Access Platform admin tools.

## Technical instructions

### Prerequisites

- Docker (with the `couchdb:3.1` image pulled)
- Node >= 14. On Ubuntu, you can use the NodeSource binaries for this. [Here are the instructions.](https://github.com/nodesource/distributions#debinstall)
- pnpm (see below)

### pnpm

This repository uses [pnpm](https://pnpm.js.org) to manage its JavaScript dependencies. With it, we can share dependencies and configuration across packages, and also ensure that they are properly linked against each other. On the command line, pnpm works very similarly to npm. You just need to remember the `p`. To use pnpm, install it globally:

```
$ (sudo) npm install -g pnpm
```

and then install project dependencies:

```
Access-Platform $ pnpm install
```

By default, `pnpm install` will run across all of the "workspaces" listed in [pnpm-workspace.yaml](pnpm-workspace.yaml). For other tasks you want to run across each package, use the `-r` flag.

### Testing

Any package or service with a `test:all` script defined can have that script run together with everything else by running `pnpm test` in the repo's root directory.

### Development environment

**New!** Improvement: run `pnpm run dev; pnpm run cleanup` from the root directory to watch all packages and services. Your mileage may vary with how the output is produced. `pnpm run dev` runs the `dev` script for each package or service; try individual `dev` scripts instead for finer control of things.

Note that the root `dev` script does not run any tests; execute `pnpm test` to do that.
