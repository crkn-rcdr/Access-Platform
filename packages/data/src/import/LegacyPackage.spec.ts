import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";
import { LegacyPackage, getImportStatus } from "./LegacyPackage.js";

const { isValid } = tester(LegacyPackage);

test("Undefined dipstaging document has status `not-found`", (t) =>
  t.is(getImportStatus("not-found", undefined).status, "not-found"));

const USER: User = { name: "User McGee", email: "mcgee@crkn.ca" };

const now = Date.now() / 1000;

const newLP: LegacyPackage = {
  id: "new",
  repos: ["foo", "bar", "baz"],
  reposDate: now,
  reposManifestDate: now,
  METS: [],
  METSDate: now,
  METSManifestDate: now,
  updated: now,
};

test("New dipstaging document validates", isValid, newLP);

test("New dipstaging document has status `new`", (t) =>
  t.is(getImportStatus("new", newLP, "69429/whatever").status, "new"));

const processingLP: LegacyPackage = {
  ...newLP,
  id: "processing",
  slug: "processing",
  smelt: {
    requestDate: now,
  },
  staff: {
    by: USER,
    date: now,
  },
};

test("Processing dipstaging document validates", isValid, processingLP);

test("Processing dipstaging document has status `processing`", (t) =>
  t.is(
    getImportStatus("processing", processingLP, "69429/whatever").status,
    "processing"
  ));

const succeededLP: LegacyPackage = {
  ...processingLP,
  id: "success",
  slug: "success",
  smelt: {
    requestDate: now,
    processDate: now,
    succeeded: true,
    message: "success!",
  },
};

test("Succeeded dipstaging document validates", isValid, succeededLP);

test("Succeeded dipstaging document has status `succeeded`", (t) =>
  t.is(
    getImportStatus("success", succeededLP, "69429/whatever").status,
    "succeeded"
  ));

const failedLP: LegacyPackage = {
  ...processingLP,
  id: "failed",
  slug: "failed",
  smelt: {
    requestDate: now,
    processDate: now,
    succeeded: false,
    message: "here's an error",
  },
};

test("Failed dipstaging document validates", isValid, failedLP);

test("Failed dipstaging document has status `failed`", (t) =>
  t.is(getImportStatus("failed", failedLP, "69429/whatever").status, "failed"));
