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
  Slug,
  NewCollection,
  NewManifest,
} from "@crkn-rcdr/access-data";

import { DatabaseHandler } from "../DatabaseHandler.js";

import { xorWith, isEqual } from "lodash-es";

// Use this essentially so that `slug` is defined
// TODO: define a Zod parser that is aware of all possible fields.
const AccessDatabaseObject = z.union([Alias, Manifest, Collection]);

type AccessDatabaseObject = z.infer<typeof AccessDatabaseObject>;

type SlugResolution =
  | { resolved: true; id: Noid; type: "manifest" | "collection" | "alias" }
  | { resolved: false; error: SlugResolutionError };
type SlugResolutionError =
  | "not-found" // the slug didn't resolve
  | "is-self" // the slug resolved to the collection being edited
  | "already-member"; // the slug resolved to an existing member of the collection

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
   * Resolves slugs.
   */
  async resolveSlugs(slugs: Slug[]): Promise<Record<Slug, SlugResolution>> {
    const response: Record<Slug, SlugResolution> = {};

    for await (const slug of slugs) {
      const resolution = await this.findUnique("slug", slug, [
        "id",
        "type",
      ] as const);
      response[slug] = resolution.found
        ? { ...resolution.result, resolved: true }
        : { error: "not-found", resolved: false };
    }

    return response;
  }

  /**
   * Publish an Access Object.
   */
  async publish(args: { id: Noid; user?: User }) {
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
  async unpublish(args: { id: Noid; user?: User }) {
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

  /**
   * Creates a new Collection.
   * @returns The created Collection.
   */

  async createCollection(args: {
    id: Noid;
    user: User;
    data: NewCollection;
  }): Promise<Collection> {
    const data = NewCollection.parse(args.data);
    await this.insert({
      id: args.id,
      staff: {
        by: args.user,
        date: Date.now(),
      },
      ...data,
    });
    // Is this required?
    if (data.members) {
      for (let members of data.members) {
        if (members.id !== undefined) {
          await this.forceUpdate(members.id);
        }
      }
    }
    const collection = await this.get(args.id);
    return Collection.parse(collection);
  }

  /**
   * Creates a new Manifest.
   * @returns The created Manifest.
   */
  async createManifest(args: {
    id: Noid;
    user: User;
    data: NewManifest;
  }): Promise<Manifest> {
    const data = NewManifest.parse(args.data);
    await this.insert({
      id: args.id,
      staff: {
        by: args.user,
        date: Date.now(),
      },
      ...data,
    });
    const manifest = await this.get(args.id);
    return Manifest.parse(manifest);
  }

  /**
   * This method resolves the slugs and returns the record of resolved and unresolved slugs with the error message
   * @param id The Collection id
   * @param slugArray The list of Slugs
   * @returns Record of resolved slugs and the errors of why the slug cannot be added to the member list
   */
  async checkAdditions(
    id: Noid,
    slugArray: Slug[]
  ): Promise<Record<Slug, SlugResolution>> {
    console.log("Entry Into checkAdditions", id);

    const currentMembers = Collection.parse(await this.get(id)).members;

    const resolution = Object.entries(await this.resolveSlugs(slugArray));

    return Object.fromEntries(
      resolution.map(([slug, r]): [string, SlugResolution] => {
        if (r.resolved) {
          if (r.id === id) {
            return [slug, { error: "is-self", resolved: false }];
          }
          for (let member of currentMembers) {
            if (r.id === member.id) {
              return [slug, { error: "already-member", resolved: false }];
            }
          }
        }
        return [slug, r];
      })
    );
  }
}
