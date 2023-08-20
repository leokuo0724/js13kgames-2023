import { GameObject, GameObjectClass, Sprite } from "kontra";

export class Background extends GameObjectClass {
  protected bg: GameObject;

  constructor() {
    super();
    this.bg = Sprite({
      x: 0,
      y: 0,
      color: "#8caba1",
      width: this.context.canvas.width,
      height: this.context.canvas.height / 2,
    });

    this.ground = Sprite({
      color: "#b3a555",
      y: this.context.canvas.height / 2 - 8,
      width: this.context.canvas.width,
      height: 8,
    });

    this.addChild([this.bg, this.ground]);
  }
}
