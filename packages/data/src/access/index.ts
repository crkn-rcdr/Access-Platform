import { Alias } from "./Alias";
import { CanvasManifest } from "./CanvasManifest";
import { Collection } from "./Collection";
import { PdfManifest } from "./PdfManifest";

export type AccessObject = Collection | CanvasManifest | PdfManifest | Alias;

export { Alias } from "./Alias";
export { Canvas } from "./Canvas";
export { CanvasManifest } from "./CanvasManifest";
export { Collection } from "./Collection";
export { PdfManifest } from "./PdfManifest";

export const isAlias = (obj: AccessObject): obj is Alias => {
  return obj.type === "alias";
};

export const isCollection = (obj: AccessObject): obj is Collection => {
  return obj.type === "collection";
};

export const isCanvasManifest = (obj: AccessObject): obj is CanvasManifest => {
  return obj.type === "manifest" && obj.from === "canvases";
};

export const isPdfManifest = (obj: AccessObject): obj is PdfManifest => {
  return obj.type === "manifest" && obj.from === "pdf";
};
