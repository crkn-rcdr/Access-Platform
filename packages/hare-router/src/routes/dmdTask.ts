import { Router } from "restify-router";
import { Request, Response, Next } from "restify";

const dmdTaskRouter = new Router();

function respond(req: Request, res: Response, next: Next) {
  res.send("dmdTask " + req.params.name);
  next();
}

// add a route like you would on a restify server instance
dmdTaskRouter.get("/dmdTask/:name", respond);

export default dmdTaskRouter;
