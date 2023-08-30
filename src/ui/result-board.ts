import { Sprite, SpriteClass, Text } from "kontra";
import { CTAButton } from "./cta-button";
import { BlockManager } from "../strategy-section/block-manager";

export class ResultBoard extends SpriteClass {
  constructor() {
    super({
      color: "#d2c9a5",
      anchor: { x: 0.5, y: 0.5 },
      opacity: 0.3,
    });
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.x = this.context.canvas.width / 2;
    this.y = this.context.canvas.height / 2;

    const board = Sprite({
      anchor: { x: 0.5, y: 0.5 },
      color: "#4b726e",
      width: 300,
      height: 200,
    });

    const text = Text({
      anchor: { x: 0.5, y: 0.5 },
      text: "Victory",
      font: "24px Verdana",
      color: "#d2c9a5",
      y: -64,
    });

    const button = new ConfirmButton();
    this.addChild([board, text, button]);
  }
}

class ConfirmButton extends CTAButton {
  constructor() {
    super({
      colorScheme: { normal: "#8caba1", hover: "#6e8e82", pressed: "#6e8e82" },
    });
    this.text = "next";
    this.y = 64;
  }

  public onDown() {
    BlockManager.getInstance().setState("prepare");
  }
}
