import fastify from "fastify";
import fastifyMultipart from "fastify-multipart";
import ctx from "./context.js";
import { dmdTaskRouter } from "./routes/dmdTask.js";
import { iiifTaskRouter } from "./routes/iiifTask.js";

// Require the framework and instantiate it
const server = fastify({
  maxParamLength: 1000,
  logger: false,
});

// Declare a route
server.get("/", async () => {
  //request, reply
  return { hello: "world" };
});

server.register(fastifyMultipart);
server.register(ctx);
server.register(dmdTaskRouter, { prefix: "/dmdtask" });
server.register(iiifTaskRouter, { prefix: "/iiiftask" });

export { server };
