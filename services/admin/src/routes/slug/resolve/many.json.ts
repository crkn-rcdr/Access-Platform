import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";

export const get: RequestHandler<Locals> = async ({ params, locals }) => {
  const slugs = [params["slugs"]] as string[];

  const prefix = params["prefix"] as string;

  const response = await locals.accessor.slug.resolveMany(slugs, prefix);
  return {
    status: 200,
    body: { noid: Object.fromEntries(response) } as JSONValue,
  };
};
