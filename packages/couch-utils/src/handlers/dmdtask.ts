import { DMDFormat, DMDTask, User } from "@crkn-rcdr/access-data";
import type { ShortTask } from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";

export class DMDTaskHandler extends DatabaseHandler<DMDTask> {
  /**
   * Create an DMDTaskHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the dmdtask database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `dmdtask-${suffix}` : `dmdtask`, DMDTask, client);
  }

  async getShort(id: string): Promise<ShortTask | null> {
    const res: any = await this.view("access", "listing", {
      key: id,
      include_docs: false,
      reduce: false,
    });

    console.log("res", res);
    return res.rows?.length
      ? {
          id: res.rows[0]["id"],
          fileName: res.rows[0].value["fileName"],
          type: res.rows[0].value["type"],
          date: res.rows[0].value["date"],
          count: res.rows[0].value["count"],
          message: res.rows[0].value["message"],
        }
      : null;
  }

  async getAll(): Promise<ShortTask[]> {
    const list = await this.view("access", "listing", {
      include_docs: false,
      reduce: false,
    });
    return list.rows.map((row: { id: string; key: string; value: any }) => {
      console.log(row);
      return {
        id: row.id,
        fileName: row.value["fileName"],
        type: row.value["type"],
        date: row.value["date"],
        count: row.value["count"],
        message: row.value["message"],
      };
    });
  }

  /**
   * Creates a DMDTask and renders it available for processing.
   * Accepts the metadata file as a base64-encoded string.
   * @returns The auto-generated id of the DMDTask.
   */
  async create(args: {
    /** User who uploaded the file */
    user: User;
    /** Descriptive metadata type of the file's contents */
    format: DMDFormat;
    /** The file as a base64-encoded string */
    file: string;
    /** The name of the file */
    fileName: string;
  }) {
    const { user, format, file, fileName } = args;

    const { message: taskId } = await this.nullUpdate({
      ddoc: "access",
      name: "create",
      body: {
        user,
        format,
        fileName,
        _attachments: {
          metadata: {
            content_type: "application/octet-stream",
            data: file,
          },
        },
      },
    });

    await this.update({
      ddoc: "access",
      name: "canProcess",
      docId: taskId,
      body: {
        user,
      },
    });

    return taskId;
  }

  async store(args: {
    /** User who triggered storage */
    user: User;
    /** Descriptive metadata task id */
    task: string;
  }) {
    const { user, task } = args;

    const dmdTask = await this.get(task);

    if ("items" in dmdTask) {
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

  async resetStorageResult(args: {
    /** User who triggered storage */
    user: User;
    /** Descriptive metadata task id */
    task: string;
  }) {
    const { user, task } = args;

    const dmdTask = await this.get(task);

    if ("items" in dmdTask) {
      const now = new Date().toISOString().replace(/.\d+Z$/g, "Z");

      await this.update({
        ddoc: "access",
        name: "editObject",
        docId: task,
        body: {
          user,
          data: {
            process: {
              requestDate: now,
              processDate: now,
              message: "",
              succeeded: true,
            },
            items: dmdTask.items.map((item) => {
              if ("found" in item) delete item["found"];
              if ("stored" in item) delete item["stored"];
              if ("shouldStore" in item) delete item["shouldStore"];
              return item;
            }),
          },
        },
      });
    }
  }

  async pauseStorage(args: {
    /** User who triggered storage */
    user: User;
    /** Descriptive metadata task id */
    task: string;
  }) {
    const { user, task } = args;

    const now = new Date().toISOString().replace(/.\d+Z$/g, "Z");

    await this.update({
      ddoc: "access",
      name: "editObject",
      docId: task,
      body: {
        user,
        data: {
          process: {
            requestDate: now,
            processDate: now,
            message: "",
            succeeded: true,
          },
          stage: "store-paused",
        },
      },
    });
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
