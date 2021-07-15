import { CouchDBClient, initializeCouchDB } from "./context/couchdb.js";

export type LapinContext = {
  couch: CouchDBClient;
};

export function createContext(): LapinContext {
  return {
    couch: initializeCouchDB(),
  };
}
