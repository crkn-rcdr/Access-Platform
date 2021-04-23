import { Middleware } from "polka";
import { LapinRequest } from "..";

import slug from "./slug";
import validate from "./validate";
export const routeSets = [slug, validate];

type Method = "HEAD" | "GET" | "POST" | "PUT" | "DELETE";

interface Route {
  method: Method;
  pattern: string;
  help: {
    description: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
    body?: string;
    returns: Record<number, string>;
  };
  handler: Middleware<LapinRequest>;
}

export interface RouteSet {
  prefix: string;
  routes: Route[];
}

export const help = Object.fromEntries(
  routeSets.flatMap((set) =>
    set.routes.map((route) => [
      `${route.method} ${set.prefix}${route.pattern}`,
      route.help,
    ])
  )
);
