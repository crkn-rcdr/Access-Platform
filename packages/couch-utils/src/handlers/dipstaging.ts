import { z } from "zod";
import {
  getImportStatus,
  ImportStatus,
  LegacyPackage,
  Slug,
} from "@crkn-rcdr/access-data";
import { DocumentViewParams, ServerScope } from "nano";
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
      const r = resolutions[row.key];
      let id: string | undefined = undefined;
      if (r && r.resolved) {
        id = r.id;
      }
      return getImportStatus(row.key, row.doc, id);
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

    const slugs = list.rows.map((row) => row.id);

    const resolutions = await access.resolveSlugs(slugs);

    return list.rows.map((row): ImportStatus => {
      const r = resolutions[row.id];
      let id: string | undefined = undefined;
      if (r && r.resolved) {
        id = r.id;
      }
      return getImportStatus(row.id, row.doc, id);
    });
  }

  // TODO: test
  async listFromView(
    viewName: string,
    limit: number | null = null,
    skip: number | null = null,
    startDate: string | null = null,
    endDate: string | null = null
  ) {
    let viewOptions: DocumentViewParams = {
      include_docs: true,
      reduce: false,
    };
    if (limit !== null) viewOptions.limit = limit;
    if (skip !== null) viewOptions.skip = skip;

    if (startDate !== null && endDate !== null) {
      const startArray = DateString.parse(startDate);
      const endArray = DateString.parse(endDate);
      viewOptions["startkey"] =
        viewName === "smeltStatus" ? [...startArray, {}] : startArray;
      viewOptions["endkey"] =
        viewName === "smeltStatus" ? [...endArray, {}] : endArray;
      /*viewOptions["startkey"] = startArray;
      viewOptions["endkey"] = endArray;*/
    }
    console.log("viewOptions", viewOptions);

    const list = await this.view("access", viewName, viewOptions);
    return {
      count: list.total_rows,
      results: list.rows.map((row) => row.doc),
    };
  }

  /* Too slow
  async findIdsInView(
    viewName: string,
    page: number,
    pageSize: number,
    startDate: string | null = null,
    endDate: string | null = null,
    status: boolean | null = null,
    ids: string[] | null = null
  ) {
    let viewOptions: DocumentViewParams = {
      include_docs: true,
      reduce: false,
    };
    console.log(startDate, endDate, status);

    if (startDate !== null && endDate !== null) {
      const startArray = DateString.parse(startDate);
      const endArray = DateString.parse(endDate);
      //endArray[2] = (endArray[2] as number) + 0.1;
      viewOptions["startkey"] = startArray;
      viewOptions["endkey"] = endArray;
    } else {
      const today = new Date().toISOString().split("T")[0];
      const startArray = DateString.parse("1995-05-19");
      const endArray = DateString.parse(today);
      endArray[2] = (endArray[2] as number) + 0.1;
      viewOptions["startkey"] = startArray;
      viewOptions["endkey"] = endArray;
    }

    console.log(viewOptions);

    const list = await this.view("access", viewName, viewOptions);

    const start = (page - 1) * pageSize;
    const end = Math.min(list.total_rows, start + pageSize);

    console.log(list.rows, list.total_rows, start + pageSize, start, end);

    let response = list.rows;

    if (ids && ids.length)
      response = response.filter((row) => {
        console.log(row.id);
        return ids.includes(row.id);
      });

    if (status !== null)
      response = response.filter((row) => {
        if (row.doc?.smelt)
          return (row.doc?.smelt as any)["succeeded"] === status;
        else return false;
      });

    //console.log("response", response);
    return response.slice(start, end).map((row) => row.doc);
  }*/
}
