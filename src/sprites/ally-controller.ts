import { GameObject } from "kontra";

export class AllyController {
  public allies: GameObject[] = [];

  constructor() {}

  public update() {
    this.allies.forEach((ally) => ally.update());
  }
  public render() {
    this.allies.forEach((ally) => ally.render());
  }
}
