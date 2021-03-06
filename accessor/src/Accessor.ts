import { get as getNano, Auth } from "@crkn-rcdr/nano";
import * as nano from "nano";
import AccessObject from "./Access/Object";

export default class Accessor {
  private readonly accessDb: nano.DocumentScope<AccessObject>;

  constructor(url: string, auth?: Auth) {
    this.accessDb = getNano(url, auth).use("access");
  }

  async resolve(slug: string): Promise<AccessObject | null> {
    const results = (await this.accessDb.find({ selector: { slug } })).docs;

    if (results.length === 0) {
      return null;
    } else if (results.length === 1) {
      return results[0] as AccessObject;
    } else {
      throw new Error(
        `Cannot resolve slug ${slug}: there are ${results.length} objects identified by it`
      );
    }
  }
}
