const { Registration } = require("./registration");

class Car {

}

describe(Registration, () => {
    let registration;
    describe("when registered with a bad labels", () => {
        beforeEach(() => {
            registration = new Registration(Car, Registration.TRANSIENT, ["b@ad_label✨~@!"])
        });
        it("should match to a \w+ sanitized version", () => {
            expect(registration.match("bad_label")).toBeTruthy();
        })
    })

    describe("when registered with multiple labels", () => {
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