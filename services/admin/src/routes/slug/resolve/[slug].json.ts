import type { RequestHandler } from "@sveltejs/kit";
import accessor from "$lib/accessor";

export const get: RequestHandler = async ({ params }) => {
  const slug = params["slug"] as string;

  const response = await accessor.slug.resolve(slug);

  return {
    status: 200,
    body: { noid: response },
  };
};
