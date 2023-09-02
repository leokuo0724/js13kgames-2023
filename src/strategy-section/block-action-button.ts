import { emit, on } from "kontra";
import { GameManager } from "./game-manager";
import { EVENTS } from "../constants/events";
import { CTAButton } from "../ui/cta-button";

export class BlockActionButton extends CTAButton {
  constructor() {
    super({
      colorScheme: { normal: "#c77b58", hover: "#ae5d40", pressed: "#79444a" },
    });
    this.x = this.context.canvas.width - 88;
    this.y = this.context.canvas.height - 50;
    this.text = "waive";
    on(EVENTS.STATE_CHANGE, this.onStateChange.bind(this));
  }

  public onDown() {
    const gameManager = GameManager.getInstance();
    switch (gameManager.state) {
      case "prepare":
        gameManager.shiftBlock();
        break;
      case "ready":
        emit(EVENTS.ON_START_CLICK);
        break;
      case "fight":
        break;
    }
  }

  protected onStateChange(state: GameState) {
    switch (state) {
      case "prepare":
        this.disabled = false;
        this.text = "waive";
        this.textNode.color = "white";
        break;
      case "ready":
        this.text = "start";
        break;
      case "fight":
        this.disabled = true;
        this.text = "fighting...";
        this.textNode.color = "#d2c9a5";
        break;
    }
  }
}
