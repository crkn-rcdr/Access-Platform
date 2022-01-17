import { OcrBatch } from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";

export class OcrBatchHandler extends DatabaseHandler<OcrBatch> {
  /**
   *
   * Create an WipmetaHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the dmdtask database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `ocr-${suffix}` : `ocr`, OcrBatch, client);
  }

  /**
   * Updates the label of a Wipmeta object.
   * @returns The Wipmeta object.
   
  async updateLabel(args: {
    id: string;
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
  }*/
}
