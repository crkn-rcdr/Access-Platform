import type { Locals, Session } from "$lib/types";
import type { GetSession, Handle, ServerFetch } from "@sveltejs/kit";

import { Env } from "@crkn-rcdr/access-env";

const env = Env.parse(process.env);

export const handle: Handle<Locals> = async ({ request, resolve }) => {
  request.locals = {
    session: {
      apiEndpoint: env.admin.urlExternal + "/api",
    },
    lapinInternalUrl: env.lapin.urlInternal,
  };

  return await resolve(request);
};

export const getSession: GetSession<Locals, Session> = (request) => {
  return request.locals.session;
};

export const serverFetch: ServerFetch = (request) => {
  if (request.url.startsWith(env.admin.urlExternal)) {
    request = new Request(
      request.url.replace(env.admin.urlExternal, env.admin.urlInternal),
      request
    );
  }

  return fetch(request);
};
