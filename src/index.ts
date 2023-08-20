import { GameLoop, Sprite, init, initPointer, track, GameObject } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { BaseSolider } from "./sprites/soldier";
import { Background } from "./backgound/background";

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
let sprite = new BaseSolider();

let loop = GameLoop({
  update: () => {
    bg.update();
    sprite.update();
  },
  render: () => {
    bg.render();
    sprite.render();
  },
});
loop.start();
