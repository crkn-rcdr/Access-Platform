import { RouteLimiter } from "../util/limiter.js";
const routeLimiter = new RouteLimiter();

export function initializeRouteLimiter() {
  return routeLimiter;
}
