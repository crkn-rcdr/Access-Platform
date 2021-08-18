import anyTest, { TestInterface } from "ava";
import { createHash } from "crypto";

import { BaseContext, getContext, randomName } from "./common.spec.js";

const test = anyTest as TestInterface<BaseContext>;

test.before((t) => {
  t.context = getContext();
});

test("can post and receive container metadata", async (t) => {
  const foo = "hey there";
  const bar = "how's it going";

  const name = randomName();
  const container = t.context.client.container(name);

  await t.context.client.createContainer(name, { foo });
  let response = await container.getMetadata();
  t.is(response.metaHeader("foo"), foo);

  await container.postMetadata({ bar });
  response = await container.getMetadata();
  t.is(response.metaHeader("bar"), bar);

  await t.context.client.deleteContainer(name);
});

test("can create and delete objects", async (t) => {
  const custom = "custom metadata!";
  const objectName = "create-delete";
  const text = "This is the object's contents.";
  const etag = createHash("md5").update(text).digest("hex");
  const args = {
    data: text,
    etag,
    contentType: "text/plain",
    metadata: { custom },
  };

  const containerName = randomName();
  const container = t.context.client.container(containerName);
  await t.context.client.createContainer(containerName);

  await container.putObject(objectName, args);

  const object = await container.getObject(objectName);
  object.content.setEncoding("utf-8");

  t.is(object.content.read(), text);
  t.is(object.etag, etag);
  t.is(object.contentType, "text/plain");
  t.is(object.metaHeader("custom"), custom);

  await container.deleteObject(objectName);
  await t.context.client.deleteContainer(containerName);
});

test("can retrieve objects as JSON", async (t) => {
  const objectName = "jsonfile";
  const contents = { json: "string" };
  const args = {
    data: JSON.stringify(contents),
    contentType: "application/json",
  };

  const containerName = randomName();
  const container = t.context.client.container(containerName);
  await t.context.client.createContainer(containerName);

  await container.putObject(objectName, args);

  const object = await container.getObjectAsJSON(objectName);

  t.deepEqual(object.content, contents);

  await container.deleteObject(objectName);
  await t.context.client.deleteContainer(containerName);
});

test("can copy objects", async (t) => {
  const scName = randomName();
  const dcName = randomName();
  const soName = "source-object";
  const doName = "destination-object";

  const contents = "this will be copied!";

  const sc = t.context.client.container(scName);
  const dc = t.context.client.container(dcName);

  await t.context.client.createContainer(scName);
  await t.context.client.createContainer(dcName);

  await sc.putObject(soName, { data: contents, contentType: "text/plain" });
  await sc.copyObject(soName, dcName, doName);

  const dobj = await dc.getObject(doName);
  dobj.content.setEncoding("utf-8");

  t.is(dobj.content.read(), contents);

  await dc.deleteObject(doName);
  await t.context.client.deleteContainer(dcName);
  await sc.deleteObject(soName);
  await t.context.client.deleteContainer(scName);
});
