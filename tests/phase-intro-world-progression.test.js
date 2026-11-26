const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");
const mainScriptStart = game.indexOf("<script>\n(()=>{");
assert.notEqual(mainScriptStart, -1, "Script principal do jogo não encontrado");
const mainScriptEnd = game.indexOf("</script>", mainScriptStart);
assert.notEqual(mainScriptEnd, -1, "Fechamento do script principal não encontrado");
const mainIifeEnd = game.lastIndexOf("\n})();", mainScriptEnd);
assert.notEqual(mainIifeEnd, -1, "Fechamento da função isolada do jogo não encontrado");
const markerPosition = game.indexOf("/* AVISO TEMPORÁRIO DA FASE");
assert.ok(markerPosition > mainScriptStart && markerPosition < mainIifeEnd,
  "Controlador da introdução precisa estar dentro do mesmo escopo das funções do jogo");
assert.ok(game.indexOf("/* AVISO TEMPORÁRIO DA FASE", mainScriptEnd) === -1,
  "O controlador não pode permanecer em um script externo");

const marker = "/* INTRODUÇÃO DAS FASES — controlador independente do HUD.";
const introStart = game.indexOf(marker);
assert.notEqual(introStart, -1, "Controlador independente da introdução não encontrado");
const introEnd = game.lastIndexOf("\n})();", mainScriptEnd);
assert.notEqual(introEnd, -1, "Fim do script principal não encontrado");
const introCode = game.slice(introStart, introEnd);

function makeElement() {
  return {
    id: "",
    textContent: "",
    style: {},
    attributes: {},
    children: [],
    parentNode: null,
    setAttribute(name, value) { this.attributes[name] = value; },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter(item => item !== child);
      child.parentNode = null;
      return child;
    }
  };
}

function runIntro(world, level = 1) {
  const body = makeElement();
  const rafQueue = [];
  const restartButton = makeElement();
  const stickKnob = makeElement();
  const windowObject = { innerWidth: 400 };
  const sandbox = {
    Image: class { constructor() { this.complete = false; this.naturalWidth = 0; this.onload = null; this.src = ""; } },
    window: windowObject,
    document: {
      body,
      documentElement: { clientWidth: 400 },
      createElement: makeElement
    },
    performance: { now: () => 0 },
    requestAnimationFrame(callback) { rafQueue.push(callback); },
    setTimeout,
    $: id => id === "restartBtn" ? restartButton : id === "stickKnob" ? stickKnob : null,
    running: true,
    paused: false,
    level,
    currentWorld: world,
    move: { x: 1, y: 1 },
    pointerMove: 7,
    keys: { ArrowRight: true },
    dpadDirections: { up: true, down: false, left: false, right: false },
    updateHUD() {},
    newLevel() {},
    showPhaseToast() {},
    worldLevelNumber() { return this.level; },
    hidePanels() {},
    TOTAL_LEVELS: 10,
    levelTransition: false,
    exit: {},
    player: {},
    score: 0,
    unlockedLevel: 1,
    selectedMapLevel: 1,
    gameClock: 0,
    portalEnterStart: 0,
    treasureSpawnWorld: world,
    treasureSpawnedThisWorld: false,
    treasureSpawnedThisLevel: false,
    saveProgress() {},
    loadProgress() {},
    allEnemiesDefeated() { return false; },
    gameOver() {}
  };
  vm.runInNewContext(introCode, sandbox, { timeout: 1000 });
  sandbox.newLevel(false);
  return { sandbox, body, rafQueue, restartButton, stickKnob };
}

test("a introdução é acionada ao criar uma fase em cada um dos cinco mundos", () => {
  const worlds = ["forest", "desert", "volcano", "ice", "swamp"];
  const expected = ["1-1", "1-2", "1-3", "1-4", "1-5"];
  for (let i = 0; i < worlds.length; i++) {
    const run = runIntro(worlds[i]);
    const overlay = run.body.children.find(element => element.id === "phaseIntroOverlay");
    const blocker = run.body.children.find(element => element.id === "phaseIntroBlocker");
    assert.ok(overlay, "overlay ausente no mundo " + worlds[i]);
    assert.ok(blocker, "bloqueador ausente no mundo " + worlds[i]);
    assert.equal(overlay.textContent, expected[i]);
    assert.equal(run.sandbox.paused, true);
    assert.equal(run.sandbox.window.__bombardeiroPhaseIntroState.triggerCount, 1);
    assert.equal(run.sandbox.move.x, 0);
    assert.equal(run.sandbox.move.y, 0);
    assert.equal(run.sandbox.pointerMove, null);
    assert.equal(Object.keys(run.sandbox.keys).length, 0);
  }
});

test("a animação entra pela direita, segura no centro por cerca de 0,8 s e sai à esquerda", () => {
  const run = runIntro("forest", 4);
  const overlay = run.body.children.find(element => element.id === "phaseIntroOverlay");
  assert.ok(overlay);
  assert.match(overlay.style.cssText, /translate3d\(120vw/);
  assert.match(overlay.style.cssText, /opacity:0/);

  let frame = run.rafQueue.shift();
  frame(0);
  frame = run.rafQueue.shift();
  frame(210);
  const centerX = Number(overlay.style.transform.match(/translate3d\(([-+0-9.e]+)px/)[1]);
  assert.ok(Math.abs(centerX) < 0.001, "a numeração deve permanecer centralizada");
  assert.equal(overlay.style.opacity, "1");

  frame = run.rafQueue.shift();
  frame(1015);
  const centerXDuringHold = Number(overlay.style.transform.match(/translate3d\(([-+0-9.e]+)px/)[1]);
  assert.ok(Math.abs(centerXDuringHold) < 0.001, "a numeração deve permanecer centralizada");
  assert.equal(overlay.style.opacity, "1");

  frame = run.rafQueue.shift();
  frame(1750);
  assert.match(overlay.style.transform, /-480(?:\.\d+)?px/);
  assert.equal(overlay.style.opacity, "0");
  assert.equal(run.body.children.length, 0);
  assert.equal(run.sandbox.paused, false);
  assert.equal(run.sandbox.window.__bombardeiroPhaseIntroState.active, false);
});

test("não inicia a apresentação quando o jogo não está em execução", () => {
  const run = runIntro("forest");
  for (const child of run.body.children.slice()) run.body.removeChild(child);
  run.sandbox.window.__bombardeiroPhaseIntroState = undefined;
  run.sandbox.running = false;
  run.sandbox.newLevel(false);
  assert.equal(run.body.children.length, 0);
  assert.equal(run.sandbox.window.__bombardeiroPhaseIntroState, undefined);
});

test("a introdução não depende do elemento antigo, de CSS animationend ou de keyframes", () => {
  assert.match(introCode, /id="phaseIntroOverlay"/);
  assert.match(introCode, /requestAnimationFrame\(drawFrame\)/);
  assert.match(introCode, /const duration=1750/);
  assert.doesNotMatch(introCode, /onanimationend|phaseIntroSlide|phase-intro-active/);
});

test("as cinco campanhas preservam a ordem e reiniciam a numeração por mundo", () => {
  assert.match(introCode, /worldOrder=\["forest","desert","volcano","ice","swamp"\]/);
  assert.match(introCode, /if\(level<TOTAL_LEVELS\)[\s\S]*?level\+\+;selectedMapLevel=level;newLevel\(true\)/);
  assert.match(introCode, /currentWorld=worldOrder\[index\+1\][\s\S]*?level=1;selectedMapLevel=1/);
  assert.match(introCode, /worldLevelNumber=function\(\)\{return level\}/);
});
