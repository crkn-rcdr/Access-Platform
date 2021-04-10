import { get as getNano, Auth } from "@crkn-rcdr/nano";
import * as nano from "nano";
import { couch } from "@crkn-rcdr/access-data";

type AccessDocument = couch.access.Document;

export default class Accessor {
  private readonly accessDb: nano.DocumentScope<AccessDocument>;

  constructor(url: string, auth?: Auth) {
    this.accessDb = getNano(url, auth).use("access");
  }

  async resolve(slug: string): Promise<AccessDocument | null> {
    const results = (await this.accessDb.find({ selector: { slug } })).docs;

    if (results.length === 0) {
      return null;
    } else if (results.length === 1) {
      return results[0] as AccessDocument;
    } else {
      throw new Error(
        `Cannot resolve slug ${slug}: there are ${results.length} objects identified by it`
      );
    }
  }
}
