import { initializeCouchDB } from "./context/couchdb.js";
/*import { initializeNoid } from "./context/noid.js";
import { initializeRouteLimiter } from "./context/routeLimiter.js";
import { initializeSwift } from "./context/swift.js";
*/
export type HareContext = {
  couch: ReturnType<typeof initializeCouchDB>;
  //noid: ReturnType<typeof initializeNoid>;
  //swift: ReturnType<typeof initializeSwift>;
  //routeLimiter: ReturnType<typeof initializeRouteLimiter>;
};

export function createContext(): HareContext {
  return {
    couch: initializeCouchDB(),
    //noid: initializeNoid(),
    //swift: initializeSwift(),
    //routeLimiter: initializeRouteLimiter(),
  };
}
import { FastifyInstance } from "fastify";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const setContext: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.decorate("ctx", createContext());
};

export default fp(setContext);
