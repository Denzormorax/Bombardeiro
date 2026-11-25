const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("entrada de fase exibe fase-mundo com parada central e saída à esquerda", () => {
  assert.match(game, /phaseIntroSlide 1\.75s linear both/);
  assert.match(game, /12%\s*\{transform:translateX\(0\);opacity:1\}/);
  assert.match(game, /58%\s*\{transform:translateX\(0\);opacity:1\}/);
  assert.match(game, /100%\s*\{transform:translateX\(-120vw\);opacity:0\}/);
  assert.match(game, /phaseIntro\.textContent=String\(level\)\+"-"+String\(worldNumber\(\)\)/);
});

test("jogo e entradas ficam bloqueados durante toda a animação", () => {
  assert.match(game, /paused=true;\s*clearMovementInput\(\)/);
  assert.match(game, /phaseIntro\.onanimationend=function\(event\)/);
  assert.match(game, /if\(running\)paused=false/);
  assert.match(game, /pointer-events:auto!important;animation:phaseIntroSlide/);
  assert.match(game, /newLevel=function\(preservePowerUps=false\)[\s\S]*?if\(running\)beginPhaseIntro\(\)/);
});

test("as cinco campanhas usam contagem local e avançam na ordem dos mundos", () => {
  assert.match(game, /worldLevelNumber=function\(\)\{return level\}/);
  assert.match(game, /worldOrder=\["forest","desert","volcano","ice","swamp"\]/);
  assert.match(game, /if\(level<TOTAL_LEVELS\)[\s\S]*?level\+\+;selectedMapLevel=level;newLevel\(true\)/);
  assert.match(game, /currentWorld=worldOrder\[index\+1\][\s\S]*?level=1;selectedMapLevel=1/);
  assert.match(game, /index<worldOrder\.length-1[\s\S]*?newLevel\(true\)/);
  assert.match(game, /unlockedLevel=TOTAL_LEVELS;saveProgress\(\);gameOver\(true\)/);
});
