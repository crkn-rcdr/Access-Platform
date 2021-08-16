import { Response as FetchResponse } from "node-fetch";
import * as Swift from "./types.js";

export function getResponse(
  entity: Swift.Entity,
  response: FetchResponse
): Swift.Response {
  return {
    code: response.status,
    date: new Date(response.headers.get("Date") || ""),
    timestamp: new Date(
      parseInt(response.headers.get("X-Timestamp") || "", 10)
    ),
    transactionId: response.headers.get("X-Trans-Id") || "",
    etag: response.headers.get("ETag") || "",
    lastModified: new Date(response.headers.get("Last-Modified") || ""),
    header: (name: string) => response.headers.get(`x-${entity}-${name}`),
    metaHeader: (name: string) =>
      response.headers.get(`x-${entity}-meta-${name}`),
  };
}

export async function getJSONResponse<T>(
  entity: Swift.Entity,
  response: FetchResponse
): Promise<Swift.JSONResponse<T>> {
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
  entity: Swift.Entity,
  response: FetchResponse
): Swift.StreamResponse {
  const swiftResponse = getResponse(entity, response);
  return {
    ...swiftResponse,
    content: response.body,
  };
}
