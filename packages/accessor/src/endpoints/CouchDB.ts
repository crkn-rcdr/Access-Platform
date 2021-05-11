import { get as getNano, Auth } from "@crkn-rcdr/nano";
import { DatabaseHandler } from "kivik";

import { DocumentTypes } from "@crkn-rcdr/access-data";

const DATABASES = ["access", "canvas"] as const;

export type DatabaseName = typeof DATABASES[number];

/**
 * CouchDB endpoint configuration.
 */
export type CouchDBConfig = {
  /**
   * CouchDB endpoint URL.
   */
  url: string;
  /**
   * CouchDB endpoint username and password.
   */
  auth: Auth;
};

/**
 * An object containing database handlers for each Couch database used by accessor.
 */
export type CouchDBEndpoint = {
  [Name in DatabaseName]: DatabaseHandler<DocumentTypes[Name]>;
};

export const initializeCouchDB = (config: CouchDBConfig): CouchDBEndpoint => {
  const nano = getNano(config.url, config.auth);
  return Object.fromEntries(
    DATABASES.map((db) => [db, nano.use(db)])
  ) as CouchDBEndpoint;
};
