import { get as getNano, Auth } from "@crkn-rcdr/nano";
import { DatabaseHandler } from "kivik";

import { DATABASES, DocumentTypes } from "@crkn-rcdr/access-data";

export type DatabaseName = typeof DATABASES[number];

export type DatabaseHandlers = {
  [Name in DatabaseName]: DatabaseHandler<DocumentTypes[Name]>;
};

export const getHandlers = (url: string, auth?: Auth): DatabaseHandlers => {
  const nano = getNano(url, auth);
  return Object.fromEntries(
    DATABASES.map((db) => [db, nano.use(db)])
  ) as DatabaseHandlers;
};
