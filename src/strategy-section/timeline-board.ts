import { Grid } from "./grid";
import { Board } from "./board";

export class TimelineBoard extends Board {
  public grids: Grid[][] = [];

  constructor() {
    super(20, 5, 40, "Strategy Timeline Board", "interact");
    this.x = 36;
  }
}
