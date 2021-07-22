import { createHttpHandler } from "@trpc/server";
import http from "http";
import { Env } from "@crkn-rcdr/access-env";
import { createOptions } from "@crkn-rcdr/lapin-router";

const handler = createHttpHandler(createOptions);

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

const {
  lapin: { port },
} = Env.parse(process.env);

console.log(`Starting lapin on port ${port}.`);

server.listen(port);
