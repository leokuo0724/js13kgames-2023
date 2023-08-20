import { GameObjectClass, Sprite } from "kontra";
import { CustomSprite } from "./custom-sprite";
import { ASSET_IDS } from "../constants/assets";
import { HealthBar } from "./health-bar";

export class EnemyCastle extends GameObjectClass {
  protected healthBar: HealthBar;

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

    this.healthBar = new HealthBar(this.castle.x - 2, this.castle.y + 142, 100);

    this.addChild([this.castle, this.healthBar]);
  }
}
