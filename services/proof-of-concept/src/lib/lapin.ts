import type { LapinRouter } from "@crkn-rcdr/lapin";
import type { LoadInput } from "@sveltejs/kit";
import { createTRPCClient } from "@trpc/client";

export const lapin = createTRPCClient<LapinRouter>({
  url: "http://localhost:3000/api",
});

export const serverLapin = (fetch: LoadInput["fetch"]) => {
  return createTRPCClient({ url: "http://localhost:3000/api", fetch });
};
