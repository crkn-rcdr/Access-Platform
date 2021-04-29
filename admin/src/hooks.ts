import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { GetContext, GetSession, Handle } from "@sveltejs/kit";

import { dev, host, devUser, auth } from "./env";

export type User = {
  name: string;
  email: string;
};

export type Context = {
  host: string;
  user?: User | null;
  auth?: {
    endpoint: string;
    error?: string;
  };
};

// no reason for these not to diverge eventually
export type Session = Context;

type JwtPayload = User;

const isValidPayload = (payload: string | object): payload is JwtPayload => {
  return typeof payload === "object" && payload["name"] && payload["email"];
};

export const getContext: GetContext<Context> = (request) => {
  const cookies = cookie.parse(request.headers.cookie || "");
  const token = cookies["auth_token"];

  if (dev) {
    return { host, user: devUser };
  } else {
    const context: Context = {
      host,
      auth: { endpoint: auth.endpoint },
      user: undefined,
    };

    if (token) {
      try {
        const payload = jwt.verify(token, auth.secret);
        if (isValidPayload(payload)) {
          context.user = { name: payload.name, email: payload.email };
        } else {
          context.user = null;
          throw new Error("Invalid payload");
        }
      } catch (e) {
        context.auth.error = e.message;
      }
    }

    return context;
  }
};

export const getSession: GetSession<Context, Session> = ({ context }) => {
  return context;
};

export const handle: Handle = async ({ request, render }) => {
  const response = await render({ ...request });
  // const { is_new, userid } = request.context;

  return response;
};
