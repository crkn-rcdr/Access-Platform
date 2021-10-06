import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { AccessHandler } from "../handlers/access.js";
import { accessMigrations } from "./access.js";
import { stringRangeEnd } from "../util.js";

type AccessHandlerContext = BaseContext & { access: AccessHandler };

const test = anyTest as TestInterface<AccessHandlerContext>;

// // MANIFEST_ONE and MANIFEST_TWO are members of COLLECTION
// const MANIFEST_ONE = "69429/m0696zw19t6s";
const MANIFEST_TWO = "69429/m02n4zg6h671";
const MANIFEST_TWO_SLUG = "oocihm.8_06941_2";
// const NEW_MANIFEST_NOID = "69429/g04x54f1mk14";
const COLLECTION = "69429/s0vq2s46j98h";
// const COLLECTION_SLUG = "oocihm.8_06941";
// const NEW_COLLECTION_NOID = "69429/g0154dn3zs9c";

// const USER = { name: "User McGee", email: "mcgee@crkn.ca" };

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    access: new AccessHandler(baseContext.client, "migrations"),
  };
  await t.context.testDeploy("access", "migrations");
});

test.serial("Migration: memberships", async (t) => {
  const m = accessMigrations["memberships"] as (
    handler: AccessHandler
  ) => Promise<Error | null>;
  await m(t.context.access);

  const manifest = await t.context.access.get(MANIFEST_TWO);
  t.is(manifest.memberships?.[0]?.of, COLLECTION);
  t.is(manifest.memberships?.[0]?.seq, 2);

  const viewResults = (
    await t.context.access.view("access", "members2", {
      startkey: [COLLECTION],
      endkey: [stringRangeEnd(COLLECTION)],
    })
  ).rows;

  t.is(viewResults.length, 2);
  t.deepEqual(viewResults?.[1]?.key as unknown, [
    COLLECTION,
    2,
    MANIFEST_TWO_SLUG,
  ]);
});

test.after.always(async (t) => {
  await t.context.testDestroy("access", "migrations");
});
