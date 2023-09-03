import { GameObjectClass, Sprite } from "kontra";
import { CustomSprite } from "../fight-section/custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";

export class Background extends GameObjectClass {
  constructor() {
    super();
    const bg = Sprite({
      x: 0,
      y: 0,
      color: "#8caba1",
      width: this.context.canvas.width,
      height: this.context.canvas.height / 2,
    });

    const ground = Sprite({
      color: "#b3a555",
      y: this.context.canvas.height / 2 - 8,
      width: this.context.canvas.width,
      height: 8,
    });

    const cloud0 = new Cloud({ x: 100, y: 30, speed: 0.2 });
    const cloud1 = new Cloud({ x: 500, y: 90, speed: 0.1, scale: 1.3 });
    const cloud2 = new Cloud({ x: 900, y: 60, speed: 0.15 });
    const cloud3 = new Cloud({ x: -100, y: 80, speed: 0.1, scale: 0.6 });

    this.addChild([bg, ground, cloud0, cloud1, cloud2, cloud3]);
  }
}

class Cloud extends CustomSprite {
  protected speed: number;

  constructor({
    x,
    y,
    speed = 0.5,
    scale = 1,
  }: {
    x: number;
    y: number;
    speed: number;
    scale?: number;
  }) {
    super({ x, y, assetId: ASSET_IDS.CLOUD });
    this.setScale(GENERAL_SCALE * scale);
    this.width = 100;
    this.speed = speed;
  }

  public update() {
    super.update();
    if (this.x! > this.context.canvas.width) {
      this.x = -this.width;
    }
    this.x += this.speed;
  }
}
