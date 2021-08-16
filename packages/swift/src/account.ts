import { Client } from "./client.js";
import { makeContainerInterface } from "./container.js";
import { makeObjectInterface } from "./object.js";
import type * as Swift from "./types.js";
import { listQuery, metadataHeaders } from "./util.js";

export function makeAccountInterface(client: Client): Swift.AccountInterface {
  return {
    get: async (options = {}) =>
      client.jsonRequest("get", null, null, listQuery(options)),
    post: (metadata: Record<string, string>) =>
      client.request("post", null, null, {
        headers: metadataHeaders("account", metadata),
      }),
    head: client.request.bind(client, "head", null, null, {}),
    container: makeContainerInterface.bind(null, client),
    object: makeObjectInterface.bind(null, client),
  };
}
