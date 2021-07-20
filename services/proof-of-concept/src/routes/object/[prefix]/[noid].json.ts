import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";
import { getLapin } from "$lib/lapin";
export const get: RequestHandler<Locals> = async ({
  params,
  locals: { accessor },
}) => {
  const prefix = params["prefix"] as string;
  const noid = params["noid"] as string;
  const id = `${prefix}/${noid}`;
  console.log("id", id);
  const lapin = getLapin();
  const response = await lapin.query("noid.resolve", id);
  console.log("noid.resolve", response);

  return {
    status: 200,
    body: { data: response } as JSONValue,
  };
};
