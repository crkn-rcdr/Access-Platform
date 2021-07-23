import {
  DocumentViewParams,
  DocumentScope,
  ServerScope,
  MangoQuery,
} from "nano";

import {
  DocumentNotFoundError,
  fromNanoError,
  UniqueKeyViolationError,
} from "./errors.js";
import { mangoEqualSelector, mangoStringRangeSelector } from "./util.js";

type CouchDocument = {
  _id: string;
  _rev: string;
  [k: string]: unknown;
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

type FindArgs<Result extends {}, TestField extends keyof Result> = {
  testField: TestField;
  testValue: Result[TestField];
  resultFields: (keyof Result)[];
};

type FindArrayArgs<Result extends {}, TestField extends keyof Result> = {
  testField: TestField;
  testValues: Result[TestField][];
  resultFields: (keyof Result)[];
};

export type UniqueResult<Result extends {}, TestField extends keyof Result> =
  | { found: true; result: Result }
  | { found: false; result: Pick<Result, TestField> };

export class DatabaseHandler {
  private name: string;
  private db: DocumentScope<unknown>;

  constructor(db: string, client: ServerScope) {
    this.name = db;
    this.db = client.use(db);
  }

  /**
   * Gets a document from a database.
   * Throws an error if the document isn't found, or if the connection to CouchDB fails.
   * @param id ID of the document.
   */
  async get(id: string): Promise<CouchDocument> {
    try {
      return (await this.db.get(id)) as CouchDocument;
    } catch (e) {
      throw fromNanoError(e, { type: "document", db: this.name, id });
    }
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
    | { found: true; doc: CouchDocument }
    | { found: false; error: DocumentNotFoundError }
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
      return await this.db.updateWithHandler(
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
   * Returns the documents found with `query`. Possibly deprecated.
   */
  async find(query: MangoQuery): Promise<Record<string, unknown>[]> {
    try {
      const response = await this.db.find(query);
      return response.docs;
    } catch (e) {
      throw fromNanoError(e, {
        type: "mango",
        db: this.name,
      });
    }
  }

  /**
   * Find all of the documents where `args.testField` equals `args.testValue`.
   *
   * Use `args.resultFields` to specify which fields you want returned.
   */
  async findEqual<Result extends {}, TestField extends keyof Result>(
    args: FindArgs<Result, TestField>
  ): Promise<Result[]> {
    return (await this.find({
      selector: mangoEqualSelector(args.testField.toString(), args.testValue),
      fields: args.resultFields.map((field) => field.toString()),
    })) as Result[];
  }

  /**
   * Find the document where `args.testField` equals `args.testValue`.
   *
   * Returns null if no document is found. Throws an error if more than one is found.
   */
  async findUnique<Result extends {}, TestField extends keyof Result>(
    args: FindArgs<Result, TestField>
  ): Promise<UniqueResult<Result, TestField>> {
    const response = await this.findEqual(args);
    if (response.length === 0)
      return {
        found: false,
        result: { [args.testField]: args.testValue } as Pick<
          Result,
          typeof args.testField
        >,
      };
    if (response.length === 1)
      return { found: true, result: response[0] as Result };
    throw new UniqueKeyViolationError(
      args.testField as string,
      args.testValue,
      {
        type: "mango",
        db: this.name,
      }
    );
  }

  /**
   * For each value in `args.testValues`, finds the document where `args.testField` equals the value, or `null` if the document does not exist.
   *
   * Throws an error if more than one result is found for any of `args.testValues`.
   */
  async findUniqueArray<Result extends {}, TestField extends keyof Result>(
    args: FindArrayArgs<Result, TestField>
  ): Promise<UniqueResult<Result, TestField>[]> {
    return Promise.all(
      args.testValues.map(
        async (testValue) =>
          await this.findUnique<Result, TestField>({ ...args, testValue })
      )
    );
  }

  /**
   * Find all of the documents where `args.testField` starts with `args.testValue`.
   */
  async findWithPrefix<Result extends {}, TestField extends keyof Result>(
    args: FindArgs<Result, TestField>
  ): Promise<Result[]> {
    // TODO: what is going on here
    return (await this.find({
      selector: mangoStringRangeSelector(
        args.testField.toString(),
        args.testValue as unknown as string
      ),
      fields: args.resultFields.map((field) => field.toString()),
    })) as Result[];
  }
}
