import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { EuropeInfantry } from "./europe-intantry";

export class EuropeCavalry extends EuropeInfantry {
  constructor() {
    super();
    this.type = "cavalry";
    this.moveSpeed = -10;
    this.moveRate = 8;
    this.health = 12;
    this.attackUnit = 1.5;

    this.horse = new CustomSprite({
      assetId: ASSET_IDS.HORSE,
      x: 10,
      y: 0,
      scaleX: -1,
    });
    this.children.forEach((child) => {
      if (child.type !== "health-bar") child.y -= 2;
    });

    this.addChild(this.horse);
  }
}
