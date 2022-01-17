import { OcrBatch } from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";

export class OcrBatchHandler extends DatabaseHandler<OcrBatch> {
  /**
   *
   * Create a BatchHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the ocr batch database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `ocr-${suffix}` : `ocr`, OcrBatch, client);
  }
}
