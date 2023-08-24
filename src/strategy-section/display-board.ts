import { Board } from "./board";
import blockMetadata from "../block-metadata.json";

export class DisplayBoard extends Board {
  /** 4x4 2D array */
  public type: "current" | "next";

  constructor(type: "current" | "next") {
    super(4, 4, 36, type === "current" ? "Current Block" : "Next Block");
    this.type = type;
    this.x = this.type === "current" ? 866 : 1020;
  }

  public setBlock() {
    const { map, anchor } = blockMetadata[0] as BlockMetadata;
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === 1) {
          this.grids[i][j].color = "red";
        }
      }
    }
  }
}
