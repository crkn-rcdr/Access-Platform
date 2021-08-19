import { LegacyPackage } from "@crkn-rcdr/access-data";
import anyTest, { TestInterface } from "ava";

import { BaseContext, getTestContext } from "../test.js";
import { LegacyPackageHandler } from "./dipstaging.js";

type LegacyPackageHandlerContext = BaseContext & {
  dipstaging: LegacyPackageHandler;
};

const test = anyTest as TestInterface<LegacyPackageHandlerContext>;

const jul19 = new Date(2021, 6, 19, 12, 0, 0).valueOf() / 1000;
const aug19 = new Date(2021, 7, 19, 12, 0, 0).valueOf() / 1000;

const lp1: LegacyPackage = {
  id: "lp1",
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
  id: "lp2",
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
    dipstaging: new LegacyPackageHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("dipstaging", "handler");

  await t.context.dipstaging.insert(lp1);
  await t.context.dipstaging.insert(lp2);
});

test.serial("Can query by keys", async (t) => {
  const result = await t.context.dipstaging.listFromKeys([
    "lp1",
    "lp2",
    "notathing",
  ]);

  t.is(result.rows[0]?.id as string, "lp1");
  t.truthy(result.rows[2]?.error as string);
});

test.serial("Can query by dates", async (t) => {
  const result = await t.context.dipstaging.listFromDates(
    "2021-07-01",
    "2021-07-31"
  );

  t.is(result.rows.length, 1);
  t.is(result.rows[0]?.id, "lp1");
});

test.after.always(async (t) => {
  await t.context.testDestroy("dipstaging", "handler");
});
