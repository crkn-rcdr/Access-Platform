# Canadiana Access Platform

This repository contains documentation, specifications, and APIs for the Canadiana Access Platform.

## Directory

### [Glossary.md](Glossary.md)

A glossary of the terms we're using to describe access objects.

### [Policy](Policy)

Other policy documents. May not be up-to-date (or our code may not be up-to-date with it).

### [data](data)

A JavaScript library that validates Access Platform data.

### [couchdb](couchdb)

Access Platform metadata is stored in CouchDB. This directory contains our CouchDB database configuration. We use [Kivik](https://github.com/crkn-rcdr/kivik) to update and test this configuration.

The [Databases](Databases) directory contains older configuration and is being phased out.

### [accessor](accessor)

A JavaScript library for interacting with access objects.

## Technical instructions

This repository uses [pnpm](https://pnpm.js.org) to manage its JavaScript dependencies. With it, we can share dependencies and configuration across packages, and also ensure that they are properly linked against each other. On the command line, pnpm works very similarly to npm. You just need to remember the `p`. To use pnpm, install it globally:

```
$ (sudo) npm install -g pnpm
```

and then install project dependencies:

```
Access-Platform $ pnpm install
```

By default, `pnpm install` will run across all of the "workspaces" listed in [pnpm-workspace.yaml](pnpm-workspace.yaml). For other tasks you want to run across each package, use the `-r` flag.

### Validating Couch documents with `kivik validate`

First, run the `build` script recursively over all packages. This will transpile the TypeScript code in `data` to JavaScript, so that it can be used by `couchdb`.

```
Access-Platform $ pnpm -r build
```

Then, from the `couchdb` directory, you can use `pnpx` to run Kivik on the command line.

```
Access-Platform/couchdb $ pnpx kivik validate access path/to/file.json
```

### Generating schema files from `data` code

```
Access-Platform $ cd data
Access-Platform/data $ pnpm schemas
Access-Platform/data $ ls schemas/couch
access.json  canvas.json
```
