import { Text, on } from "kontra";
import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { GameManager } from "./game-manager";

const DISPLAY_GRID_SIZE = 34;
const DISPLAY_ROW = 4;

export class DisplayBoard extends Board {
  /** 4x4 2D array */
  public type: "current" | "next";
  protected unitTypeText: Text;

  constructor(type: "current" | "next") {
    super(
      DISPLAY_ROW,
      DISPLAY_ROW,
      DISPLAY_GRID_SIZE,
      type === "current" ? "Current" : "Next",
      "display"
    );
    this.type = type;
    this.x = this.type === "current" ? 866 : 1028;

    this.unitTypeText = Text({
      x: 0,
      y: DISPLAY_GRID_SIZE * DISPLAY_ROW + 8,
      color: "#574852",
      text: "",
      font: "12px Verdana",
    });

    this.addChild(this.unitTypeText);

    on(EVENTS.UPDATE_BLOCK, this.onUpdateBlock.bind(this));
  }

  protected onUpdateBlock() {
    const gameManager = GameManager.getInstance();
    const targetIndex = this.type === "current" ? 0 : 1;
    const targetBlock = gameManager.blockData[targetIndex];

    if (targetBlock) {
      const { map, color, type: unitType } = targetBlock;
      this.unitTypeText.text = `Type: ${unitType}`;
      this.setBlock(map, color);
    } else {
      this.unitTypeText.text = "";
      this.clearBlock();
    }
  }

  public clearBlock() {
    this.grids.flat().forEach((grid) => (grid.covered.color = "transparent"));
  }

  public setBlock(map: number[][], color: string) {
    this.clearBlock();
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === 1) this.grids[i][j].covered.color = color;
      }
    }
  }
}

export class NextBlockBoard extends DisplayBoard {
  protected remainText: Text;

  constructor() {
    super("next");

    this.remainText = Text({
      x: DISPLAY_GRID_SIZE * DISPLAY_ROW,
      y: -7,
      text: "",
      color: "#574852",
      font: "12px Verdana",
      anchor: { x: 1, y: 1 },
    });
    this.addChild(this.remainText);
  }

  protected onUpdateBlock() {
    super.onUpdateBlock();
    this.remainText.text = `remain: ${
      GameManager.getInstance().blockData.length
    }`;
  }
}
