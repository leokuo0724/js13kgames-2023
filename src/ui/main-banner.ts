import { GameObjectClass, Text, TextClass, on } from "kontra";
import { EVENTS } from "../constants/events";
import { GameManager } from "../strategy-section/game-manager";
import { DetailsBox } from "./details-box";

const TEXT_CONFIG = {
  color: "#4b726e",
  opacity: 0,
  textAlign: "center",
  anchor: { x: 0.5, y: 0.5 },
};

const PROLOGUES = {
  PART1:
    "In the 13th century, the Mongol Empire marches to conquer the world.\nAs a Mongol commander,\n your duty is to arrange the blocks, each representing a soldier.",
  PART2:
    "The Mongol March begins; your strategy will shape history.\nLead the Empire to victory.",
};

export class MainBanner extends GameObjectClass {
  protected title: Text;
  protected body: Text;

  protected prologueStep = 0;

  constructor() {
    super();
    this.title = new BannerText({
      font: "36px Verdana",
      text: "Mongol March",
      y: -72,
    });
    this.body = new BannerText({
      font: "16px Verdana",
      text: PROLOGUES.PART1,
      lineHeight: 2,
      y: 12,
    });
    this.body.startFadingIn = true;
    this.title.startFadingIn = true;

    this.addChild([this.title, this.body]);
    this.x = this.context.canvas.width / 2;
    this.y = this.context.canvas.height / 3;

    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));

    setTimeout(() => {
      this.body.fadeOutInText(PROLOGUES.PART2);
    }, 3000);
    setTimeout(() => {
      GameManager.getInstance().setState("prepare");
    }, 8000);
  }

  protected onStateChange(state: GameState) {
    state === "prepare" || state === "ready"
      ? (this.ttl = Infinity)
      : (this.ttl = 0);
    if (state === "prepare") {
      this.title.fadeOutInText(
        `Wave ${DetailsBox.getInstance().conquered + 1}`
      );
      this.body.fadeOutInText(
        "Place blocks into board as possible as you can\nZ: rotate the block"
      );
    }
  }

  public render() {
    if (!this.isAlive()) return;
    super.render();
  }
}

class BannerText extends TextClass {
  protected startFadingIn = false;
  protected startFadingOut = false;

  constructor({
    y,
    font,
    text,
    lineHeight,
  }: {
    y: number;
    font: string;
    text: string;
    lineHeight?: number;
  }) {
    super({ y, font, text, lineHeight, ...TEXT_CONFIG });
  }

  public fadeOutInText(text: string) {
    this.startFadingOut = true;
    this.startFadingIn = false;
    this.fadeOutCallback = () => {
      this.text = text;
      this.startFadingIn = true;
    };
  }

  public update() {
    super.update();
    if (this.startFadingIn && this.opacity < 1) {
      this.opacity += 0.01;
      if (this.opacity >= 1) {
        this.startFadingIn = false;
      }
    }
    if (this.startFadingOut && this.opacity > 0) {
      this.opacity -= 0.01;
      if (this.opacity <= 0) {
        this.startFadingOut = false;
        this.fadeOutCallback?.();
      }
    }
  }
}
