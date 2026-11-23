const test = require("node:test");
const assert = require("node:assert/strict");
const Builder = require("../game-assets/scripts/enemies/builder.js");

function makeContext({ enemyCell, bombCell, range = 4, blocked = [], playerCell = [1, 1], otherEnemies = [], otherBombs = [] }) {
  const cols = 11, rows = 11;
  const map = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => x === 0 || y === 0 || x === cols - 1 || y === rows - 1 ? 1 : 0)
  );
  for (const [x, y, type = 1] of blocked) map[y][x] = type;
  const bomb = { x: bombCell[0], y: bombCell[1], range };
  const enemy = {
    x: enemyCell[0] + .5, y: enemyCell[1] + .5, alive: true,
    huntSpeed: 2, path: [], building: false, bombEscapePending: true
  };
  const player = { x: playerCell[0] + .5, y: playerCell[1] + .5 };
  const enemies = [enemy, ...otherEnemies.map(([x, y]) => ({ x: x + .5, y: y + .5, alive: true, burrowing: false }))];
  const bombs = [bomb, ...otherBombs];
  const key = (x, y) => x + "," + y;
  const tileAt = (x, y) => x < 0 || y < 0 || x >= cols || y >= rows ? 1 : map[y][x];
  const bombAt = (x, y) => bombs.find(b => Math.floor(b.x) === x && Math.floor(b.y) === y);
  const getBombDangerCells = b => {
    const result = new Set([key(Math.floor(b.x), Math.floor(b.y))]);
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      for (let n = 1; n <= b.range; n++) {
        const x = Math.floor(b.x) + dx * n, y = Math.floor(b.y) + dy * n;
        const tile = tileAt(x, y);
        if (tile === 1) break;
        result.add(key(x, y));
        if (tile === 2) break;
      }
    }
    return result;
  };
  const findGridPath = (sx, sy, tx, ty, danger) => {
    if (Math.abs(tx - sx) + Math.abs(ty - sy) !== 1) return [];
    if (tileAt(tx, ty) !== 0 || bombAt(tx, ty) || (danger && danger.has(key(tx, ty)))) return [];
    return [{ x: tx, y: ty }];
  };
  const context = {
    enemy, bomb, cols, rows, map, player, enemies, bombs,
    exit: { found: false, x: -1, y: -1 },
    waterPuddleCells: new Set(),
    tileAt, bombAt, cellKey: key, findGridPath, getBombDangerCells,
    distance: (x, y, a, b) => Math.hypot(x - a, y - b),
    builderBuildAnimations: [],
    followEnemyPath: (target) => {
      const next = target.path[0];
      if (next) {
        target.x = next.x + .5;
        target.y = next.y + .5;
        target.path.shift();
      }
    },
    rebuildStaticMapCache: () => { context.cacheRebuilt = (context.cacheRebuilt || 0) + 1; },
    spawnSandBuildParticles: () => { context.particleBursts = (context.particleBursts || 0) + 1; }
  };
  context.beginShieldBuild = (target, activeBomb) =>
    Builder.beginShieldBuild({ ...context, enemy: target, bomb: activeBomb });
  return context;
}

test("constrói escudo nos quatro sentidos cardeais", () => {
  const cases = [
    { enemyCell: [7,5], bombCell: [5,5], shield: [6,5], retreat: [8,5] },
    { enemyCell: [3,5], bombCell: [5,5], shield: [4,5], retreat: [2,5] },
    { enemyCell: [5,7], bombCell: [5,5], shield: [5,6], retreat: [5,8] },
    { enemyCell: [5,3], bombCell: [5,5], shield: [5,4], retreat: [5,2] }
  ];
  for (const item of cases) {
    const ctx = makeContext(item);
    const plan = Builder.planShield(ctx);
    assert.equal(plan.ok, true, JSON.stringify(plan));
    assert.deepEqual([plan.shieldX, plan.shieldY], item.shield);
    assert.deepEqual([plan.retreatX, plan.retreatY], item.retreat);
  }
});

