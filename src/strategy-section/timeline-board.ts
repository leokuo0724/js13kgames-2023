import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { Sprite, Text, emit, on } from "kontra";
import { GameManager } from "./game-manager";
import { BlockMetadata } from "../types/block-metadata";
import { Timeline } from "./timeline";
import {
  TIMELINE_COL,
  TIMELINE_GRID_SIZE,
  TIMELINE_ROW,
} from "../constants/board";

export class TimelineBoard extends Board {
  protected currentOveredCoord: [number, number] | null = null;
  protected timeline: Sprite;
  protected perfectText: Text;

  protected ifAnyLocked: boolean = false;

  constructor() {
    super(
      TIMELINE_COL,
      TIMELINE_ROW,
      TIMELINE_GRID_SIZE,
      "Strategy Board",
      "interact"
    );
    this.x = 36;

    this.timeline = new Timeline({
      width: 2,
      height: TIMELINE_GRID_SIZE * TIMELINE_ROW,
    });
    this.perfectText = Text({
      text: "Perfect!",
      font: "24px Verdana",
      color: "white",
      anchor: { x: 0.5, y: 0.5 },
      x: (TIMELINE_GRID_SIZE * TIMELINE_COL) / 2,
      y: (TIMELINE_GRID_SIZE * TIMELINE_ROW) / 2,
      opacity: 0,
    });
    this.addChild([this.timeline, this.perfectText]);

    on(EVENTS.ON_GRID_OVER, this.onGridOver.bind(this));
    on(EVENTS.PLACE_BLOCK, this.onPlaceBlock.bind(this));
    on(EVENTS.UPDATE_BLOCK, () => {
      this.onGridOver(this.currentOveredCoord);
    });
    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
    on(EVENTS.COL_SCANNED, this.onColScanned.bind(this));
    on(EVENTS.FINAL_COL_SCANNED, this.onFinalColScanned.bind(this));
    on(EVENTS.FIX_GRIDS, this.fixGrids.bind(this));
  }

  protected onStateChange(state: GameState) {
    if (state === "prepare") {
      this.timeline.reset();
      this.grids.flat().forEach((grid) => {
        grid.reset();
      });
      this.clearCoveredGrid();
    }
    if (state === "fight") {
      this.timeline.start();
    }
  }

  protected onColScanned(col: number) {
    const blockIds = new Set();
    for (let i = 0; i < this.grids.length; i++) {
      const grid = this.grids[i][col];
      if (grid.isScanned || grid.locked || blockIds.has(grid.occupiedId))
        continue;
      if (!grid.occupiedId && !grid.occupiedUnitType) {
        grid.setLocked();
        this.ifAnyLocked = true;
        continue;
      }
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

  protected onFinalColScanned() {
    if (!this.ifAnyLocked) {
      // Perfect
      emit(EVENTS.PERFECT_MATCH);
      this.perfectText.opacity = 1;
      setTimeout(() => {
        this.perfectText.opacity = 0;
      }, 1000);
    }
    this.ifAnyLocked = false;
  }

  protected clearCoveredGrid() {
    this.currentOveredCoord = null;
    this.grids.flat().forEach((grid) => {
      if (!grid.occupiedId && !grid.locked) {
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
          if (this.grids[x][y].occupiedId || this.grids[x][y].locked) return [];
          coords.push([x, y]);
        }
      }
    }
    return coords;
  }

  protected onGridOver(coord: [number, number] | null) {
    if (!coord) return;
    this.clearCoveredGrid();

    const gameManager = GameManager.getInstance();
    const currentBlockMetadata = gameManager.blockData[0];
    if (!currentBlockMetadata) return;

    this.currentOveredCoord = coord;
    const coords = this.getRelativeCoords(coord, currentBlockMetadata);
    const { color } = currentBlockMetadata;
    for (const coord of coords) {
      if (this.grids[coord[0]][coord[1]].locked) continue;
      this.grids[coord[0]][coord[1]].covered.color = color;
      this.grids[coord[0]][coord[1]].covered.opacity = 1;
    }
  }

  protected onPlaceBlock(coord: [number, number]) {
    const gameManager = GameManager.getInstance();
    const currentBlockMetadata = gameManager.blockData[0];
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

    gameManager.shiftBlock();
  }

  protected fixGrids(count: number) {
    let counter = 0;
    for (const grid of this.grids.flat()) {
      if (counter === count) break;
      if (grid.locked) {
        grid.setUnlocked();
        counter++;
      }
    }
  }
}

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
