import { GameObjectClass, Text, on } from "kontra";
import { CustomSprite } from "../fight-section/custom-sprite";
import { ASSET_IDS, GENERAL_SCALE } from "../constants/assets";
import { GameManager } from "../strategy-section/game-manager";
import { EVENTS } from "../constants/events";

export class DetailsBox extends GameObjectClass {
  private static instance: DetailsBox;
  public conquered = 0;
  protected conqueredText: Text;
  public slayed = 0;
  protected slayedText: Text;

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

    const skullIcon = new CustomSprite({
      assetId: ASSET_IDS.ICON_SKULL,
      scaleX: GENERAL_SCALE,
      scaleY: GENERAL_SCALE,
      y: 42,
    });
    this.slayedText = Text({
      color: "#4b726e",
      font: "20px Verdana",
      text: "0",
      x: 36,
      y: 50,
    });

    this.addChild([castleIcon, skullIcon, this.conqueredText, this.slayedText]);
    this.x = 12;
    this.y = 12;

    on(EVENTS.DEFEAT_ENEMY, this.onDefeatEnemy.bind(this));
  }

  static getInstance() {
    if (!DetailsBox.instance) {
      DetailsBox.instance = new DetailsBox();
    }
    return DetailsBox.instance;
  }

  protected onDefeatEnemy(type: UnitType) {
    if (type === "castle") {
      this.conquered++;
      this.conqueredText.text = this.conquered.toString();
    } else {
      this.slayed++;
      this.slayedText.text = this.slayed.toString();
    }
  }

  public render() {
    if (GameManager.getInstance().state === "prologue") return;
    super.render();
  }
}
