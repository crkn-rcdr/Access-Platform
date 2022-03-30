import { createContext } from "./context.js";
import { Server, createServer, Request, Response, Next } from "restify";
import dmdTaskRouter from "./routes/dmdTask.js";
import wipmetaRouter from "./routes/wipmeta.js";

export interface HTTPErrorLike {
  status: number;
  message: string;
}

export const server: Server = createServer();

function ctx(req: Request, res: Response, next: Next) {
  req.body.ctx = createContext();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  return next();
}

// this will run before every route on this router
dmdTaskRouter.use(ctx);
dmdTaskRouter.applyRoutes(server);

wipmetaRouter.use(ctx);
wipmetaRouter.applyRoutes(server);

export default server;
