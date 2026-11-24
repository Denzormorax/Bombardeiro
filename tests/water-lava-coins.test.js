const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("drops de inimigos aparecem amarelos e preservam os valores verde e vermelho", () => {
  const create = game.slice(game.indexOf("function createCoin"), game.indexOf("function updateHUD"));
  assert.match(create, /const value=coinValue\(type\)/);
  assert.match(create, /type:type==="blue"\?"blue":type==="treasureRed"\?"treasureRed":"yellow",value/);
  assert.match(create, /type==="green"\?4:6/);
  const collect = game.slice(game.indexOf("function collectCoins"), game.indexOf("/* LOJINHA */"));
  assert.match(collect, /Number\.isFinite\(c\.value\)\?c\.value:coinValue\(c\.type\)/);
  const kill = game.slice(game.indexOf("function killEnemy"), game.indexOf("function damageEnemy"));
  assert.match(kill, /"red":"green"/);
});

test("bomba na água da floresta apaga, fica parada e libera outra colocação imediatamente", () => {
  const placeStart = game.indexOf("function placeBomb");
  const place = game.slice(placeStart, game.indexOf('$("bombBtn")', placeStart));
  assert.match(place, /currentWorld==="forest"&&waterPuddleCells\.has\(cellKey\(x,y\)\)/);
  assert.match(place, /bomb\.extinguished=true/);
  assert.match(place, /bomb\.activeSlotReleased=true/);
  assert.match(place, /if\(forestWater\)activeBombs=Math\.max\(0,activeBombs-1\)/);
  assert.match(place, /bombCooldown=forestWater\?0:\.25/);
  const danger = game.slice(game.indexOf("function getBombDangerCells"), game.indexOf("function getAllBombDangerCells"));
  assert.match(danger, /bomb\.extinguished/);
  const update = game.slice(game.indexOf("function update(dt)"), game.indexOf("/* DESENHO DO CENÁRIO */"));
  assert.match(update, /if\(b\.extinguished\)\{for\(const drop of b\.waterDrips\|\|\[\]\)/);
});

test("bomba apagada fica imóvel e recebe gotas de água brilhantes com atualização leve", () => {
  const placeStart = game.indexOf("function placeBomb");
  const place = game.slice(placeStart, game.indexOf('$("bombBtn")', placeStart));
  assert.match(place, /bomb\.waterDrips=Array\.from\(\{length:5\}/);
  const updateStart = game.indexOf("function update(dt)");
  const update = game.slice(updateStart, game.indexOf("/* DESENHO DO CENÁRIO */", updateStart));
  assert.match(update, /if\(b\.extinguished\)\{for\(const drop of b\.waterDrips\|\|\[\]\)/);
  assert.match(update, /drop\.y\+=drop\.speed\*dt/);
  assert.match(update, /if\(drop\.y>12\)\{drop\.y=-16/);
  const drawStart = game.indexOf("function drawBomb(b)");
  const draw = game.slice(drawStart, game.indexOf("const flameSpriteCache=[]", drawStart));
  assert.match(draw, /pulse=b\.extinguished\?1:/);
  assert.match(draw, /drawImage\(waterDropSprite/);
  assert.doesNotMatch(draw, /globalCompositeOperation="lighter"|shadowBlur=8/);
});

test("bomba apagada pode ser detonada por uma explosão próxima", () => {
  const explode = game.slice(game.indexOf("function explode(b)"), game.indexOf("function hurtPlayer"));
  assert.match(explode, /other\.freezing\|\|other\.frozen\|\|other\.extinguished/);
  assert.match(explode, /frozenBomb=bombs\.find\(other=>other!==b&&\(other\.freezing\|\|other\.frozen\|\|other\.extinguished\)/);
});

test("bomba colocada sobre lava no mundo vulcânico explode no mesmo instante", () => {
  const placeStart = game.indexOf("function placeBomb");
  const place = game.slice(placeStart, game.indexOf('$("bombBtn")', placeStart));
  assert.match(place, /currentWorld==="volcano"&&waterPuddleCells\.has\(cellKey\(x,y\)\)/);
  assert.match(place, /if\(volcanoLava\)\{bombs\.splice\(bombs\.indexOf\(bomb\),1\);explode\(bomb\);\}/);
});

test("todas as moedas são desenhadas com aparência amarela", () => {
  const draw = game.slice(game.indexOf("function drawCoin"), game.indexOf("function buildPortalVisualCache"));
  assert.match(draw, /color="#ffd928",dark="#a96d00"/);
  assert.doesNotMatch(draw, /#36e477|#fa4545/);
});
