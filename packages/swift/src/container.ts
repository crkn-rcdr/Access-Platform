import { Client } from "./client.js";
import { makeObjectInterface } from "./object.js";
import type { ContainerInterface } from "./types.js";
import { listQuery, metadataHeaders } from "./util.js";

export function makeContainerInterface(
  client: Client,
  container: string
): ContainerInterface {
  return {
    get: async (options = {}) =>
      client.jsonRequest("get", container, null, listQuery(options)),
    put: async (metadata = {}) =>
      client.request("put", container, null, {
        headers: metadataHeaders("container", metadata),
      }),
    post: async (metadata) =>
      client.request("post", container, null, {
        headers: metadataHeaders("container", metadata),
      }),
    head: client.request.bind(client, "head", container, null),
    delete: client.request.bind(client, "delete", container, null),
    object: makeObjectInterface.bind(null, client, container),
  };
}
