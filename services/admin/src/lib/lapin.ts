import type { LapinRouter } from "@crkn-rcdr/lapin-router";
import type { LoadInput } from "@sveltejs/kit";
import { createTRPCClient } from "@trpc/client";

type LapinOptions = {
  url: string;
  fetch: LoadInput["fetch"];
};

export const getLapin = (options: LapinOptions) => {
  return createTRPCClient<LapinRouter>(options);
};
