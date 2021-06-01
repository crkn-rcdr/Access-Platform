import type { RequestHandler } from "@sveltejs/kit";
import accessor from "$lib/accessor";

export const post: RequestHandler = async ({}) => {
  const q: string = "";
  const limit: number = 10;
  const response = await accessor.slug.search(q, limit);
  console.log("response for search call", response);
  return {
    status: 200,
    body: { noid: response },
  };
};
