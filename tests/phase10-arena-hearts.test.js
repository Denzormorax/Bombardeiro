const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("a arena da fase 10 mantém o layout normal de blocos indestrutíveis e nenhuma caixa destrutível", () => {
  const start = game.indexOf("function buildPhaseTenArena(){");
  assert.notEqual(start, -1, "Construtor da arena da fase 10 não encontrado");
  const end = game.indexOf("\n}", start);
  assert.notEqual(end, -1, "Construtor da arena da fase 10 incompleto");
  const code = game.slice(start, end + 2);
  const sandbox = {
    ROWS: 13,
    COLS: 19,
    isFixedPillar(x, y) {
      return x === 0 || y === 0 || x === 18 || y === 12 || (x % 2 === 0 && y % 2 === 0);
    }
  };
  vm.runInNewContext(code, sandbox);
  sandbox.buildPhaseTenArena();

  assert.equal(sandbox.map.length, 13);
  assert.ok(sandbox.map.every(row => row.length === 19));
  assert.ok(sandbox.map.flat().every(tile => tile === 0 || tile === 1),
    "A arena não pode conter blocos destrutíveis (tipo 2)");
  assert.equal(sandbox.map[0].every(tile => tile === 1), true, "Parede superior incompleta");
  assert.equal(sandbox.map[12].every(tile => tile === 1), true, "Parede inferior incompleta");
  assert.equal(sandbox.map.every(row => row[0] === 1 && row[18] === 1), true,
    "Paredes laterais incompletas");
  assert.equal(sandbox.map[2][2], 0, "Área segura de nascimento precisa ficar livre");
  assert.equal(sandbox.map[1][1], 0, "Ponto de nascimento precisa ficar livre");
  assert.equal(sandbox.map[4][4], 1, "Pilar central indestrutível ausente");
});

test("a regra de fase 10 limpa inimigos e reconstrói o cache com a arena completa", () => {
  const start = game.indexOf("/* FASE 10 — ARENA COMPLETA:");
  const end = game.indexOf("/* Ícone SVG próprio da fase 10", start);
  assert.ok(start !== -1 && end > start, "Bloco de configuração da fase 10 não encontrado");
  const block = game.slice(start, end);
  assert.match(block, /if\(level!==TOTAL_LEVELS\)return/);
  assert.match(block, /buildPhaseTenArena\(\)/);
  assert.match(block, /enemies=\[\]/);
  assert.match(block, /rebuildStaticMapCache\(\)/);
  assert.match(block, /coinsOnMap=\[\]/);
});

test("corações perdidos são restaurados antes de criar a próxima fase após concluir o portal", () => {
  const start = game.indexOf("/* REGRAS GLOBAIS DE PROGRESSÃO — valem para todos os mundos atuais e futuros. */");
  const end = game.indexOf("\n/* INIMIGOS ESPECIAIS — MINHOCA DA FLORESTA E FURACÃO DO DESERTO.", start);
  assert.ok(start !== -1 && end > start, "Bloco isolado de regras globais de progressão não encontrado");
  const code = game.slice(start, end);

  const sandbox = {
    levelTransition: false,
    exit: { found: true, x: 5, y: 6 },
    player: { x: 5.5, y: 6.5 },
    lives: 1,
    hudUpdates: 0,
    allEnemiesDefeated() { return true; },
    updateHUD() { this.hudUpdates++; },
    checkWin() { sandbox.levelTransition = true; },
    newLevel() { sandbox.livesSeenByNextLevel = sandbox.lives; }
  };
  vm.runInNewContext(code, sandbox);
  sandbox.checkWin();
  assert.equal(sandbox.lives, 1, "Os corações devem ser restaurados ao iniciar a próxima fase, não antes");
  sandbox.newLevel(true);
  assert.equal(sandbox.lives, 3);
  assert.equal(sandbox.livesSeenByNextLevel, 3);
});

test("não restaura corações quando o jogador não conclui uma fase", () => {
  const start = game.indexOf("/* REGRAS GLOBAIS DE PROGRESSÃO — valem para todos os mundos atuais e futuros. */");
  const end = game.indexOf("\n/* INIMIGOS ESPECIAIS — MINHOCA DA FLORESTA E FURACÃO DO DESERTO.", start);
  assert.ok(start !== -1 && end > start, "Bloco isolado de regras globais de progressão não encontrado");
  const code = game.slice(start, end);
  const sandbox = {
    levelTransition: false,
    exit: { found: false, x: -1, y: -1 },
    player: { x: 1.5, y: 1.5 },
    lives: 2,
    allEnemiesDefeated() { return false; },
    updateHUD() {},
    checkWin() {},
    newLevel() { sandbox.livesSeenByNextLevel = sandbox.lives; }
  };
  vm.runInNewContext(code, sandbox);
  sandbox.checkWin();
  sandbox.newLevel(true);
  assert.equal(sandbox.lives, 2);
  assert.equal(sandbox.livesSeenByNextLevel, 2);
});
