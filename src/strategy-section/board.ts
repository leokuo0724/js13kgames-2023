import { GameObjectClass, Text } from "kontra";
import { Grid } from "./grid";

export abstract class Board extends GameObjectClass {
  public grids: Grid[][] = [];

  constructor(
    row: number,
    col: number,
    gridSize: number,
    title: string,
    category: "display" | "interact"
  ) {
    super();

    for (let i = 0; i < col; i++) {
      this.grids.push([]);
      for (let j = 0; j < row; j++) {
        const grid = new Grid({
          x: j * gridSize,
          y: i * gridSize,
          boxSize: gridSize,
          coord: [i, j],
          interact: category === "interact",
        });
        this.grids[i].push(grid);
        this.addChild(grid);
      }
    }

    const text = Text({
      x: 0,
      y: -24,
      color: "#574852",
      text: title,
      font: "16px sans-serif",
    });
    this.addChild(text);
  }

  init() {
    super.init({});
    this.y = this.context.canvas.height / 2 + 64;
  }
}
