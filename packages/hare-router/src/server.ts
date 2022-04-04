import { createContext, HareContext } from "./context.js";
import {
  Server,
  createServer,
  Request,
  Response,
  Next,
  plugins,
} from "restify";
import dmdTaskRouter from "./routes/dmdTask.js";
import wipmetaRouter from "./routes/wipmeta.js";

export interface HTTPErrorLike {
  status: number;
  message: string;
}

export const server: Server = createServer();

function setup(req: Request, res: Response, next: Next) {
  // Basic headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Give the context to the routes
  const ctx: HareContext = createContext();
  if (req.body) req.body["ctx"] = ctx;
  else req.body = { ctx };
  return next();
}

dmdTaskRouter.use(
  plugins.queryParser({
    mapParams: true,
  })
);
dmdTaskRouter.use(
  plugins.bodyParser({
    mapParams: true,
  })
);
// setup will run before every route on this router
dmdTaskRouter.use(setup);
// add routes to the server
dmdTaskRouter.applyRoutes(server);

wipmetaRouter.use(setup);
wipmetaRouter.applyRoutes(server);

export default server;
