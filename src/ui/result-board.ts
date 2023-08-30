import { Sprite, SpriteClass, Text } from "kontra";

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
    this.addChild([board, text]);
  }
}
