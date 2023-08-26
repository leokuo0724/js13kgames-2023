import { ButtonClass } from "kontra";
import { BlockManager } from "./block-manager";

export class CTAButton extends ButtonClass {
  constructor() {
    super({
      anchor: { x: 0.5, y: 0.5 },
      text: {
        text: "waive",
        color: "white",
        font: "16px sans-serif",
        anchor: { x: 0.5, y: 0.5 },
      },
      width: 100,
      height: 36,
    });

    this.x = this.context.canvas.width - 88;
    this.y = this.context.canvas.height - 50;
  }

  public draw() {
    super.draw();
    this.context.fillStyle = this.pressed
      ? "#79444a"
      : this.hovered
      ? "#ae5d40"
      : "#c77b58";
    this.context.fillRect(0, 0, this.width, this.height);
  }

  public onDown() {
    const blockManager = BlockManager.getInstance();
    blockManager.shiftBlock();
  }
}
