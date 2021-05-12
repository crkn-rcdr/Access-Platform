import { CouchDBConfig, CouchDBEndpoint, initializeCouchDB } from "./CouchDB";

export type AccessorOptions = {
  /** CouchDB connection options. */
  couch: CouchDBConfig;
};

export type AccessorEndpoints = {
  couch: CouchDBEndpoint;
};

export const initializeEndpoints = (
  options: AccessorOptions
): AccessorEndpoints => {
  return { couch: initializeCouchDB(options.couch) };
};
