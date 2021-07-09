import { createTRPCClient } from "@trpc/client";
import type { RequestHandler } from "@sveltejs/kit";
import type { LapinRouter } from "@crkn-rcdr/lapin";

const client = createTRPCClient<LapinRouter>({
  url: "http://localhost:5858",
});

export const get: RequestHandler = async ({ params, query }) => {
  const procedure = params["procedure"] as string;
  const input = query.get("input");

  const response = await client.query(procedure, input);
};
