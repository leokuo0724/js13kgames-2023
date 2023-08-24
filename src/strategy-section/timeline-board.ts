import { Grid } from "./grid";
import { Board } from "./board";

export class TimelineBoard extends Board {
  public grids: Grid[][] = [];

  constructor() {
    super(5, 20, 40, "Strategy Timeline Board");
  }

  init() {
    super.init({});
    this.y = this.context.canvas.height / 2 + 64;
    this.x = 36;
  }
}
