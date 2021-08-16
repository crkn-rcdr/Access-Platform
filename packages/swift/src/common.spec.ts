import { Env } from "@crkn-rcdr/access-env";
import { makeAccountInterface } from "./account.js";

import { Client as SwiftClient } from "./client.js";
import { AccountInterface } from "./types.js";

export type BaseContext = {
  client: SwiftClient;
  account: AccountInterface;
};

export const getContext = (): BaseContext => {
  const env = Env.parse(process.env);
  const client = new SwiftClient(env.swift);
  return {
    client: new SwiftClient(env.swift),
    account: makeAccountInterface(client),
  };
};
