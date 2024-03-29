import { z } from "zod";
import createHttpError from "http-errors";
import type { HttpError } from "http-errors";

import {
  DocumentViewParams,
  DocumentScope,
  ServerScope,
  MangoQuery,
  MangoSelector,
  RequestError,
  //DocumentBulkResponse,
} from "nano";

import { mangoEqualSelector } from "./util.js";

/**
 * The specification for a CouchDB document's `_attachments` object.
 * See https://docs.couchdb.org/en/stable/api/document/common.html#attachments
 */
export const CouchAttachmentRecord = z.record(
  z.object({
    content_type: z.string(),
    data: z.string().optional(),
    digest: z.string(),
    encoded_length: z.number().int().min(0).optional(),
    encoding: z.string().optional(),
    length: z.number().optional(),
    revpos: z.number(),
    stub: z.boolean().optional(),
  })
);

export type CouchAttachmentRecord = z.infer<typeof CouchAttachmentRecord>;

export type CouchDocument = {
  _id: string;
  _rev?: string;
  _attachments?: CouchAttachmentRecord;
  [k: string]: unknown;
};

/**
 * An object that can be inserted into or retrieved from a CouchDB database.
 */
export type Document = {
  id: string;
  attachments?: CouchAttachmentRecord;
  [k: string]: unknown;
};

const fromCouch = (doc: CouchDocument): Document => {
  const result: Document = {
    id: doc._id,
    attachments: doc._attachments,
    ...doc,
  };

  // TODO: do this without `delete`
  delete result["_attachments"];
  delete result["_id"];
  delete result["_rev"];

  return result;
};

type MangoOptions = Omit<MangoQuery, "selector" | "fields">;

type FindResult<
  T extends Document,
  Fields extends readonly (keyof T & string)[]
> = Pick<T, Fields[number]>;

type UniqueFindResult<
  T extends Document,
  Fields extends readonly (keyof T & string)[]
> = { found: false } | { found: true; result: FindResult<T, Fields> };

type ViewResponse<T extends Document, V = unknown> = {
  total_rows: number;
  offset: number;
  update_seq?: number | string;
  rows: { id: string; key: string; doc?: T; value: V }[];
};

type BulkGetResponse<T extends Document> = {
  total_rows: number;
  offset: number;
  update_seq?: number | string;
  rows: (
    | {
        id: string;
        key: string;
        value: { rev: string };
        doc?: T;
        error: undefined;
      }
    | {
        id: undefined;
        key: string;
        value: undefined;
        doc: undefined;
        error: string;
      }
  )[];
};

/**
 * Handler for interactions with a CouchDB database.
 *
 * Also handles translating `_id` and `_attachments` to non-underscored versions.
 */
export class DatabaseHandler<T extends Document> {
  private name: string;
  private parser: z.Schema<T>;
  // useful to `relax` with
  private client: ServerScope;
  private db: DocumentScope<unknown>;

  /**
   * Creates a DatabaseHandler.
   * @param db Name of the database.
   * @param parser A Zod parser for data that belongs in this database.
   * @param client A `couchdb-nano` instance pointing to a CouchDB endpoint that provides access to the database.
   */
  constructor(db: string, parser: z.Schema<T>, client: ServerScope) {
    this.name = db;
    this.parser = parser;
    this.client = client;
    this.db = client.use(db);
  }

  /**
   * A helper method that breaks apart large arrays.
   * See: https://github.com/haio/chunk-array/blob/master/index.js
   */
  chunkArray(array: any[], n: number) {
    if (!array || !n) return array;

    let length = array.length;
    let slicePoint = 0;
    let ret = [];

    while (slicePoint < length) {
      ret.push(array.slice(slicePoint, slicePoint + n));
      slicePoint += n;
    }
    return ret;
  }

  /**
   * Gets a document from a database.
   * Throws an error if the document isn't found, or if the connection to CouchDB fails.
   * @param id ID of the document.
   */
  async get(id: string): Promise<T> {
    let doc: CouchDocument;
    try {
      doc = (await this.db.get(id)) as CouchDocument;
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }

    return this.parser.parse(fromCouch(doc));
  }

