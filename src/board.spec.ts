import { expect } from "chai";
import Board from "./board";
import seedrandom from "seedrandom";

describe("Board", () => {
  describe("map", () => {
    it ("should have some links", () => {
      const board = new Board();

      const rnd = seedrandom("seed");

      board.init(2, rnd);

      expect(board.map.links.length).to.be.greaterThan(5);
    });
  })
});
