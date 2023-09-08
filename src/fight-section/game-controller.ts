import { on } from "kontra";
import { EVENTS } from "../constants/events";
import { MongolInfantry } from "./attack-units/mongol-infantry";
import { MongolArcher } from "./attack-units/mongol-archer";
import { BaseAttackUnit } from "./attack-units/base-attack-unit";
import { EuropeCastle } from "./attack-units/europe-castle";
import { EuropeInfantry } from "./attack-units/europe-intantry";
import { EuropeArcher } from "./attack-units/europe-archer";
import { GameManager } from "../strategy-section/game-manager";
import { MongolCavalry } from "./attack-units/mongol-cavalry";
import { EuropeCavalry } from "./attack-units/europe-cavalry";
import { MongolGuarder } from "./attack-units/mongol-guarder";
import { EuropeGuarder } from "./attack-units/europe-guarder";
import { MongolGunner } from "./attack-units/mongol-gunner";

export class GameController {
  public allies: BaseAttackUnit[] = [];
  public enemies: BaseAttackUnit[] = [];

  protected finalColScanned = false;

  constructor() {
    const castle = new EuropeCastle();
    this.enemies.push(castle);
    this.enemies.push(new EuropeArcher());
    this.allies.push(new MongolArcher());

    on(EVENTS.COL_SCANNED, this.onColScanned.bind(this));
    on(EVENTS.SPAWN_ALLY, (unitType: UnitType) => {
      this.spawnAttackUnit("ally", unitType);
    });
    on(EVENTS.FINAL_COL_SCANNED, () => {
      this.finalColScanned = true;
    });
    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  protected onStateChange(state: GameState) {
    if (state === "prepare") {
      this.finalColScanned = false;
      this.allies.forEach((e) => e.stop());
      this.enemies.forEach((e) => e.stop());
    }
    if (state === "fight") {
      this.enemies.find((e) => e.type === "castle")?.respawn();
    }
  }

  protected onColScanned(col: number) {
    const types: UnitType[] = [
      "infantry",
      "infantry",
      "infantry",
      "guarder",
      "guarder",
      "archer",
      "cavalry",
    ];
    const randomIndex = Math.floor(Math.random() * types.length);
    this.spawnAttackUnit("enemy", types[randomIndex]);
    const extraSoliderCount = GameManager.getInstance().bonus.enemy.addSolider;
    if (col === 10 && extraSoliderCount > 0) {
      for (let i = 0; i < extraSoliderCount; i++) {
        const randomIndex = Math.floor(Math.random() * types.length);
        this.spawnAttackUnit("enemy", types[randomIndex]);
      }
    }
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
    if (
      GameManager.getInstance().state === "fight" &&
      aliveAllies.length === 0 &&
      this.finalColScanned
    ) {
      GameManager.getInstance().setState("defeat");
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
    case "cavalry":
      return camp === "ally" ? MongolCavalry : EuropeCavalry;
    case "guarder":
      return camp === "ally" ? MongolGuarder : EuropeGuarder;
    case "gunner":
      if (camp === "enemy") throw new Error();
      return MongolGunner;
    case "castle":
      throw new Error();
  }
}
