#!/usr/bin/env node

const fs = require("fs");
const RefParser = require("@apidevtools/json-schema-ref-parser");
const ajv = new require("ajv")();

const argv = require("yargs")
  .usage("Usage: $0 [options]")
  .alias("s", "schema")
  .nargs("s", 1)
  .describe("s", "Schema for validation")
  .alias("f", "file")
  .nargs("f", 1)
  .describe("f", "File to validate")
  .demandOption(["schema", "file"]).argv;

RefParser.dereference(
  JSON.parse(fs.readFileSync(argv.schema)),
  (err, schema) => {
    if (err) {
      console.log(err);
    } else {
      let valid = ajv.validate(schema, JSON.parse(fs.readFileSync(argv.file)));
      if (valid) {
        console.log("You did it.");
      } else {
        console.log(ajv.errors);
      }
    }
  }
);
