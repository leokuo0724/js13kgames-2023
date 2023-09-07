import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { MongolInfantry } from "./mongol-infantry";

export class MongolCavalry extends MongolInfantry {
  constructor() {
    super();
    this.type = "cavalry";
    this.moveSpeed = 12;
    this.moveRate = 8;
    this.health = 12;
    this.attackUnit = 1.5;

    this.horse = new CustomSprite({
      assetId: ASSET_IDS.HORSE,
      x: -6,
      y: 4,
    });
    this.children.forEach((child) => {
      if (child.type !== "health-bar") child.y -= 8;
    });

    this.addChild(this.horse);
  }
}
