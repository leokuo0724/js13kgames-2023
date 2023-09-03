export const ASSET_IDS = {
  MONGOL: "mongol",
  SHIELD: "shield",
  SWORD: "sword",
  FIST: "fist",
  BOW: "bow",
  EUROPE: "europe",
  CASTLE: "castle",
  CLOUD: "cloud",
  HORSE: "horse",
  SHELL: "shell",
  GUN: "gun",
} as const;
export type AssetId = (typeof ASSET_IDS)[keyof typeof ASSET_IDS];

export const GENERAL_SCALE = 8;
