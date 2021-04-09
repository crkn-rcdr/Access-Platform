#!/usr/bin/env node

const { pullFixtures } = require(".");

(async () => {
  await pullFixtures();
})();
