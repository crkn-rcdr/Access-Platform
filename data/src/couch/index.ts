export * as access from "./access";
export * as canvas from "./canvas";
export * as util from "./util";

export const DATABASES = ["access", "canvas"] as const;

import { Document as AccessDocument } from "./access";
import { Document as CanvasDocument } from "./canvas";

export type DocumentTypes = {
  access: AccessDocument;
  canvas: CanvasDocument;
};
