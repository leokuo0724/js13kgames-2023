import { GameObjectClass, Sprite } from "kontra";
import { ASSET_IDS } from "../constants/assets";
import { CustomSprite } from "./custom-sprite";
import { HealthBar } from "./health-bar";

const SCALE = 4;
export class BaseSolider extends GameObjectClass {
  protected timer: number = 0;

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
    this.healthBar.setScale(1 / SCALE);
    this.setScale(SCALE);

    this.addChild([this.shield, this.main, this.sword, this.healthBar]);
    this.y = 152;
  }

  public update() {
    // this.sword.rotation += 0.1;
    // this.timer++;
    // if (this.timer % 60 === 0) {
    //   this.x += 10;
    // }
  }
}
