import { GameObject, GameObjectClass, Sprite } from "kontra";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";
import { CustomSprite } from "./custom-sprite";
import { HealthBar } from "./health-bar";

export class BaseSolider
  extends GameObjectClass
  implements IAnimated, IAttackUnit, IAttackUnit
{
  public timer = 0;
  public moveSpeed = 10;
  public moveRate = 10;
  public attackRange = 50; // width + range
  public attackRate = 60;
  public attackUnit = 1;
  public attackTarget: GameObject | null = null;

  protected main: Sprite;
  protected shield: Sprite;
  protected sword: Sprite;
  protected healthBar: HealthBar;

  constructor() {
    super();
    this.shield = new CustomSprite({
      assetId: ASSET_IDS.SHIELD,
      x: 4,
      y: 5,
    });
    this.main = new CustomSprite({
      assetId: ASSET_IDS.MONGOL,
    });
    this.sword = new CustomSprite({
      assetId: ASSET_IDS.SWORD,
      x: 1,
      y: 10,
      anchor: { x: 0, y: 0.07 },
      attack: function () {
        this.rotation! = 0.4;
        setTimeout(() => (this.rotation! = 0.8), 25);
        setTimeout(() => (this.rotation! = 1), 50);
        setTimeout(() => (this.rotation! = 0), 100);
      },
    });
    this.healthBar = new HealthBar(0, 17, 10);
    this.healthBar.setScale(1 / GENERAL_SCALE);
    this.setScale(GENERAL_SCALE);

    this.addChild([this.shield, this.main, this.sword, this.healthBar]);
    this.y = 152;
  }

  protected jump() {
    this.y -= 2;
    setTimeout(() => (this.y += 2), 100);
  }

  protected attack() {
    this.sword.attack();
  }

  public takeDamage(damage: number) {
    if (this.healthBar.health <= 0) return; // TODO: check die
    this.healthBar.takeDamage(damage);
  }

  public update() {
    this.timer++;
    if (this.timer % this.moveRate === 0 && !this.attackTarget) {
      this.x += this.moveSpeed;
      this.jump();
    }
    if (this.attackTarget) {
      if (this.timer % this.attackRate === 0) {
        this.attack();
        this.jump();
        this.attackTarget.takeDamage(1);
      }
    }
  }
}
