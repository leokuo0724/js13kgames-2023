import { GameObject } from "kontra";
import { EnemyCastle } from "./enemy-castle";
import { BaseSolider } from "./soldier";

export class GameController {
  protected allies: GameObject[] = [];

  protected enemies: GameObject[] = [];

  constructor() {
    let castle = new EnemyCastle();
    this.enemies.push(castle);

    let test = new BaseSolider();
    this.allies.push(test);
  }

  public update() {
    this.enemies
      .filter((e) => e.isAlive())
      .forEach((enemy) => {
        if (!enemy.attackTarget) {
          // assign attack target
          this.allies
            .filter((e) => e.isAlive())
            .forEach((ally) => {
              if (enemy.x + enemy.attackRange < ally.x) {
                enemy.attackTarget = ally;
              }
            });
        }
        enemy.update();
      });

    this.allies
      .filter((e) => e.isAlive())
      .forEach((ally) => {
        if (!ally.attackTarget) {
          // assign attack target
          this.enemies
            .filter((e) => e.isAlive())
            .forEach((enemy) => {
              if (ally.x + ally.attackRange > enemy.x) {
                ally.attackTarget = enemy;
              }
            });
        }
        ally.update();
      });
  }
  public render() {
    this.enemies.filter((e) => e.isAlive()).forEach((enemy) => enemy.render());
    this.allies.filter((e) => e.isAlive()).forEach((ally) => ally.render());
  }
}
