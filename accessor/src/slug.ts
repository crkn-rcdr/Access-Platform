import { Slug as SlugString } from "@crkn-rcdr/access-data/dist/format/slug";
import { Noid } from "@crkn-rcdr/access-data/dist/format/noid";
import { DatabaseHandlers } from "./databases";

export interface Slug {
  resolve: (slug: SlugString) => Promise<Noid | null>;
}

export const slugInterface = (access: DatabaseHandlers["access"]): Slug => {
  return {
    resolve: async (slug) => {
      const rows = (await access.view("access", "slug", { key: slug })).rows;
      if (rows.length > 1)
        throw new Error(`More than one object identified by slug '${slug}'`);
      if (rows[0]) return rows[0].id as Noid;
      return null;
    },
  };
};
