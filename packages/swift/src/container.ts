import { Client } from "./client.js";
import type { ContainerInterface } from "./types.js";
import { listQuery, metadataHeaders } from "./util.js";

export function makeContainerInterface(
  client: Client,
  container: string
): ContainerInterface {
  return {
    listObjects: async (options = {}) =>
      client.jsonRequest("get", container, null, listQuery(options)),
    postMetadata: async (metadata) =>
      client.request("post", container, null, {
        headers: metadataHeaders("container", metadata),
      }),
    getMetadata: client.request.bind(client, "head", container, null),
    getObject: client.streamRequest.bind(client, "get", container),
    getObjectAsJSON: <T>(object: string) =>
      client.jsonRequest<T>("get", container, object),
    putObject: (object, args) => {
      const { data, contentType, etag, metadata = {} } = args;
      const headers = metadataHeaders("object", metadata);
      headers.push(["content-type", contentType || "application/octet-stream"]);
      if (etag) headers.push(["etag", etag]);
      return client.request("put", container, object, {
        headers,
        body: data,
      });
    },
    copyObject: (object, destContainer, destObject) =>
      client.request("copy", container, object, {
        headers: { destination: `${destContainer}/${destObject}` },
      }),
    deleteObject: client.request.bind(client, "delete", container),
    getObjectMetadata: client.request.bind(client, "head", container),
    postObjectMetadata: (object, metadata) =>
      client.request("post", container, object, {
        headers: metadataHeaders("object", metadata),
      }),
  };
}
