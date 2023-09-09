import { GameObjectClass, Text, on } from "kontra";
import { CustomSprite } from "../fight-section/custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";
import { GameManager } from "../strategy-section/game-manager";
import { EVENTS } from "../constants/events";

export class DetailsBox extends GameObjectClass {
  private static instance: DetailsBox;
  public conquered = 0;
  protected conqueredText: Text;
  public score = 0;
  protected scoreText: Text;

  private constructor() {
    super();
    const castleIcon = new CustomSprite({
      assetId: ASSET_IDS.ICON_CASTLE,
      scaleX: GENERAL_SCALE,
      scaleY: GENERAL_SCALE,
    });
    this.conqueredText = Text({
      color: "#4b726e",
      font: "20px Verdana",
      text: "0",
      x: 36,
      y: 8,
    });

    const scoreIcon = new CustomSprite({
      assetId: ASSET_IDS.ICON_SCORE,
      scaleX: GENERAL_SCALE,
      scaleY: GENERAL_SCALE,
      x: 72,
      y: 1,
    });
    this.scoreText = Text({
      color: "#4b726e",
      font: "20px Verdana",
      text: "0",
      x: 108,
      y: 8,
    });

    this.addChild([castleIcon, scoreIcon, this.conqueredText, this.scoreText]);
    this.x = 12;
    this.y = 12;
  }

  static getInstance() {
    if (!DetailsBox.instance) {
      DetailsBox.instance = new DetailsBox();
    }
    return DetailsBox.instance;
  }

  public updateScore(score: number) {
    this.score += score;
    this.scoreText.text = this.score.toString();
  }
  public updateConquered() {
    this.conquered++;
    this.conqueredText.text = this.conquered.toString();
  }

  public render() {
    if (GameManager.getInstance().state === "prologue") return;
    super.render();
  }
}
