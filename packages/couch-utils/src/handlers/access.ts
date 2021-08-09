import { z } from "zod";
import createHttpError from "http-errors";
import { ServerScope } from "nano";

import {
  Alias,
  Manifest,
  Collection,
  Noid,
  EditableCollection,
  EditableManifest,
  User,
} from "@crkn-rcdr/access-data";

import { DatabaseHandler } from "../DatabaseHandler.js";

// Use this essentially so that `slug` is defined
const AccessDatabaseObject = z.union([Alias, Manifest, Collection]);

type AccessDatabaseObject = z.infer<typeof AccessDatabaseObject>;

/**
 * Interact with Access Objects in their database.
 */
export class AccessHandler extends DatabaseHandler<AccessDatabaseObject> {
  /**
   * Create an AccessHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the access database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `access-${suffix}` : `access`, AccessDatabaseObject, client);
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
    type: "manifest" | "collection" | "alias";
  }) {
    const typeCheck = await this.findUnique("id", args.id, ["type"] as const);
    if (!typeCheck.found)
      throw createHttpError(404, `No ${args.type} found with id ${args.id}.`);
    if (typeCheck.result.type !== args.type)
      throw createHttpError(
        400,
        `Object ${args.id} has type: ${typeCheck.result.type}.`
      );

    if (args.data.slug) {
      const slugCheck = await this.findUnique("slug", args.data.slug, [
        "id",
      ] as const);
      if (slugCheck.found && slugCheck.result.id !== args.id)
        throw createHttpError(400, `Slug ${args.data.slug} already in use.`);
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
   * @returns The updated Collection.
   */
  async editCollection(args: {
    id: Noid;
    user: User;
    data: EditableCollection;
  }): Promise<Collection> {
    const data = EditableCollection.parse(args.data);
    await this.editObject({
      id: args.id,
      user: args.user,
      data,
      type: "collection",
    });
    const collection = await this.get(args.id);
    return Collection.parse(collection);
  }

  /**
   * Update the staff-editable fields of a Manifest.
   * @returns The updated Manifest.
   */
  async editManifest(args: {
    id: Noid;
    user: User;
    data: EditableManifest;
  }): Promise<Manifest> {
    const data = EditableManifest.parse(args.data);
    await this.editObject({
      id: args.id,
      user: args.user,
      data,
      type: "manifest",
    });
    const manifest = await this.get(args.id);
    return Manifest.parse(manifest);
  }

  async unassignSlug(_args: { id: Noid; user: User }): Promise<void> {}
}
