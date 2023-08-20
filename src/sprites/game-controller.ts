import { GameObject } from "kontra";
import { EnemyCastle } from "./enemy-castle";
import { BaseSolider } from "./soldier";

export class GameController {
  public allies: GameObject[] = [];

  // public castle: GameObject;
  public enemies: GameObject[] = [];

  constructor() {
    let castle = new EnemyCastle();
    this.enemies.push(castle);

    let test = new BaseSolider();
    this.allies.push(test);
  }

  public update() {
    // this.castle.update();
    this.enemies.forEach((enemy) => enemy.update());
    this.allies.forEach((ally) => {
      if (!ally.attackTarget) {
        this.enemies.forEach((enemy) => {
          if (ally.x + ally.attackRange > enemy.x) {
            ally.attackTarget = enemy;
          }
        });
      }
      ally.update();
    });
  }
  public render() {
    // this.castle.render();
    this.enemies.forEach((enemy) => enemy.render());
    this.allies.forEach((ally) => ally.render());
  }
}
