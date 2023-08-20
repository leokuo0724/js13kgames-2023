import { GameObject } from "kontra";
import { BaseSolider } from "./soldier";

/** @deprecated */
export class AllyController {
  public allies: GameObject[] = [];

  constructor() {
    let test = new BaseSolider();
    this.allies.push(test);
  }

  public update() {
    this.allies.forEach((ally) => ally.update());
  }
  public render() {
    this.allies.forEach((ally) => ally.render());
  }
}
