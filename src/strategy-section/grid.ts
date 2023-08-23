import { SpriteClass } from "kontra";

export class Grid extends SpriteClass {
  public coord: [number, number];

  constructor(x: number, y: number, boxSize: number, coord: [number, number]) {
    super({
      x,
      y,
      width: boxSize,
      height: boxSize,
      color: (coord[0] + coord[1]) % 2 === 0 ? "#ab9b8e" : "#847875",
      opacity: 0.5,
    });

    this.coord = coord;
  }
}
