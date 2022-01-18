import { Slug, User, OcrBatch, EditableOcrBatch } from "@crkn-rcdr/access-data";
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

  /**
   * Update a request to import
   */
  async editBatch(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
    /** The status */
    data: EditableOcrBatch;
  }) {
    const { id, data, user } = args;

    await this.update({
      ddoc: "access",
      name: "editBatch",
      docId: id,
      body: {
        data,
        user,
      },
    });

    return await this.get(id);
  }

  /**
   * Triggers a request to export
   */
  async requestExport(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
  }) {
    const { user, id } = args;

    await this.update({
      ddoc: "access",
      name: "requestOCRExport",
      docId: id,
      body: {
        user,
      },
    });

    return await this.get(id);
  }

  /**
   * Triggers a request to import
   */
  async requestImport(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
  }) {
    const { user, id } = args;

    await this.update({
      ddoc: "access",
      name: "requestOCRImport",
      docId: id,
      body: {
        user,
      },
    });

    return await this.get(id);
  }

  /**
   * Update a request to export
   */
  async updateExport(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
    /** The status */
    succeeded: boolean;
    /** The message */
    message?: string;
  }) {
    const { id, succeeded, user } = args;

    let data: any = {
      succeeded,
      user,
    };
    if (args.message) data["message"] = args.message;

    await this.update({
      ddoc: "access",
      name: "updateOCRExport",
      docId: id,
      body: args,
    });

    return await this.get(id);
  }

  /**
   * Update a request to import
   */
  async updateImport(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
    /** The status */
    succeeded: boolean;
    /** The message */
    message?: string;
  }) {
    const { id, succeeded, user } = args;

    let data: any = {
      succeeded,
      user,
    };
    if (args.message) data["message"] = args.message;

    await this.update({
      ddoc: "access",
      name: "updateOCRImport",
      docId: id,
      body: args,
    });

    return await this.get(id);
  }

  /**
   * Cancels a request to export
   */
  async cancelExport(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
  }) {
    const { user, id } = args;

    await this.update({
      ddoc: "access",
      name: "cancelOCRExport",
      docId: id,
      body: {
        user,
      },
    });

    return await this.get(id);
  }

  /**
   * Cancels a request to import
   */
  async cancelImport(args: {
    /** User who is making the request */
    user: User;
    /** The batch id*/
    id: Slug;
  }) {
    const { user, id } = args;

    await this.update({
      ddoc: "access",
      name: "cancelOCRImport",
      docId: id,
      body: {
        user,
      },
    });

    return await this.get(id);
  }
}
