import { URLSearchParams } from "url";
import fetch, {
  BodyInit,
  Headers,
  HeadersInit,
  Response as FetchResponse,
} from "node-fetch";
import pRetry from "p-retry";
import { getStreamResponse, getJSONResponse, getResponse } from "./response.js";
import {
  ClientInterface,
  ClientOptions,
  ContainerInterface,
  ContainerListing,
  Entity,
  JSONResponse,
  ListOptions,
  Response,
} from "./types.js";
import { listQuery, metadataHeaders } from "./util.js";
import { makeContainerInterface } from "./container.js";

type HTTPMethod = "head" | "get" | "post" | "put" | "delete" | "copy";

/**
 * Options accepted by a SwiftClient request.
 */
type RequestOptions = {
  /** Request query string. */
  query?: URLSearchParams;
  /** Headers to be added to the request. */
  headers?: HeadersInit;
  /** Body of the request. */
  body?: BodyInit;
};

export class Client implements ClientInterface {
  private readonly server: string;
  private readonly authHeaders: {
    "X-Auth-User": string;
    "X-Auth-Key": string;
  };
  private readonly accountName: string;

  private token?: string;

  constructor(options: ClientOptions) {
    this.server = options.server;
    this.authHeaders = {
      "X-Auth-User": options.user,
      "X-Auth-Key": options.password,
    };
    this.accountName = options.account ?? `AUTH_${options.user}`;
  }

  private url(...args: string[]) {
    return [this.server, ...args].join("/");
  }

  /**
   * Returns an authorization token usable by this client.
   */
  private async authorize(): Promise<string> {
    if (!this.token) {
      const auth = async () => {
        const response = await fetch(this.url("auth", "v1.0"), {
          method: "get",
          headers: this.authHeaders,
        });

        if (response.status >= 500) {
          throw new Error(
            `Swift server error: ${response.statusText} (${response.status})`
          );
        }

        if (response.status >= 400) {
          throw new pRetry.AbortError(
            `Authorization failure: ${response.statusText} (${response.status})`
          );
        }

        const token = response.headers.get("X-Auth-Token");

        if (!token) {
          throw new pRetry.AbortError(
            `Authorization response lacked X-Auth-Token header`
          );
        }

        return token;
      };

      this.token = await pRetry(auth, { forever: true });
    }

    return this.token;
  }

  async info(): Promise<Record<string, unknown>> {
    const token = await this.authorize();
    const response = await fetch(this.url("info"), {
      method: "get",
      headers: { "X-Auth-Token": token },
    });

    if (response.status === 401) return await this.info();

    return await response.json();
  }

  private async setupRequest(
    method: HTTPMethod,
    container: string | null,
    object: string | null,
    options: RequestOptions = {}
  ): Promise<{ entity: Entity; fetchResponse: FetchResponse }> {
    const path = ["v1", this.accountName, container, object].filter(
      (val): val is string => val !== null
    );
    let url = this.url(...path);
    const params = new URLSearchParams(options.query).toString();
    if (params.length) url = [url, params].join("?");
    const headers = new Headers(options.headers);
    headers.set("X-Auth-Token", await this.authorize());

    const response = await fetch(url, {
      method,
      headers,
      body: options.body,
    });

    if (response.ok) {
      const entity: Entity = container
        ? object
          ? "object"
          : "container"
        : "account";
      return { entity, fetchResponse: response };
    } else {
      if (response.status === 401) {
        this.token = undefined;
        return await this.setupRequest(method, container, object, options);
      } else {
        const hasContent = response.headers.has("Content-Length");
        const message = hasContent
          ? await response.text()
          : response.statusText;
        throw { code: response.status, request: `${method} ${url}`, message };
      }
    }
  }

  // TODO: come up with a way to clean these up
  // TODO: re-order args to put options second (or combine them and method)
  async request(
    method: HTTPMethod,
    container: string | null,
    object: string | null,
    options: RequestOptions = {}
  ) {
    const { entity, fetchResponse } = await this.setupRequest(
      method,
      container,
      object,
      options
    );
    return getResponse(entity, fetchResponse);
  }

  async jsonRequest<T>(
    method: HTTPMethod,
    container: string | null,
    object: string | null,
    options: RequestOptions = {}
  ) {
    const { entity, fetchResponse } = await this.setupRequest(
      method,
      container,
      object,
      options
    );
    return getJSONResponse<T>(entity, fetchResponse);
  }

  async streamRequest(
    method: "get",
    container: string,
    object: string,
    options: RequestOptions = {}
  ) {
    const { entity, fetchResponse } = await this.setupRequest(
      method,
      container,
      object,
      options
    );
    return getStreamResponse(entity, fetchResponse);
  }

  async listContainers(
    options: ListOptions = {}
  ): Promise<JSONResponse<ContainerListing[]>> {
    return this.jsonRequest("get", null, null, listQuery(options));
  }

  async getMetadata(): Promise<Response> {
    return this.request("head", null, null);
  }

  async postMetadata(metadata: Record<string, string>): Promise<Response> {
    return this.request("post", null, null, {
      headers: metadataHeaders("account", metadata),
    });
  }

  async createContainer(
    container: string,
    metadata: Record<string, string> = {}
  ): Promise<Response> {
    return this.request("put", container, null, {
      headers: metadataHeaders("container", metadata),
    });
  }

  async deleteContainer(container: string): Promise<Response> {
    return this.request("delete", container, null);
  }

  container(name: string): ContainerInterface {
    return makeContainerInterface(this, name);
  }
}
