#!/usr/bin/env node

const { get: getNano } = require("@crkn-rcdr/nano");
const { readFileSync } = require("fs");
const { join: pathJoin } = require("path");

const { AccessHandler } = require("./dist/cjs/handlers/access.js");
const { accessMigrations } = require("./dist/cjs/migrations/access.js");

const [_ex, _path, deployment, db, migration] = process.argv;

if (!deployment || !db || !migration) {
  console.error("Usage: migrate <deployment> <db> <migration>");
  process.exit(1);
}

const deployments = JSON.parse(
  readFileSync(pathJoin(__dirname, "..", "..", "kivikrc.json"), "utf-8")
).deployments;

if (!deployments[deployment]) {
  console.error(`No kivikrc deployment called ${deployment}`);
}

// NOTE: there will be more dbs eventually
if (db !== "access") {
  console.error(`No migrations for database: ${db}`);
  process.exit(1);
}

const m = accessMigrations[migration];

if (!m) {
  console.error(`No migration with name ${migration}`);
}

(async () => {
  const {
    url,
    auth: { user, password },
  } = deployments[deployment];

  const client = getNano(url, { user, password });
  const handler = new AccessHandler(client);

  console.log("Migrating...");
  const error = await m(handler);
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    console.log("Done migrating.");
  }
})();
