import {
  DocumentViewParams,
  DocumentScope,
  ServerScope,
  MangoQuery,
} from "nano";

type PermissiveDoc = {
  _id: string;
  _rev: string;
  [k: string]: unknown;
};

export class DatabaseHandler {
  private db: DocumentScope<unknown>;

  constructor(db: string, client: ServerScope) {
    this.db = client.use(db);
  }

  async get(id: string) {
    return await this.db.get(id);
  }

  async updateWithSubset(id: string, subset: Record<string, any>) {
    let doc = await this.get(id);
    Object.assign(doc, subset);
    return await this.db.insert(doc);
  }

  async insertNew(data: Record<string, any>) {
    // TODO: figure out best way to call noid service for this
    data["_id"] = data["id"];
    return await this.db.insert(data);
  }

  async unassignSlug(id: string) {
    return await this.updateWithSubset(id, { slug: undefined });
  }

  async view(
    designName: string,
    viewName: string,
    options: DocumentViewParams
  ) {
    return await this.db.view(designName, viewName, options);
  }

  async find(query: MangoQuery): Promise<PermissiveDoc[]> {
    const response = await this.db.find(query);
    return response.docs;
  }
}
