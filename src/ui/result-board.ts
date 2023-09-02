import { Sprite, SpriteClass, Text, on } from "kontra";
import { CTAButton } from "./cta-button";
import { GameManager } from "../strategy-section/game-manager";
import { EVENTS } from "../constants/events";
import { GameController } from "../fight-section/game-controller";

export class ResultBoard extends SpriteClass {
  protected gameController: GameController;

  protected remains: Text;

  constructor({ gameController }: { gameController: GameController }) {
    super({
      color: "#d2c9a5",
      anchor: { x: 0.5, y: 0.5 },
      opacity: 0.3,
    });
    this.width = this.context.canvas.width;
    this.height = this.context.canvas.height;
    this.x = this.context.canvas.width / 2;
    this.y = this.context.canvas.height / 2;

    this.gameController = gameController;

    const board = Sprite({
      anchor: { x: 0.5, y: 0.5 },
      color: "#4b726e",
      width: 300,
      height: 200,
    });

    const title = Text({
      anchor: { x: 0.5, y: 0.5 },
      color: "#d2c9a5",
      font: "24px Verdana",
      text: "Victory",
      y: -64,
    });
    this.remains = Text({
      anchor: { x: 0.5, y: 0 },
      color: "#d2c9a5",
      font: "14px Verdana",
      textAlign: "center",
      text: "",
      lineHeight: 1.4,
      y: -28,
    });

    const button = new ConfirmButton();
    this.addChild([board, title, this.remains, button]);

    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  protected onStateChange(state: GameState) {
    if (state !== "victory") return;
    const aliveAllies = this.gameController.allies.filter((e) => e.isAlive());
    const wave = GameManager.getInstance().wave;
    this.remains.text = `Conquered territory: ${wave}\nRemain ${aliveAllies.length} soldier(s)`;
  }
}

class ConfirmButton extends CTAButton {
  constructor() {
    super({
      colorScheme: { normal: "#8caba1", hover: "#6e8e82", pressed: "#6e8e82" },
    });
    this.text = "next";
    this.y = 64;
  }

  public onDown() {
    GameManager.getInstance().setState("prepare");
  }
}
