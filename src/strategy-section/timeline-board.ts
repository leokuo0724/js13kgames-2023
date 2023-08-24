import { Grid } from "./grid";
import { Board } from "./board";

export class TimelineBoard extends Board {
  public grids: Grid[][] = [];

  constructor() {
    super(20, 5, 40, "Strategy Timeline Board");
    this.x = 36;
  }
}
