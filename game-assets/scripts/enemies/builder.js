/* Módulo isolado do inimigo construtor do Deserto.
 * JavaScript clássico, sem import/export: funciona offline no WebView e também pode ser testado no Node.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BombardeiroBuilderModule = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  "use strict";

  function planShield(ctx) {
    const {
      enemy, bomb, cols, rows, player, enemies, bombs, exit,
      waterPuddleCells, tileAt, bombAt, cellKey, findGridPath,
      getBombDangerCells
    } = ctx;

    if (!enemy || !bomb || !Array.isArray(enemies) || !Array.isArray(bombs)) {
      return { ok: false, reason: "invalid-context" };
    }
    if (!bombs.includes(bomb)) return { ok: false, reason: "bomb-not-active" };

    const bx = Math.floor(bomb.x), by = Math.floor(bomb.y);
    const ex = Math.floor(enemy.x), ey = Math.floor(enemy.y);
    let dx = 0, dy = 0, steps = 0;

    // A chama do Bomberman percorre quatro eixos cardeais, nunca diagonais.
    if (ey === by && ex !== bx) {
      dx = Math.sign(ex - bx);
      steps = Math.abs(ex - bx);
    } else if (ex === bx && ey !== by) {
      dy = Math.sign(ey - by);
      steps = Math.abs(ey - by);
    } else {
      return { ok: false, reason: "not-aligned" };
    }

    if (steps < 1 || steps > Math.max(1, Number(bomb.range) || 1)) {
      return { ok: false, reason: "outside-blast-range" };
    }

    // Se já há parede ou caixa entre a bomba e o construtor, a chama já está bloqueada.
    for (let n = 1; n < steps; n++) {
      if (tileAt(bx + dx * n, by + dy * n) !== 0) {
        return { ok: false, reason: "already-protected" };
      }
    }

    // O bloco fica no primeiro quadrado livre entre a bomba e o construtor.
    // Quando estão lado a lado, o bloco é erguido na casa que o construtor ocupava.
    const shieldX = steps === 1 ? ex : bx + dx;
    const shieldY = steps === 1 ? ey : by + dy;
    if (shieldX <= 0 || shieldY <= 0 || shieldX >= cols - 1 || shieldY >= rows - 1) {
      return { ok: false, reason: "shield-out-of-bounds" };
    }
    if (tileAt(shieldX, shieldY) !== 0 ||
        waterPuddleCells.has(cellKey(shieldX, shieldY)) ||
        (exit.found && exit.x === shieldX && exit.y === shieldY)) {
      return { ok: false, reason: "shield-cell-unavailable" };
    }

    if (steps > 1) {
      if (bombAt(shieldX, shieldY) ||
          (Math.floor(player.x) === shieldX && Math.floor(player.y) === shieldY) ||
          enemies.some(other => other !== enemy && other.alive && !other.burrowing &&
            Math.floor(other.x) === shieldX && Math.floor(other.y) === shieldY)) {
        return { ok: false, reason: "shield-cell-occupied" };
      }
    }

    // Primeiro tenta recuar exatamente uma casa para longe da bomba.
    // Se houver pilar/caixa nessa casa, usa uma das laterais livres, sem perder a proteção.
    const retreatCandidates = [
      { x: ex + dx, y: ey + dy, direction: "away" },
      { x: ex - dy, y: ey + dx, direction: "side-a" },
      { x: ex + dy, y: ey - dx, direction: "side-b" }
    ];

    const otherDanger = new Set();
    for (const otherBomb of bombs) {
      if (otherBomb === bomb) continue;
      for (const key of getBombDangerCells(otherBomb)) otherDanger.add(key);
    }

    let retreat = null;
    for (const candidate of retreatCandidates) {
      const tx = candidate.x, ty = candidate.y;
      if (tx <= 0 || ty <= 0 || tx >= cols - 1 || ty >= rows - 1) continue;
      if (tileAt(tx, ty) !== 0 || bombAt(tx, ty) ||
          waterPuddleCells.has(cellKey(tx, ty)) ||
          (exit.found && exit.x === tx && exit.y === ty) ||
          (Math.floor(player.x) === tx && Math.floor(player.y) === ty) ||
          otherDanger.has(cellKey(tx, ty))) continue;
      if (enemies.some(other => other !== enemy && other.alive && !other.burrowing &&
          Math.floor(other.x) === tx && Math.floor(other.y) === ty)) continue;

      const path = findGridPath(ex, ey, tx, ty, otherDanger);
      if (path.length === 1 && path[0].x === tx && path[0].y === ty) {
        retreat = { x: tx, y: ty, path, direction: candidate.direction };
        break;
      }
    }

    if (!retreat) return { ok: false, reason: "no-safe-retreat" };

    return {
      ok: true,
      shieldX, shieldY,
      retreatX: retreat.x, retreatY: retreat.y,
      retreatPath: retreat.path,
      retreatDirection: retreat.direction,
      blastDirection: { x: dx, y: dy },
      distance: steps
    };
  }

  function beginShieldBuild(ctx) {
    const result = planShield(ctx);
    const enemy = ctx.enemy;
    if (!result.ok) {
      if (enemy) enemy.buildDebugReason = result.reason;
      return false;
    }

    enemy.path = result.retreatPath;
    enemy.patrolTarget = null;
    enemy.repath = 0;
    enemy.mode = "build";
    enemy.building = true;
    enemy.buildPhase = "retreat";
    enemy.buildTimer = 0;
    enemy.buildBlockX = result.shieldX;
    enemy.buildBlockY = result.shieldY;
    enemy.buildRetreatX = result.retreatX;
    enemy.buildRetreatY = result.retreatY;
    enemy.buildBomb = ctx.bomb;
    enemy.buildDirection = result.retreatDirection;
    enemy.buildDebugReason = "building";
    enemy.bombEscapePending = false;
    enemy.bombReactionTimer = 0;
    enemy.evadeTimer = 0;
    enemy.evadeRepath = 0;
    enemy.speed = Math.max(enemy.huntSpeed * 1.45, 2.6);
    return true;
  }

  return Object.freeze({ planShield, beginShieldBuild });
});
