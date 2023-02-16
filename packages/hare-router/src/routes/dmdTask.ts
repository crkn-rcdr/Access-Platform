import { DMDTask, ShortTask } from "@crkn-rcdr/access-data";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { HareContext } from "../context.js";

declare module "fastify" {
  export interface FastifyInstance {
    ctx: HareContext;
  }
}

//https://www.fastify.io/docs/latest/Reference/Routes/
export const dmdTaskRouter: FastifyPluginAsync = async (
  server: FastifyInstance
) => {
  //https://github.com/fastify/fastify-multipart
  server.put("/upload", async (request:any, reply:any) => {
    try {
      const file = await request.file();
      const fileBuffer = await file.toBuffer(); // Buffer
      const fileName = file.filename;
      const fields: any = file.fields;
      const type = fields["type"]?.value;
      const user = JSON.parse(fields["user"]?.value);

      const res = await server.ctx.couch.dmdtask.create({
        user,
        fileName,
        file: fileBuffer,
        format: type,
      });

      return reply.code(200).send(res);
    } catch (e: any) {
      console.log("e", e?.message);
      return reply.code(500).send({ error: e?.message });
    }
  });

  // list
  server.post("/list", async (request, reply) => {
    try {
      const body: any = request.body;
      const input = body["filters"];
      const res: ShortTask[] = await server.ctx.couch.dmdtask.getAll(input);
      return reply.code(200).send(res);
    } catch (e: any) {
      console.log("e", e?.message);
      return reply.code(500).send({ error: e?.message });
    }
  });

  // download
  server.get("/resultCSV/:id", async (request, reply) => {
    try {
      const params: any = request.params;
      const id = params["id"];
      const task: DMDTask = await server.ctx.couch.dmdtask.get(id);
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

      return reply
        .code(200)
        .type("text/csv")
        .header("Content-Disposition", "attachment; filename=export.csv")
        .send(csvString);
    } catch (e: any) {
      console.log("e", e?.message);
      return reply.code(500).send({ error: e?.message });
    }
  });
};
