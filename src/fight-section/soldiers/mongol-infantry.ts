import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseSolider } from "./base-soldier";

export class MongolInfantry extends BaseSolider {
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
      attackRange: 50,
      attackRate: 60,
      attackUnit: 1,
    });
    this.shield = new CustomSprite({
      assetId: ASSET_IDS.SHIELD,
      x: 3,
      y: 4,
    });
    this.main = new CustomSprite({
      assetId: ASSET_IDS.MONGOL,
    });
    this.sword = new CustomSprite({
      assetId: ASSET_IDS.SWORD,
      x: 1,
      y: 10,
      anchor: { x: 0, y: 0.07 },
      attack: function () {
        this.rotation! = 0.4;
        setTimeout(() => (this.rotation! = 0.8), 25);
        setTimeout(() => (this.rotation! = 1), 50);
        setTimeout(() => (this.rotation! = 0), 100);
      },
    });

    this.addChild([this.shield, this.main, this.sword, this.healthBar]);
    this.y = this.context.canvas.height / 3 - 2;
  }

  protected placeHealthBar() {
    this.healthBar.y = 12.8;
  }

  protected attackAnim() {
    this.sword.attack();
  }
}
