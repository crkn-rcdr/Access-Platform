import { Router } from "restify-router";
import { Request, Response, Next } from "restify";
import { DMDTask } from "@crkn-rcdr/access-data";

const dmdTaskRouter = new Router();

function getById(req: Request, res: Response, next: Next) {
  req.body.ctx.couch.dmdtask.get(req.params.id).then((task: DMDTask) => {
    res.json(task);
    next();
  });
}
dmdTaskRouter.get("/dmdTask/:id", getById);

function getResultCSV(req: Request, res: Response, next: Next) {
  req.body.ctx.couch.dmdtask.get(req.params.id).then((task: DMDTask) => {
    let csvString =
      "id,label,output,parsed,parse message,found,shouldStore,stored\n";

    if ("items" in task && task.items) {
      for (let item of task.items) {
        csvString += `${item.id},"${item.label}",${item.output},${item.parsed},"${item.message}",${item.found},${item.shouldStore},${item.stored}\n`;
      }
    }
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", "attachment; filename=export.csv");
    res.send(csvString);
    next();
  });
}
dmdTaskRouter.get("/dmdTask/resultCSV/:id", getResultCSV);

//https://stackoverflow.com/questions/45948918/nodejs-restify-how-can-i-recieve-file-upload-in-api

export default dmdTaskRouter;
