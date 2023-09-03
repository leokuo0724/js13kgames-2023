import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class EuropeArcher extends BaseAttackUnit {
  protected main: Sprite;
  protected hand: Sprite;
  protected bow: Sprite;

  constructor() {
    super({
      camp: "enemy",
      type: "archer",
      moveSpeed: -5,
      moveRate: 10,
      health: 8,
      attackRange: -200,
      attackRate: 100,
      attackUnit: 1,
    });
    this.hand = new CustomSprite({
      assetId: ASSET_IDS.FIST,
      x: 3,
      y: 6,
      scaleX: -1,
    });
    this.main = new CustomSprite({
      x: 8,
      assetId: ASSET_IDS.EUROPE,
      scaleX: -1,
    });
    this.bow = new CustomSprite({
      assetId: ASSET_IDS.BOW,
      x: 7,
      y: 4,
      scaleX: -1,
      anchor: { x: 0, y: 0.01 },
      attack: function () {
        this.x! += 1;
        this.rotation! += 0.3;
        setTimeout(() => {
          this.x! += 0.5;
          this.rotation! -= 0.1;
        }, 25);
        setTimeout(() => {
          this.x! -= 0.5;
          this.rotation! -= 0.1;
        }, 50);
        setTimeout(() => {
          this.x! -= 1;
          this.rotation! -= 0.1;
        }, 100);
      },
    });

    this.addChild([this.hand, this.main, this.bow, this.healthBar]);
    this.x = this.context.canvas.width;
    this.y = this.context.canvas.height / 2 - 94;
  }

  protected placeHealthBar() {
    this.healthBar.y = 12;
  }

  protected attackAnim() {
    this.bow.attack();
  }
}
