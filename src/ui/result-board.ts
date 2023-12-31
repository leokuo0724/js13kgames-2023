import { Button, Sprite, SpriteClass, Text, on } from "kontra";
import { CTAButton } from "./cta-button";
import { GameManager } from "../strategy-section/game-manager";
import { EVENTS } from "../constants/events";
import { GameController } from "../fight-section/game-controller";
import { DetailsBox } from "./details-box";
import giftMetadata from "../gift-metadata.json";

export class ResultBoard extends SpriteClass {
  protected gameController: GameController;

  protected title: Text;
  protected body: Text;
  protected gift1: Button;
  protected gift2: Button;
  protected confirmButton: ConfirmButton;

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
      width: 400,
      height: 260,
    });

    this.title = Text({
      anchor: { x: 0.5, y: 0.5 },
      color: "#d2c9a5",
      font: "24px Verdana",
      text: "Victory",
      y: -86,
    });
    this.body = Text({
      anchor: { x: 0.5, y: 0 },
      color: "#d2c9a5",
      font: "16px Verdana",
      textAlign: "center",
      text: "",
      lineHeight: 1.4,
      y: -56,
    });
    this.gift1 = new GiftButton(8);
    this.gift2 = new GiftButton(36);

    this.confirmButton = new ConfirmButton(86);
    this.addChild([
      board,
      this.title,
      this.gift1,
      this.gift2,
      this.body,
      this.confirmButton,
    ]);

    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  protected onStateChange(state: GameState) {
    const details = DetailsBox.getInstance();
    if (state === "victory") {
      const aliveAllies = this.gameController.allies.filter((e) => e.isAlive());
      this.body.text = `${aliveAllies.length} soldiers left.\nTake a gift below or skip to next wave.`;
      // Pick gifts
      const { negative, positive } = giftMetadata;
      const positiveGift1 =
        positive[Math.floor(Math.random() * positive.length)];
      const negativeGift1 =
        negative[Math.floor(Math.random() * negative.length)];
      const positiveGift2 =
        positive[Math.floor(Math.random() * positive.length)];
      const negativeGift2 =
        negative[Math.floor(Math.random() * negative.length)];
      this.gift1.setGifts(positiveGift1, negativeGift1);
      this.gift2.setGifts(positiveGift2, negativeGift2);
    }
    if (state === "defeat") {
      const bestScore = Number(localStorage.getItem("_bs") ?? 0);
      const higherScore = Math.max(details.score, bestScore);
      localStorage.setItem("_bs", higherScore.toString());

      this.title.text = "Defeat";
      this.body.text = `You have conquered ${
        details.conquered
      } castles!\n\nScore: ${details.score.toLocaleString()}\nBest: ${higherScore.toLocaleString()}`;
      this.gift1.setDisabled();
      this.gift2.setDisabled();
      this.confirmButton.text = "retry";
    }
  }
}

class ConfirmButton extends CTAButton {
  constructor(y: number) {
    super({
      colorScheme: {
        normal: "#8caba1",
        hover: "#6e8e82",
        pressed: "#6e8e82",
        disabled: "#ab9b8e",
      },
    });
    this.text = "skip";
    this.y = y;
  }

  public onDown() {
    const gameManager = GameManager.getInstance();
    if (gameManager.state === "victory") {
      GameManager.getInstance().setState("prepare");
    }
    if (gameManager.state === "defeat") {
      window.location.reload();
    }
  }
}

class GiftButton extends CTAButton {
  protected positiveGift?: Gift;
  protected negativeGift?: Gift;

  constructor(y: number) {
    super({
      colorScheme: {
        normal: "transparent",
        hover: "#6e8e82",
        pressed: "#6e8e82",
        disabled: "#4b726e",
      },
    });
    this.y = y;
    this.height = 24;
    this.textNode.font = "14px Verdana";
  }

  public setGifts(positiveGift: Gift, negativeGift: Gift) {
    this.positiveGift = positiveGift;
    this.negativeGift = negativeGift;
    this.text = `ally ${positiveGift.text}, enemy ${negativeGift.text}`;
  }

  public setDisabled() {
    this.disabled = true;
    this.text = "";
  }

  public onDown() {
    const gameManager = GameManager.getInstance();
    if (!this.positiveGift || !this.negativeGift) return;
    gameManager.updateAllyBonus(this.positiveGift);
    gameManager.updateEnemyBonus(this.negativeGift);
    gameManager.setState("prepare");
  }
}
