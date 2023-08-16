import { GameLoop, Sprite, init, initPointer, track } from "kontra";

let { canvas } = init();

initPointer();

function resize() {
  let ctx = canvas.getContext("2d");
  let { width: w, height: h } = canvas;
  let scale = Math.min(innerWidth / w, innerHeight / h, 4);
  canvas.style.width = canvas.width * scale + "px";
  canvas.style.height = canvas.height * scale + "px";
  if (ctx) ctx.imageSmoothingEnabled = false;
}
(onresize = resize)();

let sprite = Sprite({
  x: 0,
  y: 0,
  color: "red",
  width: 30,
  height: 30,
});
track(sprite);

let loop = GameLoop({
  // create the main game loop
  update: function () {
    // update the game state
    // sprite.update();

    // wrap the sprites position when it reaches
    // the edge of the screen
    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function () {
    // render the game state
    sprite.render();
  },
});

loop.start(); // start the game
