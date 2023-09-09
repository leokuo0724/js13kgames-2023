import { ASSET_IDS } from "../../constants/assets";
import { CustomSprite } from "../custom-sprite";
import { MongolInfantry } from "./mongol-infantry";

export class MongolCavalry extends MongolInfantry {
  constructor({
    moveSpeed = 12,
    moveRate = 8,
    health = 12,
    attackRange = 80,
    attackRate = 60,
    attackUnit = 1.5,
  }: {
    moveSpeed?: number;
    moveRate?: number;
    health?: number;
    attackRange?: number;
    attackRate?: number;
    attackUnit?: number;
  }) {
    super({ moveSpeed, moveRate, health, attackRange, attackRate, attackUnit });
    this.type = "cavalry";

    this.horse = new CustomSprite({
      assetId: ASSET_IDS.HORSE,
      x: 9,
      anchor: { x: 0.5, y: 1 },
    });
    this.children.forEach((child) => {
      if (child.type !== "health-bar") child.y -= 8;
    });

    this.addChild(this.horse);
  }
}
