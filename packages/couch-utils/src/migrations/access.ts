import { AccessHandler } from "../handlers/access";

export const accessMigrations: Record<
  string,
  (handler: AccessHandler) => Promise<Error | null>
> = {
  memberships: async (handler: AccessHandler) => {
    const limit = 10;
    let skip = 0;

    try {
      while (true) {
        const collections = await handler.find(
          { type: "collection" },
          ["id", "behavior", "members"] as const,
          { limit, skip }
        );

        for (const collection of collections) {
          if (collection.members) {
            const addSeq = collection.behavior === "multi-part";
            for (const [index, member] of collection.members.entries()) {
              await handler.update({
                ddoc: "migrations",
                name: "00001-memberships",
                docId: member.id,
                body: {
                  of: collection.id,
                  seq: addSeq ? index + 1 : undefined,
                  label: member.label,
                },
              });
            }
          }
        }

        if (collections.length < limit) break;
        skip += limit;
      }
    } catch (e) {
      return e as Error;
    }

    return null;
  },
};
