type GiftMetadata = {
  positive: Gift[];
  negative: Gift[];
};

type Gift = {
  text: string;
  effect:
    | "attackUnit"
    | "attackRange"
    | "attackRate"
    | "health"
    | "fixGrids"
    | "addSolider";
  value: number;
};

type BonusInfo = {
  attackUnit: number;
  attackRange: number;
  attackRate: number;
  health: number;
  addSolider: number;
};

type Bonus = {
  ally: BonusInfo;
  enemy: BonusInfo;
};
