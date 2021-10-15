import { RouteLimiter } from "../util/limiter.js";
const limiter = new RouteLimiter();

export function initializeRouteLimiter() {
  return limiter;
}
