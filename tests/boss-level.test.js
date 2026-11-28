const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("todas as fases 10 usam a arena normal completa, apenas com blocos indestrutíveis", () => {
  const start = game.indexOf("/* FASE 10 — ARENA COMPLETA:");
  const end = game.indexOf("/* Ícone SVG próprio da fase 10", start);
  assert.ok(start >= 0 && end > start, "regra global da arena da fase 10 deve existir");
  const boss = game.slice(start, end);
  assert.match(boss, /if\(level!==TOTAL_LEVELS\)return/);
  assert.match(boss, /buildPhaseTenArena\(\)/);
  assert.match(boss, /rebuildStaticMapCache\(\)/);
});

test("a arena da fase 10 tem paredes, pilares fixos, área segura e nenhum bloco destrutível", () => {
  const start = game.indexOf("function buildPhaseTenArena(){");
  const end = game.indexOf("\n}", start);
  assert.ok(start >= 0 && end > start);
  const sandbox = {
    ROWS: 13, COLS: 19,
    isFixedPillar(x, y) {
      return x === 0 || y === 0 || x === 18 || y === 12 || (x % 2 === 0 && y % 2 === 0);
    }
  };
  vm.runInNewContext(game.slice(start, end + 2), sandbox);
  sandbox.buildPhaseTenArena();
  assert.equal(sandbox.map.length, 13);
  assert.ok(sandbox.map.every(row => row.length === 19));
  assert.ok(sandbox.map.flat().every(tile => tile === 0 || tile === 1),
    "não pode haver blocos destrutíveis do tipo 2");
  assert.ok(sandbox.map[0].every(tile => tile === 1));
  assert.ok(sandbox.map[12].every(tile => tile === 1));
  assert.ok(sandbox.map.every(row => row[0] === 1 && row[18] === 1));
  assert.equal(sandbox.map[1][1], 0);
  assert.equal(sandbox.map[2][2], 0);
  assert.equal(sandbox.map[4][4], 1);
});

test("fase 10 remove inimigos, moedas, itens e efeitos, preservando o portal normal de saída", () => {
  const start = game.indexOf("/* FASE 10 — ARENA COMPLETA:");
  const end = game.indexOf("/* Ícone SVG próprio da fase 10", start);
  const boss = game.slice(start, end);
  for (const expression of [
    /enemies=\[\]/, /coinsOnMap=\[\]/, /coinDrops=\{\}/,
    /waterPuddles=\[\]/, /waterParticles=\[\]/,
    /treasureChests\.length=0/, /treasureEffects\.length=0/,
    /burningCrates\.length=0/, /diamondPortalPositions\.length=0/,
    /spiderDisguises=\[\]/
  ]) assert.match(boss, expression);
  const defeatedStart = game.indexOf("const bossArenaAllEnemiesDefeatedBase");
  const defeatedEnd = game.indexOf("/* Ícone SVG próprio da fase 10", defeatedStart);
  const defeated = game.slice(defeatedStart, defeatedEnd);
  assert.match(defeated, /return level===TOTAL_LEVELS\|\|bossArenaAllEnemiesDefeatedBase\(\)/);
  assert.match(game, /spawnExitPortal\(\);/);
});

test("fase 10 recebe uma caveira SVG própria em todos os mapas de seleção", () => {
  assert.match(game, /const bossLevelSkullSvg='<svg class="bossSkullIcon"/);
  assert.match(game, /node\.classList\.add\("bossLevelNode"\)/);
  assert.match(game, /node\.setAttribute\("aria-label","Fase 10 — Boss"\)/);
  assert.match(game, /bossLevelNodeObserver\.observe\(document\.body,\{childList:true,subtree:true\}\)/);
  assert.match(game, /\.mapNode\.bossLevelNode \.bossSkullIcon/);
});
