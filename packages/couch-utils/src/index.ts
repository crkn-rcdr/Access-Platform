import type { z } from "zod";

import nano from "nano";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

import { DatabaseHandler, Document } from "./DatabaseHandler.js";
import { Env } from "@crkn-rcdr/access-env";

export { CouchAttachmentRecord } from "./DatabaseHandler";

export {
  mangoEqualSelector,
  mangoStringRangeSelector,
  stringRangeEnd,
} from "./util.js";

/**
 * Connect to the CouchDB endpoint specified in environment variables.
 * @param databases A record of databases mapped to Zod parsers that validate their contents.
 * @returns A function that can retrieved a strongly-typed handler for a database.
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

  return <T extends Document>(name: string, parser: z.Schema<T>) => {
    return new DatabaseHandler<T>(name, parser, client);
  };
}
