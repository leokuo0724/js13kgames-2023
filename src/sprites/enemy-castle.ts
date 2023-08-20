import { GameObjectClass, Sprite } from "kontra";
import { CustomSprite } from "./custom-sprite";
import { ASSET_IDS } from "../constants/assets";

export class EnemyCastle extends GameObjectClass {
  protected blood: number = 100;

  protected castle: Sprite;

  constructor() {
    super();
    this.castle = new CustomSprite({
      assetId: ASSET_IDS.CASTLE,
      x: this.context.canvas.width - 58,
      y: this.context.canvas.height / 2 - 146,
      scaleX: 4,
      scaleY: 4,
    });

    this.addChild(this.castle);
  }
}
