import { CouchDBClient, initializeCouchDB } from "./context/couchdb.js";

export type Context = {
  couch: CouchDBClient;
};

export function getFromEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value) {
    return value;
  } else if (defaultValue) {
    return defaultValue;
  } else {
    throw new Error(`${name} environment variable required`);
  }
}

export function createContext(): Context {
  return {
    couch: initializeCouchDB(),
  };
}
