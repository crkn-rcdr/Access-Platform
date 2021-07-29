import { router as trpcRouter } from "@trpc/server";

import { LapinContext } from "./context.js";

import { slugRouter } from "./routes/slug.js";
import { noidRouter } from "./routes/noid.js";
import { behaviorRouter } from "./routes/behavior.js";
import { canvasesRouter } from "./routes/canvases.js";
import { labelRouter } from "./routes/label.js";
import { membersRouter } from "./routes/members.js";
import { pageLabelsRouter } from "./routes/pageLabels.js";
import { summaryRouter } from "./routes/summary.js";
import { viewingDirectionRouter } from "./routes/viewingDirection.js";

export function createRouter() {
  return trpcRouter<LapinContext>();
}

export const router = createRouter()
  .merge("slug.", slugRouter)
  .merge("noid.", noidRouter)
  .merge("behavior.", behaviorRouter)
  .merge("canvases.", canvasesRouter)
  .merge("label.", labelRouter)
  .merge("members.", membersRouter)
  .merge("pageLabels.", pageLabelsRouter)
  .merge("summary.", summaryRouter)
  .merge("viewingDirection.", viewingDirectionRouter);

export type LapinRouter = typeof router;
