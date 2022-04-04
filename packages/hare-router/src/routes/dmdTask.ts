import { Router } from "restify-router";
import { Request, Response, Next } from "restify";
import { DMDTask, ShortTask } from "@crkn-rcdr/access-data";
import * as fs from "fs";

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
  const file = req.files?.["file"];
  //console.log(file._writeStream);
  if (!file) next("upload request requires a file");
  else {
    fs.readFile(
      file.path,
      (err: NodeJS.ErrnoException | null, data: Buffer) => {
        if (err) next(err.message);
        const createData = {
          user: req.body.user,
          format: req.body.format,
          file: data,
          fileName: file["name"],
        };
        req.body.ctx.couch.dmdtask.create(createData).then((taskId: string) => {
          res.send(202, taskId);
          next();
        });
      }
    );
  }
}
dmdTaskRouter.put("/dmdTask/upload", upload);

//https://stackoverflow.com/questions/45948918/nodejs-restify-how-can-i-recieve-file-upload-in-api

export default dmdTaskRouter;
