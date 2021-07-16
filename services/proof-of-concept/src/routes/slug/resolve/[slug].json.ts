import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";
import { getLapin } from "$lib/lapin";
export const get: RequestHandler<Locals> = async ({
  params,
  locals: { accessor },
}) => {
  const slug = params["slug"] as string;
  console.log("slug", slug);
  const lapin = getLapin();
  const response = await lapin.query("slug.resolve", slug);
  console.log("slug.resolve", response);

  return {
    status: 200,
    body: { data: response } as JSONValue,
  };
};
