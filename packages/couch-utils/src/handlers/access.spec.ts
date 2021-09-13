import { Collection, Manifest, Timestamp } from "@crkn-rcdr/access-data";
import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { AccessHandler } from "./access.js";

type AccessHandlerContext = BaseContext & { access: AccessHandler };

const test = anyTest as TestInterface<AccessHandlerContext>;

// MANIFEST_ONE and MANIFEST_TWO are members of COLLECTION
const MANIFEST_ONE = "69429/m0696zw19t6s";
const MANIFEST_TWO = "69429/m02n4zg6h671";
const MANIFEST_TWO_SLUG = "oocihm.8_06941_2";
const NEW_MANIFEST_NOID = "69429/g04x54f1mk14";
const COLLECTION = "69429/s0vq2s46j98h";
const COLLECTION_SLUG = "oocihm.8_06941";
const NEW_COLLECTION_NOID = "69429/g0154dn3zs9c";

const USER = { name: "User McGee", email: "mcgee@crkn.ca" };

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    access: new AccessHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("access", "handler");
});

test.serial("Manifests are parseable", async (t) => {
  const doc = await t.context.access.get(MANIFEST_TWO);
  t.true(Manifest.safeParse(doc).success);
});

test.serial("Collections are parseable", async (t) => {
  const doc = await t.context.access.get(COLLECTION);
  t.true(Collection.safeParse(doc).success);
});

test.serial("Can resolve slugs", async (t) => {
  const result = await t.context.access.resolveSlugs([
    MANIFEST_TWO_SLUG,
    "notaslug",
  ]);
  t.deepEqual(result[MANIFEST_TWO_SLUG], {
    id: MANIFEST_TWO,
    type: "manifest",
    resolved: true,
  });
  t.deepEqual(result["notaslug"], { error: "not-found", resolved: false });
});

test.serial("Objects can be published and unpublished", async (t) => {
  await t.context.access.unpublish({ id: MANIFEST_TWO, user: USER });

  let doc = await t.context.access.get(MANIFEST_TWO);
  t.falsy(doc.public);
  t.deepEqual(doc.staff?.by, USER);

  let error = await t.throwsAsync(
    t.context.access.unpublish({ id: MANIFEST_TWO, user: USER })
  );
  t.is(error.message, "Trying to unpublish an object that isn't public");

  await t.context.access.publish({ id: MANIFEST_TWO, user: USER });

  doc = await t.context.access.get(MANIFEST_TWO);
  t.true(Timestamp.safeParse(doc.public).success);
  t.deepEqual(doc.staff?.by, USER);

  error = await t.throwsAsync(
    t.context.access.publish({ id: MANIFEST_TWO, user: USER })
  );
  t.is(error.message, "Trying to publish an object that is already public");
});

test.serial("Slugs can only change if they aren't taken", async (t) => {
  const error = await t.throwsAsync(
    t.context.access.editCollection({
      id: COLLECTION,
      user: USER,
      data: { slug: MANIFEST_TWO_SLUG },
    })
  );
  t.true(error.message.includes("already in use"));

  const doc = await t.context.access.editCollection({
    id: COLLECTION,
    user: USER,
    data: { slug: "definitely_available" },
  });

  t.is(doc.slug, "definitely_available");

  await t.context.access.editCollection({
    id: COLLECTION,
    user: USER,
    data: { slug: COLLECTION_SLUG },
  });
});

test.serial("Cannot edit something if it's the wrong type", async (t) => {
  const error = await t.throwsAsync(
    t.context.access.editCollection({
      id: MANIFEST_TWO,
      user: USER,
      data: { label: { none: "hi" } },
    })
  );

  t.true(error.message.includes("has type: manifest"));
});

