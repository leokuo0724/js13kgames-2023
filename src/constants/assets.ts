export const ASSET_IDS = {
  // character components
  MONGOL: "mongol",
  SHIELD: "shield",
  SWORD: "sword",
  HAND: "hand",
  BOW: "bow",
  // bg
  CASTLE: "castle",
} as const;
export type AssetId = (typeof ASSET_IDS)[keyof typeof ASSET_IDS];
