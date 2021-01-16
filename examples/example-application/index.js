const {Container} = require("spaghetti-code");
const {Counter} = require("./lib/counter");
const {Logger} = require("./lib/logger");
const {App} = require("./lib/app");

async function main() {
  const c = new Container();

  c.singleton("logger", Logger);
  c.singleton("counter", Counter);
  c.singleton("app", App);

  const logger = c.resolve("logger");
  let app;
  try {
    app = c.resolve("app");
    await app.start();
  } catch(e) {
    logger.info("FATAL!", e);
    process.exit(1);
  }
}

main();