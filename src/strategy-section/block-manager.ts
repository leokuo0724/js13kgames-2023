import { emit, on, onKey } from "kontra";
import blockMetadata from "../block-metadata.json";
import { EVENTS } from "../constants/events";
import { BlockMetadata } from "../types/block-metadata";

const TOTAL_BLOCK_COUNT = 30;

export class BlockManager {
  private static instance: BlockManager;
  public blockData: BlockMetadata[] = [];

  public state: GameState = "prepare";

  private constructor() {
    onKey("z", () => {
      this.rotateCurrentBlock();
      emit(EVENTS.UPDATE_BLOCK);
    });
    on(EVENTS.ON_START_CLICK, this.onStartClick.bind(this));
  }

  static getInstance() {
    if (!BlockManager.instance) {
      BlockManager.instance = new BlockManager();
    }
    return BlockManager.instance;
  }

  public setState(state: GameState) {
    this.state = state;
    emit(EVENTS.STATE_CHANGE, this.state);
    if (state === "prepare") this.reload();
  }

  public reload() {
    this.blockData = randomPickNElements(
      Object.values(blockMetadata) as BlockMetadata[],
      TOTAL_BLOCK_COUNT
    );
    emit(EVENTS.UPDATE_BLOCK);
  }

  public shiftBlock() {
    this.blockData.shift();
    emit(EVENTS.UPDATE_BLOCK);

    if (this.blockData.length === 0) {
      this.setState("ready");
    }
  }

  protected onStartClick() {
    this.setState("fight");
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

function randomPickNElements<T>(elements: Array<T>, count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * elements.length);
    result.push(elements[randomIndex]);
  }
  return result;
}

function rotate90DegMatrix<T>(matrix: Array<Array<T>>) {
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
}

function rotate90DegAnchor(anchor: [number, number], arrayLength: number) {
  const newX = anchor[1];
  const newY = arrayLength - 1 - anchor[0];
  return [newX, newY];
}
