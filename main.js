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
let currentLineIndex = 0; // cuántas líneas se han revelado en la escena
let waitingForChoice = false;

// ---------------------------
// UI (Pixeloid)
// ---------------------------
const TEXT_X = 18;
const FONT_SIZE = 16;
const LINE_HEIGHT = 18;
const FONT_UI = `${FONT_SIZE}px "Pixeloid", monospace`;

// Micro-corte entre “páginas” (ms)
const PAGE_CUT_MS = 120;
let cutUntil = 0; // timestamp (performance.now) hasta el que se muestra la caja vacía

// ---------------------------
// ASSETS
// ---------------------------
let images = {};

const imageManifest = {
  title_bg: "./assets/gfx/backgrounds/title_bg.png",
  station_bg: "./assets/gfx/backgrounds/station_bg.png",
  village_bg: "./assets/gfx/backgrounds/village_bg.png",
  inn_bg: "./assets/gfx/backgrounds/inn_bg.png",

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

// Lazy-load por si añades fondos y te olvidas del manifest
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

  // TITLE: Enter para empezar
  if (currentScene.type === "title" && e.key === "Enter") {
    loadScene(resolveNext(currentScene.next));
    return;
  }

  // Choices: números 1..9
  if (waitingForChoice && e.key >= "1" && e.key <= "9") {
    const index = parseInt(e.key, 10) - 1;
    const choice = currentScene.choices?.[index];
    if (!choice) return;

    const allowed = !choice.condition || choice.condition(flags, { sanity });
    if (!allowed) return;

    loadScene(resolveNext(choice.next));
    return;
  }

  // Avance con Enter
  if (e.key === "Enter" && !waitingForChoice) {
    const sceneText = getSceneText();

    if (currentLineIndex < sceneText.length) {
      // revelamos una línea más
      const nextIndex = currentLineIndex + 1;

      // Micro-corte cuando empezamos una nueva “página” (líneas 3,5,7...)
      // (o sea: cuando nextIndex es impar y > 1)
      if (nextIndex > 1 && nextIndex % 2 === 1) {
        cutUntil = performance.now() + PAGE_CUT_MS;
      }

      currentLineIndex = nextIndex;
      return;
    }

    // Fin del texto: choices o next o fin
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

// next puede ser string o función
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

  // al cambiar de escena, cancelamos cualquier corte visual pendiente
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

// Texto con borde (legibilidad)
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

// Caja pequeña narrativa (2 líneas) + caja alta para opciones
function renderScene(t) {
  const sceneText = getSceneText();
  drawBackground();

  ctx.font = FONT_UI;

  const margin = 8;
  const BOX_X = 10;
  const BOX_W = INTERNAL_WIDTH - 20;

  const BOX_H_NARR = 72;
  const BOX_H_CHOICES = 120;

  const usingChoicesBox = waitingForChoice && currentScene.choices;
  const BOX_H = usingChoicesBox ? BOX_H_CHOICES : BOX_H_NARR;
  const BOX_Y = INTERNAL_HEIGHT - BOX_H - margin;

  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

  const textStartY = BOX_Y + 28;

  if (usingChoicesBox) {
    // ---- Opciones: todas visibles ----
    const choicesStartY = textStartY;

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

  // ---- Micro-corte: caja vacía unos ms ----
  if (performance.now() < cutUntil) {
    return;
  }

  // ---- Narración en páginas de 2 líneas ----
  if (currentLineIndex <= 0) return;

  const revealed = currentLineIndex;

  // página (0,1) (2,3) (4,5)...
  const pageStart = Math.floor((revealed - 1) / 2) * 2;

  // impar -> 1 línea, par -> 2 líneas
  const linesToShow = (revealed % 2 === 1) ? 1 : 2;

  const visibleLines = sceneText.slice(pageStart, pageStart + linesToShow);

  visibleLines.forEach((line, i) => {
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

  // Espera a Pixeloid (local) sin bloquear si falla
  try {
    await document.fonts.load(FONT_UI);
    await document.fonts.ready;
  } catch {}

  if (currentScene?.bg) lazyLoadBackground(currentScene.bg);

  requestAnimationFrame(loop);
})();