import { Cavalry } from "./cavalry";

export class MongolKhan extends Cavalry {
  constructor() {
    super({
      camp: "ally",
      health: 50,
      moveSpeed: 20,
      attackUnit: 10,
      attackRange: 120,
      attackRate: 50,
    });
    this.type = "khan";
    this.setScale(2.5);
    this.sword.setScale(1, 1.2);
  }
}
