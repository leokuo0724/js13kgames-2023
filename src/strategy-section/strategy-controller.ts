import { GameObject } from "kontra";
import { CurrentBlockBoard, NextBlockBoard } from "./display-board";
import { TimelineBoard } from "./timeline-board";
import { BlockActionButton } from "./block-action-button";

export class StrategyController {
  private group: GameObject[];
  protected timelineBoard: TimelineBoard;
  protected currentBlockBoard: CurrentBlockBoard;
  protected nextBlockBoard: NextBlockBoard;
  protected button: BlockActionButton;

  constructor() {
    this.timelineBoard = new TimelineBoard();
    this.currentBlockBoard = new CurrentBlockBoard();
    this.nextBlockBoard = new NextBlockBoard();
    this.button = new BlockActionButton();
    this.group = [
      this.timelineBoard,
      this.currentBlockBoard,
      this.nextBlockBoard,
      this.button,
    ];
  }

  public update() {
    this.group.forEach((object) => object.update());
  }
  public render() {
    this.group.forEach((object) => object.render());
  }
}
