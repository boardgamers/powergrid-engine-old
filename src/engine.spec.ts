import {Engine} from "./engine";
import {expect} from "chai";

describe("Engine", () => {
  it ("should init with a turn order", () => {
    const engine = new Engine();
    engine.init(2, "seed");

    expect(engine.turnorder[0]).to.equal("red");
  });

  it ("should load and save from JSON", () => {
    const engine = new Engine();
    engine.init(2, "seed");

    const stringified = JSON.parse(JSON.stringify(engine));
    const restored = new Engine();
    restored.fromJSON(stringified);

    expect(restored.turnorder).to.deep.equal(engine.turnorder);
  });
});