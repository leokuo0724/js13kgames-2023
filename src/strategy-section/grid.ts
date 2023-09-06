import { Sprite, SpriteClass, emit, track } from "kontra";
import { EVENTS } from "../constants/events";
import { GameManager } from "./game-manager";

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
  public isScanned: boolean = false;
  public locked: boolean = false;

  constructor({ x, y, boxSize, coord, interact = false }: GridProps) {
    super({
      x,
      y,
      width: boxSize,
      height: boxSize,
      color: (coord[0] + coord[1]) % 2 === 0 ? "#ab9b8e" : "#847875",
      opacity: 0.5,
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
    emit(EVENTS.PLACE_BLOCK, this.coord);
  }

  setScanned() {
    this.isScanned = true;
    this.covered.color = "#847875";
  }
  setLocked() {
    this.locked = true;
    this.color = "#4d3d44";
    GameManager.getInstance().freeGridsCount--;
  }
  setUnlocked() {
    this.locked = false;
    this.color =
      (this.coord[0] + this.coord[1]) % 2 === 0 ? "#ab9b8e" : "#847875";
    GameManager.getInstance().freeGridsCount++;
  }
  reset() {
    this.covered.color = "transparent";
    this.isScanned = false;
    // locked is not reset til game over
    this.occupiedId = null;
    this.occupiedUnitType = null;
  }
}
