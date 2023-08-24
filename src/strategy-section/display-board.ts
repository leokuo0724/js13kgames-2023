import { Grid } from "./grid";
import { Board } from "./board";

export class DisplayBoard extends Board {
  /** 4x4 2D array */
  public grids: Grid[][] = [];
  public type: "current" | "next";

  constructor(type: "current" | "next") {
    super(4, 4, 34, type === "current" ? "Current Block" : "Next Block");
    this.type = type;
    this.x = this.type === "current" ? 876 : 1030;
  }

  init() {
    super.init({});
    this.y = this.context.canvas.height / 2 + 64;
  }
}
