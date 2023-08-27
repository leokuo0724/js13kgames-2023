import { GameObject, GameObjectClass } from "kontra";
import { HealthBar } from "../health-bar";
import { GENERAL_SCALE } from "../../constants/assets";

type BaseSoliderConfig = {
  camp: UnitCamp;
  type: UnitType;
  moveSpeed: number;
  moveRate: number;
  health: number;
  attackRange: number;
  attackRate: number;
  attackUnit: number;
};

export abstract class BaseAttackUnit
  extends GameObjectClass
  implements IAnimated, IMovableUnit, IAttackUnit
{
  public camp: UnitCamp;
  public type: UnitType;
  public timer = 0;
  public moveSpeed: number;
  public moveRate: number;
  public health: number;
  public attackRange: number;
  public attackRate: number;
  public attackUnit: number;
  public attackTarget: GameObject | null = null;

  protected healthBar: HealthBar;

  constructor({
    camp,
    type,
    moveSpeed,
    moveRate,
    health,
    attackRange,
    attackRate,
    attackUnit,
  }: BaseSoliderConfig) {
    super();
    this.camp = camp;
    this.type = type;
    this.moveSpeed = moveSpeed;
    this.moveRate = moveRate;
    this.health = health;
    this.attackRange = attackRange;
    this.attackRate = attackRate;
    this.attackUnit = attackUnit;

    this.healthBar = new HealthBar({ maxHealth: this.health, camp: this.camp });
    this.healthBar.setScale(1 / GENERAL_SCALE);
    this.setScale(GENERAL_SCALE);
    this.placeHealthBar();
  }

  protected abstract placeHealthBar(): void;
  protected abstract attackAnim(): void;

  public takeDamage(damage: number) {
    if (this.healthBar.health <= 0) return;
    const isDead = this.healthBar.takeDamage(damage);
    if (isDead) this.ttl = 0;
  }

  protected reset() {
    if (this.type !== "castle") {
      // Should not reset castle position
      this.x = this.camp === "ally" ? 0 : this.context.canvas.width;
    }
    this.healthBar.reset();
    this.timer = 0;
    this.attackTarget = null;
  }

  public stop() {
    this.ttl = 0;
    this.reset();
  }

  public respawn() {
    this.ttl = Infinity;
    this.reset();
  }

  protected jump() {
    if (this.moveSpeed === 0) return;
    this.y -= 2;
    setTimeout(() => (this.y += 2), 100);
  }

  protected attack() {
    this.attackAnim();
    setTimeout(() => {
      if (!this.attackTarget) return;
      this.attackTarget.takeDamage(this.attackUnit);
      if (!this.attackTarget?.isAlive()) this.attackTarget = null;
    }, 50);
  }

  public update() {
    if (!this.isAlive()) return;
    this.timer++;
    if (this.timer % this.moveRate === 0 && !this.attackTarget) {
      this.x += this.moveSpeed;
      this.jump();
    }
    if (this.attackTarget) {
      if (this.timer % this.attackRate === 0) {
        this.jump();
        this.attack();
      }
    }
    // deal with boundary
    if (this.camp === "ally" && this.x >= this.context.canvas.width) {
      this.ttl = 0;
    }
    if (this.camp === "enemy" && this.x <= 0) {
      this.ttl = 0;
    }
  }
}
