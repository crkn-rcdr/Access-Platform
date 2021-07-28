import type { Locals, Session } from "$lib/types";
import type { GetSession, Handle, ServerFetch } from "@sveltejs/kit";
import type { JwtPayload } from "jsonwebtoken";
import type { User } from "@crkn-rcdr/access-data";

import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Env } from "@crkn-rcdr/access-env";

const verifyToken = (token: string, secret: string): User => {
  const payload = jwt.verify(token, secret) as JwtPayload;
  return {
    name: payload["name"] as string,
    email: payload["email"] as string,
  };
};

const getFullpath = (path: string, query: URLSearchParams) => {
  const q = query.toString();
  return q.length > 0 ? `${path}?${q}` : path;
};

// TODO: this is pretty unwieldy, although I doubt it'll need to grow much
export const handle: Handle<Locals> = async ({ request, resolve }) => {
  const env = Env.parse(process.env);

  // we'll need this more than once
  const fullpath = getFullpath(request.path, request.query);

  // Auth
  const cookies = cookie.parse(request.headers["cookie"] || "");
  const token = cookies["auth_token"];

  let user: User;
  if (token) {
    try {
      user = verifyToken(token, env.auth.secret);
    } catch (e) {
      return {
        status: 403,
        headers: {},
        body: `Could not verify authorization token: ${e.message}`,
      };
    }
  } else {
    const returnUrl = `${env.admin.urlExternal}/${fullpath}`;
    const redirectUrl = `${env.auth.url}/azuread/login?redirectUrl=${returnUrl}`;
    return {
      status: 307,
      headers: { Location: redirectUrl },
    };
  }

  // Fetch api response from lapin and return it
  if (request.path.startsWith("/api/")) {
    const url = `${env.lapin.url}/${fullpath.slice(5)}`;

    const fetchOptions = { method: request.method };

    if (request.method !== "HEAD" && request.method !== "GET")
      fetchOptions["body"] = request.rawBody;

    const response = await fetch(url, fetchOptions);

    return {
      status: response.status,
      // @ts-ignore: TypeScript's DOM library doesn't have Headers.entries()
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  }

  // Set up `locals`
  request.locals = {
    session: {
      apiEndpoint: env.admin.urlExternal + "/api",
      authLogout: env.auth.url + "/logout",
      user,
    },
  };

  return await resolve(request);
};

export const getSession: GetSession<Locals, Session> = (request) => {
  return request.locals.session;
};

export const serverFetch: ServerFetch = (request) => {
  /* Docker won't have access to local hosts files, and so
     we replace external domains with `127.0.0.1`.
     This assumes the external domain starts with `access`. */
  const url = request.url.replace(
    /^https:\/\/access.*\.canadiana\.ca/,
    `http://127.0.0.1:${process.env["ADMIN_PORT"]}`
  );

  return fetch(new Request(url, request));
};
