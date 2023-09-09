import { SpriteClass, emit } from "kontra";
import { TIMELINE_COL, TIMELINE_GRID_SIZE } from "../constants/board";
import { EVENTS } from "../constants/events";

const MAX_X = TIMELINE_GRID_SIZE * TIMELINE_COL;
export class Timeline extends SpriteClass {
  protected isActive: boolean = false;
  protected isFinished: boolean = false;
  public scanned: Set<number> = new Set();

  constructor({ width, height }: { width: number; height: number }) {
    super({
      width,
      height,
      color: "black",
    });
  }

  public start() {
    this.isActive = true;
  }

  public reset() {
    this.isActive = false;
    this.x = 0;
    this.isFinished = false;
    this.scanned.clear();
  }

  public update() {
    if (!this.isActive) return;
    if (this.x >= MAX_X) {
      if (!this.isFinished) {
        this.isFinished = true;
        emit(EVENTS.FINAL_COL_SCANNED);
      }
      return;
    }
    this.x += 0.3;

    const currentCol = Math.floor(this.x / TIMELINE_GRID_SIZE);
    if (currentCol >= TIMELINE_COL) return;
    if (this.scanned.has(currentCol)) return;
    this.scanned.add(currentCol);
    emit(EVENTS.COL_SCANNED, currentCol);
  }

  public render() {
    if (!this.isActive) return;
    super.render();
  }
}
