import { Router } from "restify-router";
import { Request, Response, Next } from "restify";

const wipmetaRouter = new Router();

function respond(req: Request, res: Response, next: Next) {
  res.send("wipmeta " + req.params.name);
  next();
}

// add a route like you would on a restify server instance
wipmetaRouter.get("/wipmeta/:name", respond);

export default wipmetaRouter;
