class PetrolEngine {
  getFuelType() {
    return "petrol";
  }
  rev() {
    console.log("putt-putt-putt-putt!");
  }
}

class DieselEngine {
  getFuelType() {
    return "diesel";
  }
  rev() {
    console.log("BRUM BRUM BRUM");
  }
}

class Car {
  constructor(engine) {
    this.engine = engine;
  }
  getFuelType() {
    return this.engine.getFuelType();
  }
  drive() {
    this.engine.rev();
  }
}

class AlreadyWired {
  static __wiring = ["engine"];
  constructor(item) {
    this.item = item;
  }
}

const {Container} = require("./container");

describe("Container", () => {
  let container;
  beforeEach(() => {
    container = new Container();
  });

  describe("#wire", () => {
    describe("when wiring a class with internal wiring", () => {
      beforeEach(() => {
      })
      it("should throw", () => {
        expect( () => container.wire(AlreadyWired, ["different_engine"]) ).toThrow()
      })
    });

    describe("when wiring an already-wired object", () => {
      beforeEach(() => {
        container.wire(Car, ["engine"]);
      })
      it("should error", () => {
        expect(() => { container.wire(Car, ["engine"])}).toThrow()
      })
    
    });
  })

  describe("#transient", () => {
    describe("when registering an existing single-label registration", () => {
      it("should throw", () => {
        container.transient("engine", PetrolEngine);
        container.transient("car", Car);

        expect(() => container.transient("car", Car)).toThrow();
      })
    });
    describe("when a transient is resolved multiple times", () => {
      let resolve1;
      let resolve2;
      beforeEach(() => {
        container.transient("engine", PetrolEngine);
        container.transient("car", Car);
        resolve1 = container.resolve("car");
        resolve2 = container.resolve("car");
      })
      it("should be created each time", () => {
        expect(resolve1).not.toBe(resolve2);
      });
    })
    describe("When registering a multi-label transient", () => {
      beforeEach(() => {
        container.transient(["noisemaker", "engine"], PetrolEngine);
      })

      it("should resolve for both labels individually", () => {
        expect(container.resolve("noisemaker")).toBeInstanceOf(PetrolEngine);
        expect(container.resolve("engine")).toBeInstanceOf(PetrolEngine);
      });

      it("should resolve for both labels case-insensitive", () => {
        expect(container.resolve("noiSemAker")).toBeInstanceOf(PetrolEngine);
        expect(container.resolve("ENGiNE")).toBeInstanceOf(PetrolEngine);
      });

      it("should resolve an OR expression on both labels", () => {
        expect(container.resolve("noisemaker|engine")).toBeInstanceOf(PetrolEngine);
      });

      it("should resolve an AND expression on both labels", () => {
        expect(container.resolve("noisemaker&engine")).toBeInstanceOf(PetrolEngine);
      });

      it("should resolve an exclusive OR (bad) for NOT both labels", () => {
        expect(container.resolve("!noisemaker&!engine")).toBeInstanceOf(PetrolEngine);
      });

      it("should resolve an exclusive AND (good) for NOT both labels", () => {
        expect(() => container.resolve("!(noisemaker&engine)")).toThrow();
      });

      it("should throw (not found) on a NOT expression that includes one label", () => {
        expect(() => container.resolve("(!noisemaker)&engine")).toThrow();
      });

    });
  });
  describe("#singleton", () => {
    describe("when a singleton is resolved multiple times", () => {
      let resolve1;
      let resolve2;
      beforeEach(() => {
        container.singleton("engine", PetrolEngine);
        container.singleton("car", Car);
        resolve1 = container.resolve("car");
        resolve2 = container.resolve("car");
      })
      it("should not be created each time", () => {
        expect(resolve1).toBe(resolve2);
      });
    })

    describe("When registering a multi-label singleton", () => {
      let instance;
      beforeEach(() => {
        container.singleton(["noisemaker", "engine"], PetrolEngine);
        instance = container.resolve("noisemaker");
      })

      it("should resolve for both labels individually", () => {
        expect(container.resolve("noisemaker")).toBe(instance);
        expect(container.resolve("engine")).toBe(instance);
      });

      it("should resolve for both labels case-insensitive", () => {
        expect(container.resolve("noiSemAker")).toBe(instance);
        expect(container.resolve("ENGiNE")).toBe(instance);
      });

      it("should resolve an OR expression on both labels", () => {
        expect(container.resolve("noisemaker|engine")).toBe(instance);
      });

      it("should resolve an AND expression on both labels", () => {
        expect(container.resolve("noisemaker&engine")).toBe(instance);
      });

      it("should resolve an exclusive OR (bad) for NOT both labels", () => {
        expect(container.resolve("!noisemaker&!engine")).toBe(instance);
      });

      it("should resolve an exclusive AND (good) for NOT both labels", () => {
        expect(() => container.resolve("!(noisemaker&engine)")).toThrow();
      });

      it("should throw (not found) on a NOT expression that includes one label", () => {
        expect(() => container.resolve("(!noisemaker)&engine")).toThrow();
      });

    });

  })

  describe("#resolve", () => {
    describe("when resolving an unregistered label", () => {
      it("should throw", () => {
        expect(() => container.resolve("unregistered")).toThrow();
      })
    })
  })
})