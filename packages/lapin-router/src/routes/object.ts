import { createRouter } from "../router.js";

export const objectRouter = createRouter().mutation("insert", {
  input: (value: any) => {
    //let typedef = Manifest.partial().and(value);
    //console.log(typedef);
    if (typeof value === "object") {
      return value;
    } else throw "Data is malformatted";
  },
  /*(value: any) => {
    
  }, //figure this outssssssssssss*/
  async resolve({ input: q, ctx }): Promise<any> {
    console.log("ONE");
    const response = await ctx.couch.access.updateWithSubset(q?.id, q.data);
    return response;
  },
});
