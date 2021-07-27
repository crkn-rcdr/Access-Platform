import { MangoQuery, MangoSelector, RequestError } from "nano";

export class AuthorizationError extends Error {
  constructor() {
    super("Could not authorize this request with CouchDB.");
    this.name = "AuthorizationError";
  }
}
export class ConnectionError extends Error {
  constructor() {
    super("Could not connect to CouchDB.");
    this.name = "ConnectionError";
  }
}

export class DocumentNotFoundError extends Error {
  constructor(id: string) {
    super(`Document ${id} not found.`);
    this.name = "DocumentNotFoundError";
  }
}

export class NanoError extends Error {
  constructor(e: RequestError, context: Context) {
    super(
      `Nano error: ${JSON.stringify(e, null, 2)}

Context: ${JSON.stringify(context, null, 2)}`
    );
  }
}

export class UniqueKeyViolationError extends Error {
  constructor(
    selector: MangoSelector,
    fields: readonly string[],
    response: unknown
  ) {
    super(`Expected only one result but found multiple:
Selector: ${JSON.stringify(selector, null, 2)}
Fields: ${JSON.stringify(fields)}
Response: ${JSON.stringify(response, null, 2)}`);

    this.name = "UniqueKeyViolationError";
  }
}

type DocumentContext = {
  type: "document";
  db: string;
  id: string;
};
type UpdateContext = {
  type: "update";
  db: string;
  ddoc: string;
  name: string;
  id?: string;
};
type ViewContext = {
  type: "view";
  db: string;
  ddoc: string;
  name: string;
};
type MangoContext = {
  type: "mango";
  db: string;
  query: MangoQuery;
};

type Context = DocumentContext | UpdateContext | ViewContext | MangoContext;

export const fromNanoError = (e: RequestError, context: Context) => {
  if (e.message === "error happened in your connection")
    return new ConnectionError();
  if (e.statusCode === 401) return new AuthorizationError();
  if (context.type === "document") {
    if (e.statusCode === 404) return new DocumentNotFoundError(context.id);
  }
  return new NanoError(e, context);
};
