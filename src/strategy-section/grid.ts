import { Sprite, SpriteClass, emit, track } from "kontra";
import { EVENTS } from "../constants/events";

type GridProps = {
  x: number;
  y: number;
  boxSize: number;
  coord: [number, number];
  interact?: boolean;
};

export class Grid extends SpriteClass {
  public coord: [number, number];
  public covered: Sprite;
  protected isPointerOver: boolean = false;
  public occupiedId: string | null = null;
  public occupiedUnitType: UnitType | null = null;

  constructor({ x, y, boxSize, coord, interact = false }: GridProps) {
    super({
      x,
      y,
      width: boxSize,
      height: boxSize,
      color: (coord[0] + coord[1]) % 2 === 0 ? "#ab9b8e" : "#847875",
      opacity: 0.4,
    });
    if (interact) track(this);

    this.covered = Sprite({
      width: boxSize,
      height: boxSize,
    });
    this.addChild(this.covered);

    this.coord = coord;
  }

  onOver() {
    if (this.isPointerOver) return;
    this.isPointerOver = true;
    emit(EVENTS.ON_GRID_OVER, this.coord);
  }
  onOut() {
    this.isPointerOver = false;
  }
  onDown() {
    if (this.covered.color === "transparent") return;
    emit(EVENTS.SET_BLOCK, this.coord);
  }
}
