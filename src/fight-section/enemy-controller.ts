import { GameObject } from "kontra";
import { EnemyCastle } from "./enemy-castle";

/** @deprecated */
export class EnemyController {
  public castle: GameObject;
  public enemies: GameObject[] = [];

  constructor() {
    this.castle = new EnemyCastle();
  }

  public update() {
    this.castle.update();
    this.enemies.forEach((enemy) => enemy.update());
  }
  public render() {
    this.castle.render();
    this.enemies.forEach((enemy) => enemy.render());
  }
}
