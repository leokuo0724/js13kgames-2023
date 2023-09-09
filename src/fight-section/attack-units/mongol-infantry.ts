import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class MongolInfantry extends BaseAttackUnit {
  protected main: Sprite;
  protected shield: Sprite;
  protected sword: Sprite;

  constructor() {
    super({
      camp: "ally",
      type: "infantry",
      moveSpeed: 10,
      moveRate: 10,
      health: 10,
      attackRange: 80,
      attackRate: 60,
      attackUnit: 1,
    });
    this.shield = new CustomSprite({
      assetId: ASSET_IDS.SHIELD,
      x: 12,
      y: -18,
      anchor: { x: 0.5, y: 0.5 },
    });
    this.main = new CustomSprite({
      assetId: ASSET_IDS.MONGOL,
      anchor: { x: 0.5, y: 1 },
    });
    this.sword = new CustomSprite({
      assetId: ASSET_IDS.SWORD,
      x: -10,
      y: -18,
      anchor: { x: 0, y: 1 },
      attack: function () {
        this.rotation! = 0.4;
        setTimeout(() => (this.rotation! = 0.8), 25);
        setTimeout(() => (this.rotation! = 1), 50);
        setTimeout(() => (this.rotation! = 0), 100);
      },
    });

    this.addChild([this.shield, this.main, this.sword, this.healthBar]);
  }

  protected placeHealthBar() {
    this.healthBar.x = -12;
  }
  protected attackAnim() {
    this.sword.attack();
  }
}
