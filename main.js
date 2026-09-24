import { scenes } from "./data/scenes.js";
import { loadImages } from "./engine/assets.js";

// ---------------------------
// CONFIG CANVAS
// ---------------------------
const INTERNAL_WIDTH = 480;
const INTERNAL_HEIGHT = 270;
const SCALE = 4;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = INTERNAL_WIDTH * SCALE;
canvas.height = INTERNAL_HEIGHT * SCALE;

ctx.imageSmoothingEnabled = false;
ctx.scale(SCALE, SCALE);

// ---------------------------
// GAME STATE
// ---------------------------
const flags = {
  spokeWithInnkeeper: false,
  heardAboutWater: false,
  examinedAltar: false,
  catacombsUnlocked: false,
  drankWater: false,
  readArchive: false,
};

let sanity = 100;
function loseSanity(amount) {
  sanity -= amount;
  if (sanity < 0) sanity = 0;
}

let gameEnded = false;

// Scene runtime
let currentSceneKey = "title";
let currentScene = scenes[currentSceneKey];
let currentLineIndex = 0;
let waitingForChoice = false;

// ---------------------------
// UI (Pixeloid)
// ---------------------------
const TEXT_X = 18;
const FONT_SIZE = 16;
const LINE_HEIGHT = 18;
const FONT_UI = `${FONT_SIZE}px "Pixeloid", monospace`;

const PAGE_CUT_MS = 120;
let cutUntil = 0;

// ---------------------------
// ASSETS
// ---------------------------
let images = {};

const imageManifest = {
  title_bg: "./assets/gfx/backgrounds/title_bg.png",
  station_bg: "./assets/gfx/backgrounds/station_bg.png",
  village_bg: "./assets/gfx/backgrounds/village_bg.png",
  square_approach_bg: "./assets/gfx/backgrounds/square_approach_bg.png",
  inn_bg: "./assets/gfx/backgrounds/inn_bg.png",
  inn_room_bg: "./assets/gfx/backgrounds/inn_room_bg.png",
  plaza_bg: "./assets/gfx/backgrounds/plaza_bg.png",
  archive_bg: "./assets/gfx/backgrounds/archive_bg.png",
  cathedral_path_bg: "./assets/gfx/backgrounds/cathedral_path_bg.png",
  cathedral_nave_bg: "./assets/gfx/backgrounds/cathedral_nave_bg.png",
  cathedral_altar_bg: "./assets/gfx/backgrounds/cathedral_altar_bg.png",
  cathedral_side_bg: "./assets/gfx/backgrounds/cathedral_side_bg.png",
  catacombs_entry_bg: "./assets/gfx/backgrounds/catacombs_entry_bg.png",
  catacombs_fork_bg: "./assets/gfx/backgrounds/catacombs_fork_bg.png",
  deep_chamber_bg: "./assets/gfx/backgrounds/deep_chamber_bg.png",
  ritual_chamber_bg: "./assets/gfx/backgrounds/ritual_chamber_bg.png",
  ending_water_bg: "./assets/gfx/backgrounds/ending_water_bg.png",
  ending_witness_bg: "./assets/gfx/backgrounds/ending_witness_bg.png",
  final_bg: "./assets/gfx/backgrounds/final_bg.png",
};

const lazyStatus = new Map();
function lazyLoadBackground(key) {
  if (!key) return;
  if (images[key]) return;

  const status = lazyStatus.get(key);
  if (status === "loading" || status === "loaded" || status === "error") return;

  lazyStatus.set(key, "loading");

  const img = new Image();
  img.onload = () => {
    images[key] = img;
    lazyStatus.set(key, "loaded");
  };
  img.onerror = () => {
    lazyStatus.set(key, "error");
    console.warn(`[BG] No se pudo cargar: ./assets/gfx/backgrounds/${key}.png`);
  };
  img.src = `./assets/gfx/backgrounds/${key}.png`;
}

// ---------------------------
// INPUT
// ---------------------------
window.addEventListener("keydown", (e) => {
  if (gameEnded) return;

  if (currentScene.type === "title" && e.key === "Enter") {
    loadScene(resolveNext(currentScene.next));
    return;
  }

  if (waitingForChoice && e.key >= "1" && e.key <= "9") {
    const index = parseInt(e.key, 10) - 1;
    const choice = currentScene.choices?.[index];
    if (!choice) return;

    const allowed = !choice.condition || choice.condition(flags, { sanity });
    if (!allowed) return;

    loadScene(resolveNext(choice.next));
    return;
  }

  if (e.key === "Enter" && !waitingForChoice) {
    const sceneText = getSceneText();

    if (currentLineIndex < sceneText.length) {
      const nextIndex = currentLineIndex + 1;

      if (nextIndex > 1 && nextIndex % 2 === 1) {
        cutUntil = performance.now() + PAGE_CUT_MS;
      }

      currentLineIndex = nextIndex;
      return;
    }

    if (currentScene.choices) {
      waitingForChoice = true;
      return;
    }

    if (currentScene.next) {
      loadScene(resolveNext(currentScene.next));
      return;
    }

    gameEnded = true;
  }
});

