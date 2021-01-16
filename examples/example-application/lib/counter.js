function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Counter {
  static __wiring = ["logger"]

  constructor(logger) {
    this.logger = logger;
  }
  

  async count(start, end, interval = 100) {
    for(let i = start; i <= end; i++) {
      this.logger.info("I waited!");
      await timeout(interval);
    }
  }
}

module.exports = {Counter};