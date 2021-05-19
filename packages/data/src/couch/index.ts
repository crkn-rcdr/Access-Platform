import { AccessDocument } from "./access";
import { CanvasDocument } from "./canvas";
import { DipstagingDocument } from "./dipstaging";

export type DocumentTypes = {
  access: AccessDocument;
  canvas: CanvasDocument;
  dipstaging: DipstagingDocument;
};

export const DATABASES = ["access", "canvas", "dipstaging"] as const;

export { validate as validateAccessDocument, toAccessObject } from "./access";
export { validate as validateCanvasDocument } from "./canvas";
export { validate as validateDipstagingDocument } from "./dipstaging";
export { fromCouch, toCouch } from "./util";
