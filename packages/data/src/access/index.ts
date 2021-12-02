import { z } from "zod";

import { Canvas } from "./Canvas.js";
import { Collection } from "./Collection.js";
import { Manifest } from "./Manifest.js";
import { Noid, Slug } from "../util/index.js";
import { TextRecord } from "./util/TextRecord.js";

export const AccessObject = z.union([Canvas, Collection, Manifest]);
export type AccessObject = z.infer<typeof AccessObject>;

export const isCanvas = (obj: AccessObject): obj is Canvas => {
  return obj.type === "canvas";
};

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isManifest = (obj: AccessObject): obj is Manifest => {
  return obj.type === "manifest";
};

export { Canvas, EditableCanvas } from "./Canvas.js";
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

export { FileRef } from "./util/FileRef.js";
export { ImageRef } from "./util/ImageRef.js";
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
