import type { LapinRouter } from "@crkn-rcdr/lapin-router";
import type { LoadInput } from "@sveltejs/kit";
import { createTRPCClient } from "@trpc/client";

type LapinOptions = {
  apiEndpoint: string;
  fetch: LoadInput["fetch"];
};

export const getLapin = ({ apiEndpoint, fetch }: LapinOptions) => {
  const options = { url: apiEndpoint, fetch };

  return createTRPCClient<LapinRouter>(options);
};

export type LapinClient = ReturnType<typeof getLapin>;
