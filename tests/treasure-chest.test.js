const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("baú azul raro pode surgir ao destruir blocos em qualquer mundo, no máximo uma vez por fase", () => {
  const explode = game.slice(game.indexOf("function explode(b)"), game.indexOf("function hurtPlayer"));
  assert.match(explode, /!treasureSpawnedThisLevel&&Math\.random\(\)<\.025/);
  assert.match(explode, /treasureSpawnedThisLevel=true;treasureChests\.push\(\{x,y,hp:4,maxHp:4/);
  assert.match(explode, /spawnTreasureEffect\(x\+\.5,y\+\.5,"reveal"\)/);
  assert.doesNotMatch(explode.slice(explode.indexOf("Math.random()<.025")-80, explode.indexOf("Math.random()<.025")+260), /currentWorld===/);
});

test("baú exige quatro explosões e solta moeda azul de 100 moedas", () => {
  const explode = game.slice(game.indexOf("function explode(b)"), game.indexOf("function hurtPlayer"));
  assert.match(explode, /chest\.hp--;chest\.hitFlash=\.24/);
  assert.match(explode, /if\(chest\.hp<=0\)\{treasureChests\.splice\(i,1\)/);
  assert.match(explode, /spawnTreasureEffect\(chest\.x\+\.5,chest\.y\+\.5,"burst"\)/);
  assert.match(explode, /type:"blue",value:100/);
  const coin = game.slice(game.indexOf("function createCoin"), game.indexOf("function updateHUD"));
  assert.match(coin, /type==="blue"\?100/);
  const collect = game.slice(game.indexOf("function collectCoins"), game.indexOf("/* LOJINHA */"));
  assert.match(collect, /coins\+=value/);
});

test("baú é sólido, anima tampa e salto, com partículas douradas e fogo azul em cache", () => {
  const collision = game.slice(game.indexOf("function canOccupy"), game.indexOf("function moveEntity"));
  assert.match(collision, /for\(const chest of treasureChests\)/);
  const visual = game.slice(game.indexOf("function buildTreasureVisualCache"), game.indexOf("function drawCoin(c)"));
  assert.match(visual, /treasureChestBodyCanvas=body/);
  assert.match(visual, /treasureChestLidCanvas=lid/);
  assert.match(visual, /treasureGoldSparkCanvas=spark/);
  assert.match(visual, /treasureBlueFlameCanvas=flame/);
  assert.match(visual, /treasureBlueCoinCanvas=coin/);
  assert.match(visual, /Math\.abs\(Math\.sin\(t\*4\.15\+chest\.phase\)\)\*3\.2/);
  assert.match(visual, /ctx\.rotate\(-lidOpen\)/);
  assert.match(visual, /drawImage\(treasureAuraCanvas/);
  assert.match(visual, /drawImage\(treasureGoldSparkCanvas/);
  assert.match(visual, /drawImage\(treasureBlueFlameCanvas/);
});

test("efeitos do tesouro reutilizam sprites pré-renderizados e respeitam dt", () => {
  const update = game.slice(game.indexOf("function updateTreasureEffects"), game.indexOf("function drawTreasureEffects"));
  assert.match(update, /p\.x\+=p\.vx\*dt/);
  assert.match(update, /p\.vy\+=\(effect\.kind==="reveal"\?1\.25:2\.2\)\*dt/);
  const draw = game.slice(game.indexOf("function drawTreasureEffects"), game.indexOf("function drawTreasureChest"));
  assert.match(draw, /if\(!treasureEffects\.length\)return/);
  assert.match(draw, /ctx\.drawImage\(treasureGoldSparkCanvas/);
  assert.match(draw, /ctx\.drawImage\(treasureBlueFlameCanvas/);
  assert.doesNotMatch(draw, /shadowBlur/);
});

test("tesouro e efeitos são limpos ao iniciar outra fase", () => {
  const level = game.slice(game.indexOf("function newLevel"), game.indexOf("function gameOver"));
  assert.match(level, /treasureChests\.length=0;treasureEffects\.length=0;treasureSpawnedThisLevel=false/);
});
