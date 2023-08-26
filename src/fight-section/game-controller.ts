import { GameObject, on } from "kontra";
import { EnemyCastle } from "./enemy-castle";
import { EVENTS } from "../constants/events";
import { MongolInfantry } from "./soldiers/mongol-infantry";
import { MongolArcher } from "./soldiers/mongol-archer";
import { BaseSolider } from "./soldiers/base-soldier";

export class GameController {
  protected allies: BaseSolider[] = [];

  protected enemies: GameObject[] = [];

  constructor() {
    const castle = new EnemyCastle();
    this.enemies.push(castle);

    on(EVENTS.SPAWN_ALLY, this.onSpawnAlly.bind(this));
  }

  protected onSpawnAlly(unitType: UnitType) {
    const reusableObj = this.allies.find(
      (e) => e.type === unitType && !e.isAlive()
    );
    if (reusableObj) {
      reusableObj.respawn();
      return;
    }

    // Create new instance
    const unit = getAttackUnitClass(unitType);
    this.allies.push(new unit());
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

function getAttackUnitClass(unitType: UnitType) {
  switch (unitType) {
    case "archer":
      return MongolArcher;
    case "infantry":
      return MongolInfantry;
    case "castle":
      throw new Error();
  }
}
