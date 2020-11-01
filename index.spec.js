const imported = require("./index");

describe("index.js", () => {
  it("should export `Container`", () => {
    expect(imported.Container).toBeTruthy();
  })
})