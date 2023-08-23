import { GameLoop, init, initPointer } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { Background } from "./backgound/background";

import { GameController } from "./sprites/game-controller";

let { canvas } = init();

initPointer();

function resize() {
  let ctx = canvas.getContext("2d");
  let { width: w, height: h } = canvas;
  let scale = Math.min(innerWidth / w, innerHeight / h, 1);
  canvas.style.width = canvas.width * scale + "px";
  canvas.style.height = canvas.height * scale + "px";
  if (ctx) ctx.imageSmoothingEnabled = false;
}
(onresize = resize)();

let imgContainer = document.getElementById("imgs");
Object.values(ASSET_IDS).forEach((id) => {
  imgContainer?.insertAdjacentHTML(
    "beforeend",
    `
    <img id="${id}" src="./sprite.svg#${id}" />
  `
  );
});

// FIXME: Image onload
let bg = new Background();
let gameController = new GameController();

let loop = GameLoop({
  update: () => {
    bg.update();
    gameController.update();
  },
  render: () => {
    bg.render();
    gameController.render();
  },
});
loop.start();
