import { IIIFTask, User } from "@crkn-rcdr/access-data";
import type { ShortIIIFTask } from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";

export class IIIFTaskHandler extends DatabaseHandler<IIIFTask> {
  /**
   * Create an IIIFTaskHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the dmdtask database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `iiiftask-${suffix}` : `iiiftask`, IIIFTask, client);
  }

  async getShort(id: string): Promise<ShortIIIFTask | null> {
    const res: any = await this.view("access", "listing", {
      key: id,
      include_docs: false,
      reduce: false,
    });
    return res.rows?.length
      ? {
          id: res.rows[0]["id"],
          fileName: res.rows[0].value["fileName"],
          date: res.rows[0].value["date"],
          count: res.rows[0].value["count"],
          message: res.rows[0].value["message"],
          type: res.rows[0].value["type"],
        }
      : null;
  }

  async getAll(): Promise<ShortIIIFTask[]> {
    let options: any = {
      include_docs: false,
      reduce: false,
    };

    const list = await this.view("access", "listing", options);
    return list.rows.map((row: { id: string; key: string; value: any }) => {
      return {
        id: row.id,
        fileName: row.value["fileName"],
        date: row.value["date"],
        count: row.value["count"],
        message: row.value["message"],
        type: row.value["type"],
      };
    });
  }

  /**
   * Creates a IIIFTask and renders it available for processing.
   * Accepts the metadata file as a base64-encoded string.
   * @returns The auto-generated id of the IIIFTask.
   */
  async create(args: {
    /** User who uploaded the file */
    user: User;
    /** The file as a base64-encoded string */
    file: any;
    /** The name of the file */
    fileName: string;
  }) {
    const { user, file, fileName } = args;

    const { message: taskId } = await this.nullUpdate({
      ddoc: "access",
      name: "create",
      body: {
        user,
        fileName,
      },
    });

    await this.uploadAttachment({
      /** Document id */
      document: taskId,

      /** Attachment name */
      attachmentName: "labels",

      /** Attachment (as a Buffer) */
      attachment: file,

      /** Attachment content type. Default: application/octet-stream */
      //contentType?: string
    });

    return taskId;
  }

  async run(args: {
    /** User who triggered storage */
    user: User;
    /** Descriptive metadata task id */
    task: string;
  }) {
    const { user, task } = args;

    const iiifTask = await this.get(task);

    if ("items" in iiifTask) {
      await this.update({
        ddoc: "access",
        name: "canProcess",
        docId: task,
        body: {
          user,
        },
      });
      return await this.get(task);
    } else throw "Can not store a metadata task before it has been parsed.";
  }

  
  async getProgress(id: string): Promise<number> {
    const res: any = await this.view("access", "processProgress", {
      key: id,
      include_docs: false,
      reduce: false,
    });

    return res.rows?.length ? res.rows[0].value : 0;
  }
}
