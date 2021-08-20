import { z } from "zod";
import {
  getImportStatus,
  ImportStatus,
  LegacyPackage,
  Slug,
} from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";
import { DatabaseHandler } from "../DatabaseHandler.js";
import { AccessHandler } from "./access.js";

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((str) => str.split("-").map((s) => parseInt(s, 10)));

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

  async listFromKeys(keys: Slug[], access: AccessHandler) {
    const resolutions = await access.resolveSlugs(keys);
    const list = await this.list({ include_docs: true, keys });
    return list.rows.map((row): ImportStatus => {
      return getImportStatus(
        row.key,
        row.doc,
        resolutions[row.key] ? resolutions[row.key]?.id : undefined
      );
    });
  }

  async listFromDates(start: string, end: string, access: AccessHandler) {
    const startArray = DateString.parse(start);
    const endArray = DateString.parse(end);
    endArray[2] = (endArray[2] as number) + 0.1;

    const list = await this.view("access", "byManifestDate", {
      startkey: startArray,
      endkey: endArray,
      reduce: false,
      include_docs: true,
    });

    const resolutions = await access.resolveSlugs(
      list.rows.map((row) => row.id)
    );

    return list.rows.map((row): ImportStatus => {
      return getImportStatus(
        row.id,
        row.doc,
        resolutions[row.id] ? resolutions[row.id]?.id : undefined
      );
    });
  }
}
