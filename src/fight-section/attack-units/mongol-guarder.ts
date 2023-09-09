import { Sprite } from "kontra";
import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { BaseAttackUnit } from "./base-attack-unit";

export class MongolGuarder extends BaseAttackUnit {
  protected shell: Sprite;
  protected main: Sprite;

  constructor({ camp }: { camp: UnitCamp }) {
    const isAlly = camp === "ally";
    super({
      camp,
      type: "guarder",
      moveSpeed: isAlly ? 6 : -6,
      moveRate: 12,
      health: 20,
      attackRange: isAlly ? 60 : -60,
      attackRate: 60,
      attackUnit: 0.5,
    });

    this.shell = new CustomSprite({
      x: isAlly ? 14 : -6,
      y: -20,
      assetId: ASSET_IDS.SHELL,
      scaleX: isAlly ? 1 : -1,
      anchor: { x: 0.5, y: 0.5 },
      attack: function () {
        this.x! += 6;
        setTimeout(() => (this.x! -= 3), 25);
        setTimeout(() => (this.x! -= 2), 50);
        setTimeout(() => (this.x! -= 1), 100);
      },
    });
    this.main = new CustomSprite({
      x: isAlly ? 0 : 8,
      assetId: isAlly ? ASSET_IDS.MONGOL : ASSET_IDS.EUROPE,
      scaleX: isAlly ? 1 : -1,
      anchor: { x: 0.5, y: 1 },
    });
    this.fist = new CustomSprite({
      assetId: ASSET_IDS.FIST,
      x: isAlly ? -9 : 18,
      y: -21,
      scaleX: isAlly ? 1 : -1,
    });

    this.addChild([this.shell, this.main, this.healthBar, this.fist]);
    this.x = isAlly ? 0 : this.context.canvas.width;
  }

  protected placeHealthBar() {
    this.healthBar.x = this.camp === "ally" ? -12 : -10;
  }
  protected attackAnim() {
    this.shell.attack();
  }
}
