import { GameObjectClass, Text, on } from "kontra";
import { EVENTS } from "../constants/events";
import { GameManager } from "../strategy-section/game-manager";

const TEXT_CONFIG = {
  color: "#4b726e",
  textAlign: "center",
  anchor: { x: 0.5, y: 0.5 },
};

export class MainBanner extends GameObjectClass {
  protected title: Text;

  constructor() {
    super();
    this.title = Text({
      font: "36px Verdana",
      text: "Mongol March",
      ...TEXT_CONFIG,
    });
    const text = Text({
      font: "16px Verdana",
      text: "Place blocks into board as possible as you can\nZ: rotate the block",
      lineHeight: 2,
      ...TEXT_CONFIG,
    });

    this.addChild([this.title, text]);
    this.x = this.context.canvas.width / 2;
    this.y = this.context.canvas.height / 3;
    this.title.y = -64;

    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  protected onStateChange(state: GameState) {
    state === "prepare" || state === "ready"
      ? (this.ttl = Infinity)
      : (this.ttl = 0);
    if (state === "prepare") {
      this.title.text = `Wave ${GameManager.getInstance().wave}`;
    }
  }

  public render() {
    if (!this.isAlive()) return;
    super.render();
  }
}
