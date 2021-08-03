import { z } from "zod";

import {
  DocumentViewParams,
  DocumentScope,
  ServerScope,
  MangoQuery,
  MangoSelector,
} from "nano";

import {
  DocumentNotFoundError,
  fromNanoError,
  UniqueKeyViolationError,
} from "./errors.js";
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

type CouchDocument = {
  _id: string;
  _rev: string;
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

type UpdateArgs<Body extends unknown> = {
  /** Design document name */
  ddoc: string;
  /** Update function name */
  name: string;
  /** Document ID */
  docId: string;
  /** Update function payload */
  body?: Body;
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

/**
 * Handler for interactions with a CouchDB database.
 *
 * Also handles translating `_id` and `_attachments` to non-underscored versions.
 */
export class DatabaseHandler<T extends Document> {
  private name: string;
  private parser: z.Schema<T>;
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
    this.db = client.use(db);
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
      throw fromNanoError(e, { type: "document", db: this.name, id });
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
  ): Promise<
    { found: true; doc: T } | { found: false; error: DocumentNotFoundError }
  > {
    try {
      return { found: true, doc: await this.get(id) };
    } catch (e) {
      if (e instanceof DocumentNotFoundError) {
        return { found: false, error: e };
      } else {
        throw e;
      }
    }
  }

  /**
   * Calls one of this database's design document update functions.
   *
   * By creating methods that set the `Body` type parameter, you can assert
   * that the update function payload is typed correctly.
   *
   * @param args Arguments to the underlying call.
   */
  async update<Body = unknown>(args: UpdateArgs<Body>) {
    try {
      await this.db.updateWithHandler(
        args.ddoc,
        args.name,
        args.docId,
        args.body
      );
    } catch (e) {
      throw fromNanoError(e, {
        type: "update",
        db: this.name,
        ddoc: args.ddoc,
        name: args.name,
        id: args.docId,
      });
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
  async view(
    designName: string,
    viewName: string,
    options: DocumentViewParams
  ) {
    try {
      return await this.db.view(designName, viewName, options);
    } catch (e) {
      throw fromNanoError(e, {
        type: "view",
        db: this.name,
        ddoc: designName,
        name: viewName,
      });
    }
  }

  /**
   * Returns the documents found with `query`.
   */
  async find<Fields extends readonly (keyof T & string)[]>(
    selector: MangoSelector,
    fields: Fields,
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

    const query = {
      selector,
      fields: [...fieldSet.values()],
      ...options,
    };

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
      throw fromNanoError(e, { type: "mango", db: this.name, query });
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
    throw new UniqueKeyViolationError(selector, fields, response);
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

    return Object.fromEntries(results.entries());
  }
}
