import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class MongolGuarder extends BaseAttackUnit {
  protected shell: Sprite;
  protected main: Sprite;

  constructor() {
    super({
      camp: "ally",
      type: "guarder",
      moveSpeed: 6,
      moveRate: 12,
      health: 20,
      attackRange: 40,
      attackRate: 60,
      attackUnit: 0.5,
    });

    this.shell = new CustomSprite({
      x: 3.5,
      y: 2,
      assetId: ASSET_IDS.SHELL,
      attack: function () {
        this.x! += 2;
        setTimeout(() => (this.x! -= 1), 25);
        setTimeout(() => (this.x! -= 0.5), 50);
        setTimeout(() => (this.x! -= 0.5), 100);
      },
    });
    this.main = new CustomSprite({
      assetId: ASSET_IDS.MONGOL,
    });
    this.fist = new CustomSprite({
      assetId: ASSET_IDS.FIST,
      x: 1,
      y: 7,
    });

    this.addChild([this.shell, this.main, this.healthBar, this.fist]);
    this.y = this.context.canvas.height / 3 - 2;
  }

  protected placeHealthBar() {
    this.healthBar.y = 12.8;
  }
  protected attackAnim() {
    this.shell.attack();
  }
}
