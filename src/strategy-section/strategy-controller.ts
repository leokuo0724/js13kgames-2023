import { GameObject } from "kontra";
import { DisplayBoard } from "./display-board";
import { TimelineBoard } from "./timeline-board";
import { BlockManager } from "./block-manager";
import { CTAButton } from "./cta-button";

export class StrategyController {
  private group: GameObject[];
  protected timelineBoard: TimelineBoard;
  protected currentBlockBoard: DisplayBoard;
  protected nextBlockBoard: DisplayBoard;
  protected blockManager: BlockManager = BlockManager.getInstance();
  protected button: CTAButton;

  constructor() {
    this.timelineBoard = new TimelineBoard();
    this.currentBlockBoard = new DisplayBoard("current");
    this.nextBlockBoard = new DisplayBoard("next");
    this.button = new CTAButton();
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
