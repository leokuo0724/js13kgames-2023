import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { on } from "kontra";
import { BlockManager } from "./block-manager";

export class TimelineBoard extends Board {
  constructor() {
    super(20, 5, 40, "Strategy Timeline Board", "interact");
    this.x = 36;

    on(EVENTS.ON_GRID_OVER, this.onGridOver.bind(this));
  }

  protected onGridOver(coord: [number, number]) {
    this.clearCoveredGrid();

    const blockManager = BlockManager.getInstance();
    const currentBlock = blockManager.blockData[0];
    if (!currentBlock) return;

    const { map, anchor, color } = currentBlock;
    const coords = [];
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const [x, y] = [coord[0] - anchor[0] + i, coord[1] - anchor[1] + j];
        if (map[i][j] === 1) {
          if (x < 0 || x >= this.grids.length) return;
          if (y < 0 || y >= this.grids[x].length) return;
          coords.push([x, y]);
        }
      }
    }
    coords.forEach((coord) => {
      this.grids[coord[0]][coord[1]].covered.color = color;
      this.grids[coord[0]][coord[1]].covered.opacity = 1;
    });
  }

  protected clearCoveredGrid() {
    this.grids.flat().forEach((grid) => {
      grid.covered.color = "transparent";
      grid.covered.opacity = 0;
    });
  }
}
