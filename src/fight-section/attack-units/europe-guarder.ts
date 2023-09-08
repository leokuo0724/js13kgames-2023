import { Sprite } from "kontra";
import { BaseAttackUnit } from "./base-attack-unit";
import { CustomSprite } from "../custom-sprite";
import { ASSET_IDS } from "../../constants/assets";

export class EuropeGuarder extends BaseAttackUnit {
  protected shell: Sprite;
  protected main: Sprite;

  constructor() {
    super({
      camp: "enemy",
      type: "guarder",
      moveSpeed: -6,
      moveRate: 12,
      health: 20,
      attackRange: -40,
      attackRate: 60,
      attackUnit: 0.5,
    });

    this.shell = new CustomSprite({
      x: -6,
      y: -18,
      scaleX: -1,
      assetId: ASSET_IDS.SHELL,
      anchor: { x: 0.5, y: 0.5 },
      attack: function () {
        this.x! -= 2;
        setTimeout(() => (this.x! += 1), 25);
        setTimeout(() => (this.x! += 0.5), 50);
        setTimeout(() => (this.x! += 0.5), 100);
      },
    });
    this.main = new CustomSprite({
      x: 8,
      assetId: ASSET_IDS.EUROPE,
      scaleX: -1,
      anchor: { x: 0.5, y: 1 },
    });
    this.fist = new CustomSprite({
      assetId: ASSET_IDS.FIST,
      x: 18,
      y: -21,
      scaleX: -1,
    });

    this.addChild([this.shell, this.main, this.healthBar, this.fist]);
    this.x = this.context.canvas.width;
  }

  protected placeHealthBar() {
    this.healthBar.x = -10;
  }
  protected attackAnim() {
    this.shell.attack();
  }
}
