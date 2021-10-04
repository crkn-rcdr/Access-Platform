import { z } from "zod";

import { Alias } from "./Alias.js";
import { Collection } from "./Collection.js";
import { Manifest } from "./Manifest.js";

export const AccessObject = z.union([Alias, Collection, Manifest]);
export type AccessObject = z.infer<typeof AccessObject>;

export const isAlias = (obj: AccessObject): obj is Alias => {
  return obj.type === "alias";
};

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isManifest = (obj: AccessObject): obj is Manifest => {
  return obj.type === "manifest";
};

export { Alias, EditableAlias } from "./Alias.js";
export { Canvas, EditableCanvas } from "./Canvas.js";
export { Collection, EditableCollection, NewCollection } from "./Collection.js";
export { Manifest, EditableManifest, NewManifest } from "./Manifest.js";

export { FileRef } from "./util/FileRef.js";
export { ImageRef } from "./util/ImageRef.js";
export { ObjectList } from "./util/ObjectList.js";
export { TextRecord } from "./util/TextRecord.js";
