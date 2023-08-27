import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class EuropeInfantry extends BaseAttackUnit {
  protected main: Sprite;
  protected shield: Sprite;
  protected sword: Sprite;

  constructor() {
    super({
      camp: "enemy",
      type: "infantry",
      moveSpeed: -5,
      moveRate: 10,
      health: 15,
      attackRange: -50,
      attackRate: 60,
      attackUnit: 1,
    });
    this.shield = new CustomSprite({
      assetId: ASSET_IDS.SHIELD,
      x: 5,
      y: 3,
      scaleX: -1,
    });
    this.main = new CustomSprite({
      x: 8,
      assetId: ASSET_IDS.EUROPE,
      scaleX: -1,
    });
    this.sword = new CustomSprite({
      assetId: ASSET_IDS.SWORD,
      x: 7.5,
      y: 6,
      scaleX: -1,
      anchor: { x: 0, y: 0.05 },
      attack: function () {
        this.rotation! = -0.4;
        setTimeout(() => (this.rotation! = -0.8), 25);
        setTimeout(() => (this.rotation! = -1), 50);
        setTimeout(() => (this.rotation! = 0), 100);
      },
    });

    this.addChild([this.shield, this.main, this.sword, this.healthBar]);
    this.x = this.context.canvas.width;
    this.y = this.context.canvas.height / 2 - 94;
  }

  protected placeHealthBar() {
    this.healthBar.y = 12;
  }

  protected attackAnim() {
    this.sword.attack();
  }
}
