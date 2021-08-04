import nano from "nano";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

import { Env } from "@crkn-rcdr/access-env";
import {} from "@crkn-rcdr/access-data";

import { AccessHandler } from "./handlers/access.js";

export { CouchAttachmentRecord } from "./DatabaseHandler.js";

export {
  mangoEqualSelector,
  mangoStringRangeSelector,
  stringRangeEnd,
} from "./util.js";

/**
 * Get handlers for accessing CouchDB Access Platform databases.
 */
export function connect() {
  const env = Env.parse(process.env);
  const client = nano({
    url: env.couch.url,
    requestDefaults: {
      auth: env.couch.auth,
      // @ts-ignore
      httpAgent: new HttpAgent({ maxSockets: 1 }),
      httpsAgent: new HttpsAgent({ maxSockets: 1 }),
    },
  });

  return {
    access: new AccessHandler(client),
  };
}
