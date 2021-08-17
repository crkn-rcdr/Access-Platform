import { Env } from "@crkn-rcdr/access-env";

import { Client as SwiftClient } from "./client.js";

export type BaseContext = {
  client: SwiftClient;
};

export const getContext = (): BaseContext => {
  const env = Env.parse(process.env);
  return {
    client: new SwiftClient(env.swift),
  };
};

export const randomName = (): string => Math.random().toString().slice(2);
