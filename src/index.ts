import { GameLoop, init, initKeys, initPointer } from "kontra";
import { ASSET_IDS } from "./constants/assets";
import { Background } from "./backgound/background";
import { GameController } from "./fight-section/game-controller";
import { StrategyController } from "./strategy-section/strategy-controller";
import { MainBanner } from "./ui/main-banner";
import { GameManager } from "./strategy-section/game-manager";
import { ResultBoard } from "./ui/result-board";
import { RESULT_STATES } from "./constants/game-states";
import { DetailsBox } from "./ui/details-box";

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

const SVG_DATA: Record<(typeof ASSET_IDS)[keyof typeof ASSET_IDS], string> = {
  ml: 'width="23.8" height="47.9" viewBox="0 0 23.8 47.9"><path fill="#C77B58" d="m19 33 1-1 3-5-5-9-11-1-7 12 6 3v12h3l1-2 5-3 5 5h4z"/><path fill="#D1B187" d="M22 10V9h-6l-2 11h4c2 0 4 0 4-2v-8z"/><path fill="#79444A" d="M6 48h2l1-4H6zM20 44l1 2v2h3v-4zM6 32h14v3H6z"/><path fill="#574852" d="m15 35-8 7-4-2 3-5zM16 35l4 6h4l-4-6z"/><path fill="#847875" d="M7 20h12v12H7z"/><path fill="#574852" d="m23 26-3-6H4l-4 4 8 4 8-8 4 6z"/><path fill="#C77B58" d="m22 6-7-6-8 6-3 15h13l1-15z"/><path fill="#79444A" d="M6 6h17v4H6z"/></svg>',
  sh: 'width="27.6" height="27.6" viewBox="0 0 27.6 27.6"><circle cx="13.8" cy="13.8" r="13.8" fill="#AE5D40"/><path fill="#79444A" d="M12 10h3v8h-3z"/><path fill="#D1B187" d="M12 12h3v3l-2 1h-3z"/></svg>',
  sw: 'width="8.7" height="31.6" viewBox="0 0 8.7 31.6"><path fill="#D1B187" d="m1 28-1 3 5 1 2-2-1-3H4z"/><path fill="#D2C9A5" d="M4 26V0s9 7 2 26H4z"/><path fill="#AE5D40" d="M3 26h4v1H3z"/></svg>',
  bw: 'width="30.6" height="28.2" viewBox="0 0 30.6 28.2"><path fill="#574852" d="M21.2 27.7 2.9 14.1 21.2.5l.2.3L3.6 14.1l17.8 13.3z"/><path fill="#AE5D40" d="M20.8 0s2.7 4.4 2.7 14.1-2.7 14.1-2.7 14.1 4.7-3 4.7-14.1S20.8 0 20.8 0z"/><path fill="#4D4539" d="M6.8 13.7h22.6v.8H6.8z"/><path fill="#D2C9A5" d="m30.6 14.1-3-1.7.4 1.7-.4 1.7z"/><path fill="#D1B187" d="M.7 12.8 0 15.7l4.8.8 2.3-1.9-1-2.5-2.6-.1z"/></svg>',
  cs: 'width="44" height="103.8" viewBox="0 0 44 103.8"><path fill="#BA9158" d="M44 8V0h-8v8h-4V0h-8v8h-4V0h-8v8H8V0H0v104h44z"/><path fill="#927441" d="M0 16h44v4H0zM22 48h-5s0-16 5-16 5 16 5 16h-5z"/></svg>',
  eu: 'width="23.8" height="43.8" viewBox="0 0 23.8 43.8"><path fill="#847875" d="M20 31v-3l3-5-5-10H7L0 25l6 3v12h3l1-2 5-3 5 5h4z"/><path fill="#79444A" d="M6 44h2l1-4H6z"/><path fill="#BA9158" d="M20 31V17l-1-4h-2l1 4-9 1v-5H7L6 31l-1 5h17z"/><path fill="#79444A" d="m20 40 1 2v2h3v-4zM6 28h14v3H6z"/><path fill="#AB9B8E" d="M7 5c0-3 3-5 7-5s7 2 7 5v9c0 2-1 2-4 2h-5l-5-4V5c0 1 0 0 0 0z"/><path fill="#574852" d="M13 6h8v2h-1v6h-2V8h-5z"/></svg>',
  fs: 'width="5" height="4" viewBox="0 0 5 4"><path fill="#D1B187" d="M2 0h3v3L2 4H0z"/></svg>',
  cd: 'width="59.9" height="26.4" viewBox="0 0 59.9 26.4"><path fill="#D2C9A5" d="M60 26s0-14-15-14c1 0 1-12-11-12S22 7 22 7 10 5 10 17c0 0-10 0-10 9h60z"/></svg>',
  hr: 'width="54.3" height="44.1" viewBox="0 0 54.3 44.1"><path fill="#4B3D44" d="m34 3-7 20h3l6-17V4zM12 24H5l-5 9h5l3-6h4z"/><path fill="#BA9158" d="m35 31-23 2v5h24l5-5 3-18h-2z"/><path fill="#927441" d="M41 6V0h-5v6l-6 17H12v21h4v-8l3-3h13v11h4v-8l6-21h12V6z"/><path fill="#4B3D44" d="M12 43h4v1h-4zM32 43h4v1h-4z"/></svg>',
  sl: 'width="21.9" height="37.5" viewBox="0 0 21.9 37.5"><path fill="#574852" d="M0 0h22v38H0z"/><path fill="#847875" d="M1 2h20v34H1z"/><path fill="#79444A" d="M10 16h2v8h-2z"/><path fill="#D1B187" d="M10 18h2v3l-2 1H7z"/></svg>',
  gn: 'width="38.1" height="5.7" viewBox="0 0 38.1 5.7"><path fill="#AE5D40" d="M10 0h28v5H10z"/><path fill="#4D4539" d="M3 1h7v3H3z"/><path fill="#79444A" d="M29 0h1v5h-1zM19 0h1v5h-1z"/><path fill="#D1B187" d="M1 1 0 4l5 1 2-2-1-2-2-1zM22 6V4h4v2z"/></svg>',
  ics: 'width="16" height="16" viewBox="0 0 16 16"><path fill="#4B726E" d="M10 1v2-2h2v5h-1l1 9H4l1-9H4V1h2v2-2z"/></svg>',
  isc: 'width="16" height="16" viewBox="0 0 16 16"><path fill="#4B726E" d="M4 2v10l4 3 4-3V2H4zm6 6H6l1-1-2-2h2l1-1 1 1h2L9 7l1 1z"/></svg>',
};

const imgContainer = document.getElementById("imgs");
Object.entries(SVG_DATA).forEach(([id, data]) => {
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" ${data}`
  );
  imgContainer?.insertAdjacentHTML(
    "beforeend",
    `
    <img id="${id}" src="data:image/svg+xml;utf8, ${encoded}" />
  `
  );
});

const bg = new Background();
const mainBanner = new MainBanner();
const gameController = new GameController();
const resultBoard = new ResultBoard({ gameController });
const strategyController = new StrategyController();
const detailsBox = DetailsBox.getInstance();

const loop = GameLoop({
  update: () => {
    bg.update();
    resultBoard.update();
    if (RESULT_STATES.includes(GameManager.getInstance().state)) return;
    mainBanner.update();
    gameController.update();
    strategyController.update();
    detailsBox.update();
  },
  render: () => {
    bg.render();
    mainBanner.render();
    gameController.render();
    strategyController.render();
    if (RESULT_STATES.includes(GameManager.getInstance().state)) {
      resultBoard.render();
    }
    detailsBox.render();
  },
});
loop.start();
