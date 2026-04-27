const { createTables } = require("./setuptable");

(async () => {
  await createTables();
  process.exit();
})();