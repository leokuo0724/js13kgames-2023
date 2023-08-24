import { GameLoop, init, initPointer } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { Background } from "./backgound/background";
import { GameController } from "./fight-section/game-controller";
import { StrategyController } from "./strategy-section/strategy-controller";

const { canvas } = init();

initPointer();

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

// FIXME: Image onload
const bg = new Background();
const gameController = new GameController();
const strategyController = new StrategyController();

const loop = GameLoop({
  update: () => {
    bg.update();
    gameController.update();
    strategyController.update();
  },
  render: () => {
    bg.render();
    gameController.render();
    strategyController.render();
  },
});
loop.start();
