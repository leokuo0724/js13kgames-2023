import { Cavalry } from "./cavalry";

export class MongolKhan extends Cavalry {
  constructor() {
    super({
      camp: "ally",
      health: 50,
      attackUnit: 10,
      attackRange: 120,
      attackRate: 50,
    });
    this.type = "khan";
    this.setScale(2.5);
  }
}
