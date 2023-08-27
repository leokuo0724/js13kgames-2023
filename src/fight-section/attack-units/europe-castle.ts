import { Sprite, getWorldRect } from "kontra";
import { BaseAttackUnit } from "./base-attack-unit";
import { CustomSprite } from "../custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../../constants/assets";

export class EuropeCastle extends BaseAttackUnit {
  protected main: Sprite;
  protected particle: Sprite;

  constructor() {
    super({
      camp: "enemy",
      type: "castle",
      moveSpeed: 0,
      moveRate: 0,
      health: 100,
      attackRange: -200,
      attackRate: 40,
      attackUnit: 1,
    });

    this.main = new CustomSprite({
      assetId: ASSET_IDS.CASTLE,
    });
    this.particle = Sprite({
      x: 5,
      y: 11,
      width: 1,
      height: 1,
      color: "#4b3d44",
      opacity: 0,
      reset: () => {
        this.particle.x = 5;
        this.particle.y = 11;
        this.particle.opacity = 0;
      },
    });

    this.addChild([this.main, this.healthBar, this.particle]);
    this.y = this.context.canvas.height / 3 - 116;
    this.x = this.context.canvas.width - 88;
  }

  protected placeHealthBar() {
    this.healthBar.x = 2;
    this.healthBar.y = 27;
  }

  protected attackAnim() {
    if (!this.attackTarget) return;
    const particleRect = getWorldRect(this.particle);
    const deltaX = particleRect.x - this.attackTarget.x - 24;
    const deltaY = particleRect.y - this.attackTarget.y - 24;
    const fly = () => {
      this.particle.x -= deltaX / 3 / GENERAL_SCALE;
      this.particle.y -= deltaY / 3 / GENERAL_SCALE;
    };

    this.particle.opacity = 1;
    setTimeout(fly, 20);
    setTimeout(fly, 40);
    setTimeout(fly, 60);
    setTimeout(() => {
      this.particle.reset();
      this.attackTarget?.takeDamage(this.attackUnit);
      if (!this.attackTarget?.isAlive()) this.attackTarget = null;
    }, 61);
  }

  public takeDamage(damage: number): void {
    super.takeDamage(damage);
    // check win
    if (this.healthBar.health <= 0) {
      console.log("You win!");
    }
  }
}
