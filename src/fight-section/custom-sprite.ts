import { GameObject, SpriteClass } from "kontra";
import { AssetId } from "../constants/assets";

/** Extend sprite class, add image based on asset id */
export class CustomSprite extends SpriteClass {
  constructor(properties: {
    assetId: AssetId;
    color?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    context?: CanvasRenderingContext2D;
    dx?: number;
    dy?: number;
    ddx?: number;
    ddy?: number;
    ttl?: number;
    anchor?: { x: number; y: number };
    children?: GameObject[];
    opacity?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    update?: (dt?: number) => void;
    render?: Function;
    [props: string]: any;
  }) {
    const image = document.querySelector(
      `#${properties.assetId}`
    ) as HTMLImageElement;
    super({ image, ...properties });
  }
}
