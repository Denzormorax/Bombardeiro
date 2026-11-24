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

test("fantasminhas aparecem somente nas fases 3 a 6 do Pântano", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /currentWorld==="swamp"&&level>=3&&level<=6\)spawnSwampGhosts\(\)/);
  assert.match(html, /const count=2\+Math\.floor\(Math\.random\(\)\*2\)/);
  assert.match(html, /dist>5\)return false/);
});
test("fantasminhas flutuam, perseguem por caminhos e só teleportam ao receber dano", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /swampGhostMistCanvas|swampMist/);
  assert.match(html, /Math\.sin\(g\.phase\)\*3\.1/);
  assert.match(html, /swampGhostChasePath/);
  assert.match(html, /g\.alerted/);
  assert.match(html, /swampGhostStartTeleport\(enemy,destination,true,true(?:,false,"damage")?\)/);
  assert.doesNotMatch(html, /danger\.has\(k\)&&swampGhostStartTeleport\(g,swampGhostTarget\(g,true,danger\),true\)/);
  assert.match(html, /!entity\.isSwampGhost/);
});
test("lama reduz movimento e desloca apenas alguns pixels os pés", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /dx\*=\.64;dy\*=\.64/);
  assert.match(html, /player\.y\+=\.045/);
  assert.match(html, /e\.y\+=\.045/);
});
test("troncos do pântano soltam lascas, cipós e folhas com sprites em cache", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /swampDebrisCache/);
  assert.match(html, /i<36/);
  assert.match(html, /currentWorld==="swamp"\)spawnDestroyedBlockEffect/);
});

test("fantasminha suporta três danos e reaparece em posição aleatória após ser atingido", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /enemy\.hp=Math\.max\(0,\(enemy\.hp\?\?3\)-1\)/);
  assert.match(html, /swampGhostRandomDestination\(enemy,danger\)/);
  assert.match(html, /swampGhostStartTeleport\(enemy,destination,true,true(?:,false,"damage")?\)/);
  assert.match(html, /if\(enemy\.hp<=0\).*?killEnemy\(enemy\)/s);
});
test("bombas empurradas no Pântano param em poças de lama e mantêm o temporizador", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /currentWorld==="swamp"&&waterPuddleCells\.has\(cellKey\(nx,ny\)\)\)\{b\.x=nx;b\.y=ny;b\.slide=null;continue\}/);
});
test("brilho diagonal dos blocos indestrutíveis do Pântano usa verde escuro mais intenso", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /swamp:createPillarShimmerCanvas\("rgb\(13,104,39\)","rgba\(211,255,190,1\)",1\.65\)/);
});

test("fantasmas que se tocam desaparecem rapidamente e recebem destinos aleatórios distintos", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /function swampGhostRandomDestination\(ghost,danger,reserved=\[\]\)/);
  assert.match(html, /function swampGhostResolveTouchCollisions\(danger\)/);
  assert.match(html, /Math\.hypot\(a\.x-b\.x,a\.y-b\.y\)>.48/);
  assert.match(html, /swampGhostStartTeleport\(a,destinationA,true,true,true\)/);
  assert.match(html, /swampGhostStartTeleport\(b,destinationB,true,true,true\)/);
  assert.match(html, /collision\?\.30/);
  assert.match(html, /swampGhostResolveTouchCollisions\(danger\)/);
  assert.doesNotMatch(html, /function swampGhostSpread\(/);
});
test("teletransporte periódico dos fantasminhas também continua durante a perseguição", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /g\.patrolTeleportTimer=Math\.max\(0,\(g\.patrolTeleportTimer\?\?4\)-dt\)/);
  assert.match(html, /swampGhostStartTeleport\(g,target,!g\.alerted,true\)/);
  assert.match(html, /ctx\.drawImage\(swampGhostBody,-33,-39,66,77\)/);
});

test("fantasma escolhe somente um dos quatro quadrados ortogonais livres ao surgir perto do jogador", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  const target = html.slice(html.indexOf("function swampGhostChaseSpawnTarget"), html.indexOf("function swampGhostTarget"));
  assert.match(target, /for\(const d of \[\[0,-1\],\[1,0\],\[0,1\],\[-1,0\]\]\)/);
  assert.match(target, /tileAt\(x,y\)!==0/);
  assert.match(target, /waterPuddleCells\.has\(key\)/);
  assert.match(target, /danger\.has\(key\)/);
  assert.match(html, /swampGhostStartTeleport\(g,target,false,false,false,"chase"\)/);
});
test("aparição de perseguição usa espiral lenta e não coloca o fantasma sobre o jogador", () => {
  const html = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
  assert.match(html, /style==="chase"\?1\.35/);
  assert.match(html, /g\.teleportStyle==="chase"&&g\.teleportSwapped/);
  assert.match(html, /g\.spiralEmitClock/);
  assert.match(html, /ctx\.rotate\(\(1-revealProgress\)\*Math\.PI\*2\.15\)/);
});
