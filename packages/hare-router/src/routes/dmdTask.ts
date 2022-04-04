import { Router } from "restify-router";
import { Request, Response, Next } from "restify";
import { DMDTask, ShortTask } from "@crkn-rcdr/access-data";

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
      "id,is duplicated,found,parsed,shouldStore,stored,output,label,message\n";

    if ("items" in task && task.items) {
      const ids: (string | undefined)[] = task.items.map(
        (item: any) => item.id
      );
      const duplicates = ids.filter(
        (
          (set: Set<string | undefined>) => (value: string | undefined) =>
            set.has(value) || !set.add(value)
        )(new Set())
      );
      for (let item of task.items) {
        ("id,is duplicated?,found?,parsed,shouldStore?,stored?,output,label,message\n");
        csvString += `${item.id},${duplicates.includes(item.id)},${
          item.found
        },${item.parsed},${item.shouldStore},${item.stored},${item.output},"${
          item.label
        }","${item.message}"\n`;
      }
    }
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", "attachment; filename=export.csv");
    res.send(csvString);
    next();
  });
}
dmdTaskRouter.get("/dmdTask/resultCSV/:id", getResultCSV);

function list(req: Request, res: Response, next: Next) {
  const input = req.body.filters;
  req.body.ctx.couch.dmdtask.getAll(input).then((tasks: ShortTask[]) => {
    res.json(tasks);
    next();
  });
}
dmdTaskRouter.post("/dmdTask/list", list);

function upload(req: Request, res: Response, next: Next) {
  const input = req.files;
  console.log(input);
  res.send("moo");
  next();
}
dmdTaskRouter.post("/dmdTask/upload", upload);

//https://stackoverflow.com/questions/45948918/nodejs-restify-how-can-i-recieve-file-upload-in-api

export default dmdTaskRouter;
