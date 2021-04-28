import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { GetContext, GetSession, Handle } from "@sveltejs/kit";

export type User = {
  name: string;
  email: string;
};

export type Context = {
  host: string;
  user: User | null | undefined;
  jwtError?: string;
  authUrl: string;
};

export const getContext: GetContext<Context> = (request) => {
  const cookies = cookie.parse(request.headers.cookie || "");
  const token = cookies["auth_token"];

  const host = process.env["HOST"];
  const authUrl = process.env["AUTH"];

  const context: Context = { host, authUrl, user: undefined };

  if (token) {
    try {
      const payload = jwt.verify(token, process.env["JWT_SECRET"]);
      context.user = { name: payload["name"], email: payload["email"] };
    } catch (e) {
      context.jwtError = e.message;
    }
  }

  return context;
};

export const getSession: GetSession<Context, Context> = ({ context }) => {
  return context;
};

export const handle: Handle = async ({ request, render }) => {
  const response = await render({ ...request });
  // const { is_new, userid } = request.context;

  return response;
};
