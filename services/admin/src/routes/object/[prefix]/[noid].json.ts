import type { Locals } from "$lib/types";
import type { RequestHandler } from "@sveltejs/kit";
import type { JSONValue } from "@sveltejs/kit/types/endpoint";

export const get: RequestHandler<Locals> = async ({ params, locals }) => {
  const id = [params["prefix"] as string, params["noid"] as string].join("/");

  const response = await locals.accessor.retrieve(id);
  console.log("*****show the response****", response);
  if (response) {
    return {
      status: 200,
      body: { object: response.data } as JSONValue,
    };
  } else {
    return {
      status: 404,
      body: { error: `No object with id ${id}` } as JSONValue,
    };
  }
};
