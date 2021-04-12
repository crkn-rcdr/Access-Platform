import { get as getNano, Auth } from "@crkn-rcdr/nano";
import { DatabaseHandler } from "kivik";
import { couch } from "@crkn-rcdr/access-data";

export type DatabaseHandlers = {
  [Name in typeof couch.DATABASES[number]]: DatabaseHandler<
    couch.DocumentTypes[Name]
  >;
};

export const getHandlers = (url: string, auth?: Auth): DatabaseHandlers => {
  const nano = getNano(url, auth);
  return Object.fromEntries(
    couch.DATABASES.map((db) => [db, nano.use(db)])
  ) as DatabaseHandlers;
};
