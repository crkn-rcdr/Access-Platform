import type { RequestHandler } from "@sveltejs/kit";
import type { Locals } from "$lib/types";

export const get: RequestHandler<Locals> = async ({
  params,
  locals: { accessor },
}) => {
  const slug = params["slug"] as string;

  const response = await accessor.slug.resolve(slug);

  return {
    status: 200,
    body: { noid: response },
  };
};
