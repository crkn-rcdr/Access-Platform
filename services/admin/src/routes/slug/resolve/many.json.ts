import type { RequestHandler } from "@sveltejs/kit";
import accessor from "$lib/accessor";

export const get: RequestHandler = async ({ params }) => {
  const slugs = [params["slugs"]] as string[];

  const prefix = params["prefix"] as string;

  const response = await accessor.slug.resolveMany(slugs, prefix);
  return {
    status: 200,
    body: { noid: response },
  };
};
