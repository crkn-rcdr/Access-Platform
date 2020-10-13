const TestDeployer = require("kivik/src/TestDeployer");

const deployer = new TestDeployer(
  __dirname + "/../../Databases",
  "http://couch:5984/"
);

before(async () => {
  await deployer.load();
});

beforeEach(async () => {
  await deployer.deploy();
});

afterEach(async () => {
  await deployer.reset();
});
