import { Collection, Manifest, Timestamp } from "@crkn-rcdr/access-data";
import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../index.spec.js";
import { AccessHandler } from "./access.js";

type AccessHandlerContext = BaseContext & { access: AccessHandler };

const test = anyTest as TestInterface<AccessHandlerContext>;

const MANIFEST_TWO = "69429/m02n4zg6h671";
const MANIFEST_TWO_SLUG = "oocihm.8_06941_2";
const COLLECTION = "69429/s0vq2s46j98h";
const COLLECTION_SLUG = "oocihm.8_06941";

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

test.serial("Objects can be published and unpublished", async (t) => {
  await t.context.access.unpublish(MANIFEST_TWO);

  let doc = await t.context.access.get(MANIFEST_TWO);
  t.falsy(doc.public);

  let error = await t.throwsAsync(t.context.access.unpublish(MANIFEST_TWO));
  t.is(error.message, "Trying to unpublish an object that isn't public");

  await t.context.access.publish(MANIFEST_TWO);

  doc = await t.context.access.get(MANIFEST_TWO);
  t.true(Timestamp.safeParse(doc.public).success);

  error = await t.throwsAsync(t.context.access.publish(MANIFEST_TWO));
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

test.serial("Can unassign a slug", async (t) => {
  await t.context.access.unassignSlug({ id: MANIFEST_TWO, user: USER });

  const collection = Collection.parse(await t.context.access.get(COLLECTION));

  t.is(
    collection.members.find((member) => member.id === MANIFEST_TWO),
    undefined
  );

  const manifest = Manifest.parse(await t.context.access.get(MANIFEST_TWO));

  t.is(manifest.slug, undefined);
});

// n.b MANIFEST_TWO is no longer a member of COLLECTION

test.after(async (t) => {
  await t.context.testDestroy("access", "handler");
});
