import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class Archer extends BaseAttackUnit {
  protected main: Sprite;
  protected hand: Sprite;
  protected bow: Sprite;

  constructor({ camp }: { camp: UnitCamp }) {
    const isAlly = camp === "ally";
    super({
      camp,
      type: "archer",
      moveSpeed: isAlly ? 10 : -5,
      moveRate: 10,
      health: 8,
      attackRange: isAlly ? 200 : -200,
      attackRate: 100,
      attackUnit: isAlly ? 1.5 : 1,
    });
    this.hand = new CustomSprite({
      assetId: ASSET_IDS.FIST,
      x: isAlly ? 10 : -10,
      y: -20,
      scaleX: isAlly ? 1 : -1,
    });
    this.main = new CustomSprite({
      assetId: isAlly ? ASSET_IDS.MONGOL : ASSET_IDS.EUROPE,
      scaleX: isAlly ? 1 : -1,
      anchor: { x: 0.5, y: 1 },
    });
    this.bow = new CustomSprite({
      assetId: ASSET_IDS.BOW,
      x: isAlly ? -10 : 10,
      y: -18,
      scaleX: isAlly ? 1 : -1,
      anchor: { x: 0, y: 0.5 },
      attackAnim: function (x: number, rotation: number) {
        const isAlly = this.camp === "ally";
        isAlly ? (this.x! += x) : (this.x! -= x);
        isAlly ? (this.rotation! += rotation) : (this.rotation! -= rotation);
      },
      attack: function () {
        this.attackAnim(-1, -0.3);
        setTimeout(() => {
          this.attackAnim(-0.5, 0.1);
        }, 25);
        setTimeout(() => {
          this.attackAnim(0.5, 0.1);
        }, 50);
        setTimeout(() => {
          this.attackAnim(1, 0.1);
        }, 100);
      },
    });

    this.addChild([this.hand, this.main, this.bow, this.healthBar]);
    this.x = isAlly ? 0 : this.context.canvas.width;
  }

  protected placeHealthBar() {
    this.healthBar.x = this.camp === "ally" ? -12 : -18;
  }

  protected attackAnim() {
    this.bow.attack();
  }
}
