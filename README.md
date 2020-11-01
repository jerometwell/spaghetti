# spaghetti-code 🍝
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

## Non-class constructors
When registering non-class constructors, use `#singletonFn` and `#transientFn` methods. Be mindful of how closure can preserve state, even on transient resolves. 

```javascript
cx.singletonFn("config", () => ({
  baseUrl: process.env.URL
}));
cx.singletonFn("api_client", (config) => axios.create({baseUrl: config.url}), {wiring: ["config"]});

const api = cx.resolve("api_client");
// api.post(...)
```

## 🏷 Labels
Labels are what we use to identify dependencies. They are string-based, case-insensitive identifiers that are attached to dependency registrations.

```javascript
// register with one label or many
cx.transient("engine", DieselEngine);
cx.transient(["ENGINE", "loud"], DieselEngine);

// resolve for any matching label
cx.resolve("LOUD");
cx.resolve("engine");

// resolve for an expression
// See "Multi-label Registrations/Expressions" below
cx.resolve("engine&LOUD");

// the same label can be registered multiple times - single resolves will resolve the first match.
cx.transient("engine", PetrolEngine);
```

## 🔌 Wiring
Lacking reflection, this library requires annotation via "wiring". You must provide strings that represent dependencies. 

Wiring is given as a argument list with strings as values. Nested arrays and strings will be resolved recursively:

```javascript
["car", "person"] // => new Thing(<car>, <person>)

["car", ["cat", "dog"]] // => new Thing(<car>, [<cat>, <dog>])

[{vehicle: "car", pet: "cat"}] // => new Thing({vehicle: <car>, pet: <cat>})
```

Wiring can be given invasively, by setting the static/class property `__wiring` e.g. `Car.__wiring = [...]` Or externally using the `Container#wire` method.

Wiring can also be given during registration: 

```javascript
container.transient("car", Car, {wiring: ["engine"]] // => new Car(<PetrolEngine>)
```

## 🧮 Multi-label Registrations/Expressions
Registrations can be made against multiple tags by passing an array of strings in place of a label. This registration will respond to requests for that label.

```
container.transient(["vegetable", "red"], Tomato);
container.singleton(["db", "primary"], DatabaseProvider);
```

Wiring can be given as an expression using a logical syntax. 

#### Supported Operators
* `|` Or
* `&` And
* `!` Not
* `()` Parentheses

```javascript
container.transient(["vegetable", "red"], Tomato);
container.transient(["vegetable", "green"], Celery);

container.resolve("vegetable&!red") // find me a vegetable that isn't red

// be mindful of open-ended matching (exclusive OR/NOT anything)
container.resolve("!red") // blue 2005 toyota yaris, 1299cc, 2 axle rigid body

// exclusive NOT can still match previous excluded terms
container.transient(["vegetable", "red"], Tomato);
container.resolve("!red&!vegetable") // Tomato

container.resolve("!(red&vegetable)") // !Tomato
```

## Resolving Multiple
Any expression can be used to resolve _all matching registrations_. Use `label[]` notation to match an array in wiring, or invoke the `#resolveAll` method directly.

```javascript
container.singleton("person", Mom);
container.transient("engine", DieselEngine);
container.transient("engine", PetrolEngine);

class MultiEngineCar {
  static __wiring = ["person", "engine[]"]

// class will receive new MultiEngineCar(<Mom>, [<DieselEngine>, <PetrolEngine>])
// this wiring `engine[]` is functionally identical to the resolve statements below:
container.resolve("engine[]");
container.resolveAll("engine");

// resolveAll is evaluated per expression, not per label: 
container.resolve("loud&engine[]"); // get all loud engines
```

## TODO `v1.0.0`
* ✔ support for non-es6classes, direct-value dependencies
* container child scopes
* container logging
* container options - warnOnDuplicate, errOnDuplcate, etc
* example application
