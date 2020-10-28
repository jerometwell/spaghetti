# Spaghetti 🍝
A non-invasive dependency injection container for ES6 Classes in javascript that isn't based on reflection.

## Why tho?

I'll come back to you on that one.

> “Commander Vimes always says that when life hands you a mess of spaghetti, you just keep pulling until you find a meatball.”

― Terry Pratchett, Making Money


## Quick Start
```javascript
class PetrolEngine {
  getFuelType() {
    return "petrol";
  }
}

class DieselEngine {
  getFuelType() {
    return "diesel";
  }
}

class Car {
  constructor(engine) {
    this.engine = engine;
  }
  getFuelType() {
    return this.engine.getFuelType();
  }
}

class Dad {
    // wiring can be done invasively (in the class property ::__wiring)
    static __wiring = ["car"]
    constructor(car) {
        this.car = car;
    }
}

// ------

const {Container} = require("spaghetti");

// Create a container 🎉
// containers hold wiring and instances for you
const cx = new Container();

// Wiring can be done non-invasively using Container#wire(klass, wiring)
// Wiring is an array that represents the arguments that need to be resolved for the constructor. 
cx.wire(Car, ["engine"]);

// Destructuring can be used to resolve nested arguments:
// cx.wire(Car, [{optionalPropertyName: "engine"}])

// Transients are created each time they are resolved
cx.transient("engine", DieselEngine);
// Easily replaceable with a different engine
// cx.transient("engine", PetrolEngine);

// Singletons are created on resolve and memoized
cx.singleton("car", Car);

const theFamilyCar = cx.resolve("car");
const alsoTheFamilyCar = cx.resolve("car");
Object.is(theFamilyCar, alsoTheFamilyCar) // true

theFamilyCar.getFuelType() // diesel

cx.transient("dad", Dad);

// no matter how many dads you have, they all drive the same car
const dad1 = cx.resolve("dad");
const dad2 = cx.resolve("dad");

Object.is(dad1.car, dad2.car) // true
```

## Wiring
Lacking reflection, this library requires annotation via "wiring". You must provide strings that represent dependencies. 

Wiring is given as a argument list with strings as values. Nested arrays and strings will be resolved recursively:

```javascript
["car", "person"] // => new Thing(<car>, <person>)

["car", ["cat", "dog"]] // => new Thing(<car>, [<cat>, <dog>])

[{vehicle: "car", optionalPet: "cat"}] // => new Thing({vehicle: <car>, pet: <cat>})
```

Wiring can be given invasively, by setting the static/class property `__wiring` e.g. `Car.__wiring = [...]` Or externally using the `Container#wire` method.

