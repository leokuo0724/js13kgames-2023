import { CustomSprite } from "./custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";
import { HealthBar } from "./health-bar";
import { GameObject } from "kontra";

export class EnemyCastle extends CustomSprite implements IAttackUnit {
  public timer = 0;
  public attackTarget: GameObject | null = null;
  public attackRange = -150;
  public attackRate = 30;
  public attackUnit = 5;

  protected healthBar: HealthBar;

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

    this.addChild([this.healthBar]);
  }

  public takeDamage(damage: number) {
    if (this.healthBar.health <= 0) return; // TODO: check win
    this.healthBar.takeDamage(damage);
  }

  public update() {
    if (!this.attackTarget) return;
    this.timer++;
    if (this.timer % this.attackRate === 0) {
      this.attackTarget.takeDamage(5);
    }
  }
}
