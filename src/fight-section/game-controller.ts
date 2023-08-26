import { GameObject, on } from "kontra";
import { EnemyCastle } from "./enemy-castle";
import { EVENTS } from "../constants/events";

export class GameController {
  protected allies: GameObject[] = [];

  protected enemies: GameObject[] = [];

  constructor() {
    const castle = new EnemyCastle();
    this.enemies.push(castle);

    // on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  // protected onStateChange(state: GameState) {}

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
