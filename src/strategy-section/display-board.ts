import { Button, ButtonClass, Text, on } from "kontra";
import { Board } from "./board";
import { EVENTS } from "../constants/events";
import { GameManager } from "./game-manager";
import { BlockMetadata } from "../types/block-metadata";

const DISPLAY_GRID_SIZE = 34;
const DISPLAY_ROW = 4;

class DisplayBoard extends Board {
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
      const { type: unitType } = targetBlock;
      this.unitTypeText.text = `Type: ${unitType}`;
      this.setBlock(targetBlock);
    } else {
      this.unitTypeText.text = "";
      this.clearBlock();
    }
  }

  protected clearBlock() {
    this.grids.flat().forEach((grid) => {
      grid.covered.color = "transparent";
    });
  }

  protected setBlock(targetBlock: BlockMetadata) {
    this.clearBlock();
    const { map, color } = targetBlock;
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === 1) this.grids[i][j].covered.color = color;
      }
    }
  }
}

export class CurrentBlockBoard extends DisplayBoard {
  protected anchorButton: Button;

  constructor() {
    super("current");

    this.anchorButton = new AnchorButton();
    this.anchorButton.onDown = () => {
      GameManager.getInstance().rotateCurrentBlock();
    };
    this.addChild(this.anchorButton);
  }

  protected clearBlock(): void {
    super.clearBlock();
    this.anchorButton.disabled = true;
    this.anchorButton.opacity = 0;
  }

  protected setBlock(targetBlock: BlockMetadata): void {
    super.setBlock(targetBlock);
    const { anchor } = targetBlock;
    this.anchorButton.x = anchor[1] * DISPLAY_GRID_SIZE + DISPLAY_GRID_SIZE / 2;
    this.anchorButton.y = anchor[0] * DISPLAY_GRID_SIZE + DISPLAY_GRID_SIZE / 2;
    this.anchorButton.disabled = false;
    this.anchorButton.opacity = 0.6;
  }
}

class AnchorButton extends ButtonClass {
  constructor() {
    super({
      width: DISPLAY_GRID_SIZE,
      height: DISPLAY_GRID_SIZE,
      disabled: true,
      opacity: 0,
      anchor: { x: 0.5, y: 0.5 },
    });
  }
  public draw() {
    this.context.beginPath();
    this.context.arc(
      DISPLAY_GRID_SIZE / 2,
      DISPLAY_GRID_SIZE / 2,
      5,
      0,
      Math.PI * 2
    );
    this.context.lineWidth = 4;
    this.context.strokeStyle = "#4b3d44";
    this.context.stroke();
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
