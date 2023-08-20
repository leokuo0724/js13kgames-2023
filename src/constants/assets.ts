export const ASSET_IDS = {
  MONGOL: "mongol",
  SHIELD: "shield",
  SWORD: "sword",
  HAND: "hand",
  BOW: "bow",
} as const;
export type AssetId = (typeof ASSET_IDS)[keyof typeof ASSET_IDS];
