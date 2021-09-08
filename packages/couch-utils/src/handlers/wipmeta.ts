import { WipmetaObject } from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";

export class WipmetaHandler extends DatabaseHandler<WipmetaObject> {
  /**
   * Create an WipmetaHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the dmdtask database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `wipmeta-${suffix}` : `wipmeta`, WipmetaObject, client);
  }

  /**
   * Stores the metadata results form a DMDTask item.
   * Accepts the metadata file as a base64-encoded string.
   * @returns The Wipmeta object.
   */
  async store(args: {
    id: string;
    /** The file as a base64-encoded string */
    file: string;
  }) {
    const { file, id } = args;
    const wipmeta = await this.update({
      ddoc: "access",
      name: "store",
      docId: id,
      body: {
        _attachments: {
          "dmd.xml": {
            content_type: "application/octet-stream",
            data: file,
          },
        },
      },
    });
    return wipmeta;
  }
}
