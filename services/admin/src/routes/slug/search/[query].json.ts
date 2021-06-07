import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";

export const post: RequestHandler<Locals> = async ({ params, locals }) => {
  const q = params["query"] as string;
  const response = await locals.accessor.slug.search(q);
  return {
    status: 200,
    body: { noid: Object.fromEntries(response) } as JSONValue,
  };
};