  /**
   * Gets a document from a database. Does not throw an error if the document isn't found.
   * Returns a wrapper object with a `found` property that you can use to check that
   * the `doc` property contains the document.
   * @param id ID of the document.
   */
  async getSafe(
    id: string
  ): Promise<{ found: true; doc: T } | { found: false }> {
    try {
      return { found: true, doc: await this.get(id) };
    } catch (error) {
      if ((error as HttpError).status === 404) {
        return { found: false };
      }
      throw error;
    }
  }

  /**
   * Gets a document from a database. Does not throw an error if the document isn't found.
   * Returns a the cache status
   * @param id ID of the document.
   */
  async getCacheStatus(
    id: string
  ): Promise<{ found: true; result: any } | { found: false }> {
    try {
      const doc = await this.get(id);
      return { found: true, result: doc["updateInternalmeta"] };
    } catch (error) {
      if ((error as HttpError).status === 404) {
        return { found: false };
      }
      throw error;
    }
  }

  /**
   * Updates all the objects in ids
   * @param ids Id strings for the objects to be updated
   * @param changeMethod A function that returns the following: [<new document>, <message>]
   * @returns the result of the bulk update
   *
   * See: https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-bulk-docs
   * For updating existing documents, you must provide the document ID, revision information (_rev), and new document values.
   */
  async bulkChange(
    ids: any[], // todo: make string once object list item id is not optional,
    changeMethod: Function
  ): Promise<boolean> {
    if (ids.length) {
      // Only grab and update 100 items, max, at a time
      const chunks = this.chunkArray(ids, 100);

      // Loop through the max 100 item long lists
      for (const chunk of chunks) {
        const bulkUpdateDocs: any[] = [];

        //Grab the items in the list
        const fetchRes = await this.db.list({
          keys: chunk,
          include_docs: true,
        });

        // Change the data as described in the change method
        fetchRes.rows.map((row) => {
          if (row.doc) {
            const newDocData: any[] = changeMethod(row.doc);

            // Add a document to the bulk update array for updating
            if (newDocData.length)
              if (newDocData[0]) bulkUpdateDocs.push(newDocData[0]);

            // Log a message if one exists
            if (newDocData.length === 2) console.log(newDocData[1]);
          }
        });

        // Update the database if any were found
        if (bulkUpdateDocs.length)
          await this.db.bulk({
            docs: bulkUpdateDocs,
          });
      }
      return true;
    }
    return false;
  }

  /**
   * Forces an update on a list of ids.
   * @returns void
   */
  async bulkForceUpdate(ids: any[]): Promise<boolean> {
    const date = new Date().toISOString().replace(/.\d+Z$/g, "Z");
    return await this.bulkChange(ids, (doc: any) => {
      if (!doc) return [null, "Error. Old document was null."];
      if (!doc["_id"]) return [null, "Error. Old document had no id."];
      if (!doc["_rev"]) return [null, "Error. Old document had no revision."];
      if (!doc["dmdType"])
        return [null, "Error. Old document had no dmd type."];

      doc.updateInternalmeta = {
        requestDate: date,
      };

      return [doc];
    });
  }

  async bulkLookup(ids: any[]): Promise<any> {
    const res = await this.db.fetch({
      keys: ids,
    });
    return res;
  }


  async listFromView(
    viewName: string,
    limit: number | null = null,
    skip: number | null = null,
    startDate: string | null = null,
    endDate: string | null = null,
    status: boolean | null = null,
    docsName: string = "access"
  ) {
    const DateString = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((str) => str.split("-").map((s) => parseInt(s, 10)));  

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
        status !== null ? [status, ...startArray] : startArray;
      viewOptions["endkey"] =
        status !== null ? [status, ...endArray] : endArray;
    } else {
      viewOptions["descending"] = true;
    }

