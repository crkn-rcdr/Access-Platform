import { z } from "zod";
import { LegacyPackage, Slug } from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";
import { DatabaseHandler } from "../DatabaseHandler.js";
import { stringRangeEnd } from "../util.js";

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((str) => str.split("-"));

type DateString = z.infer<typeof DateString>;

/**
 * Interact with the `dipstaging` database.
 */
export class LegacyPackageHandler extends DatabaseHandler<LegacyPackage> {
  /**
   * Create an LegacyPackageHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the access database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(
      suffix ? `dipstaging-${suffix}` : `dipstaging`,
      LegacyPackage,
      client
    );
  }

  async listFromKeys(keys: Slug[]) {
    return await this.list({ include_docs: true, keys });
  }

  async listFromDates(start: string, end: string) {
    const startArray = DateString.parse(start);
    const endArray = DateString.parse(end);
    endArray[2] = stringRangeEnd(endArray[2] as string);

    return await this.view("access", "byManifestDate", {
      startkey: startArray,
      endkey: endArray,
      reduce: false,
      include_docs: true,
    });
  }
}
