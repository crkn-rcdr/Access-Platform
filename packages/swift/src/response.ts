import { Response as FetchResponse } from "node-fetch";
import { Entity, JSONResponse, Response, StreamResponse } from "./types.js";

export function getResponse(entity: Entity, response: FetchResponse): Response {
  return {
    code: response.status,
    date: new Date(response.headers.get("Date") || ""),
    timestamp: new Date(
      parseInt(response.headers.get("X-Timestamp") || "", 10)
    ),
    transactionId: response.headers.get("X-Trans-Id") || "",
    etag: response.headers.get("ETag") || "",
    lastModified: new Date(response.headers.get("Last-Modified") || ""),
    contentType: response.headers.get("content-type") || "",
    header: (name: string) => response.headers.get(`x-${entity}-${name}`),
    metaHeader: (name: string) =>
      response.headers.get(`x-${entity}-meta-${name}`),
  };
}

export async function getJSONResponse<T>(
  entity: Entity,
  response: FetchResponse
): Promise<JSONResponse<T>> {
  const swiftResponse = getResponse(entity, response);
  const text = await response.text();
  try {
    const content = JSON.parse(text) as T;
    return {
      ...swiftResponse,
      content,
    };
  } catch (e) {
    throw new Error(`Could not parse this as JSON: ${text}`);
  }
}

export function getStreamResponse(
  entity: Entity,
  response: FetchResponse
): StreamResponse {
  const swiftResponse = getResponse(entity, response);
  return {
    ...swiftResponse,
    content: response.body,
  };
}
