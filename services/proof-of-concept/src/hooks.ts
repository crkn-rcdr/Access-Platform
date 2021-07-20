import type { Locals, Session } from "$lib/types";
import type { GetSession, Handle, ServerFetch } from "@sveltejs/kit";

import { Env } from "@crkn-rcdr/access-env";

export const handle: Handle<Locals> = async ({ request, resolve }) => {
  const env = Env.parse(process.env);

  if (request.path.startsWith("/api/")) {
    const url = `${env.lapin.urlInternal}/${request.path.slice(
      5
    )}?${request.query.toString()}`;

    const response = await fetch(url, {
      method: request.method,
      body: request.rawBody,
    });

    return {
      status: response.status,
      // @ts-ignore
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  }

  request.locals = {
    env,
    session: {
      apiEndpoint: env.admin.urlExternal + "/api",
    },
  };

  return await resolve(request);
};

export const getSession: GetSession<Locals, Session> = (request) => {
  return request.locals.session;
};

export const serverFetch: ServerFetch = (request) => {
  /* Docker won't have access to local hosts files, and so
     we replace external domains with `localhost`.
     This assumes the external domain starts with `access`. */
  const url = request.url.replace(
    /^https:\/\/access.*\.canadiana\.ca/,
    `http://localhost:${process.env["ADMIN_PORT"]}`
  );

  return fetch(new Request(url, request));
};