test("usa uma casa lateral se o recuo direto estiver bloqueado", () => {
  const ctx = makeContext({
    enemyCell: [7,5], bombCell: [6,5], range: 3,
    blocked: [[8,5,1]]
  });
  const plan = Builder.planShield(ctx);
  assert.equal(plan.ok, true, JSON.stringify(plan));
  assert.deepEqual([plan.retreatX, plan.retreatY], [7,6]);
  assert.equal(plan.retreatDirection, "side-a");
});

test("não constrói se já existe obstáculo entre bomba e construtor", () => {
  const ctx = makeContext({ enemyCell: [8,5], bombCell: [5,5], blocked: [[6,5,2]] });
  assert.equal(Builder.planShield(ctx).reason, "already-protected");
});

test("não tenta construir fora do alcance ou em diagonal", () => {
  const tooFar = makeContext({ enemyCell: [8,5], bombCell: [5,5], range: 2 });
  const diagonal = makeContext({ enemyCell: [7,7], bombCell: [5,5], range: 4 });
  assert.equal(Builder.planShield(tooFar).reason, "outside-blast-range");
  assert.equal(Builder.planShield(diagonal).reason, "not-aligned");
});

test("não ocupa a casa do jogador nem outro inimigo", () => {
  const playerBlocked = makeContext({ enemyCell: [7,5], bombCell: [5,5], playerCell: [6,5] });
  const enemyBlocked = makeContext({ enemyCell: [7,5], bombCell: [5,5], otherEnemies: [[6,5]] });
  assert.equal(Builder.planShield(playerBlocked).reason, "shield-cell-occupied");
  assert.equal(Builder.planShield(enemyBlocked).reason, "shield-cell-occupied");
});

test("inicia a retirada e limpa a fuga genérica da bomba", () => {
  const ctx = makeContext({ enemyCell: [7,5], bombCell: [5,5] });
  assert.equal(Builder.beginShieldBuild(ctx), true);
  assert.equal(ctx.enemy.building, true);
  assert.equal(ctx.enemy.buildPhase, "retreat");
  assert.deepEqual(ctx.enemy.path, [{ x: 8, y: 5 }]);
  assert.equal(ctx.enemy.bombEscapePending, false);
});

test("a máquina de estados recua, ergue o bloco destrutível e conclui a animação", () => {
  const ctx = makeContext({ enemyCell: [7,5], bombCell: [5,5] });
  assert.equal(Builder.beginShieldBuild(ctx), true);
  assert.equal(Builder.updateEnemy(ctx.enemy, .05, ctx), true);
  assert.equal(ctx.map[5][6], 2);
  assert.equal(ctx.builderBuildAnimations.length, 1);
  assert.equal(ctx.cacheRebuilt, 1);
  assert.equal(ctx.particleBursts, 1);
  assert.equal(ctx.enemy.buildPhase, "raise");
  assert.equal(Builder.updateEnemy(ctx.enemy, .24, ctx), false);
  assert.equal(ctx.enemy.building, false);
  assert.equal(ctx.enemy.buildDebugReason, "shield-complete");
});

test("cancela sem colocar bloco se a bomba for movida durante a retirada", () => {
  const ctx = makeContext({ enemyCell: [7,5], bombCell: [5,5] });
  assert.equal(Builder.beginShieldBuild(ctx), true);
  ctx.bomb.x = 4;
  assert.equal(Builder.updateEnemy(ctx.enemy, .05, ctx), false);
  assert.equal(ctx.map[5][6], 0);
  assert.equal(ctx.enemy.building, false);
});

test("cancela com segurança se a casa do escudo ficar ocupada durante a retirada", () => {
  const ctx = makeContext({ enemyCell: [7,5], bombCell: [5,5] });
  assert.equal(Builder.beginShieldBuild(ctx), true);
  ctx.map[5][6] = 1;
  assert.equal(Builder.updateEnemy(ctx.enemy, .05, ctx), false);
  assert.equal(ctx.map[5][6], 1);
  assert.equal(ctx.enemy.building, false);
});
