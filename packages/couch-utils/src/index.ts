import nano from "nano";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

import { DatabaseHandler } from "./DatabaseHandler.js";
import { Env } from "@crkn-rcdr/access-env";

export type { UniqueResult } from "./DatabaseHandler.js";

export type CouchDBClient<DatabaseNames extends readonly string[]> = {
  [Name in DatabaseNames[number]]: DatabaseHandler;
};

/**
 * Connect to the CouchDB endpoint specified in environment variables.
 * @param databases The list of databases you want to interact with.
 * @returns A strongly-typed object with handlers keyed by the provided database list.
 */
export function connect(
  databases: readonly string[]
): CouchDBClient<typeof databases> {
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

  return Object.fromEntries(
    databases.map((db) => [db, new DatabaseHandler(db, client)])
  );
}
