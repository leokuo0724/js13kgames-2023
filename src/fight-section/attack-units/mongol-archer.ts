import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class MongolArcher extends BaseAttackUnit {
  protected main: Sprite;
  protected hand: Sprite;
  protected bow: Sprite;

  constructor() {
    super({
      camp: "ally",
      type: "archer",
      moveSpeed: 10,
      moveRate: 10,
      health: 8,
      attackRange: 200,
      attackRate: 100,
      attackUnit: 1.5,
    });
    this.hand = new CustomSprite({
      assetId: ASSET_IDS.FIST,
      x: 22,
      y: 27,
    });
    this.main = new CustomSprite({
      assetId: ASSET_IDS.MONGOL,
    });
    this.bow = new CustomSprite({
      assetId: ASSET_IDS.BOW,
      x: 2,
      y: 28,
      anchor: { x: 0, y: 0.5 },
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

    this.addChild([this.hand, this.main, this.bow, this.healthBar]);
    this.y = this.context.canvas.height / 3 - 2;
  }

  protected placeHealthBar() {
    this.healthBar.y = 52;
  }

  protected attackAnim() {
    this.bow.attack();
  }
}
