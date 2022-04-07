import createHttpError from "http-errors";
import { ServerScope } from "nano";

import {
  Manifest,
  Collection,
  Noid,
  EditableCollection,
  EditableManifest,
  User,
  Slug,
  NewCollection,
  NewManifest,
  TextRecord,
  SimpleRecord,
  Membership,
  Ancestry,
  AccessObject,
  AccessObjectType,
  Pdf,
  EditablePdf,
} from "@crkn-rcdr/access-data";

import { DatabaseHandler } from "../DatabaseHandler.js";

type SlugResolution =
  | { resolved: true; id: Noid; type: AccessObjectType }
  | { resolved: false; error: SlugResolutionError };
type SlugResolutionError =
  | "not-found" // the slug didn't resolve
  | "is-self" // the slug resolved to the collection being edited
  | "already-member"; // the slug resolved to an existing member of the collection

export type ProcessListCommand =
  | ["add", Noid[]]
  | ["prepend", Noid[]]
  | ["addAfter", [Noid[], Noid]]
  | ["addBefore", [Noid[], Noid]]
  | ["overwrite", Noid[]]
  | ["remove", Noid[]]
  | ["move", [Noid[], number]]
  | ["relabel", [Noid, TextRecord]]
  | ["moveAfter", [Noid[], Noid]]
  | ["moveBefore", [Noid[], Noid]];

/**
 * Interact with Access Objects in their database.
 */
export class AccessHandler extends DatabaseHandler<AccessObject> {
  /**
   * Create an AccessHandler.
   * @param client A couchdb-nano client.
   * @param suffix Suffix to append to the access database's name.
   */
  constructor(client: ServerScope, suffix?: string) {
    super(suffix ? `access-${suffix}` : `access`, AccessObject, client);
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
    type: AccessObjectType;
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

  /**
   * Update the staff-editable fields of a Manifest.
   * @returns The updated Manifest.
   */
  async editPdf(args: {
    id: Noid;
    user: User;
    data: EditablePdf;
  }): Promise<Pdf> {
    const data = Pdf.partial().parse(args.data);
    await this.editObject({
      id: args.id,
      user: args.user,
      data,
      type: "pdf",
    });
    const pdf = await this.get(args.id);
    return Pdf.parse(pdf);
  }

  async processList(args: {
    id: Noid;
    command: ProcessListCommand;
    user?: User;
  }): Promise<void> {
    const { id, command, user } = args;
    await this.update({
      ddoc: "access",
      name: "processList",
      docId: id,
      body: { command, user },
    });
  }

  /**
   * Removes a member from a collection.
   */
  async removeMember(args: {
    /** Collection id */
    id: Noid;
    /** Member id */
    member: Noid;
    /** User making the update */
    user?: User;
  }): Promise<void> {
    const { id, member, user } = args;
    await this.processList({
      id,
      command: ["remove", [member]],
      user,
    });
  }

  /**
   * Forces an update on all members of a Collection.
   * @returns void
   */
  async bulkForceUpdateAllMembers(id: string): Promise<void> {
    // Update all other members
    const collection = await this.get(id);
    if ("members" in collection) {
      const memberIds: string[] = [];
      for (const member of collection.members) {
        if ("id" in member && typeof member.id !== "undefined")
          memberIds.push(member.id);
      }

      // Don't hold up the response but force update to these new members
      this.bulkForceUpdate(memberIds).then((res: any) => {
        console.log("Forced Update Members: ", res);
      });
    }
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

  private async simpleLookup(id: Noid): Promise<SimpleRecord> {
    const lookup = await this.findUnique("id", id, [
      "id",
      "slug",
      "label",
    ] as const);
    if (lookup.found) {
      return lookup.result;
    } else {
      throw createHttpError(404, `Object ${id} not found.`);
    }
  }

  /** TODO: move to lapin when it's testable */
  async getMembership(id: Noid): Promise<Membership> {
    const memberships = await this.isMemberOf(id);

    const rv: Membership = [];
    for (const m of memberships) {
      rv.push(await this.simpleLookup(m));
    }

    return rv;
  }

  async bulkPublish(ids: any[], user: User): Promise<boolean> {
    const date = new Date().toISOString().replace(/.\d+Z$/g, "Z");
    return await this.bulkChange(ids, (doc: any) => {
      if (!doc) return [null, "Error. Old document was null."];
      if (!doc["_id"]) return [null, "Error. Old document had no id."];
      if (!doc["_rev"]) return [null, "Error. Old document had no revision."];
      if (!doc["dmdType"])
        return [null, "Error. Old document had no dmd type."];
      if (doc["public"]) {
        return [null, `Trying to publish an object that is already public`];
      }

      doc.public = date;

      doc.staff = {
        by: user,
        date,
      };

      doc.updateInternalmeta = {
        requestDate: date,
      };

      return [doc];
    });
  }

  async bulkUnpublish(ids: any[], user: User): Promise<boolean> {
    const date = new Date().toISOString().replace(/.\d+Z$/g, "Z");
    return await this.bulkChange(ids, (doc: any) => {
      if (!doc) return [null, "Error. Old document was null."];
      if (!doc["_id"]) return [null, "Error. Old document had no id."];
      if (!doc["_rev"]) return [null, "Error. Old document had no revision."];
      if (!doc["dmdType"])
        return [null, "Error. Old document had no dmd type."];
      if (!doc["public"]) {
        return [
          null,
          `Trying to unpublish an object that is already unpublished`,
        ];
      }

      delete doc.public;

      doc.staff = {
        by: user,
        date,
      };

      doc.updateInternalmeta = {
        requestDate: date,
      };

      return [doc];
    });
  }

  async publishAllMembers(id: Noid, user: User): Promise<boolean> {
    const collection = await this.get(id);
    if ("members" in collection && collection.members?.length) {
      let ids: string[] = [];
      for (const m of collection.members) {
        if (!m.id) continue;
        ids.push(m.id);
      }

      try {
        return await this.bulkPublish(ids, user);
      } catch (e: any) {
        console.log(e?.message);
        return false;
      }
    }
    return false;
  }

  async unpublishAllMembers(id: Noid, user: User): Promise<boolean> {
    const collection = await this.get(id);
    if ("members" in collection && collection.members?.length) {
      let ids: string[] = [];
      for (const m of collection.members) {
        if (!m.id) continue;
        ids.push(m.id);
      }

      try {
        return await this.bulkUnpublish(ids, user);
      } catch (e: any) {
        console.log(e?.message);
        return false;
      }
    }
    return false;
  }

  async getAncestry(id: Noid): Promise<Ancestry> {
    const parentMemo = new Map<Noid, Noid[]>();
    const recordMemo = new Map<Noid, SimpleRecord>();

    const partial = async (id: Noid): Promise<Noid[][]> => {
      if (!recordMemo.has(id)) {
        recordMemo.set(id, await this.simpleLookup(id));
      }
      if (!parentMemo.has(id)) {
        parentMemo.set(id, await this.isMemberOf(id));
      }
      const parents = parentMemo.get(id)!;
      if (parents.length > 0) {
        const rv: Noid[][] = [];
        for (const parent of parents) {
          const parentAncestry = await partial(parent);
          rv.push(
            ...parentAncestry.map((path) => {
              if (path.indexOf(id) > -1) {
                throw createHttpError(
                  500,
                  `Ancestry cycle detected! ${[...path, id].join(" -> ")}`
                );
              }
              return [...path, id];
            })
          );
        }
        return rv;
      } else {
        return [[id]];
      }
    };
    const graph = await partial(id);

    return graph.map((path) => path.map((id) => recordMemo.get(id)!));
  }
}
