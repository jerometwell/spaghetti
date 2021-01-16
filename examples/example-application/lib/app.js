class App {
  static __wiring = ["counter"];
  constructor(counter) {
    this.counter = counter;
  }

  async start() {
    await this.counter.count(1,50);
  }
}

module.exports = {
  App
}