import { DMDFormat, DMDTask, User } from "@crkn-rcdr/access-data";
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
  }) {
    const { user, format, file } = args;
    const { message: taskId } = await this.nullUpdate({
      ddoc: "access",
      name: "create",
      body: {
        user,
        format,
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
    });

    return taskId;
  }
}
