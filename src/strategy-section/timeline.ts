import { SpriteClass } from "kontra";

export class Timeline extends SpriteClass {
  protected isActive: boolean = false;
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
    this.scanned.clear();
  }

  public render() {
    if (!this.isActive) return;
    super.render();
  }
}
