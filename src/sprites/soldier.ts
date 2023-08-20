import { GameObjectClass, Sprite } from "kontra";
import { ASSET_IDS } from "../constants/assets";
import { CustomSprite } from "./custom-sprite";

export class BaseSolider extends GameObjectClass {
  protected timer: number = 0;
  protected main: Sprite;
  protected shield: Sprite;
  protected sword: Sprite;

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
    });
    this.setScale(4);

    this.addChild([this.shield, this.main, this.sword]);
  }

  public update() {
    // this.sword.rotation += 0.1;
    // this.timer++;
    // if (this.timer % 60 === 0) {
    //   this.x += 10;
    // }
  }
}
