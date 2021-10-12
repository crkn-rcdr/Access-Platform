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

//View tests
const FAIL_SLUG = "failTest";
const SUCCESS_SLUG = "successTest";
const NEW_SLUG = "newDipTest";
const QUEUE_SLUG = "queueTest";
const NEVER_SMELTED_SLUG = "neversmeltedTest";

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

const lpFail: LegacyPackage = {
  id: FAIL_SLUG,
  repos: ["toma", "swift", "romano", "eclipse"],
  reposManifestDate: "2016-03-08T21:45:41Z",
  reposDate: "2020-06-02T15:20:19Z",
  updated: "2020-06-02T15:20:19Z",
  METS: [
    {
      path: "data/sip/data/metadata.xml",
      md5: "e2becefa917e2751e22c627a60562227",
    },
  ],
  METSManifestDate: "2016-03-08T21:45:41Z",
  METSDate: "2019-08-29T19:45:37Z",
  smelt: {
    succeeded: false,
    message: "test",
    requestDate: "2020-04-20T20:28:52Z",
    processDate: "2020-04-22T21:01:24Z",
  },
};

const lpSucceed: LegacyPackage = {
  id: SUCCESS_SLUG,
  repos: ["toma", "swift", "romano", "eclipse"],
  reposManifestDate: "2016-03-08T21:45:41Z",
  reposDate: "2020-06-02T15:20:19Z",
  updated: "2020-06-02T15:20:19Z",
  METS: [
    {
      path: "data/sip/data/metadata.xml",
      md5: "e2becefa917e2751e22c627a60562227",
    },
  ],
  METSManifestDate: "2016-03-08T21:45:41Z",
  METSDate: "2019-08-29T19:45:37Z",
  smelt: {
    succeeded: true,
    message: "test",
    requestDate: "2020-04-20T20:28:52Z",
    processDate: "2020-04-22T21:01:24Z",
  },
};

const lpNew: LegacyPackage = {
  id: NEW_SLUG,
  repos: ["toma", "swift", "romano", "eclipse"],
  reposManifestDate: "2021-04-22T21:01:24Z",
  reposDate: "2020-06-02T15:20:19Z",
  updated: "2020-06-02T15:20:19Z",
  METS: [
    {
      path: "data/sip/data/metadata.xml",
      md5: "e2becefa917e2751e22c627a60562227",
    },
  ],
  METSManifestDate: "2016-03-08T21:45:41Z",
  METSDate: "2019-08-29T19:45:37Z",
  smelt: {
    succeeded: true,
    message: "test",
    requestDate: "2020-04-20T20:28:52Z",
    processDate: "2020-06-02T15:20:19Z",
  },
};

const lpNeverSmelted: LegacyPackage = {
  id: NEVER_SMELTED_SLUG,
  METS: [
    {
      path: "data/sip/data/metadata.xml",
      md5: "e2becefa917e2751e22c627a60562227",
    },
  ],
  reposManifestDate: "2021-04-22T21:01:24Z",
  reposDate: "2020-06-02T15:20:19Z",
  updated: "2020-06-02T15:20:19Z",
  METSManifestDate: "2016-03-08T21:45:41Z",
  METSDate: "2019-08-29T19:45:37Z",
  repos: ["foo", "bar"],
};

const lpQueue: LegacyPackage = {
  id: QUEUE_SLUG,
  METS: [
    {
      path: "data/sip/data/metadata.xml",
      md5: "e2becefa917e2751e22c627a60562227",
    },
  ],
  reposManifestDate: "2021-04-22T21:01:24Z",
  reposDate: "2020-06-02T15:20:19Z",
  updated: "2020-06-02T15:20:19Z",
  METSManifestDate: "2016-03-08T21:45:41Z",
  METSDate: "2019-08-29T19:45:37Z",
  repos: ["foo", "bar"],
  smelt: {
    requestDate: "2020-04-20T20:28:52Z",
  },
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

  await t.context.dipstaging.insert(lpFail);
  await t.context.dipstaging.insert(lpSucceed);
  await t.context.dipstaging.insert(lpNew);
  await t.context.dipstaging.insert(lpQueue);
  await t.context.dipstaging.insert(lpNeverSmelted);
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

test.serial("Can query by status", async (t) => {
  const response = await t.context.dipstaging.listFromView("smeltStatus");
  t.is(response.results.filter((res) => res?.id === FAIL_SLUG).length, 1);
  t.is(response.results.filter((res) => res?.id === SUCCESS_SLUG).length, 1);
  t.is(response.results.filter((res) => res?.id === QUEUE_SLUG).length, 0);
});

test.serial("Can query by never smelted", async (t) => {
  const response = await t.context.dipstaging.listFromView("neverSmelted");
  t.is(
    response.results.filter((res) => res?.id === NEVER_SMELTED_SLUG).length,
    1
  );
  t.is(response.results.filter((res) => res?.id === SUCCESS_SLUG).length, 0);
});

test.serial("Can query by new dips", async (t) => {
  const response = await t.context.dipstaging.listFromView("newDip");
  t.is(response.results.filter((res) => res?.id === NEW_SLUG).length, 1);
  t.is(
    response.results.filter((res) => res?.id === NEVER_SMELTED_SLUG).length,
    0
  );
});

test.serial("Can query by queue", async (t) => {
  const response = await t.context.dipstaging.listFromView("smeltQueue");
  t.is(response.results.filter((res) => res?.id === QUEUE_SLUG).length, 1);
  t.is(
    response.results.filter((res) => res?.id === NEVER_SMELTED_SLUG).length,
    0
  );
});

test.after.always(async (t) => {
  await t.context.testDestroy("access", "dipstaging");
  await t.context.testDestroy("dipstaging", "handler");
});
