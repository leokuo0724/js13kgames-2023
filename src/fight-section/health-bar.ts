import { Sprite, SpriteClass } from "kontra";

export class HealthBar extends SpriteClass {
  public maxHealth: number;
  public health: number;
  protected inner: Sprite;

  constructor({
    maxHealth,
    camp = "ally",
  }: {
    maxHealth: number;
    camp: UnitCamp;
  }) {
    super({
      width: 60,
      height: 16,
      color: "#4d3d44",
    });
    this.type = "health-bar";
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
      color: camp === "ally" ? "#ae5d40" : "#927441",
    });
    this.addChild([innerBg, this.inner]);
  }

  public updateMaxHealth(maxHealth: number) {
    this.maxHealth = maxHealth;
    this.health = maxHealth;
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