function resolveNext(next) {
  if (typeof next === "function") return next(flags, { sanity });
  return next;
}

// ---------------------------
// SCENE LOADING
// ---------------------------
function loadScene(sceneKey) {
  currentSceneKey = sceneKey;
  currentScene = scenes[sceneKey];
  currentLineIndex = 0;
  waitingForChoice = false;
  gameEnded = false;
  cutUntil = 0;

  if (currentScene?.onEnter) {
    currentScene.onEnter(flags, { loseSanity, sanity });
  }

  if (currentScene?.bg) lazyLoadBackground(currentScene.bg);
}

function getSceneText() {
  if (!currentScene.text) return [];
  if (typeof currentScene.text === "function") {
    return currentScene.text({ sanity, flags });
  }
  return currentScene.text;
}

// ---------------------------
// RENDER HELPERS
// ---------------------------
function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function drawBackground() {
  const key = currentScene.bg;
  if (key && !images[key]) lazyLoadBackground(key);

  const bg = key ? images[key] : null;
  if (bg) {
    ctx.drawImage(bg, 0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
    return;
  }

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
}

function drawTextOutlined(text, x, y) {
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillText(text, x - 1, y);
  ctx.fillText(text, x + 1, y);
  ctx.fillText(text, x, y - 1);
  ctx.fillText(text, x, y + 1);

  ctx.fillStyle = "#e6e6e6";
  ctx.fillText(text, x, y);
}

function renderTitle(t) {
  drawBackground();

  const blink = Math.floor(t / 500) % 2 === 0;
  if (blink) {
    ctx.textAlign = "center";
    ctx.font = FONT_UI;
    drawTextOutlined(
      currentScene.prompt || "PULSA ENTER",
      INTERNAL_WIDTH / 2,
      INTERNAL_HEIGHT - 18
    );
    ctx.textAlign = "left";
  }
}

function renderScene(t) {
  const sceneText = getSceneText();
  drawBackground();

  ctx.font = FONT_UI;

  const margin = 8;
  const BOX_X = 10;
  const BOX_W = INTERNAL_WIDTH - 20;
  const TEXT_MAX_WIDTH = BOX_W - (TEXT_X - BOX_X) * 2;

  const BOX_H_NARR = 72;
  const BOX_H_CHOICES = 120;

  const usingChoicesBox = waitingForChoice && currentScene.choices;

  if (usingChoicesBox) {
    const BOX_H = BOX_H_CHOICES;
    const BOX_Y = INTERNAL_HEIGHT - BOX_H - margin;

    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

    const choicesStartY = BOX_Y + 28;

    currentScene.choices.forEach((choice, index) => {
      const ok = !choice.condition || choice.condition(flags, { sanity });
      if (!ok) return;

      drawTextOutlined(
        `${index + 1}. ${choice.text}`,
        TEXT_X,
        choicesStartY + index * LINE_HEIGHT
      );
    });
    return;
  }

  if (performance.now() < cutUntil) {
    const BOX_Y = INTERNAL_HEIGHT - BOX_H_NARR - margin;
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H_NARR);
    return;
  }

  if (currentLineIndex <= 0) return;

  const revealed = currentLineIndex;
  const pageStart = Math.floor((revealed - 1) / 2) * 2;
  const linesToShow = (revealed % 2 === 1) ? 1 : 2;
  const visibleLines = sceneText.slice(pageStart, pageStart + linesToShow);

  const wrappedLines = visibleLines.flatMap((line) => wrapText(line, TEXT_MAX_WIDTH));

  const BOX_H = Math.max(BOX_H_NARR, 28 + wrappedLines.length * LINE_HEIGHT + 10);
  const BOX_Y = INTERNAL_HEIGHT - BOX_H - margin;

  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

  const textStartY = BOX_Y + 28;

  wrappedLines.forEach((line, i) => {
    drawTextOutlined(line, TEXT_X, textStartY + i * LINE_HEIGHT);
  });
}

// ---------------------------
// LOOP
// ---------------------------
function loop(t) {
  if (currentScene.type === "title") renderTitle(t);
  else renderScene(t);

  requestAnimationFrame(loop);
}

// ---------------------------
// BOOT
// ---------------------------
(async function boot() {
  images = await loadImages(imageManifest);

  try {
    await document.fonts.load(FONT_UI);
    await document.fonts.ready;
  } catch {}

  if (currentScene?.bg) lazyLoadBackground(currentScene.bg);

  requestAnimationFrame(loop);
})();