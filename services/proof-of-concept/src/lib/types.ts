import type { User } from "@crkn-rcdr/access-data";

export type Session = {
  apiEndpoint: string;
  authLogout: string;
  user: User;
};

export type Locals = {
  session: Session;
};
