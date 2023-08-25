import { on } from "kontra";
import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { BlockManager } from "./block-manager";
import blockMetadata from "../block-metadata.json";
import { BlockId } from "../types/block-metadata";

export class DisplayBoard extends Board {
  /** 4x4 2D array */
  public type: "current" | "next";

  constructor(type: "current" | "next") {
    super(
      4,
      4,
      36,
      type === "current" ? "Current Block" : "Next Block",
      "display"
    );
    this.type = type;
    this.x = this.type === "current" ? 866 : 1020;

    on(EVENTS.RELOAD_BLOCKS, () => {
      this.onReloadBlocks();
    });
  }

  protected onReloadBlocks() {
    const blockManager = BlockManager.getInstance();
    const targetIndex = this.type === "current" ? 0 : 1;
    const id = blockManager.blockIds[targetIndex] as BlockId;

    if (id) {
      const { map, color } = blockMetadata[id];
      this.setBlock(map, color);
    } else {
      this.clear();
    }
  }

  public clear() {
    this.grids.flat().forEach((grid) => (grid.covered.color = "transparent"));
  }

  public setBlock(map: number[][], color: string) {
    this.clear();
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === 1) this.grids[i][j].covered.color = color;
      }
    }
  }
}
