import { Sprite, SpriteClass } from "kontra";

export class HealthBar extends SpriteClass {
  public maxHealth: number;
  public health: number;
  protected inner: Sprite;

  constructor(x: number, y: number, maxHealth: number) {
    super({
      x,
      y,
      width: 60,
      height: 16,
      color: "#4d3d44",
    });
    this.maxHealth = maxHealth;
    this.health = maxHealth;

    let innerBg = Sprite({
      x: 3,
      y: 3,
      width: 54,
      height: 10,
      color: "#ab9b8e",
    });
    this.inner = Sprite({
      x: 3,
      y: 3,
      width: 54,
      height: 10,
      color: "#79444a",
    });
    this.addChild([innerBg, this.inner]);
  }

  public reset() {
    this.health = this.maxHealth;
    this.updateHealth();
  }

  public takeDamage(damage: number): boolean {
    this.health -= damage;
    this.updateHealth();
    return this.health <= 0 ? true : false;
  }

  private updateHealth() {
    this.inner.width = (this.health / this.maxHealth) * 54;
  }
}