    const list = await this.view(docsName, viewName, viewOptions);
    return {
      count: list.total_rows,
      results: list.rows.map((row) => row.doc),
    };
  }

  /**
   * Queries the `_all_docs` view for this database.
   * @param options View query options.
   * @returns the view output. Check `docs`.
   */
  async list(options: DocumentViewParams): Promise<BulkGetResponse<T>> {
    try {
      const response = await this.db.list(options);
      return {
        total_rows: response.total_rows,
        offset: response.offset,
        update_seq: response.update_seq,
        rows: response.rows.map((row) => {
          if (row.error !== undefined)
            return {
              id: undefined,
              value: undefined,
              doc: undefined,
              error: row.error,
              key: row.key,
            };
          else {
            const doc = row.doc
              ? this.parser.parse(fromCouch(row.doc as CouchDocument))
              : undefined;
            return { ...row, doc, error: undefined };
          }
        }),
      };
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /** Don't use this unless you're testing something. */
  async insert(obj: T): Promise<void> {
    const doc: CouchDocument = {
      _id: obj.id,
      _attachments: obj.attachments,
      ...obj,
    };
    delete doc["id"];
    delete doc["attachments"];

    try {
      const headers = (await this.db.head(obj.id)) as { etag: string };
      doc._rev = headers.etag;
    } catch (ignore) {}

    try {
      await this.db.insert(doc);
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Calls one of this database's design document update functions,
   * to update a particular document.
   * @returns The message returned by the update function upon success.
   */
  async update<Body = unknown>(args: {
    /** Design document name */
    ddoc: string;
    /** Update function name */
    name: string;
    /** Document ID */
    docId: string;
    /** Update function payload */
    body?: Body;
  }) {
    try {
      const response = await this.db.atomic<{ message: string }>(
        args.ddoc,
        args.name,
        args.docId,
        args.body
      );
      return response.message;
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Calls one of this database's design document update functions,
   * without specifying a document.
   * @returns The message returned by the update function upon success.
   */
  async nullUpdate<Body = unknown>(args: {
    /** Design document name */
    ddoc: string;
    /** Update function name */
    name: string;
    /** Update function payload */
    body?: Body;
  }) {
    try {
      return (await this.client.relax({
        db: this.name,
        method: "post",
        path: `_design/${args.ddoc}/_update/${args.name}`,
        body: args.body,
      })) as { message: string };
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Queries one of this databases's design document views.
   * This method mirrors the `nano` method; we might want to make changes eventually.
   * @param designName Design document name.
   * @param viewName View name.
   * @param options View query options.
   * @returns the view output. Check `docs`.
   */
  async view<V = unknown>(
    designName: string,
    viewName: string,
    options: DocumentViewParams
  ): Promise<ViewResponse<T, V>> {
    try {
      const response = await this.db.view(designName, viewName, options);
      return {
        total_rows: response.total_rows,
        offset: response.offset,
        update_seq: response.update_seq,
        rows: response.rows.map((row) => {
          const doc = row.doc
            ? this.parser.parse(fromCouch(row.doc as CouchDocument))
            : undefined;
          return { ...row, doc, value: row.value as V, error: undefined };
        }),
      };
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Returns the documents found with `query`.
   */
  async find<Fields extends readonly (keyof T & string)[]>(
    selector: MangoSelector,
    fields: Fields | null = null,
    options: MangoOptions = {}
  ): Promise<FindResult<T, Fields>[]> {
    // Switch id and _id
    const fieldSet = new Set(fields);
    let hasId = false;
    if (fieldSet.has("id")) {
      hasId = true;
      fieldSet.delete("id");
      fieldSet.add("_id");
    }
    if (!fields) hasId = true;

    const query: any = {
      selector,
      ...options,
    };
    if (fields) query["fields"] = [...fieldSet.values()];

    try {
      const response = await this.db.find(query);

      if (hasId) {
        return response.docs.map((doc) => {
          const r: Record<string, unknown> = { ...doc };
          r["id"] = doc._id;
          delete r["_id"];
          return r as FindResult<T, Fields>;
        });
      } else {
        return response.docs as unknown as FindResult<T, Fields>[];
      }
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Returns the unique result of looking up string `key` in field `searchField`.
   * Throws an error if more than one result is returned.
   */
  async findUnique<
    Fields extends readonly string[],
    SearchField extends keyof T & string
  >(
    searchField: SearchField,
    key: string,
    fields: Fields,
    options: MangoOptions = {}
  ): Promise<UniqueFindResult<T, Fields>> {
    const selector = mangoEqualSelector(searchField, key);
    const response = await this.find(selector, fields, options);
    if (response.length === 0) return { found: false };
    if (response.length === 1) return { found: true, result: response[0]! };
    throw createHttpError(
      400,
      `More than one result found when looking up ${searchField} = ${key}`
    );
  }

  async findUniqueArray<
    Fields extends readonly string[],
    SearchField extends keyof T & string
  >(
    searchField: SearchField,
    keys: string[],
    fields: Fields,
    options: MangoOptions = {}
  ) {
    const results: Map<string, UniqueFindResult<T, Fields>> = new Map();

    for await (const key of keys) {
      results.set(
        key,
        await this.findUnique(searchField, key, fields, options)
      );
    }

    return [...results.entries()];
  }

  /**
   * Gets an attachment from a CouchDB document.
   * Throws if the document or attachment do not exist.
   * @returns A `Buffer` containing the attachment.
   */
  async getAttachment(args: {
    /** Document id */
    document: string;
    /** Attachment name */
    attachment: string;
  }): Promise<Buffer> {
    const { document, attachment } = args;
    try {
      return await this.db.attachment.get(document, attachment);
    } catch (e) {
      const error = e as RequestError;
      if (error.statusCode === 404) {
        if (error.reason === "Document is missing attachment")
          throw createHttpError(
            404,
            `Document ${document} does not have an attachment named ${attachment}`
          );
        if (error.reason === "missing")
          throw createHttpError(404, `Document ${document} does not exist`);
      }
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Gets an attachment from a CouchDB document and then parses it as JSON.
   * Throws if the document or attachment do not exist, or if the
   * attachment cannot be parsed.
   * @returns Whatever the file was parsed as.
   */
  async getAttachmentAsJSON(args: {
    /** Document id */
    document: string;
    /** Attachment name */
    attachment: string;
  }): Promise<unknown> {
    const attachment = await this.getAttachment(args);
    try {
      return JSON.parse(attachment.toString("utf-8"));
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(
        400,
        `Could not parse attachment ${args.attachment} as JSON: ${error.message}`
      );
    }
  }

  /**
   * Uploads an attachment to a CouchDB document.
   * Throws if there is an error uploading, or if the document does not exist.
   */
  async uploadAttachment(args: {
    /** Document id */
    document: string;
    /** Attachment name */
    attachmentName: string;
    /** Attachment (as a Buffer) */
    attachment: Buffer;
    /** Attachment content type. Default: application/octet-stream */
    contentType?: string;
  }) {
    const { document, attachmentName, attachment } = args;
    const contentType = args.contentType || "application/octet-stream";

    let headers: { etag: string };
    try {
      // Get the current document revision (headers.etag)
      headers = await this.db.head(document);
    } catch (e) {
      const error = e as RequestError;
      if (error.statusCode === 404)
        throw createHttpError(404, `Document ${document} does not exist.`);
      throw createHttpError(error.statusCode || 500, error.message);
    }

    try {
      return await this.db.attachment.insert(
        document,
        attachmentName,
        attachment,
        contentType,
        {
          rev: headers.etag.toString().replace(/"/g, ""),
        }
      );
    } catch (e) {
      const error = e as RequestError;
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /**
   * Uploads a base64-encoded string as an attachment to a CouchDB document.
   * Throws if there is an error uploading, or if the document does not exist.
   */
  async uploadBase64Attachment(args: {
    /** Document id */
    document: string;
    /** Attachment name */
    attachmentName: string;
    /** Attachment (as a base64-encoded string) */
    attachment: string;
    /** Attachment content type. Default: applicaton/octet-stream */
    contentType?: string;
  }) {
    const buffer = Buffer.from(args.attachment, "base64");
    await this.uploadAttachment({
      ...args,
      attachment: buffer,
    });
  }

  /**
   * Destroys an attachment to a CouchDB document.
   * Throws if there is an error destorying the attachment, or if the document does not exist.
   */
  async destroyAttachment(args: {
    /** Document id */
    document: string;
    /** Attachment name */
    attachmentName: string;
  }) {
    const { document, attachmentName } = args;

    try {
      const documentObj = await this.db.get(document);
      if (documentObj) {
        await this.db.attachment.destroy(document, attachmentName);
      }
    } catch (e) {
      const error = e as RequestError;
      if (error.statusCode === 404)
        throw createHttpError(404, `Document ${document} does not exist.`);
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }

  /** Deletes an item from the database by id */
  async delete(args: { document: string }): Promise<void> {
    const { document } = args;
    try {
      const documentObj = await this.db.get(document);
      if (documentObj) {
        this.db.destroy(document, documentObj._rev);
      }
    } catch (e) {
      const error = e as RequestError;
      if (error.statusCode === 404)
        throw createHttpError(404, `Document ${document} does not exist.`);
      throw createHttpError(error.statusCode || 500, error.message);
    }
  }
}
