import { z } from "zod";
import {
  Collection,
  EditableCollection,
  NewCollection,
  Noid,
  ObjectListHandler,
  User,
  Slug,
  ObjectListPage,
  TextRecord,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";
import { TRPCError } from "@trpc/server";
import { LapinContext } from "../context.js";

const PageInput = z.object({
  id: Noid,
  page: z.number().int().positive(),
  limit: z.number().int().positive().default(100),
});

const PageAfterInput = z.object({
  id: Noid,
  after: Noid.nullable(),
  limit: z.number().int().positive().default(100),
});

const PageBeforeInput = z.object({
  id: Noid,
  before: Noid.nullable(),
  limit: z.number().int().positive().default(100),
});

const expandList = async (ctx: LapinContext, page: ObjectListPage) => {
  const expandedList = [];
  for (const obj of page.list) {
    if ("id" in obj && typeof obj.id !== "undefined") {
      const stuff = await ctx.couch.access.findUnique("id", obj.id, [
        "slug",
        "label",
        "type",
        "behavior",
        "public",
      ] as const);
      if (stuff.found) {
        expandedList.push({
          labelFromMember: stuff.result.label,
          ...stuff.result,
          ...obj,
        });
      }
    }
  }
  return { first: page.first, last: page.last, list: expandedList };
};

const EditInput = z.object({
  id: Noid,
  user: User,
  data: EditableCollection,
});

const NewInput = z.object({
  user: User,
  data: NewCollection,
});

const checkAdditions = z.object({
  id: Noid,
  slugArray: z.array(Slug),
});

const id = z.array(Noid);
export const collectionRouter = createRouter()
  .query("page", {
    input: PageInput.parse,
    async resolve({ input: { id, page, limit }, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          const pageData = members.page(page, limit);
          return await expandList(ctx, pageData);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Object ${id} cannot be parsed.`,
        });
      }
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .query("pageAfter", {
    input: PageAfterInput.parse,
    async resolve({ input: { id, after, limit }, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          const page = members.pageAfter(after, limit);
          return await expandList(ctx, page);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Object ${id} cannot be parsed.`,
        });
      }
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .query("pageBefore", {
    input: PageBeforeInput.parse,
    async resolve({ input: { id, before, limit }, ctx }) {
      const response = await ctx.couch.access.getSafe(id);
      if (response.found) {
        const collectionCheck = Collection.safeParse(response.doc);
        if (collectionCheck.success) {
          const members = new ObjectListHandler(collectionCheck.data.members);
          const page = members.pageBefore(before, limit);
          return await expandList(ctx, page);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Object ${id} cannot be parsed.`,
        });
      }
      throw new TRPCError({
        code: "PATH_NOT_FOUND",
        message: `No object with id ${id} found.`,
      });
    },
  })
  .mutation("edit", {
    input: EditInput.parse,
    async resolve({ input, ctx }) {
      try {
        const res = await ctx.couch.access.editCollection(input);

        /**
         * members of a multi-part collection that was edited (including label)
         * members of an unordered collection that was edited (label doesn't matter, but public/private and slug does)
         */

        if (
          input.data.slug ||
          (res.behavior === "multi-part" && input.data.label)
        ) {
          const ids: any[] = res.members
            .filter((member) => typeof member.id !== "undefined")
            .map((member) => member.id);

          // Don't hold up the response. This will run in the background without causing issues for end users. They don't need to be alerted about any of this in real time. The updateInternalmeta is displayed in the editor.
          ctx.couch.access.bulkForceUpdate(ids).then((res: any) => {
            console.log("Forced Update Members: ", res);
          });
        }

        return res;
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("new", {
    input: NewInput.parse,
    async resolve({ input, ctx }) {
      try {
        const id: Noid = await ctx.noid.mintOne();
        await ctx.couch.access.createCollection({
          id,
          ...input,
        });
        return id;
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("checkAdditions", {
    input: checkAdditions.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.checkAdditions(input.id, input.slugArray);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("appendMembers", {
    input: z.object({
      id: Noid,
      members: z.array(Slug),
      user: User, //.optional(),
    }),
    async resolve({ input: { id, members, user }, ctx }) {
      try {
        const collection = await ctx.couch.access.get(id);

        const memberResolutions = await ctx.couch.access.resolveSlugs(members);
        const memberIds: Noid[] = [];
        members.forEach((slug) => {
          const r = memberResolutions[slug];
          let id: string | undefined = undefined;
          if (r && r.resolved) {
            id = r.id;
            memberIds.push(id);
          }
        });

        // Do not add duplicates
        let filteredMembers: string[] = [];
        if ("members" in collection) {
          let currentMembers: string[] = [];
          for (const member of collection.members) {
            if (member.id) currentMembers.push(member.id);
          }
          filteredMembers = memberIds.filter(
            (member) => !currentMembers.includes(member)
          );
        }

        // If valid list
        if (filteredMembers.length) {
          await ctx.couch.access.processList({
            id,
            command: ["add", filteredMembers],
            user,
          });
        }

        // Don't hold up the response but force update to these new members
        if (
          "behavior" in collection &&
          (collection.behavior === "multi-part" ||
            collection.behavior === "unordered")
        ) {
          ctx.couch.access.bulkForceUpdate(filteredMembers).then((res: any) => {
            console.log("Forced Update Members: ", res);
          });
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("prependMembers", {
    input: z.object({
      id: Noid,
      members: z.array(Slug),
      user: User, //.optional(),
    }),
    async resolve({ input: { id, members, user }, ctx }) {
      try {
        const collection = await ctx.couch.access.get(id);

        const memberResolutions = await ctx.couch.access.resolveSlugs(members);
        const memberIds: Noid[] = [];
        members.forEach((slug) => {
          const r = memberResolutions[slug];
          let id: string | undefined = undefined;
          if (r && r.resolved) {
            id = r.id;
            memberIds.push(id);
          }
        });

        // Do not add duplicates
        let filteredMembers: string[] = [];
        if ("members" in collection) {
          let currentMembers: string[] = [];
          for (const member of collection.members) {
            if (member.id) currentMembers.push(member.id);
          }
          filteredMembers = memberIds.filter(
            (member) => !currentMembers.includes(member)
          );
        }
        if (filteredMembers.length) {
          await ctx.couch.access.processList({
            id,
            command: ["prepend", filteredMembers],
            user,
          });

          // Update every member of the collection
          if ("behavior" in collection) {
            if (collection.behavior === "multi-part") {
              await ctx.couch.access.bulkForceUpdateAllMembers(id);
            } else if (collection.behavior === "unordered") {
              ctx.couch.access
                .bulkForceUpdate(filteredMembers)
                .then((res: any) => {
                  console.log("Forced Update Members: ", res);
                });
            }
          }
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("addBySlug", {
    input: z.object({
      id: Noid,
      members: z.array(Slug),
      refMember: z.string(), // .positive() doesn't accept 0
      user: User.optional(),
      operation: z.enum(["addBefore", "addAfter"]),
    }),
    async resolve({ input: { id, members, refMember, user, operation }, ctx }) {
      try {
        // Get the noid for the member to use as a reference to put the members list around
        const refMemberResolution = await ctx.couch.access.findUnique(
          "slug",
          refMember,
          ["id"] as const
        );

        if (refMemberResolution.found) {
          // Try to get the noid of the members to move around
          const memberResolutions = await ctx.couch.access.resolveSlugs(
            members
          );
          const memberIds: Noid[] = [];
          members.forEach((slug) => {
            const r = memberResolutions[slug];
            let id: string | undefined = undefined;
            if (r && r.resolved) {
              id = r.id;
              memberIds.push(id);
            }
          });
          const refMemberId = refMemberResolution.result.id;

          // Do the move
          await ctx.couch.access.processList({
            id,
            command: [operation, [memberIds, refMemberId]],
            user,
          });

          // Update every member of the collection. For now.
          const collection = await ctx.couch.access.get(id);

          if ("behavior" in collection) {
            if (collection.behavior === "multi-part") {
              await ctx.couch.access.bulkForceUpdateAllMembers(id);
            } else if (collection.behavior === "unordered") {
              ctx.couch.access.bulkForceUpdate(memberIds).then((res: any) => {
                console.log("Forced Update Members: ", res);
              });
            }
          }
        }
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("overwriteMembers", {
    input: z.object({
      id: Noid,
      members: z.array(Slug),
      user: User, //.optional(),
    }),
    async resolve({ input: { id, members, user }, ctx }) {
      try {
        const memberResolutions = await ctx.couch.access.resolveSlugs(members);
        const memberIds: Noid[] = [];
        members.forEach((slug) => {
          const r = memberResolutions[slug];
          let id: string | undefined = undefined;
          if (r && r.resolved) {
            id = r.id;
            memberIds.push(id);
          }
        });

        const collection = await ctx.couch.access.get(id);

        const collectionMemberIds = [];
        if ("members" in collection && collection.behavior === "multi-part") {
          for (const member of collection.members) {
            if (member.id) collectionMemberIds.push(member.id);
          }
        }

        await ctx.couch.access.processList({
          id,
          command: ["overwrite", memberIds],
          user,
        });

        if ("behavior" in collection) {
          // Don't hold up the response but force update to all old and new members

          if (collection.behavior === "multi-part") {
            const allObjectsToUpdate = [
              ...new Set([...memberIds, ...collectionMemberIds]),
            ];
            ctx.couch.access
              .bulkForceUpdate(allObjectsToUpdate)
              .then((res: any) => {
                console.log("Forced Update Members: ", res);
              });
          } else if (collection.behavior === "unordered") {
            ctx.couch.access.bulkForceUpdate(memberIds).then((res: any) => {
              console.log("Forced Update Members: ", res);
            });
          }
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("removeMembers", {
    input: z.object({
      id: Noid,
      members: z.array(Noid),
      user: User.optional(),
    }),
    async resolve({ input: { id, members, user }, ctx }) {
      try {
        await ctx.couch.access.processList({
          id,
          command: ["remove", members],
          user,
        });

        // Don't hold up the response but force update to these new members
        //const collection = await ctx.couch.access.get(id);
        //if ("behavior" in collection && collection.behavior === "multi-part") {
        ctx.couch.access.bulkForceUpdate(members).then((res: any) => {
          console.log("Forced Update Members: ", res);
        });
        //}
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("removeMembersBySlug", {
    input: z.object({
      id: Noid,
      members: z.array(Slug),
      user: User.optional(),
    }),
    async resolve({ input: { id, members, user }, ctx }) {
      try {
        const memberResolutions = await ctx.couch.access.resolveSlugs(members);
        const memberIds: Noid[] = [];
        members.forEach((slug) => {
          const r = memberResolutions[slug];
          let id: string | undefined = undefined;
          if (r && r.resolved) {
            id = r.id;
            memberIds.push(id);
          }
        });
        await ctx.couch.access.processList({
          id,
          command: ["remove", memberIds],
          user,
        });
        // Don't hold up the response but force update to these new members
        ctx.couch.access.bulkForceUpdate(memberIds).then((res: any) => {
          console.log("Forced Update Members: ", res);
        });
      } catch (e: any) {
        console.log(e?.message);
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("moveMembers", {
    input: z.object({
      id: Noid,
      members: z.array(Noid),
      toIndex: z.number().int(), // .positive() doesn't accept 0
      user: User.optional(),
    }),
    async resolve({ input: { id, members, toIndex, user }, ctx }) {
      try {
        await ctx.couch.access.processList({
          id,
          command: ["move", [members, toIndex]],
          user,
        });
        const collection = await ctx.couch.access.get(id);
        if ("behavior" in collection && collection.behavior === "multi-part") {
          await ctx.couch.access.bulkForceUpdateAllMembers(id);
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("moveBySlug", {
    input: z.object({
      id: Noid,
      members: z.array(Slug),
      refMember: z.string(), // .positive() doesn't accept 0
      user: User.optional(),
      operation: z.enum(["moveBefore", "moveAfter"]),
    }),
    async resolve({ input: { id, members, refMember, user, operation }, ctx }) {
      try {
        // Get the noid for the member to use as a reference to put the members list around
        const refMemberResolution = await ctx.couch.access.findUnique(
          "slug",
          refMember,
          ["id"] as const
        );

        if (refMemberResolution.found) {
          // Try to get the noid of the members to move around
          const memberResolutions = await ctx.couch.access.resolveSlugs(
            members
          );
          const memberIds: Noid[] = [];
          members.forEach((slug) => {
            const r = memberResolutions[slug];
            let id: string | undefined = undefined;
            if (r && r.resolved) {
              id = r.id;
              memberIds.push(id);
            }
          });
          const refMemberId = refMemberResolution.result.id;

          // Do the move
          await ctx.couch.access.processList({
            id,
            command: [operation, [memberIds, refMemberId]],
            user,
          });

          // Update every member of the collection.
          const collection = await ctx.couch.access.get(id);
          if (
            "behavior" in collection &&
            collection.behavior === "multi-part"
          ) {
            await ctx.couch.access.bulkForceUpdateAllMembers(id);
          }
        }
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("relabelMember", {
    input: z.object({
      id: Noid,
      member: Noid,
      label: TextRecord,
      user: User.optional(),
    }),
    async resolve({ input: { id, member, label, user }, ctx }) {
      try {
        await ctx.couch.access.processList({
          id,
          command: ["relabel", [member, label]],
          user,
        });
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("unpublishAllMembers", {
    input: z.object({
      id: Noid,
      user: User,
    }),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.unpublishAllMembers(input.id, input.user);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .mutation("publishAllMembers", {
    input: z.object({
      id: Noid,
      user: User,
    }),
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.publishAllMembers(input.id, input.user);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("getMemberSlugs", {
    input: Noid,
    async resolve({ input, ctx }) {
      try {
        const collection = await ctx.couch.access.get(input);

        const slugs: Slug[] = [];
        if ("members" in collection) {
          for (const member of collection.members) {
            if ("id" in member && typeof member.id !== "undefined") {
              const memberObj = await ctx.couch.access.get(member.id);
              if (memberObj?.slug) slugs.push(memberObj.slug);
            }
          }
        }

        return slugs;
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  })
  .query("viewMembersContext", {
    input: id.parse,
    async resolve({ input, ctx }) {
      try {
        return await ctx.couch.access.findUniqueArray("id", input, [
          "slug",
          "label",
        ] as const);
      } catch (e) {
        throw httpErrorToTRPC(e);
      }
    },
  });
