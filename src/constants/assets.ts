export const ASSET_IDS = {
  MONGOL: "ml",
  SHIELD: "sh",
  SWORD: "sw",
  BOW: "bw",
  CASTLE: "cs",
  EUROPE: "eu",
  FIST: "fs",
  CLOUD: "cd",
  HORSE: "hr",
  SHELL: "sl",
  GUN: "gn",
  ICON_CASTLE: "ics",
  ICON_SKULL: "isk",
} as const;
export type AssetId = (typeof ASSET_IDS)[keyof typeof ASSET_IDS];

export const GENERAL_SCALE = 8;
