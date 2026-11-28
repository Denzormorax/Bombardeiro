const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("todas as fases 10 ficam totalmente vazias, sem blocos", () => {
  const start = game.indexOf("/* FASE 10 — ARENA BOSS");
  const end = game.indexOf("/* Ícone SVG próprio da fase 10", start);
  assert.ok(start >= 0 && end > start, "regra global da arena Boss deve existir no final do jogo");
  const boss = game.slice(start, end);
  assert.match(boss, /if\(level!==TOTAL_LEVELS\)return/);
  assert.match(boss, /for\(let y=0;y<ROWS;y\+\+\)for\(let x=0;x<COLS;x\+\+\)map\[y\]\[x\]=0/);
  assert.match(boss, /rebuildStaticMapCache\(\)/);
});

test("fase 10 remove inimigos, blocos destrutíveis, moedas, itens e efeitos de arena", () => {
  const start = game.indexOf("/* FASE 10 — ARENA BOSS");
  const end = game.indexOf("/* Ícone SVG próprio da fase 10", start);
  const boss = game.slice(start, end);
  for (const expression of [
    /enemies=\[\]/, /coinsOnMap=\[\]/, /coinDrops=\{\}/,
    /waterPuddles=\[\]/, /waterParticles=\[\]/,
    /treasureChests\.length=0/, /treasureEffects\.length=0/,
    /burningCrates\.length=0/, /diamondPortalPositions\.length=0/,
    /spiderDisguises=\[\]/
  ]) assert.match(boss, expression);
});

test("fase 10 continua concluível sem inimigos, com portal normal de saída", () => {
  const start = game.indexOf("const bossArenaAllEnemiesDefeatedBase");
  const end = game.indexOf("/* Ícone SVG próprio da fase 10", start);
  const boss = game.slice(start, end);
  assert.match(boss, /allEnemiesDefeated=function\(\)/);
  assert.match(boss, /return level===TOTAL_LEVELS\|\|bossArenaAllEnemiesDefeatedBase\(\)/);
  assert.match(game, /spawnExitPortal\(\);/);
});

test("fase 10 recebe uma caveira SVG própria em todos os mapas de seleção", () => {
  assert.match(game, /const bossLevelSkullSvg='<svg class="bossSkullIcon"/);
  assert.match(game, /node\.classList\.add\("bossLevelNode"\)/);
  assert.match(game, /node\.setAttribute\("aria-label","Fase 10 — Boss"\)/);
  assert.match(game, /bossLevelNodeObserver\.observe\(document\.body,\{childList:true,subtree:true\}\)/);
  assert.match(game, /\.mapNode\.bossLevelNode \.bossSkullIcon/);
});

test("a arena da fase 10 não mantém nenhum bloco indestrutível ou destrutível",()=>{
 const start=game.indexOf("/* FASE 10 — ARENA BOSS");
 const end=game.indexOf("/* Ícone SVG próprio da fase 10",start);
 const boss=game.slice(start,end);
 assert.match(boss,/for\(let y=0;y<ROWS;y\+\+\)for\(let x=0;x<COLS;x\+\+\)map\[y\]\[x\]=0/);
 assert.doesNotMatch(boss,/map\[y\]\[x\]!==1/);
});
