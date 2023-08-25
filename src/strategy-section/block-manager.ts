import { emit, onKey } from "kontra";
import blockMetadata from "../block-metadata.json";
import { EVENTS } from "../constants/events";
import { BlockMetadata } from "../types/block-metadata";

const TOTAL_BLOCK_COUNT = 30;

export class BlockManager {
  private static instance: BlockManager;
  public blockData: BlockMetadata[] = [];

  private constructor() {
    onKey("arrowup", () => {
      this.rotateCurrentBlock();
      emit(EVENTS.UPDATE_BLOCK);
    });
  }

  static getInstance() {
    if (!BlockManager.instance) {
      BlockManager.instance = new BlockManager();
    }
    return BlockManager.instance;
  }

  public reload() {
    this.blockData = randomPickNElements(
      Object.values(blockMetadata) as BlockMetadata[],
      TOTAL_BLOCK_COUNT
    );

    emit(EVENTS.UPDATE_BLOCK);
  }

  protected rotateCurrentBlock() {
    const blockMetadata = this.blockData[0];
    if (!blockMetadata) return;

    const { map, anchor } = blockMetadata;
    const rotatedMap = rotate90DegMatrix(map);
    const rotatedAnchor = rotate90DegAnchor(anchor, map.length);

    const rotatedBlockMetadata = {
      ...blockMetadata,
      map: rotatedMap,
      anchor: rotatedAnchor,
    } as BlockMetadata;

    this.blockData[0] = rotatedBlockMetadata;
  }
}

const randomPickNElements = <T>(elements: Array<T>, count: number) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * elements.length);
    result.push(elements[randomIndex]);
  }
  return result;
};

const rotate90DegMatrix = <T>(matrix: Array<Array<T>>) => {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const rotatedMatrix = new Array(cols)
    .fill(null)
    .map(() => new Array(rows).fill(null));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotatedMatrix[col][rows - 1 - row] = matrix[row][col];
    }
  }

  return rotatedMatrix;
};

const rotate90DegAnchor = (anchor: [number, number], arrayLength: number) => {
  const newX = anchor[1];
  const newY = arrayLength - 1 - anchor[0];
  return [newX, newY];
};
