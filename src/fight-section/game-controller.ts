import { on } from "kontra";
import { EVENTS } from "../constants/events";
import { MongolInfantry } from "./attack-units/mongol-infantry";
import { MongolArcher } from "./attack-units/mongol-archer";
import { BaseAttackUnit } from "./attack-units/base-attack-unit";
import { EuropeCastle } from "./attack-units/europe-castle";
import { EuropeInfantry } from "./attack-units/europe-intantry";
import { EuropeArcher } from "./attack-units/europe-archer";

export class GameController {
  protected allies: BaseAttackUnit[] = [];
  protected enemies: BaseAttackUnit[] = [];

  protected finalColScanned = false;

  constructor() {
    const castle = new EuropeCastle();
    this.enemies.push(castle);

    on(EVENTS.COL_SCANNED, this.onColScanned.bind(this));
    on(EVENTS.SPAWN_ALLY, (unitType: UnitType) => {
      this.spawnAttackUnit("ally", unitType);
    });
    on(EVENTS.FINAL_COL_SCANNED, () => {
      this.finalColScanned = true;
    });
  }

  protected onColScanned(col: number) {
    // this.spawnAttackUnit("enemy", "infantry");
  }

  protected spawnAttackUnit(camp: UnitCamp, unitType: UnitType) {
    const targetCamp = camp === "ally" ? this.allies : this.enemies;
    const reusableObj = targetCamp.find(
      (e) => e.type === unitType && !e.isAlive()
    );
    if (reusableObj) {
      reusableObj.respawn();
      return;
    }

    // Create new instance
    const unit = getAttackUnitClass(camp, unitType);
    targetCamp.push(new unit());
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

    const aliveAllies = this.allies.filter((e) => e.isAlive());
    aliveAllies.forEach((ally) => {
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

    // check alive allies
    if (aliveAllies.length === 0 && this.finalColScanned) {
      console.log("You lose");
    }
  }
  public render() {
    this.enemies.filter((e) => e.isAlive()).forEach((enemy) => enemy.render());
    this.allies.filter((e) => e.isAlive()).forEach((ally) => ally.render());
  }
}

function getAttackUnitClass(camp: UnitCamp, unitType: UnitType) {
  switch (unitType) {
    case "archer":
      return camp === "ally" ? MongolArcher : EuropeArcher;
    case "infantry":
      return camp === "ally" ? MongolInfantry : EuropeInfantry;
    case "castle":
      throw new Error();
  }
}
