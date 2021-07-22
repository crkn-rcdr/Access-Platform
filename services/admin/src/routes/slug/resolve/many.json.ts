import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";
import { getLapin } from "$lib/lapin";

export const get: RequestHandler<Locals> = async ({ params, locals }) => {
  const prefix = params["prefix"] as string;
  const slugs = ([params["slugs"]] as string[]).map(
    (slug) => `${prefix}${slug}`
  );

  const lapin = getLapin();
  const response = await lapin.query("slug.resolveMany", slugs);
  console.log("slug.resolveMany", response);

  return {
    status: 200,
    body: { data: response } as JSONValue,
  };
};
