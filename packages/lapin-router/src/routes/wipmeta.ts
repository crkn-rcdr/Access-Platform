import { z } from "zod";
import { createRouter } from "../router.js";
import { storePreservation } from "../util/dmdTask.js";

export const StorePreservationInput = z.object({
  task: z.string(), // dmdtask uuid
  index: z.number(),
  id: z.string(), // = prefix.slug
});

export const wipmetaRouter = createRouter().mutation("storePreservation", {
  input: StorePreservationInput.parse,
  async resolve({ input, ctx }) {
    console.log("preservation input: ", input);
    const { id, index, task } = input;
    // Throws user-readable TRPC errors for specific issues
    await storePreservation(ctx, id, task, index);
  },
});
