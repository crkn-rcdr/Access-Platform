import * as Data from "@crkn-rcdr/access-data";
import { CouchDBEndpoint } from "../endpoints/CouchDB";

// TODO: Add Canvas to AccessObject
type AccessObject = Data.AccessObject | Data.Canvas;

export const getRetriever =
  (couch: CouchDBEndpoint) =>
  async (noid: Data.Noid): Promise<ObjectAccessor | null> => {
    let data: AccessObject | null = null;

    try {
      data = Data.fromCouch<Data.AccessObject>(await couch.access.get(noid));
    } catch (error) {
      if (error.statusCode !== 404) throw error;
    }

    if (!data) {
      try {
        data = Data.fromCouch<Data.Canvas>(await couch.canvas.get(noid));
      } catch (error) {
        if (error.statusCode === 404) {
          return null;
        } else {
          throw error;
        }
      }
    }

    return new ObjectAccessor(data);
  };

export class ObjectAccessor {
  data: AccessObject;

  constructor(data: AccessObject) {
    this.data = data;
  }

  isCanvas(): this is CanvasAccessor {
    return (
      this.data.hasOwnProperty("master") && this.data.hasOwnProperty("source")
    );
  }

  isAlias(): this is AliasAccessor {
    return Data.isAlias(this.data as Data.AccessObject);
  }

  isCanvasManifest(): this is CanvasManifestAccessor {
    return Data.isCanvasManifest(this.data as Data.AccessObject);
  }

  isPdfManifest(): this is PdfManifestAccessor {
    return Data.isPdfManifest(this.data as Data.AccessObject);
  }

  isCollection(): this is CollectionAccessor {
    return Data.isCollection(this.data as Data.AccessObject);
  }
}

export class CanvasAccessor extends ObjectAccessor {
  declare data: Data.Canvas;
}

export class SluggedObjectAccessor extends ObjectAccessor {}

export class AliasAccessor extends SluggedObjectAccessor {
  declare data: Data.Alias;
}

export class CanonicalObjectAccessor extends SluggedObjectAccessor {}

export class ManifestAccessor extends CanonicalObjectAccessor {}

export class PdfManifestAccessor extends ManifestAccessor {
  declare data: Data.PdfManifest;
}

export class CanvasManifestAccessor extends ManifestAccessor {
  declare data: Data.CanvasManifest;
}

export class CollectionAccessor extends CanonicalObjectAccessor {
  declare data: Data.Collection;
}
