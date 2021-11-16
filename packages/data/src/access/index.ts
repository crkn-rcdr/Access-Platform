import { z } from "zod";

import { Alias } from "./Alias.js";
import { Canvas } from "./Canvas.js";
import { Collection } from "./Collection.js";
import { Manifest } from "./Manifest.js";

export const AccessObject = z.union([Collection, Manifest, Canvas, Alias]);
export type AccessObject = z.infer<typeof AccessObject>;

export const isAlias = (obj: AccessObject): obj is Alias => {
  return obj.type === "alias";
};

export const isCanvas = (obj: AccessObject): obj is Canvas => {
  return obj.type === "canvas";
};

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isManifest = (obj: AccessObject): obj is Manifest => {
  return obj.type === "manifest";
};

export { Alias, EditableAlias } from "./Alias.js";
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
