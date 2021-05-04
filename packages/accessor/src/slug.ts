import { Slug, Noid } from "@crkn-rcdr/access-data";
import { DatabaseHandlers } from "./databases";

export type ResolvedSlug = Noid | null;

export interface SlugInterface {
  /**
   * Resolves a slug to a noid. Throws if the lookup returns multiple noids.
   * @param slug A slug.
   * @returns The resolved noid, or `null` if the slug does not resolve.
   */
  resolve: (slug: Slug) => Promise<ResolvedSlug>;

  /**
   * Resolves multiple slugs in a single lookup. Throws if any slug returns
   * more than one object.
   * @param slugs A list of slugs.
   * @param prefix A string prepended to each slug prior to lookup.
   * @returns A map of slugs to either their resolved noid or `null`.
   */
  resolveMany: (
    slugs: Slug[],
    prefix?: string
  ) => Promise<Map<Slug, ResolvedSlug>>;

  /**
   * Searches for slugs starting with string `q`, limited to `limit` results.
   * (Default limit: 10)
   * @returns A map of found slugs to their corresponding noids.
   */
  search: (q: string, limit?: number) => Promise<Map<Slug, Noid>>;
}

export const slugInterface = (
  access: DatabaseHandlers["access"]
): SlugInterface => {
  return {
    resolve: async function resolve(slug) {
      const rows = (await access.view("access", "slug", { key: slug })).rows;
      if (rows.length > 1)
        throw new Error(`More than one object identified by slug '${slug}'`);
      if (rows[0]) return rows[0].id as Noid;
      return null;
    },

    resolveMany: async function resolveMany(slugs, prefix) {
      const actualSlugs = new Set(
        prefix ? slugs.map((slug) => `${prefix}${slug}`) : slugs
      );
      const rows = (
        await access.view("access", "slug", { keys: [...actualSlugs] })
      ).rows;

      // keep track of repeats
      const badSlugs: Set<string> = new Set();
      let prevSlug = "";
      const result: Map<Slug, ResolvedSlug> = new Map();

      for (const row of rows) {
        if (row.key === prevSlug) badSlugs.add(row.key);
        actualSlugs.delete(row.key);
        result.set(row.key, row.id);
        prevSlug = row.key;
      }

      if (badSlugs.size)
        throw new Error(`Multiple objects resolved by slugs: ${[...badSlugs]}`);

      for (const slug of actualSlugs) {
        result.set(slug, null);
      }

      return result;
    },

    search: async function search(q, limit = 10) {
      const rows = (
        await access.view("access", "slug", {
          startkey: q,
          endkey: `${q}\ufff0`,
          limit,
        })
      ).rows;
      return new Map(rows.map((row) => [row.key, row.id]));
    },
  };
};
