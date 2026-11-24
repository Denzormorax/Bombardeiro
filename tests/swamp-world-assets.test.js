const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const atlas = fs.readFileSync(path.join(root, "game-assets/sprites/swamp_themes.svg"), "utf8");
const world = JSON.parse(fs.readFileSync(path.join(root, "game-assets/worlds/swamp-world.json"), "utf8"));

test("Mundo 5 possui dez fases temáticas próprias do Pântano Assombrado", () => {
  assert.equal(world.world, 5);
  assert.equal(world.id, "swamp");
  assert.equal(world.phases.length, 10);
  assert.equal(new Set(world.phases.map(phase => phase.name)).size, 10);
  assert.equal(world.phases[9].bossPhase, true);
  assert.equal(world.phases.slice(0, 9).every(phase => !phase.bossPhase), true);
});

test("atlas do pântano contém quarenta texturas, quatro por fase", () => {
  assert.match(atlas, /width="384" height="960"/);
  assert.equal((atlas.match(/<g transform="translate\(/g) || []).length, 40);
  assert.equal((atlas.match(/<title>(?:Terreno|Variação de terreno|Bloco indestrutível|Tronco destrutível)/g) || []).length, 40);
  for (const phase of world.phases) assert.ok(atlas.includes(phase.name), `Texturas ausentes: ${phase.name}`);
});

test("blocos destrutíveis do novo mundo são troncos de madeira em relevo", () => {
  assert.equal(world.destructibleBlock.type, "weathered_swamp_log");
  assert.equal(world.destructibleBlock.sameGameplayAsExistingDestructibleBlocks, true);
  const logs = atlas.split("<title>Tronco destrutível");
  assert.equal(logs.length - 1, 10);
  assert.match(atlas, /linearGradient id="log"/);
  assert.match(atlas, /stroke="#d5a775"/);
  assert.match(atlas, /filter id="shadow"/);
});

test("fantasma e monstro de lama continuam fora desta etapa", () => {
  assert.match(world.enemyChanges, /Nenhum inimigo novo/);
  assert.match(world.enemyChanges, /etapa futura/);
});
