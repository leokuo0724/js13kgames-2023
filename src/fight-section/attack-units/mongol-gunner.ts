import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class MongolGunner extends BaseAttackUnit {
  protected main: Sprite;
  protected gun: Sprite;

  constructor() {
    super({
      camp: "ally",
      type: "gunner",
      moveSpeed: 10,
      moveRate: 10,
      health: 6,
      attackRange: 250,
      attackRate: 120,
      attackUnit: 2,
    });

    this.main = new CustomSprite({
      assetId: ASSET_IDS.MONGOL,
    });
    this.gun = new CustomSprite({
      x: 0.5,
      y: 8.5,
      assetId: ASSET_IDS.GUN,
      anchor: { x: 0, y: 0.01 },
      attack: function () {
        this.x! -= 1;
        this.rotation! -= 0.3;
        setTimeout(() => {
          this.x! -= 0.5;
          this.rotation! += 0.1;
        }, 25);
        setTimeout(() => {
          this.x! += 0.5;
          this.rotation! += 0.1;
        }, 50);
        setTimeout(() => {
          this.x! += 1;
          this.rotation! += 0.1;
        }, 100);
      },
    });

    this.addChild([this.main, this.gun, this.healthBar]);
    this.y = this.context.canvas.height / 3 - 2;
  }

  protected placeHealthBar() {
    this.healthBar.y = 12.8;
  }
  protected attackAnim() {
    this.gun.attack();
  }

  update() {
    super.update();
    // this.gun.attack();
  }
}
