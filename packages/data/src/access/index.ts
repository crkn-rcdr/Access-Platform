import { z } from "zod";

import { Collection } from "./Collection.js";
import { Manifest } from "./Manifest.js";
import { Pdf } from "./Pdf.js";
import { Noid, Slug } from "../util/index.js";
import { TextRecord } from "./util/TextRecord.js";

export const AccessObject = z.union([Collection, Manifest, Pdf]);
export type AccessObject = z.infer<typeof AccessObject>;

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isManifest = (obj: AccessObject): obj is Manifest => {
  return obj.type === "manifest";
};

export const isPdf = (obj: AccessObject): obj is Pdf => {
  return obj.type === "pdf";
};

export {
  Collection,
  EditableCollection,
  NewCollection,
  PagedCollection,
  toPagedCollection,
} from "./Collection.js";
export {
  Manifest,
  EditableManifest,
  NewManifest,
  PagedManifest,
  toPagedManifest,
} from "./Manifest.js";
export { Pdf } from "./Pdf.js";

export {
  ObjectList,
  ObjectListShort,
  ObjectListHandler,
  ObjectListPage,
} from "./util/ObjectList.js";
export { TextRecord } from "./util/TextRecord.js";

export interface SimpleRecord {
  id: Noid;
  slug?: Slug;
  label: TextRecord;
}

export type Membership = Array<SimpleRecord>;
export type Ancestry = Array<Array<SimpleRecord>>;
