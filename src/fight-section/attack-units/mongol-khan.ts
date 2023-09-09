import { MongolCavalry } from "./mongol-cavalry";

export class MongolKhan extends MongolCavalry {
  constructor() {
    super({
      health: 50,
      attackUnit: 10,
      attackRange: 120,
      attackRate: 50,
    });
    this.type = "khan";
    this.setScale(2.5);
  }
}
