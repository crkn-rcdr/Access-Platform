import { Alias } from "./Alias";
import { Manifest } from "./Manifest";
import { Collection } from "./Collection";

export type AccessObject = Collection | Manifest | Alias;

export { Alias } from "./Alias";
export { Canvas } from "./Canvas";
export { Collection } from "./Collection";
export { Manifest } from "./Manifest";

export const isAlias = (obj: AccessObject): obj is Alias => {
  return obj.type === "alias";
};

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isManifest = (obj: AccessObject): obj is Manifest => {
  return obj.type === "manifest";
};
