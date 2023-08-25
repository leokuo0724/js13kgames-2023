import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { on } from "kontra";
import { BlockManager } from "./block-manager";
import { BlockMetadata } from "../types/block-metadata";

export class TimelineBoard extends Board {
  protected currentOveredCoord: [number, number] | null = null;

  constructor() {
    super(20, 5, 40, "Strategy Timeline Board", "interact");
    this.x = 36;

    on(EVENTS.ON_GRID_OVER, this.onGridOver.bind(this));
    on(EVENTS.SET_BLOCK, this.onSetBlock.bind(this));
    on(EVENTS.UPDATE_BLOCK, () => {
      this.onGridOver(this.currentOveredCoord);
    });
  }

  protected clearCoveredGrid() {
    this.currentOveredCoord = null;
    this.grids.flat().forEach((grid) => {
      if (!grid.occupiedId) {
        grid.covered.color = "transparent";
        grid.covered.opacity = 0;
      }
    });
  }

  /** Get all relative grids' coords based on the anchor */
  protected getRelativeCoords(
    coord: [number, number],
    blockMetadata: BlockMetadata
  ) {
    const { map, anchor } = blockMetadata;
    const coords = [];
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const [x, y] = [coord[0] - anchor[0] + i, coord[1] - anchor[1] + j];
        if (map[i][j] === 1) {
          if (x < 0 || x >= this.grids.length) return [];
          if (y < 0 || y >= this.grids[x].length) return [];
          if (this.grids[x][y].occupiedId) return [];
          coords.push([x, y]);
        }
      }
    }
    return coords;
  }

  protected onGridOver(coord?: [number, number]) {
    if (!coord) return;
    this.clearCoveredGrid();

    const blockManager = BlockManager.getInstance();
    const currentBlockMetadata = blockManager.blockData[0];
    if (!currentBlockMetadata) return;

    this.currentOveredCoord = coord;
    const coords = this.getRelativeCoords(coord, currentBlockMetadata);
    const { color } = currentBlockMetadata;
    coords.forEach((coord) => {
      this.grids[coord[0]][coord[1]].covered.color = color;
      this.grids[coord[0]][coord[1]].covered.opacity = 1;
    });
  }

  protected onSetBlock(coord: [number, number]) {
    const blockManager = BlockManager.getInstance();
    const currentBlockMetadata = blockManager.blockData[0];
    if (!currentBlockMetadata) return;

    const coords = this.getRelativeCoords(coord, currentBlockMetadata);
    const { color, type } = currentBlockMetadata;
    coords.forEach((coord) => {
      this.grids[coord[0]][coord[1]].covered.color = color;
      this.grids[coord[0]][coord[1]].covered.opacity = 1;
      this.grids[coord[0]][coord[1]].occupiedId = generateUUID();
      this.grids[coord[0]][coord[1]].occupiedUnitType = type;
    });

    // TODO: block manager update to next blocks
  }
}

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
