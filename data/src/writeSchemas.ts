import * as data from ".";

import { join as pathJoin, dirname } from "path";
import { writeJsonSync as writeJson } from "fs-extra";
import { sync as mkdirp } from "mkdirp";

const schemaDir = pathJoin(__dirname, "..", "schemas");

Object.entries(data.validator.schemas)
  .filter(([id, _]) => id.startsWith("/"))
  .forEach(([id, obj]) => {
    const schema = obj?.schema;
    if (schema) {
      const path = pathJoin(schemaDir, ...id.substring(1).split("/")) + ".json";
      mkdirp(dirname(path));
      writeJson(path, schema, { spaces: 2 });
    }
  });
