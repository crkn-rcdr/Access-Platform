import { AccessDocument } from "./access";
import { CanvasDocument } from "./canvas";

export type DocumentTypes = {
  access: AccessDocument;
  canvas: CanvasDocument;
};

export const DATABASES = ["access", "canvas"] as const;

export { validate as validateAccessDocument } from "./access";
export { validate as validateCanvasDocument } from "./canvas";
export { fromCouch, toCouch } from "./util";
