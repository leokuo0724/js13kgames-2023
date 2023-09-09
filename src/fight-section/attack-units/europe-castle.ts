import { Sprite, getWorldRect } from "kontra";
import { BaseAttackUnit } from "./base-attack-unit";
import { CustomSprite } from "../custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../../constants/assets";
import { GameManager } from "../../strategy-section/game-manager";

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
      attackRange: -300,
      attackRate: 40,
      attackUnit: 1,
    });

    this.main = new CustomSprite({
      assetId: ASSET_IDS.CASTLE,
      anchor: { x: 0.5, y: 1 },
    });
    this.particle = Sprite({
      y: -60,
      width: 5,
      height: 5,
      color: "#4b3d44",
      opacity: 0,
      anchor: { x: 0.5, y: 0.5 },
      reset: () => {
        this.particle.x = 0;
        this.particle.y = -60;
        this.particle.opacity = 0;
      },
    });

    this.addChild([this.main, this.healthBar, this.particle]);
    this.x = this.context.canvas.width - 44;
  }

  protected placeHealthBar() {
    this.healthBar.x = -12;
  }

  protected attackAnim() {
    if (!this.attackTarget) return;
    const particleRect = getWorldRect(this.particle);
    const targetRect = getWorldRect(this.attackTarget);
    const deltaX = particleRect.x - targetRect.x;
    const deltaY = particleRect.y - (targetRect.y - 40);
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
      GameManager.getInstance().setState("victory");
    }
  }
}
