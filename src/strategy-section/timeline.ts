import { SpriteClass } from "kontra";

export class Timeline extends SpriteClass {
  protected isActive: boolean = false;
  protected maxX: number;

  constructor({
    width,
    height,
    maxX,
  }: {
    width: number;
    height: number;
    maxX: number;
  }) {
    super({
      width,
      height,
      color: "black",
    });

    this.maxX = maxX;
  }

  public start() {
    this.isActive = true;
  }

  public reset() {
    this.isActive = false;
    this.x = 0;
  }

  public render() {
    if (!this.isActive) return;
    super.render();
    if (this.x >= this.maxX) return;
    this.x += 0.2;
  }
}
