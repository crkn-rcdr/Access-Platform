import { ImportStatus, LegacyPackage } from "@crkn-rcdr/access-data";
import anyTest, { TestInterface } from "ava";

import { BaseContext, getTestContext } from "../test.js";
import { AccessHandler } from "./access.js";
import { LegacyPackageHandler } from "./dipstaging.js";

type LegacyPackageHandlerContext = BaseContext & {
  access: AccessHandler;
  dipstaging: LegacyPackageHandler;
};

const test = anyTest as TestInterface<LegacyPackageHandlerContext>;

const MANIFEST_ONE = "69429/m0696zw19t6s";
const MANIFEST_ONE_SLUG = "oocihm.8_06941_1";
const MANIFEST_TWO_SLUG = "oocihm.8_06941_2";

const jul19 = new Date(2021, 6, 19, 12, 0, 0).valueOf() / 1000;
const aug19 = new Date(2021, 7, 19, 12, 0, 0).valueOf() / 1000;

const lp1: LegacyPackage = {
  id: MANIFEST_ONE_SLUG,
  METS: [
    {
      path: "data/sip/data/metadata.xml",
      md5: "e2becefa917e2751e22c627a60562227",
    },
  ],
  METSDate: jul19,
  METSManifestDate: jul19,
  repos: ["foo", "bar"],
  reposDate: jul19,
  reposManifestDate: jul19,
  updated: jul19,
};

const lp2: LegacyPackage = {
  ...lp1,
  id: MANIFEST_TWO_SLUG,
  METSDate: aug19,
  METSManifestDate: aug19,
  reposDate: aug19,
  reposManifestDate: aug19,
  updated: aug19,
};

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    access: new AccessHandler(baseContext.client, "dipstaging"),
    dipstaging: new LegacyPackageHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("access", "dipstaging");
  await t.context.testDeploy("dipstaging", "handler");

  await t.context.dipstaging.insert(lp1);
  await t.context.dipstaging.insert(lp2);
});

test.serial("Can query by keys", async (t) => {
  const result = await t.context.dipstaging.listFromKeys(
    [MANIFEST_ONE_SLUG, MANIFEST_TWO_SLUG, "notathing"],
    t.context.access
  );

  const firstResult = result[0] as ImportStatus;
  t.is(firstResult.id, MANIFEST_ONE_SLUG);
  t.is((firstResult as any).noid, MANIFEST_ONE);
  t.is(result[2]?.status, "not-found");
});

test.serial("Can query by dates", async (t) => {
  const result = await t.context.dipstaging.listFromDates(
    "2021-07-01",
    "2021-07-31",
    t.context.access
  );
  t.is(result.length, 1);

  const firstResult = result[0] as ImportStatus;
  t.is(firstResult?.id, MANIFEST_ONE_SLUG);
  t.is((firstResult as any).noid, MANIFEST_ONE);
});

test.after.always(async (t) => {
  await t.context.testDestroy("access", "dipstaging");
  await t.context.testDestroy("dipstaging", "handler");
});
