import type { RequestHandler } from "@sveltejs/kit";

const handler: RequestHandler = async (request) => {
  const url = `http://lapin:5858/${
    request.params["name"]
  }?${request.query.toString()}`;

  const response = await fetch(url, {
    method: request.method,
    body: request.rawBody,
  });

  if (response.status < 500) {
    return { status: response.status, body: await response.json() };
  } else {
    return { status: response.status };
  }
};

export const get = handler;
export const post = handler;
