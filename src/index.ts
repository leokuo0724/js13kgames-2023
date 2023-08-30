import { GameLoop, init, initKeys, initPointer } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { Background } from "./backgound/background";
import { GameController } from "./fight-section/game-controller";
import { StrategyController } from "./strategy-section/strategy-controller";
import { Tutorial } from "./ui/tutorial";
import { BlockManager } from "./strategy-section/block-manager";
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
const tutorial = new Tutorial();
const resultBoard = new ResultBoard();
const gameController = new GameController();
const strategyController = new StrategyController();

const loop = GameLoop({
  update: () => {
    bg.update();
    // resultBoard.update();
    if (BlockManager.getInstance().state === "victory") return;
    tutorial.update();
    gameController.update();
    strategyController.update();
  },
  render: () => {
    bg.render();
    tutorial.render();
    gameController.render();
    strategyController.render();
    // resultBoard.render();
  },
});
loop.start();
