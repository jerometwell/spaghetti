const { Registration } = require("./registration");

const WIRING_KEY = "__wiring";

function isPojo(obj) {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  return Object.getPrototypeOf(obj) === Object.prototype;
}

class Container {
  constructor() {
    this._registrations = [];
    this._instances = [];
    this._wiring = {};
  }
  _register(lifecycle, labels = [], ctor) {
    // normalize
    if (!Array.isArray(labels)) {
      labels = [labels];
    }

    this._registrations.push(new Registration(ctor, lifecycle, labels));
  }

  _getRegistration(expression) {
    return this._registrations.find(r => r.match(expression));
  }

  _getAllRegistrations(expression) {
    return this._registrations.filter(r => r.match(expression));
  }


  /**
   * Recursively transforms wiring objects into a resolved arglist
   * e.g. ["engine", {carThing: "car"}] => [<Engine>, {carThing: <Car>}]
   */
  _transformWiring(item) {
    if (Array.isArray(item)) {
      return item.map(v => this._transformWiring(v));
    } else if (isPojo(item)) {
      return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, this._transformWiring(v)]))
    } else if (!item) {
      return item;
    } else {
      return this.resolve(item);
    }
  }

  _getWiring(ctor) {
    return this._wiring[ctor.name] || ctor[WIRING_KEY] || [];
  }


  _create(reg) {
    const { ctor } = reg;
    const args = this._transformWiring(this._getWiring(ctor));
    const created = new ctor(...args);
    return created;
  }

  _getMemoizedOrCreate(reg) {
    const existing = reg.instance;
    if (existing) {
      return existing;
    }
    const created = this._create(reg);
    reg.storeInstance(created);

    return created;
  }

  _resolveSingle(reg) {
    if (reg.lifecycle === Registration.SINGLETON) {
      return this._getMemoizedOrCreate(reg);
    } else if (reg.lifecycle === Registration.TRANSIENT) {
      return this._create(reg);
    } else {
      throw new Error("unknown lifecycle " + reg.lifecycle)
    }
  }

  _assertValidExpression(expression) {
    const invalidCharMatch = expression.match(/([^\|&\(\)\!\w])/)
    if (invalidCharMatch) {
      throw new Error(`Invalid expression ${expression}: invalid characters present: ${invalidCharMatch[1]}`);
    }
  }
  resolveAll(expression) {
    // reject any invalid characters up front
    this._assertValidExpression(expression);
    return this._getAllRegistrations(expression).map(reg => this._resolveSingle(reg));
  }

  resolve(rawExpression) {
    // pre-parse - remove expression[] notation 
    const multiMatch = rawExpression.match(/^([^\[\]]+)(\[\])?$/);
    if (!multiMatch) {
      throw new Error(`Invalid expression ${rawExpression}: unknown syntax`);
    }
    const [match, expression, isMulti] = multiMatch;

    // reject any invalid characters up front
    this._assertValidExpression(expression);

    if (isMulti) {
      return this.resolveAll(expression)
    } else {
      const reg = this._getRegistration(expression);
      if (!reg) {
        throw new Error(`Unable to locate match for ${expression}`);
      }
      return this._resolveSingle(reg);
    }

  }


  wire(ctor, needs) {
    if (ctor[WIRING_KEY]) {
      throw new Error(`${ctor} Already wired`)
    }
    ctor[WIRING_KEY] = needs;
  }

  singleton = (...args) => this._register(Registration.SINGLETON, ...args);
  transient = (...args) => this._register(Registration.TRANSIENT, ...args);

}

module.exports = {
  Container
}