import { GameObject } from "kontra";
import { DisplayBoard } from "./display-board";
import { TimelineBoard } from "./timeline-board";

export class StrategyController {
  private group: GameObject[];
  protected timelineBoard: TimelineBoard;
  protected currentBlockBoard: DisplayBoard;
  protected nextBlockBoard: DisplayBoard;

  constructor() {
    this.timelineBoard = new TimelineBoard();
    this.currentBlockBoard = new DisplayBoard("current");
    this.nextBlockBoard = new DisplayBoard("next");
    this.group = [
      this.timelineBoard,
      this.currentBlockBoard,
      this.nextBlockBoard,
    ];

    this.currentBlockBoard.setBlock();
  }

  public update() {
    this.group.forEach((board) => board.update());
  }
  public render() {
    this.group.forEach((board) => board.render());
  }
}
