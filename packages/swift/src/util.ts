import { URLSearchParams } from "url";
import type { ListOptions, Entity } from "./types.js";

export function listQuery(options: ListOptions) {
  const limit = options.limit ? options.limit.toString() : undefined;
  const q = { ...options, limit, format: "json" };
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
