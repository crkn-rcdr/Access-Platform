import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";
import { getLapin } from "$lib/lapin";

export const post: RequestHandler<Locals> = async ({ params, locals }) => {
  const q = params["query"] as string;
  const lapin = getLapin();
  const response = await lapin.query("slug.search", q);
  console.log("slug.search", response);
  return {
    status: 200,
    body: { data: response } as JSONValue,
  };
};
