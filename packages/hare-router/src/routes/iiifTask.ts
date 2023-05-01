import { IIIFTask, ShortIIIFTask } from "@crkn-rcdr/access-data";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { HareContext } from "../context.js";

declare module "fastify" {
  export interface FastifyInstance {
    ctx: HareContext;
  }
}

export const iiifTaskRouter: FastifyPluginAsync = async (
  server: FastifyInstance
) => {

  server.put("/upload", async (request:any, reply:any) => {
    try {
      const file = await request.file();
      const fileBuffer = await file.toBuffer(); // Buffer
      const fileName = file.filename;

      const fields: any = file.fields;
      const user = JSON.parse(fields["user"]?.value);

      const res = await server.ctx.couch.iiiftask.create({
        user,
        fileName,
        file: fileBuffer,
      });

      return reply.code(200).send(res);
    } catch (e: any) {
      console.log("e1", e?.message);
      return reply.code(500).send({ error: e?.message });
    }
  });

  server.post("/list", async (request:any, reply:any) => {
    try {
      const body: any = request.body;
      console.log(body);
      const res: ShortIIIFTask[] = await server.ctx.couch.iiiftask.getAll();
      return reply.code(200).send(res);
    } catch (e: any) {
      console.log("e2", e?.message);
      return reply.code(500).send({ error: e?.message });
    }
  });

  server.get("/task/:taskId", async (request: any, reply:any) => {
    try {
      const { taskId } = request.params;
      const res: IIIFTask = await server.ctx.couch.iiiftask.get(taskId);
      return reply.code(200).send(res);
    } catch (e: any) {
      console.log("e3", e?.message);
      return reply.code(500).send({ error: e?.message });
    }
  });

};
