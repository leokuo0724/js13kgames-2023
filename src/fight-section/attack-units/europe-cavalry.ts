import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { EuropeInfantry } from "./europe-intantry";

export class EuropeCavalry extends EuropeInfantry {
  constructor() {
    super({
      moveRate: 8,
      moveSpeed: -10,
      health: 12,
      attackUnit: 1.5,
    });
    this.type = "cavalry";

    this.horse = new CustomSprite({
      assetId: ASSET_IDS.HORSE,
      x: -9,
      scaleX: -1,
      anchor: { x: 0.5, y: 1 },
    });
    this.children.forEach((child) => {
      if (child.type !== "health-bar") child.y -= 8;
    });

    this.addChild(this.horse);
  }
}
