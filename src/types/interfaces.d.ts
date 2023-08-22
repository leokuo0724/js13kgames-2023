interface IAnimated {
  timer: number;
}

interface IAttackUnit {
  health: number;
  attackTarget: GameObject | null;
  attackRange: number;
  attackRate: number;
  attackUnit: number;
  takeDamage(damage: number): void; // return true if dead
}

interface IMovableUnit {
  moveSpeed: number;
  moveRate: number;
}
