import type { LapinRouter } from "@crkn-rcdr/lapin-router";
import type { LoadInput } from "@sveltejs/kit";
import { createTRPCClient } from "@trpc/client";

export const getLapin = (fetch?: LoadInput["fetch"]) => {
  const options = { url: "http://localhost:4747/api" };

  if (fetch) {
    options["fetch"] = fetch;
  }

  return createTRPCClient<LapinRouter>(options);
};

export type LapinClient = ReturnType<typeof getLapin>;
