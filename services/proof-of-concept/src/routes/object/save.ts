import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";
import { getLapin } from "$lib/lapin";
export const post: RequestHandler<Locals> = async ({
  body,
  locals: { accessor },
}) => {
  const bodyObj = JSON.parse(body.toString());
  console.log(typeof body, body);
  const lapin = getLapin();
  const response = await lapin.mutation("object.insert", bodyObj);
  console.log("object.insert", response);

  return {
    status: 200,
    body: { data: response } as JSONValue,
  };
};
