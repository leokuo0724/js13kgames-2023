import { ButtonClass, emit, on } from "kontra";
import { BlockManager } from "./block-manager";
import { EVENTS } from "../constants/events";

export class CTAButton extends ButtonClass {
  constructor() {
    super({
      anchor: { x: 0.5, y: 0.5 },
      text: {
        text: "waive",
        color: "white",
        font: "16px Verdana",
        anchor: { x: 0.5, y: 0.5 },
      },
      width: 100,
      height: 36,
    });

    this.x = this.context.canvas.width - 88;
    this.y = this.context.canvas.height - 50;

    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  public draw() {
    super.draw();
    this.context.fillStyle = this.disabled
      ? "#ab9b8e"
      : this.pressed
      ? "#79444a"
      : this.hovered
      ? "#ae5d40"
      : "#c77b58";
    this.context.fillRect(0, 0, this.width, this.height);
  }

  public onDown() {
    const blockManager = BlockManager.getInstance();
    switch (blockManager.state) {
      case "prepare":
        blockManager.shiftBlock();
        break;
      case "ready":
        emit(EVENTS.ON_START_CLICK);
        break;
      case "fight":
        break;
    }
  }

  protected onStateChange(state: GameState) {
    switch (state) {
      case "prepare":
        this.disabled = false;
        this.text = "waive";
        this.textNode.color = "white";
        break;
      case "ready":
        this.text = "start";
        break;
      case "fight":
        this.disabled = true;
        this.text = "fighting...";
        this.textNode.color = "#d2c9a5";
        break;
    }
  }
}
