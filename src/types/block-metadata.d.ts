import blockMetadata from "../block-metadata.json";

type BlockMetadata = {
  map: number[][];
  anchor: [number, number];
  color: string;
  type: UnitType;
};

export type BlockId = keyof typeof blockMetadata;
