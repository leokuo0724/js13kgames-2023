import { GameObjectClass, Text } from "kontra";
import { Grid } from "./grid";

const GRID_SIZE = 42;

export class TimelineBoard extends GameObjectClass {
  public grids: Grid[][] = [];

  constructor() {
    super();

    for (let i = 0; i < 18; i++) {
      this.grids.push([]);
      for (let j = 0; j < 5; j++) {
        const grid = new Grid(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, [j, i]);
        this.grids[i].push(grid);
        this.addChild(grid);
      }
    }
  }

  init() {
    super.init({});
    this.y = this.context.canvas.height / 2 + 64;
    this.x = 36;

    const text = Text({
      x: 0,
      y: -24,
      color: "#574852",
      text: "Strategy Timeline Board",
      font: "16px sans-serif",
    });
    this.addChild(text);
  }
}
