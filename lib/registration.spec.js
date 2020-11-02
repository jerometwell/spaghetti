const { Registration } = require("./registration");

class Car {

}

describe(Registration, () => {
    let registration;
    describe("when created with a bad labels", () => {
        beforeEach(() => {
            registration = new Registration(Car, Registration.TRANSIENT, ["b@ad_label✨~@!"])
        });
        it("should match to a \w+ sanitized version", () => {
            expect(registration.match("bad_label")).toBeTruthy();
        })
        it("should have property #isCtor default true", () => {
            expect(registration.isCtor).toBeTruthy();
        })
    })

    describe("when created with options.isCtor == flase", () => {
        beforeEach(() => {
            registration = new Registration(Car, Registration.TRANSIENT, ["hello"], {isCtor: false})
        });
        it("should have property #isCtor false", () => {
            expect(registration.isCtor).toBeFalsy();
        })
    })

    describe("when created with multiple labels", () => {
        beforeEach(() => {
            registration = new Registration(Car, Registration.TRANSIENT, ["one", "two", "three"])
        });
        it("should match to each label individually", () => {
            expect(registration.match("one")).toBeTruthy();
            expect(registration.match("two")).toBeTruthy();
            expect(registration.match("three")).toBeTruthy();
        });

        it("should match to a partial AND expression", () => {
            expect(registration.match("three&two")).toBeTruthy();
        });
        it("should match to a partial OR expression", () => {
            expect(registration.match("unmatched|one")).toBeTruthy();
        });
        it("should match to a NOT label expression", () => {
            expect(registration.match("!cheese")).toBeTruthy();
        });

        it("should match to a OR NOT expression", () => {
            expect(registration.match("!cheese|!one")).toBeTruthy();
        });
        it("should not match to a NOT AND expression", () => {
            expect(registration.match("!(two&one)")).toBeFalsy();
        });
    })
})