import type { Env } from "@crkn-rcdr/access-env";

export type Session = {
  apiEndpoint: string;
};

export type Locals = {
  env: Env;
  session: Session;
};
