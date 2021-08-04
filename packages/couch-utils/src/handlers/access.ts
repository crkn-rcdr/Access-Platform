import { z } from "zod";
import {
  Alias,
  Manifest,
  Collection,
  Noid,
  EditableCollection,
  EditableManifest,
  User,
} from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";
import createHttpError from "http-errors";

// Use this essentially so that `slug` is defined
const AccessDatabaseObject = z.union([Alias, Manifest, Collection]);

type AccessDatabaseObject = z.infer<typeof AccessDatabaseObject>;

/**
 * Interact with Access Objects in their database.
 */
export class AccessHandler extends DatabaseHandler<AccessDatabaseObject> {
  constructor(client: ServerScope) {
    super("access", AccessDatabaseObject, client);
  }

  /**
   * Publish an Access Object.
   */
  async publish(id: Noid) {
    await this.update({
      ddoc: "access",
      name: "publish",
      docId: id,
    });
  }

  /**
   * Unpublish an Access Object.
   */
  async unpublish(id: Noid) {
    await this.update({
      ddoc: "access",
      name: "unpublish",
      docId: id,
    });
  }

  private async editObject<T extends { slug?: string }>(args: {
    id: Noid;
    user: User;
    data: T;
  }) {
    const { slug } = args.data;

    if (slug) {
      const response = await this.findUnique("slug", slug, ["id"] as const);
      if (response.found && response.result.id !== args.id)
        throw createHttpError(400, `Slug ${slug} already in use.`);
    }

    await this.update({
      ddoc: "access",
      name: "editObject",
      docId: args.id,
      body: args,
    });
  }

  /**
   * Update the staff-editable fields of a Collection.
   */
  async editCollection(args: {
    id: Noid;
    user: User;
    data: EditableCollection;
  }) {
    const data = EditableCollection.parse(args.data);
    return await this.editObject({ id: args.id, user: args.user, data });
  }

  /**
   * Update the staff-editable fields of a Manifest.
   */
  async editManifest(args: { id: Noid; user: User; data: EditableManifest }) {
    const data = EditableManifest.parse(args.data);
    return await this.editObject({ id: args.id, user: args.user, data });
  }
}
