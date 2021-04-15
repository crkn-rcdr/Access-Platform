export * as access from "./access";
export * as canvas from "./canvas";
export * as util from "./util";

export const DATABASES = ["access", "canvas"] as const;

import { AccessDocument } from "./access";
import { CanvasDocument } from "./canvas";

export type DocumentTypes = {
  access: AccessDocument;
  canvas: CanvasDocument;
};
