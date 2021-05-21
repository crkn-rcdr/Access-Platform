import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { GetSession, Handle } from "@sveltejs/kit";

import { dev, host, devUser, auth, accessorArgs } from "./env";
import type { User, Session, Locals } from "./lib/types";
import { Accessor } from "@crkn-rcdr/accessor";

const verifyToken = (token: string, secret: string): User => {
  const payload = jwt.verify(token, secret) as Record<string, string>;
  if (
    typeof payload === "object" &&
    typeof payload["name"] === "string" &&
    typeof payload["email"] === "string"
  ) {
    return {
      name: payload["name"],
      email: payload["email"],
    };
  } else {
    throw new Error("Invalid payload");
  }
};

export const handle: Handle<Locals> = async ({ request, render }) => {
  const cookies = cookie.parse(request.headers["cookie"] || "");
  const token = cookies["auth_token"];

  request.locals.accessor = new Accessor(accessorArgs);

  if (dev) {
    request.locals.session = { host, user: devUser };
  } else {
    if (auth === null) throw new Error("Auth is null, somehow.");

    request.locals.session = {
      host,
      auth: { endpoint: auth.endpoint },
      user: undefined,
    };

    if (token) {
      try {
        request.locals.session.user = verifyToken(token, auth.secret);
      } catch (e) {
        request.locals.session.user = null;
        request.locals.session.auth = {
          endpoint: auth.endpoint,
          error: e.message,
        };
      }
    }
  }

  return await render(request);
};

export const getSession: GetSession<Locals, Session> = (request) => {
  return request.locals.session;
};
