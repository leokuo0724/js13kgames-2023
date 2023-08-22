import { CustomSprite } from "./custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";
import { HealthBar } from "./health-bar";
import { GameObject, Sprite, getWorldRect } from "kontra";

export class EnemyCastle extends CustomSprite implements IAttackUnit {
  public timer = 0;
  public attackTarget: GameObject | null = null;
  public attackRange = -200;
  public attackRate = 30;
  public attackUnit = 1;

  protected healthBar: HealthBar;
  protected particle: Sprite;

  constructor() {
    super({
      width: 58,
      height: 138,
      assetId: ASSET_IDS.CASTLE,
    });
    this.setScale(GENERAL_SCALE);
    this.x = this.context.canvas.width - this.width;
    this.y = this.context.canvas.height / 2 - this.height - 8;

    this.healthBar = new HealthBar(
      -2 / GENERAL_SCALE,
      142 / GENERAL_SCALE,
      100
    );
    this.healthBar.setScale(1 / GENERAL_SCALE);

    let particleX = this.context.canvas.width - 33;
    let particleY = this.context.canvas.height / 2 - 90;
    this.particle = Sprite({
      x: particleY,
      y: particleX,
      width: 8,
      height: 8,
      color: "#4b3d44",
      opacity: 0,
      reset: () => {
        this.particle.x = particleX;
        this.particle.y = particleY;
        this.opacity = 1;
      },
    });

    this.addChild([this.healthBar]);
  }

  public takeDamage(damage: number) {
    if (this.healthBar.health <= 0) return; // TODO: check win
    this.healthBar.takeDamage(damage);
  }

  public attack() {
    if (!this.attackTarget) return;
    let particleRect = getWorldRect(this.particle);
    let deltaX = particleRect.x - this.attackTarget.x - 24;
    let deltaY = particleRect.y - this.attackTarget.y - 24;

    let fly = () => {
      this.particle.x -= deltaX / 3;
      this.particle.y -= deltaY / 3;
    };

    this.particle.opacity = 1;
    setTimeout(fly, 20);
    setTimeout(fly, 40);
    setTimeout(fly, 60);
    setTimeout(() => {
      this.attackTarget?.takeDamage(this.attackUnit);
      this.particle.reset();
    }, 61);
  }

  public update() {
    super.update();
    if (!this.attackTarget) return;
    this.timer++;
    if (this.timer % this.attackRate === 0) {
      this.attack();
    }
  }
  public render() {
    super.render();
    this.particle.render();
  }
}
