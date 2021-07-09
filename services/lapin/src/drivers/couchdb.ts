import {
  connect,
  CouchDBClient as GenericCouchDBClient,
} from "@crkn-rcdr/couch-utils";
import { getFromEnv } from "../context.js";

const DATABASES = ["access", "canvas", "dipstaging"] as const;

export type CouchDBClient = GenericCouchDBClient<typeof DATABASES>;

export function initializeCouchDB(): CouchDBClient {
  return connect({
    url: getFromEnv("COUCH_URL"),
    auth: {
      user: getFromEnv("COUCH_USER"),
      password: getFromEnv("COUCH_PASSWORD"),
    },
    dbs: DATABASES,
  }) as CouchDBClient;
}
