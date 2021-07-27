import { z } from "zod";
import { connect } from "@crkn-rcdr/couch-utils";
import {
  Alias,
  Manifest,
  Collection,
  Canvas,
  DMDTask,
  LegacyPackage,
} from "@crkn-rcdr/access-data";

// Use this essentially so that `slug` is defined
const AccessDatabaseObject = z.union([Alias, Manifest, Collection]);

export function initializeCouchDB() {
  const createHandler = connect();

  return {
    /** `access` database: Access objects that aren't canvases */
    access: createHandler("access", AccessDatabaseObject),
    /** `canvas` database: Access objects that _are_ canvases */
    canvas: createHandler("canvas", Canvas),
    /** `dipstaging` database: Record of all available legacy DIPs */
    dips: createHandler("dipstaging", LegacyPackage),
    /** `dmdtask` database: Descriptive metadata batch processing tasks */
    dmd: createHandler("dmdtask", DMDTask),
  };
}
