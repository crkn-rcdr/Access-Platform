import { CouchDBClient, initializeCouchDB } from "./drivers/couchdb.js";

export type Context = {
  drivers: {
    couch: CouchDBClient;
  };
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
    drivers: {
      couch: initializeCouchDB(),
    },
  };
}
