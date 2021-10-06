import { z } from "zod";

import { Collection } from "./Collection.js";
import { Manifest } from "./Manifest.js";

export const AccessObject = z.union([Collection, Manifest]);
export type AccessObject = z.infer<typeof AccessObject>;

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isManifest = (obj: AccessObject): obj is Manifest => {
  return obj.type === "manifest";
};

export { Canvas, EditableCanvas } from "./Canvas.js";
export { Collection, EditableCollection, NewCollection } from "./Collection.js";
export { Manifest, EditableManifest, NewManifest } from "./Manifest.js";

export { FileRef } from "./util/FileRef.js";
export { ImageRef } from "./util/ImageRef.js";
export { ObjectList } from "./util/ObjectList.js";
export { TextRecord } from "./util/TextRecord.js";
