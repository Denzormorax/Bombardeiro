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
  assert.ok(game.includes('phaseIntro.textContent=String(level)+"-"+String(worldNumber())'));
});

test("jogo e entradas ficam bloqueados durante toda a animação", () => {
  assert.match(game, /paused=true;[\s\S]*?introBlocker\.style\.display="block";[\s\S]*?clearMovementInput\(\)/);
  assert.match(game, /phaseIntro\.onanimationend=function\(event\)/);
  assert.match(game, /if\(running\)paused=false/);
  assert.ok(game.includes("#phaseIntroBlocker{position:fixed;inset:0;z-index:99998;display:none;background:rgba(0,0,0,.10);pointer-events:auto}"));
  assert.match(game, /pointer-events:none!important;animation:phaseIntroSlide/);
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

test("as propriedades animadas de opacidade e deslocamento não são travadas por !important", () => {
  const introStart = game.indexOf("#phaseToast{position:fixed!important");
  assert.notEqual(introStart, -1, "CSS da introdução da fase não encontrado");
  const baseEnd = game.indexOf("}", introStart);
  const baseRule = game.slice(introStart, baseEnd + 1);
  const activeStart = game.indexOf("#phaseToast.phase-intro-active{", baseEnd);
  assert.notEqual(activeStart, -1, "Regra ativa da introdução não encontrada");
  const activeEnd = game.indexOf("}", activeStart);
  const activeRule = game.slice(activeStart, activeEnd + 1);
  assert.doesNotMatch(baseRule, /opacity:\s*0\s*!important|transform:\s*none\s*!important/);
  assert.doesNotMatch(activeRule, /opacity:\s*1\s*!important|transform:\s*none\s*!important/);
  assert.match(activeRule, /animation:phaseIntroSlide 1\.75s linear both!important/);
});
