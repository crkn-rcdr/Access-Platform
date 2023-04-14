import nano from "nano";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

import { Env } from "@crkn-rcdr/access-env";

import { AccessHandler } from "./handlers/access.js";
import { DMDTaskHandler } from "./handlers/dmdtask.js";
import { LegacyPackageHandler } from "./handlers/dipstaging.js";
import { WipmetaHandler } from "./handlers/wipmeta.js";
import { OcrBatchHandler } from "./handlers/ocr.js";
import { IIIFTaskHandler } from "./handlers/iiifTask.js";

export { CouchAttachmentRecord } from "./DatabaseHandler.js";

export {
  mangoEqualSelector,
  mangoStringRangeSelector,
  stringRangeEnd,
} from "./util.js";

export function client() {
  const env = Env.parse(process.env);
  return nano({
    url: env.couch.url,
    requestDefaults: {
      auth: env.couch.auth,
      // @ts-ignore
      httpAgent: new HttpAgent({ maxSockets: 1 }),
      httpsAgent: new HttpsAgent({ maxSockets: 1 }),
    },
  });
}

/**
 * Get handlers for accessing CouchDB Access Platform databases.
 */
export function connect() {
  const c = client();

  return {
    access: new AccessHandler(c),
    dipstaging: new LegacyPackageHandler(c),
    dmdtask: new DMDTaskHandler(c),
    wipmeta: new WipmetaHandler(c),
    ocr: new OcrBatchHandler(c),
    iiiftask: new IIIFTaskHandler(c)
  };
}
