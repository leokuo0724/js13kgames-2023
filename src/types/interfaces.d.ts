interface IAnimated {
  timer: number;
}

interface IAttackUnit {
  attackTarget: GameObject | null;
  attackRange: number;
  attackRate: number;
  attackUnit: number;
  takeDamage(damage: number): void;
}

interface IMovableUnit {
  moveSpeed: number;
  moveRate: number;
}
