import { on } from "kontra";
import { EVENTS } from "../constants/events";

import { BaseAttackUnit } from "./attack-units/base-attack-unit";
import { GameManager } from "../strategy-section/game-manager";

import { MongolGunner } from "./attack-units/mongol-gunner";
import { EuropeCastle } from "./attack-units/europe-castle";
import { DetailsBox } from "../ui/details-box";
import { MongolKhan } from "./attack-units/mongol-khan";
import { Infantry } from "./attack-units/infantry";
import { Archer } from "./attack-units/archer";
import { Cavalry } from "./attack-units/cavalry";
import { Guarder } from "./attack-units/guarder";

export class GameController {
  public allies: BaseAttackUnit[] = [];
  public enemies: BaseAttackUnit[] = [];

  protected finalColScanned = false;

  constructor() {
    on(EVENTS.COL_SCANNED, this.onColScanned.bind(this));
    on(EVENTS.SPAWN_ALLY, (unitType: UnitType) => {
      this.spawnAttackUnit("ally", unitType);
    });
    on(EVENTS.FINAL_COL_SCANNED, () => {
      this.finalColScanned = true;
    });
    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
    on(EVENTS.PERFECT_MATCH, this.onPerfectMatch.bind(this));
  }

  protected onPerfectMatch() {
    this.spawnAttackUnit("ally", "khan");
  }

  protected onStateChange(state: GameState) {
    if (state === "prepare") {
      this.finalColScanned = false;
      this.allies.forEach((e) => e.stop());
      this.enemies.forEach((e) => e.stop());
    }
    if (state === "fight") {
      const castle = this.enemies.find((e) => e.type === "castle");
      if (!castle) {
        this.enemies.push(new EuropeCastle());
      } else {
        castle.respawn();
      }
    }
    if (state === "victory") {
      const totalAliveAllyScore = Math.round(
        this.allies
          .filter((e) => e.isAlive())
          .reduce((prev, current) => {
            const scores = current.calculateScore();
            return (prev += scores);
          }, 0) / 2
      );
      DetailsBox.getInstance().updateScore(totalAliveAllyScore);
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
    const unit = getAttackUnit(camp, unitType);
    targetCamp.push(unit);
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

function getAttackUnit(camp: UnitCamp, unitType: UnitType) {
  switch (unitType) {
    case "archer":
      return camp === "ally"
        ? new Archer({ camp: "ally" })
        : new Archer({ camp: "enemy" });
    case "infantry":
      return camp === "ally"
        ? new Infantry({ camp: "ally" })
        : new Infantry({
            camp: "enemy",
            moveSpeed: -5,
            attackRange: -80,
          });
    case "cavalry":
      return camp === "ally"
        ? new Cavalry({ camp: "ally" })
        : new Cavalry({
            camp: "enemy",
            moveSpeed: -12,
            attackRange: -80,
          });
    case "guarder":
      return camp === "ally"
        ? new Guarder({ camp: "ally" })
        : new Guarder({ camp: "enemy" });
    case "gunner":
      if (camp === "enemy") throw new Error();
      return new MongolGunner();
    case "khan":
      if (camp === "enemy") throw new Error();
      return new MongolKhan();
    case "castle":
      throw new Error();
  }
}
