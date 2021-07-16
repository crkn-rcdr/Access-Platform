import {
  connect,
  CouchDBClient as GenericCouchDBClient,
} from "@crkn-rcdr/couch-utils";

const DATABASES = ["access", "canvas", "dipstaging"] as const;

export type CouchDBClient = GenericCouchDBClient<typeof DATABASES>;

export function initializeCouchDB(): CouchDBClient {
  return connect(DATABASES) as CouchDBClient;
}
