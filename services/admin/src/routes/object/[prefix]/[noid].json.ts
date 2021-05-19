import type { RequestHandler } from "@sveltejs/kit";
import accessor from "$lib/accessor";

export const get: RequestHandler = async ({ params }) => {
  const id = [params["prefix"] as string, params["noid"] as string].join("/");

  const response = await accessor.retrieve(id);

  if (response) {
    return {
      status: 200,
      body: { object: response.data },
    };
  } else {
    return { status: 404, body: { error: `No object with id ${id}` } };
  }
};
