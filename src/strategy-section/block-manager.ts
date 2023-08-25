import { emit } from "kontra";
import blockMetadata from "../block-metadata.json";
import { EVENTS } from "../constants/events";

const TOTAL_BLOCK_COUNT = 30;

export class BlockManager {
  private static instance: BlockManager;
  public blockIds: string[] = [];

  private constructor() {}

  static getInstance() {
    if (!BlockManager.instance) {
      BlockManager.instance = new BlockManager();
    }
    return BlockManager.instance;
  }

  public reload() {
    this.blockIds = randomPickNElements(
      Object.keys(blockMetadata),
      TOTAL_BLOCK_COUNT
    );

    emit(EVENTS.RELOAD_BLOCKS);
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
