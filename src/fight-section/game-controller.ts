import { on } from "kontra";
import { EVENTS } from "../constants/events";
import { MongolInfantry } from "./attack-units/mongol-infantry";
import { MongolArcher } from "./attack-units/mongol-archer";
import { BaseAttackUnit } from "./attack-units/base-attack-unit";
import { EuropeCastle } from "./attack-units/europe-castle";

export class GameController {
  protected allies: BaseAttackUnit[] = [];

  protected enemies: BaseAttackUnit[] = [];

  constructor() {
    const castle = new EuropeCastle();
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
