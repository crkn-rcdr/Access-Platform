import { createRouter } from "../router.js";

export const objectRouter = createRouter().mutation("insert", {
  input: (value: unknown) => {
    try {
      // test
      return value;
    } catch (e) {
      throw e; // Zod parser error will occur if the values for valid keys in the data fail their validation
    }
  },
  async resolve({ input: q, ctx }): Promise<any> {
    try {
      console.log("q", q);
      const response = await ctx.couch.access.update(
        "access",
        "edit",
        q.id,
        q.behaviour
      );
      return response;
    } catch (e) {
      throw e; // Catch any issues with updating the database
    }
  },
});
