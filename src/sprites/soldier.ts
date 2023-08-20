import { GameObject, GameObjectClass, Sprite } from "kontra";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";
import { CustomSprite } from "./custom-sprite";
import { HealthBar } from "./health-bar";

export class BaseSolider extends GameObjectClass {
  protected timer: number = 0;
  protected moveSpeed: number = 10;
  protected moveRate: number = 60;
  protected attackRange: number = 50; // width + range\
  protected attackTarget: GameObject | null = null;
  protected attackRate: number = 60;

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

  public update() {
    this.timer++;
    if (this.timer % 10 === 0 && !this.attackTarget) {
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
