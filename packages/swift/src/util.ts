import { URLSearchParams } from "url";
import type { ListOptions, Entity } from "./types.js";

export function listQuery(options: ListOptions) {
  let q : any = { ...options, format: "json" };
  if(options.limit) {
    const limit = options.limit.toString();
    q["limit"] = limit;
  }
  return { query: new URLSearchParams(q) };
}

export function metadataHeaders(
  entity: Entity,
  metadata: Record<string, string>
) {
  return Object.entries(metadata).map(([key, value]) => [
    `x-${entity}-meta-${key}`,
    value,
  ]);
}

