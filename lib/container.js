const LEP = require("logical-expression-parser");

const WIRING_KEY = "__wiring";

function isPojo(obj) {
    if (obj === null || typeof obj !== "object") {
        return false;
    }
    return Object.getPrototypeOf(obj) === Object.prototype;
}

const SINGLETON = "SINGLETON";
const TRANSIENT = "TRANSIENT";

class Registration {
    constructor(ctor, lifecycle, labels) {
        this.ctor = ctor;
        this.lifecycle = lifecycle;
        this.labels = labels;
    }
    storeInstance(instance) {
        this.instance = instance;
    }
    match(expression) {
        return LEP.parse(expression, search => this.labels.some( label => label.toUpperCase() == search.toUpperCase() ));
    }
}

class Container {
    constructor(){
        this._registrations = [];
        this._instances = [];
        this._wiring = {};
    }
    _register(lifecycle, labels = [], ctor) {
        // normalize
        if(!Array.isArray(labels)) {
            labels = [labels];
        }

        const collision = this._registrations.find(r => r.labels.some(regLabel => labels.some( l => l == regLabel) ))
        if(collision) {
            throw new Error(`Failed to register ${ctor.name} [${labels}], Collision with ${collision.ctor.name} [${collision.labels}]!`);
        }
        this._registrations.push(new Registration(ctor, lifecycle, labels));
    }
    
    _getRegistration(expression) {
        return this._registrations.find( r => r.match(expression));
    }

    _getAllRegistrations() {
        return this._registrations.filter( r => r.match(expression));
    }
   
    
    /**
     * Recursively transforms wiring objects into a resolved arglist
     * e.g. ["engine", {carThing: "car"}] => [<Engine>, {carThing: <Car>}]
     */
    _transformWiring(item) {
        if(Array.isArray(item)) {
            return item.map( v => this._transformWiring(v) );
        } else if (isPojo(item)) {
            return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, this._transformWiring(v)] ))
        } else if(!item) {
            return item;
        } else {
            return this.resolve(item); 
        }
    }
    
    _getWiring(ctor) {
        return this._wiring[ctor.name] || ctor[WIRING_KEY] || [];
    }
    
    
    _create(reg) {
        const {ctor} = reg;
        const args = this._transformWiring(this._getWiring(ctor));
        const created = new ctor(...args);
        return created;
    }

    _storeInstance(registration, instance){
        registration.storeInstance(instance);
    }

    resolve(expression) {
        const reg = this._getRegistration(expression);
        if(!reg) {
            throw new Error(`Unable to locate match for ${expression}`);
        }
        
        if(reg.lifecycle === SINGLETON) {
            const existing = reg.instance;
            if(existing) {
                return existing;
            }
            const created = this._create(reg);
            this._storeInstance(reg, created);

            return created;
        } else if(reg.lifecycle === TRANSIENT) {
            return this._create(reg);
        } else {
            throw new Error("unknown lifecycle " + reg.lifecycle)
        }
        
    }
    
   
    wire(ctor, needs) {
        if(ctor[WIRING_KEY]) {
            throw new Error(`${ctor} Already wired`)
        }
        ctor[WIRING_KEY] = needs;
    }

    singleton = (...args) => this._register(SINGLETON, ...args);
    transient = (...args) => this._register(TRANSIENT, ...args);
   
}

module.exports = {
    Container
}