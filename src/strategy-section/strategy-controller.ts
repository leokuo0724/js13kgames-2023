import { GameObject } from "kontra";
import { DisplayBoard, NextBlockBoard } from "./display-board";
import { TimelineBoard } from "./timeline-board";
import { BlockManager } from "./block-manager";
import { BlockActionButton } from "./block-action-button";

export class StrategyController {
  private group: GameObject[];
  protected timelineBoard: TimelineBoard;
  protected currentBlockBoard: DisplayBoard;
  protected nextBlockBoard: DisplayBoard;
  protected blockManager: BlockManager = BlockManager.getInstance();
  protected button: BlockActionButton;

  constructor() {
    this.timelineBoard = new TimelineBoard();
    this.currentBlockBoard = new DisplayBoard("current");
    this.nextBlockBoard = new NextBlockBoard();
    this.button = new BlockActionButton();
    this.group = [
      this.timelineBoard,
      this.currentBlockBoard,
      this.nextBlockBoard,
      this.button,
    ];

    this.blockManager.reload();
  }

  public update() {
    this.group.forEach((object) => object.update());
  }
  public render() {
    this.group.forEach((object) => object.render());
  }
}
