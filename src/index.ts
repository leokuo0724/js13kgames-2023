import { GameLoop, init, initKeys, initPointer } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { Background } from "./backgound/background";
import { GameController } from "./fight-section/game-controller";
import { StrategyController } from "./strategy-section/strategy-controller";
import { MainBanner } from "./ui/main-banner";
import { GameManager } from "./strategy-section/game-manager";
import { ResultBoard } from "./ui/result-board";

const { canvas } = init();

initPointer();
initKeys();

function resize() {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  const scale = Math.min(innerWidth / w, innerHeight / h, 1);
  canvas.style.width = canvas.width * scale + "px";
  canvas.style.height = canvas.height * scale + "px";
  if (ctx) ctx.imageSmoothingEnabled = false;
}
(onresize = resize)();

const imgContainer = document.getElementById("imgs");
Object.values(ASSET_IDS).forEach((id) => {
  imgContainer?.insertAdjacentHTML(
    "beforeend",
    `
    <img id="${id}" src="./sprite.svg#${id}" />
  `
  );
});

const bg = new Background();
const mainBanner = new MainBanner();
const gameController = new GameController();
const resultBoard = new ResultBoard({ gameController });
const strategyController = new StrategyController();

const loop = GameLoop({
  update: () => {
    bg.update();
    resultBoard.update();
    if (GameManager.getInstance().state === "victory") return;
    mainBanner.update();
    gameController.update();
    strategyController.update();
  },
  render: () => {
    bg.render();
    mainBanner.render();
    gameController.render();
    strategyController.render();
    if (GameManager.getInstance().state === "victory") {
      resultBoard.render();
    }
  },
});
loop.start();