test.serial("Can add and remove members", async (t) => {
  // Get the time at the start of the test. We'll use this to ensure that
  // `updateInternalmeta` has been updated.
  const teststart = Date.now() / 1000;

  let collection = Collection.parse(await t.context.access.get(COLLECTION));
  const oldMembers = collection.members;

  const newMembers = [{ id: MANIFEST_ONE }];
  // Remove MANIFEST_TWO from COLLECTION
  collection = await t.context.access.editCollection({
    id: COLLECTION,
    user: USER,
    data: { members: newMembers },
  });

  // Test that MANIFEST_TWO is no longer in COLLECTION
  t.deepEqual(collection.members, newMembers);

  // Test whether MANIFEST_TWO has been updated
  const manifestTwo = await t.context.access.get(MANIFEST_TWO);
  t.true(
    (manifestTwo.updateInternalmeta?.requestDate || 0) > teststart,
    "Has MANIFEST_TWO been updated?"
  );

  // Add MANIFEST_TWO back
  await t.context.access.editCollection({
    id: COLLECTION,
    user: USER,
    data: { members: oldMembers },
  });
});

test.serial("Can unassign a slug", async (t) => {
  await t.context.access.unassignSlug({ id: MANIFEST_TWO, user: USER });

  const collection = Collection.parse(await t.context.access.get(COLLECTION));

  const isMember = (id: string) =>
    collection.members.findIndex((member) => member.id === id) >= 0;

  t.false(isMember(MANIFEST_TWO));
  t.true(isMember(MANIFEST_ONE));

  const manifest = Manifest.parse(await t.context.access.get(MANIFEST_TWO));

  t.is(manifest.slug, undefined);
});

test.serial("check validations to add member", async (t) => {
  await t.context.access.checkAdditions(COLLECTION, []);
});

test.serial("Collections can be created", async (t) => {
  const noidError = await t.throwsAsync(
    t.context.access.createCollection({
      id: "", // should fail
      user: USER,
      data: {
        slug: "definitely_available_2",
        label: {
          none: "I will fail",
        },
        type: "collection",
        summary: {
          none: "Fail I will",
        },
        behavior: "individuals",
        members: [],
      },
    })
  );
  t.true(noidError.message.includes("illegal_docid"));

  const slugError = await t.throwsAsync(
    t.context.access.createCollection({
      id: NEW_COLLECTION_NOID,
      user: USER,
      data: {
        slug: MANIFEST_TWO_SLUG, // should fail
        label: {
          none: "I will fail",
        },
        type: "collection",
        summary: {
          none: "Fail I will",
        },
        behavior: "individuals",
        members: [],
      },
    })
  );
  t.true(slugError.message.includes("already in use"));

  const doc = await t.context.access.createCollection({
    id: NEW_COLLECTION_NOID,
    user: USER,
    data: {
      slug: "definitely_available_2",
      label: {
        none: "I will succeed",
      },
      type: "collection",
      summary: {
        none: "Succeed I will",
      },
      behavior: "individuals",
      members: [],
    },
  });

  t.is(doc.slug, "definitely_available_2");
});

test.serial("Manifest can be created", async (t) => {
  const noidError = await t.throwsAsync(
    t.context.access.createManifest({
      id: "", // should fail
      user: USER,
      data: {
        slug: "definitely_available_3",
        label: {
          none: "I will fail",
        },
        type: "manifest",
        summary: {
          none: "Fail I will",
        },
        behavior: "individuals",
        viewingDirection: "bottom-to-top",
        canvases: [],
        from: "canvases",
      },
    })
  );
  t.true(noidError.message.includes("illegal_docid"));

  const slugError = await t.throwsAsync(
    t.context.access.createManifest({
      id: NEW_MANIFEST_NOID,
      user: USER,
      data: {
        slug: MANIFEST_TWO_SLUG, // should fail
        label: {
          none: "I will fail",
        },
        type: "manifest",
        summary: {
          none: "Fail I will",
        },
        behavior: "individuals",
        viewingDirection: "bottom-to-top",
        canvases: [],
        from: "canvases",
      },
    })
  );
  t.true(slugError.message.includes("already in use"));
  const doc = await t.context.access.createManifest({
    id: NEW_MANIFEST_NOID,
    user: USER,
    data: {
      slug: "definitely_available_3",
      label: {
        none: "I will succeed",
      },
      type: "manifest",
      summary: {
        none: "Succeed I will",
      },
      behavior: "individuals",
      viewingDirection: "bottom-to-top",
      canvases: [],
      from: "canvases",
    },
  });

  t.is(doc.slug, "definitely_available_3");
});

// n.b MANIFEST_TWO is no longer a member of COLLECTION

test.after.always(async (t) => {
  await t.context.testDestroy("access", "handler");
});
