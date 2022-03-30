import { Router } from "restify-router";
import { Request, Response, Next } from "restify";

const dmdTaskRouter = new Router();

function respond(req: Request, res: Response, next: Next) {
  req.body.ctx.couch.dmdtask.get(req.params.id).then((task: any) => {
    res.json(task);
    next();
  });
}

// add a route like you would on a restify server instance
dmdTaskRouter.get("/dmdTask/:id", respond);

export default dmdTaskRouter;
