import { Client } from "./client.js";
import type { ObjectInterface } from "./types.js";
import { metadataHeaders } from "./util.js";

export function makeObjectInterface(
  client: Client,
  container: string,
  object: string
): ObjectInterface {
  return {
    get: client.streamRequest.bind(client, "get", container, object),
    getAsJSON: () => client.jsonRequest("get", container, object),
    put: (data, metadata = {}) =>
      client.request("put", container, object, {
        headers: metadataHeaders("object", metadata),
        body: data,
      }),
    copy: (destContainer, destObject) =>
      client.request("copy", container, object, {
        headers: { destination: `${destContainer}/${destObject}` },
      }),
    head: client.request.bind(client, "head", container, object),
    delete: client.request.bind(client, "delete", container, object),
    post: (metadata) =>
      client.request("post", container, object, {
        headers: metadataHeaders("object", metadata),
      }),
  };
}
