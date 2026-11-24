const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("todos os inimigos usam percepção máxima de quatro blocos com linha de visão", () => {
  const vision = game.slice(game.indexOf("function canSeePlayer"), game.indexOf("function choosePatrolPath"));
  assert.match(vision, /vision=4/);
  assert.match(vision, /if\(dist>vision\)return false/);
  assert.match(game, /const seesPlayer=canSeePlayer\(enemy\)/);
  assert.match(game, /const sees=d<=4&&canSeePlayer\(e\)/);
  assert.doesNotMatch(vision, /vision=11|vision=9|vision=6\.5/);
});

test("caçador e boneco de neve patrulham durante a espera da explosão", () => {
  const update = game.slice(game.indexOf("function updateEnemies(dt)"), game.indexOf("/* BOMBAS E COMBATE */"));
  assert.match(update, /if\(enemy\.evadeTimer>0\)\{[\s\S]{0,280}choosePatrolPath\(enemy,danger\)/);
  assert.match(update, /const playerVisibleAfterBomb=canSeePlayer\(enemy\)/);
  assert.match(update, /enemy\.mode=playerVisibleAfterBomb\?"chase":"patrol"/);
});

test("inimigos enfurecidos e foguinho azul não perseguem o jogador fora do alcance", () => {
  assert.match(game, /enemy\.isBuilder&&enemy\.isEnraged&&canSeePlayer\(enemy\)/);
  assert.match(game, /enemy\.isHorned&&enemy\.isEnraged&&canSeePlayer\(enemy\)/);
  assert.match(game, /if\(!sees&&e\.mode==="chase"\)\{e\.mode="patrol"/);
  assert.match(game, /const playerVisibleAfterBomb=distance\(e\.x,e\.y,player\.x,player\.y\)<=4&&canSeePlayer\(e\)/);
});

test("moedas sempre surgem no centro de uma célula livre do chão", () => {
  const coin = game.slice(game.indexOf("function findFreeCoinPosition"), game.indexOf("function coinValue"));
  assert.match(coin, /candidates=\[\{x:centerX\+\.5,y:centerY\+\.5\}\]/);
  assert.match(coin, /tileAt\(Math\.floor\(p\.x\),Math\.floor\(p\.y\)\)===0/);
  assert.match(coin, /canOccupy\(p\.x,p\.y,COIN_RADIUS,null,null\)/);
  assert.doesNotMatch(coin, /candidates=\[\{x,y\}\]/);
});
