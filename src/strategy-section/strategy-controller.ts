import { GameObject } from "kontra";
import { DisplayBoard } from "./display-board";
import { TimelineBoard } from "./timeline-board";
import { BlockManager } from "./block-manager";

export class StrategyController {
  private group: GameObject[];
  protected timelineBoard: TimelineBoard;
  protected currentBlockBoard: DisplayBoard;
  protected nextBlockBoard: DisplayBoard;
  protected blockManager: BlockManager = BlockManager.getInstance();

  constructor() {
    this.timelineBoard = new TimelineBoard();
    this.currentBlockBoard = new DisplayBoard("current");
    this.nextBlockBoard = new DisplayBoard("next");
    this.group = [
      this.timelineBoard,
      this.currentBlockBoard,
      this.nextBlockBoard,
    ];

    this.blockManager.reload();
  }

  public update() {
    this.group.forEach((board) => board.update());
  }
  public render() {
    this.group.forEach((board) => board.render());
  }
}
