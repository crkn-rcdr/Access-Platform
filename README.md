# Canadiana Access Platform

## Database definitions

Schemas, design documents, and test fixtures for databases can be found in the Databases directory.

Ideally, databases should be defined using [JSON Schema](https://json-schema.org/). Discussion about schemas can take place in issues/PRs.

### Use of the JSON Schema `date-time` string format

The `date-time` string format validates any ISO 8601 date-time. While in the long run this shouldn't present any issues, CouchDB 1.7 uses an old-enough version of SpiderMonkey for JavaScript parsing that we can't trust its `Date.parse()` method to do the right thing. As a result, all date-times should be entered in the format `yyyy-MM-ddThh:mm:ssZ`.

### Tools

```
$ npm install
OR
$ yarn install
```

(Please note that `package.json` references the master branch of [Kivik](https://github.com/crkn-rcdr/kivik); you might need to ensure your Kivik dependency is up to date.)

Run the "inspect" script to look at a test Couch installation featuring all of the databases.

Run the "validate" script to validate a JSON document against a schema (or a directory that contains a schema). Use it as follows:

```
$ yarn run validate path/to/doc dir/with/schema
```

### Testing

An integration testing suite for design documents and fixtures has been set up in `test/`. Run `yarn run docker:test` to run the suite. Tests can be written using [nano](https://github.com/apache/couchdb-nano) to interact with the test database.

A future update to Kivik will allow tests to be written in files in the same directory as the design document functions themselves.

## Policy

The Policy directory contains hopefully up-to-date policy documents about the access platform.
