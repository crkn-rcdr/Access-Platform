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

// Use this essentially so that `slug` is defined
const AccessDatabaseObject = z.union([Alias, Manifest, Collection]);

type AccessDatabaseObject = z.infer<typeof AccessDatabaseObject>;

export class AccessHandler extends DatabaseHandler<AccessDatabaseObject> {
  constructor(client: ServerScope) {
    super("access", AccessDatabaseObject, client);
  }

  async publish(id: Noid) {
    await this.update({
      ddoc: "access",
      name: "publish",
      docId: id,
    });
  }

  async unpublish(id: Noid) {
    await this.update({
      ddoc: "access",
      name: "unpublish",
      docId: id,
    });
  }

  async editCollection(id: Noid, user: User, data: EditableCollection) {
    const body = { ...data, user };
    await this.update({
      ddoc: "access",
      name: "editCollecton",
      docId: id,
      body,
    });
  }

  async editManifest(id: Noid, user: User, data: EditableManifest) {
    const body = { ...data, user };
    await this.update({
      ddoc: "access",
      name: "editManifest",
      docId: id,
      body,
    });
  }
}
