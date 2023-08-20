import { GameLoop, init, initPointer } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { Background } from "./backgound/background";
import { EnemyController } from "./sprites/enemy-controller";
import { AllyController } from "./sprites/ally-controller";

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
    <img id="${id}" src="/src/assets/sprite.svg#${id}" />
  `
  );
});

// FIXME: Image onload
let bg = new Background();
let enemyController = new EnemyController();
let allyController = new AllyController();

let loop = GameLoop({
  update: () => {
    bg.update();
    enemyController.update();
    allyController.update();
  },
  render: () => {
    bg.render();
    enemyController.render();
    allyController.render();
  },
});
loop.start();
