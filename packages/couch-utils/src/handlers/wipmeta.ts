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
   * Updates the label of a Wipmeta object.
   * @returns The Wipmeta object.
   */
  async updateLabel(args: {
    id: string;
    /** The file as a base64-encoded string */
    label: string;
  }) {
    const { id, label } = args;
    const wipmeta = await this.update({
      ddoc: "access",
      name: "updateLabel",
      docId: id,
      body: {
        label,
      },
    });
    return wipmeta;
  }
}
