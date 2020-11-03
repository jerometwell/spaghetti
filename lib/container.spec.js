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

const { Container } = require("./container");

describe(Container, () => {
  let container;
  beforeEach(() => {
    container = new Container();
  });

  describe("#wire", () => {
    describe("when wiring a class with internal wiring", () => {
      beforeEach(() => {
      })
      it("should throw", () => {
        expect(() => container.wire(AlreadyWired, ["different_engine"])).toThrow()
      })
    });

    describe("when wiring an already-wired object", () => {
      beforeEach(() => {
        container.wire(Car, ["engine"]);
      })
      it("should error", () => {
        expect(() => { container.wire(Car, ["engine"]) }).toThrow()
      })

    });
  })

  describe("#transient", () => {
    describe("when registering a transient for invalid labels", () => {
      beforeEach(() => {
        container.transient(["engine😇", "hello_world?"], PetrolEngine);
      })
      it("should strip invalid characters and resolve successfully", () => {
        expect(container.resolve("engine")).toBeInstanceOf(PetrolEngine);
        expect(container.resolve("hello_world")).toBeInstanceOf(PetrolEngine);
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

  describe("#transientFn", () => {
    describe("when registering a transientFn", () => {
      let fn;
      beforeEach(() => {
        fn = jest.fn(() => "I'm an Engine!");
        container.transientFn(["engine"], fn);
      })
      it("should resolve as the return value of the fn", () => {
        expect(container.resolve("engine")).toEqual("I'm an Engine!");
      })
      it("should call the fn on each resolve", () => {
        const resolve1 = container.resolve("engine");
        const resolve2 = container.resolve("engine");

        expect(fn).toHaveBeenCalledTimes(2);
      })
    });
    describe("when registering with wiring", () => {
      let fn;
      beforeEach(() => {
        fn = jest.fn();
        container.transient("engine", PetrolEngine);
        container.transientFn("thing", fn, {wiring: ["engine"]});
      })

      it("should call the ctor fn with the wired dependency on resolve", () => {
        const resolve = container.resolve("thing");
        
        expect(fn.mock.calls[0][0]).toBeInstanceOf(PetrolEngine);
      })
    });
  });

  describe("#singletonFn", () => {
    describe("when registering a singletonFn", () => {
      let fn;
      beforeEach(() => {
        fn = jest.fn(() => "I'm an Engine!");
        container.singletonFn(["engine"], fn);
      })
      it("should resolve as the return value of the fn", () => {
        expect(container.resolve("engine")).toEqual("I'm an Engine!");
      })
      it("should call the fn once across all resolves", () => {
        const resolve1 = container.resolve("engine");
        const resolve2 = container.resolve("engine");

        expect(fn).toHaveBeenCalledTimes(1);
      })
    });
    describe("when registering with wiring", () => {
      let fn;
      beforeEach(() => {
        fn = jest.fn();
        container.transient("engine", PetrolEngine);
        container.singletonFn("thing", fn, {wiring: ["engine"]});
      })

      it("should call the ctor fn with the wired dependency on resolve", () => {
        const resolve = container.resolve("thing");
        
        expect(fn.mock.calls[0][0]).toBeInstanceOf(PetrolEngine);
      })
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
        expect(instance).toBeInstanceOf(PetrolEngine);
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
    it("should throw when resolving an in-expression []", () => {
      expect(() => container.resolve("loud[]|engine")).toThrow();
    });
    it("should throw when invalid characters are used", () => {
      expect(() => container.resolve("loud👀")).toThrow();
    });
    it("should resolve an empty array when asking for all of unregistered", () => {
      const result = container.resolve("engine[]");

      expect(result).toHaveLength(0);
    });
    it("should resolve an array of 1 instance when asking for all of 1 tag", () => {
      container.transient("engine", PetrolEngine);

      const result = container.resolve("engine[]");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PetrolEngine);
    })
    describe("when multiple registrations are present for the same tag", () => {
      beforeEach(() => {
        container.transient("engine", PetrolEngine);
        container.transient("engine", DieselEngine);
      });

      it("multinotation[] should resolve all registrations in registration order", () => {
        const result = container.resolve("engine[]");

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(PetrolEngine);
        expect(result[1]).toBeInstanceOf(DieselEngine);
      })
    })
    describe("when resolving an unregistered label", () => {
      it("should throw", () => {
        expect(() => container.resolve("unregistered")).toThrow();
      })
    });

    describe("when resolving deeply nested wiring", () => {

      beforeEach( () => {
        class MockCapture {
          static __wiring = ["engine", ["engine", "engine"], {otherKey: "engine"}]
          constructor() {
            this.mock = jest.fn();
            this.mock.apply(this, arguments);
          }
        }
        container.transient("engine", PetrolEngine);
        container.transient("mock", MockCapture);
      })
      it("should recursively solve all dependencies", () => {
        const capture = container.resolve("mock");

        expect(capture.mock).toHaveBeenCalledTimes(1);

        expect(capture.mock.mock.calls[0][0]).toBeInstanceOf(PetrolEngine);

        expect(capture.mock.mock.calls[0][1][0]).toBeInstanceOf(PetrolEngine);
        expect(capture.mock.mock.calls[0][1][1]).toBeInstanceOf(PetrolEngine);

        expect(capture.mock.mock.calls[0][2].otherKey).toBeInstanceOf(PetrolEngine);
      })
    })
  });
  describe("#resolveAll", () => {
    it("should throw when resolving an already-multi-notation expr", () => {
      expect(() => container.resolveAll("loud[]")).toThrow();
    });
    it("should throw when resolving an in-expression []", () => {
      expect(() => container.resolveAll("loud[]|engine")).toThrow();
    });
    it("should throw when invalid characters are used", () => {
      expect(() => container.resolveAll("loud👀")).toThrow();
    });

    it("should resolve an empty array when asking for all of unregistered", () => {
      const result = container.resolveAll("engine");

      expect(result).toHaveLength(0);
    });

    it("should resolve an array of 1 instance when asking for all of 1 tag", () => {
      container.transient("engine", PetrolEngine);

      const result = container.resolveAll("engine");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PetrolEngine);
    })
    describe("when multiple registrations are present for the same tag", () => {
      beforeEach(() => {
        container.transient("engine", PetrolEngine);
        container.transient("engine", DieselEngine);
      });

      it("multinotation[] should resolve all registrations in registration order", () => {
        const result = container.resolveAll("engine");

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(PetrolEngine);
        expect(result[1]).toBeInstanceOf(DieselEngine);
      })
    })
  });

  describe("#getScope", () => {
    let scope;
    beforeEach(() => {
      container.singleton("engine", PetrolEngine);
      container.scoped("car", Car);
      scope = container.getScope()
    })
    it("should resolve like a singleton on the base container", () => {
      const resolve1 = container.resolve("car");
      const resolve2 = container.resolve("car");

      expect(resolve1).toBe(resolve2);
    });
    it("should resolve with a different memoized instance on the scope", () => {
      const baseResolve = container.resolve("car");
      const scopeResolve = scope.resolve("car");
      const scopeResolve2 = scope.resolve("car");

      expect(baseResolve).not.toBe(scopeResolve);

      expect(scopeResolve).toBe(scopeResolve2);
    });
  })
})