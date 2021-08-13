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
  ObjectList,
} from "@crkn-rcdr/access-data";

import { DatabaseHandler } from "../DatabaseHandler.js";

import { xorWith, isEqual } from "lodash-es";

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
   * Returns the Noids of the Collections the object identified by `id` is a member of.
   */
  async isMemberOf(id: Noid): Promise<Noid[]> {
    const response = await this.view("access", "members", { key: id });
    return response.rows.map((row) => row.id);
  }

  /**
   * Publish an Access Object.
   */
  async publish(args: { id: Noid; user: User }) {
    await this.update({
      ddoc: "access",
      name: "publish",
      docId: args.id,
      body: args.user,
    });
  }

  /**
   * Unpublish an Access Object.
   */
  async unpublish(args: { id: Noid; user: User }) {
    await this.update({
      ddoc: "access",
      name: "unpublish",
      docId: args.id,
      body: args.user,
    });
  }
  /**
   * forceUpdate an Access Object.
   */
  async forceUpdate(id: Noid): Promise<void> {
    await this.update({
      ddoc: "access",
      name: "forceUpdate",
      docId: id,
    });
  }
  /**
   * Edit an Access Object.
   */
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
    let filteredMembers: ObjectList = [];

    if (data.members) {
      const currentMembers = Collection.parse(await this.get(args.id)).members;

      const filteredMembers = xorWith(data.members, currentMembers, isEqual);

      for (let members of filteredMembers) {
        if (members.id !== undefined) {
          await this.forceUpdate(members.id);
        }
      }
    }

    await this.editObject({
      id: args.id,
      user: args.user,
      data,
      type: "collection",
    });
    for (let members of filteredMembers) {
      if (members.id !== undefined) {
        await this.forceUpdate(members.id);
      }
    }
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

  async unassignSlug(args: { id: Noid; user: User }): Promise<void> {
    const { id, user } = args;
    const collections = await this.isMemberOf(id);

    for (const collection of collections) {
      await this.update({
        ddoc: "access",
        name: "removeMember",
        docId: collection,
        body: { id, user },
      });
    }

    await this.update({
      ddoc: "access",
      name: "unassignSlug",
      docId: id,
      body: user,
    });
  }
}
