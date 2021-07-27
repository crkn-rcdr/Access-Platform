import { initializeCouchDB } from "./context/couchdb.js";

export type LapinContext = {
  couch: ReturnType<typeof initializeCouchDB>;
};

export function createContext(): LapinContext {
  return {
    couch: initializeCouchDB(),
  };
}
