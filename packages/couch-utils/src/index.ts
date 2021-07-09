import nano from "nano";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

import { DatabaseHandler } from "./DatabaseHandler.js";

export type BasicAuth = {
  user: string;
  password: string;
};

export type ConnectionConfig = {
  url: string | number;
  auth: BasicAuth;
  dbs: readonly string[];
};

export type CouchDBClient<DatabaseNames extends readonly string[]> = {
  [Name in DatabaseNames[number]]: DatabaseHandler;
};

export function connect(
  config: ConnectionConfig
): CouchDBClient<typeof config.dbs> {
  let { url } = config;
  const { auth, dbs } = config;
  if (typeof url === "number") {
    url = `http://localhost:${url}/`;
  }
  const client = nano({
    url,
    requestDefaults: {
      auth: { username: auth.user, password: auth.password },
      // @ts-ignore
      httpAgent: new HttpAgent({ maxSockets: 1 }),
      httpsAgent: new HttpsAgent({ maxSockets: 1 }),
    },
  });

  return Object.fromEntries(
    dbs.map((db) => [db, new DatabaseHandler(db, client)])
  );
}
