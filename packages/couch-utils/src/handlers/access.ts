import { z } from "zod";
import {
  Alias,
  Manifest,
  Collection,
  Noid,
  EditableCollection,
  EditableManifest,
  StaffUpdate,
  User,
} from "@crkn-rcdr/access-data";
import { ServerScope } from "nano";

import { DatabaseHandler } from "../DatabaseHandler.js";

// Use this essentially so that `slug` is defined
const AccessDatabaseObject = z.union([Alias, Manifest, Collection]);

type AccessDatabaseObject = z.infer<typeof AccessDatabaseObject>;

const makeStaffUpdate = (user: User): StaffUpdate => {
  return {
    by: user,
    date: Date.now() / 1000,
  };
};

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

  private async editObject<T>(args: { id: Noid; user: User; data: T }) {
    const body = { ...args.data, staff: makeStaffUpdate(args.user) };
    await this.update({
      ddoc: "access",
      name: "editObject",
      docId: args.id,
      body,
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
