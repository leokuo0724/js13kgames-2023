import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class MongolInfantry extends BaseAttackUnit {
  protected main: Sprite;
  protected shield: Sprite;
  protected sword: Sprite;

  constructor({
    camp,
    moveSpeed = 10,
    moveRate = 10,
    health = 10,
    attackRange = 80,
    attackRate = 60,
    attackUnit = 1,
  }: {
    camp: UnitCamp;
    moveSpeed?: number;
    moveRate?: number;
    health?: number;
    attackRange?: number;
    attackRate?: number;
    attackUnit?: number;
  }) {
    const isAlly = camp === "ally";
    super({
      camp,
      type: "infantry",
      moveSpeed,
      moveRate,
      health,
      attackRange,
      attackRate,
      attackUnit,
    });
    this.shield = new CustomSprite({
      assetId: ASSET_IDS.SHIELD,
      x: isAlly ? 12 : -12,
      y: -18,
      anchor: { x: 0.5, y: 0.5 },
      scaleX: isAlly ? 1 : -1,
    });
    this.main = new CustomSprite({
      assetId: isAlly ? ASSET_IDS.MONGOL : ASSET_IDS.EUROPE,
      anchor: { x: 0.5, y: 1 },
      scaleX: isAlly ? 1 : -1,
    });
    this.sword = new CustomSprite({
      assetId: ASSET_IDS.SWORD,
      x: isAlly ? -10 : 10,
      y: -18,
      anchor: { x: 0, y: 1 },
      scaleX: isAlly ? 1 : -1,
      attack: function () {
        this.rotation! = isAlly ? 0.4 : -0.4;
        setTimeout(() => (this.rotation! = isAlly ? 0.8 : -0.8), 25);
        setTimeout(() => (this.rotation! = isAlly ? 1 : 1), 50);
        setTimeout(() => (this.rotation! = 0), 100);
      },
    });

    this.addChild([this.shield, this.main, this.sword, this.healthBar]);
    this.x = isAlly ? 0 : this.context.canvas.width;
  }

  protected placeHealthBar() {
    this.healthBar.x = this.camp === "ally" ? -12 : -18;
  }
  protected attackAnim() {
    this.sword.attack();
  }
}
