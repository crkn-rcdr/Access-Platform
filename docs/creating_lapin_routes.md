# Creating lapin routes

The admin tools (and, eventually, other things) use [lapin](../services/lapin) to interface with the Access Platform back-end. Lapin's router is found in the [lapin-router package](../packages/lapin-router). The router uses [tRPC](https://trpc.io) to define query and mutation procedures involving Access Platform data. A tRPC route is defined by two functions, `input` and `resolve`, where `input` specifies the shape of the procedures arguments, and `resolve` performs the work involved.

## Naming routes

Each router "namespace" has a router defined in a file in the [routes](../packages/lapin-router/src/routes) directory. Use your discretion when deciding what name to give a procedure, and whether it fits in an existing router or motivates creating a new one. New routers will need to be merged into the main router in [router.ts](../packages/lapin-router/src/router.ts).

## Using routes in the admin tools

A lapin client is available in two places in admin tools code:

- Load functions: `context`
- Client-side code: `$session`

The router's specification is provided to TypeScript such that the `procedure` argument in `lapin.query(procedure, input)` and `lapin.mutation(procedure, input)` is restricted to valid route names.

## CouchDB

The vast majority of lapin routes will need to interact with access object metadata stored in CouchDB. The code that performs these interactions will need to live in different parts of the repo depending on the scope of the interactions:

- [services/couchdb](../services/couchdb): CouchDB [design document functions](https://docs.couchdb.org/en/stable/ddocs/ddocs.html) and [Mango indexes](https://docs.couchdb.org/en/stable/api/database/find.html). If you need to create new design document views or Mango indexes, let everyone know, since updating them in production can take time and cause other things to grind to a halt.
- [packages/couch-utils](../packages/couch-utils): This package performs every request to CouchDB. The `connect` function returns a database handler that lapin has access to. Each database's handler can be extended to provide database-specific functionality. The bulk of CouchDB request code will live here.
- [packages/lapin-router](../packages/lapin-router): Lapin routes should not involve too much business logic, beyond coordinating requests to multiple CouchDB databases or to other services.

Lapin routes can access the database handlers provided by couch-utils in the `couch` property of the lapin context.

### Queries

Queries for CouchDB data may involve document get requests, Mango queries, or design document views. Unless a query requires interacting with more than one database, a dedicated method for the query should be added to the associated database handler class. See [AccessHandler#get](../packages/couch-utils/src/handlers/access.ts) for a simple example.

### Mutations of a single access object

Use an update function in [the access design doc](../services/couchdb/access/design/access/updates) to make the required changes. When writing an update function, we can assume that the shape of the retrieved document matches the object's specification, i.e. there is no need to ensure that fields that are supposed to be there are there.

Use a method in [couch-utils' AccessHandler](../packages/couch-utils/src/handlers/access.ts) to invoke the update function. If the update function accepts data, this method should parse its arguments to generate that data correctly. The method can then retrieve the updated object and parse it, as a measure of sanity checking, if desired. The lapin route should then use this method.

## Noid minting

Access to the noid minter is provided in the `noid` property of the lapin context. Use `ctx.noid.mint(n)` to mint `n` noids, and `ctx.noid.mintOne()` to mint 1 noid.
