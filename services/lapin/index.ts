import { ServerResponse, STATUS_CODES } from "http";
import polka, { ErrorHandler, Middleware, Request } from "polka";
import polkaSend, { OutgoingHeaders } from "@polka/send";
import { json } from "@polka/parse";
import morgan from "morgan";

import { couch } from "./env";
import { routeSets, help } from "./routes";

import { Accessor } from "@crkn-rcdr/accessor";

export interface LapinRequest extends Request {
  accessor: Accessor;
  getQueryParam: (key: string) => string | undefined;
}

const accessor = new Accessor({ couch });

export const send = (
  res: ServerResponse,
  status?: number,
  data?: any,
  headers?: OutgoingHeaders
) => {
  if (!headers) headers = {};
  if (!headers["Content-Type"]) {
    data = JSON.stringify(data);
    headers["Content-Type"] = "application/json";
  }
  return polkaSend(res, status, data, headers);
};

const onError: ErrorHandler = (err, _req, res) => {
  if (typeof err === "string" || Buffer.isBuffer(err)) {
    send(res, 500, { message: err.toString() });
  } else {
    const code = err.code || err.status || 500;
    send(res, code, { message: err.message || STATUS_CODES[code] });
  }
};

export const server = polka<LapinRequest>({ onError })
  .use(json())
  .use(morgan("common"))
  .use((req, _res, next) => {
    req.accessor = accessor;
    req.getQueryParam = (key) => {
      if (req.query && typeof req.query === "object") {
        const val = req.query[key];
        return Array.isArray(val) ? val.join(";") : val;
      } else {
        return undefined;
      }
    };
    return next();
  })
  .get("/", (_req, res) => send(res, 200, help));

const wrapWithTry = (
  handler: Middleware<LapinRequest>
): Middleware<LapinRequest> => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

for (const set of routeSets) {
  for (const route of set.routes) {
    server.add(
      route.method,
      set.prefix + route.pattern,
      wrapWithTry(route.handler)
    );
  }
}
