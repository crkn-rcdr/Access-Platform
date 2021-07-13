import * as trpc from "@trpc/server";
import http from "http";
import { router } from "./router.js";
import { createContext } from "./context.js";

export type { LapinRouter } from "./router.js";

const handler = trpc.createHttpHandler({
  router,
  createContext,
});

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  handler(req, res);
});

server.listen(5858);
