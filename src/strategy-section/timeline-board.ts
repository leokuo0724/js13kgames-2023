import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { Sprite, emit, on } from "kontra";
import { BlockManager } from "./block-manager";
import { BlockMetadata } from "../types/block-metadata";
import { Timeline } from "./timeline";
import { TIMELINE_GRID_SIZE } from "../constants/board";

const ROW = 5;
const COL = 20;
const MAX_X = TIMELINE_GRID_SIZE * COL;

export class TimelineBoard extends Board {
  protected currentOveredCoord: [number, number] | null = null;
  protected timeline: Sprite;

  constructor() {
    super(COL, ROW, TIMELINE_GRID_SIZE, "Strategy Board", "interact");
    this.x = 36;

    this.timeline = new Timeline({
      width: 2,
      height: TIMELINE_GRID_SIZE * ROW,
    });
    this.addChild(this.timeline);

    on(EVENTS.ON_GRID_OVER, this.onGridOver.bind(this));
    on(EVENTS.PLACE_BLOCK, this.onPlaceBlock.bind(this));
    on(EVENTS.UPDATE_BLOCK, () => {
      this.onGridOver(this.currentOveredCoord);
    });
    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  protected onStateChange(state: GameState) {
    if (state !== "fight") return;
    this.timeline.start();
  }

  protected scanGridsCol(col: number) {
    const blockIds = new Set();
    for (let i = 0; i < this.grids.length; i++) {
      const grid = this.grids[i][col];
      if (
        grid.isScanned ||
        blockIds.has(grid.occupiedId) ||
        !grid.occupiedUnitType
      )
        continue;
      blockIds.add(grid.occupiedId);
      setTimeout(() => {
        emit(EVENTS.SPAWN_ALLY, grid.occupiedUnitType);
      }, 500 * i);
    }

    if (blockIds.size === 0) return;
    // Scan rest grids
    for (let i = 0; i < this.grids.length; i++) {
      for (let j = col; j < this.grids[i].length; j++) {
        const grid = this.grids[i][j];
        if (!grid.occupiedId || grid.isScanned) continue;
        if (blockIds.has(grid.occupiedId)) {
          grid.setScanned();
        }
      }
    }
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

  protected onGridOver(coord: [number, number] | null) {
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

  protected onPlaceBlock(coord: [number, number]) {
    const blockManager = BlockManager.getInstance();
    const currentBlockMetadata = blockManager.blockData[0];
    if (!currentBlockMetadata) return;

    const coords = this.getRelativeCoords(coord, currentBlockMetadata);
    const { color, type } = currentBlockMetadata;
    if (coords.length === 0) return;
    const id = generateUUID();
    coords.forEach((coord) => {
      this.grids[coord[0]][coord[1]].covered.color = color;
      this.grids[coord[0]][coord[1]].covered.opacity = 1;
      this.grids[coord[0]][coord[1]].occupiedId = id;
      this.grids[coord[0]][coord[1]].occupiedUnitType = type;
    });

    blockManager.shiftBlock();
  }

  public update() {
    super.update();
    // Handle timeline movement
    if (!this.timeline.isActive) return;
    if (this.timeline.x >= MAX_X) return;
    this.timeline.x += 0.3;

    // Check block
    const currentCol = Math.floor(this.timeline.x / TIMELINE_GRID_SIZE);
    if (currentCol >= COL) return;
    if (this.timeline.scanned.has(currentCol)) return;
    this.timeline.scanned.add(currentCol);
    this.scanGridsCol(currentCol);
  }
}

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
