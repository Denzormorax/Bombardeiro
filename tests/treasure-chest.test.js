const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("baú é raro: no máximo um por mundo, somente nas fases 1 a 9", () => {
  const explode = game.slice(game.indexOf("function explode(b)"), game.indexOf("function hurtPlayer"));
  assert.match(explode, /level>=1&&level<=9&&treasureSpawnWorld===currentWorld&&!treasureSpawnedThisWorld&&Math\.random\(\)<\.006/);
  assert.match(explode, /treasureSpawnedThisWorld=true;treasureChests\.push\(\{x,y,hp:4,maxHp:4/);
  assert.match(explode, /spawnTreasureEffect\(x\+\.5,y\+\.5,"reveal"\)/);
  assert.match(game, /treasureSpawnWorld=currentWorld;treasureSpawnedThisWorld=false/);
  assert.match(game, /treasureSpawnWorld=null/);
});

test("baú exige quatro explosões e sorteia moeda azul de 100 ou vermelha de 50, favorecendo a vermelha", () => {
  const explode = game.slice(game.indexOf("function explode(b)"), game.indexOf("function hurtPlayer"));
  assert.match(explode, /chest\.hp--;chest\.hitFlash=\.24/);
  assert.match(explode, /if\(chest\.hp<=0\)\{treasureChests\.splice\(i,1\)/);
  assert.match(explode, /spawnTreasureEffect\(chest\.x\+\.5,chest\.y\+\.5,"burst"\)/);
  assert.match(explode, /Math\.random\(\)<\.15\?"blue":"treasureRed"/);
  assert.match(explode, /value:coinValue\(reward\)/);
  assert.match(explode, /coinsOnMap\.push\(\{x:chest\.x\+\.5,y:chest\.y\+\.5,type:reward/);
  const coin = game.slice(game.indexOf("function createCoin"), game.indexOf("function updateHUD"));
  assert.match(coin, /type==="blue"\?100:type==="treasureRed"\?50/);
  const collect = game.slice(game.indexOf("function collectCoins"), game.indexOf("/* LOJINHA */"));
  assert.match(collect, /coins\+=value/);
});

test("baú é sólido, tem contornos e maçaneta dourados, animação e partículas douradas contínuas", () => {
  const collision = game.slice(game.indexOf("function canOccupy"), game.indexOf("function moveEntity"));
  assert.match(collision, /for\(const chest of treasureChests\)/);
  const visual = game.slice(game.indexOf("function buildTreasureVisualCache"), game.indexOf("function drawCoin(c)"));
  assert.match(visual, /treasureChestBodyCanvas=body/);
  assert.match(visual, /treasureChestLidCanvas=lid/);
  assert.match(visual, /treasureGoldSparkCanvas=spark/);
  assert.match(visual, /treasureBlueFlameCanvas=flame/);
  assert.match(visual, /treasureBlueCoinCanvas=coin/);
  assert.match(visual, /treasureRedCoinCanvas=redCoin/);
  assert.match(visual, /fillText\("50",44,43\)/);
  assert.match(visual, /Math\.abs\(Math\.sin\(t\*4\.15\+chest\.phase\)\)\*3\.2/);
  assert.match(visual, /ctx\.rotate\(-lidOpen\)/);
  assert.match(visual, /drawImage\(treasureAuraCanvas/);
  assert.match(visual, /drawImage\(treasureGoldSparkCanvas/);
  assert.match(visual, /drawImage\(treasureBlueFlameCanvas/);
  assert.match(visual, /#ffe16a/);
  assert.match(visual, /c\.arc\(48,41,7/);
  assert.match(visual, /ambientParticles/);
  assert.match(visual, /sparkTimer>=\.055/);
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

test("baú ocupa exatamente a célula inteira do bloco destrutível", () => {
  const collision = game.slice(game.indexOf("function canOccupy"), game.indexOf("function moveEntity"));
  assert.match(collision, /circleRectCollision\(x,y,r,chest\.x,chest\.y,1,1\)/);
});

test("inimigos comuns percebem bombas próximas e descartam rotas bloqueadas quando a fuga não encontra saída", () => {
  const reaction = game.slice(game.indexOf("function reactToNewBomb"), game.indexOf("function followEnemyPath"));
  assert.match(reaction, /baseRadius=enemy\.isMushroom\?4\.8:enemy\.isHorned\?5\.2:4\.8/);
  const update = game.slice(game.indexOf("function updateEnemies(dt)"), game.indexOf("/* BOMBAS E COMBATE */"));
  assert.match(update, /const routeBlockedByBomb=!!\(enemy\.path&&enemy\.path\.some\(p=>bombAt\(p\.x,p\.y\)\)\)/);
  assert.match(update, /if\(routeInDanger\|\|routeBlockedByBomb\)/);
});

test("fantasminha volta à patrulha após receber dano e persegue mais rápido quando detecta o jogador", () => {
  assert.match(game, /enemy\.alerted=false;enemy\.mode="patrol";enemy\.lastSeen=null;enemy\.path=\[\]/);
  assert.match(game, /enemy\.teleportCooldown=\.2/);
  assert.match(game, /g\.speed=\(g\.baseSpeed\|\|g\.speed\|\|1\.12\)\*1\.45/);
});

test("fuga de bombas é limitada a cinco casas, prioriza abrigo e reage sem pausa", () => {
  const escape = game.slice(game.indexOf("function findBombEscapePath"), game.indexOf("function findBlueFlameEscapePath"));
  assert.match(escape, /const maxSteps=5/);
  assert.match(escape, /isBehindBombCover/);
  const reaction = game.slice(game.indexOf("function reactToNewBomb"), game.indexOf("function followEnemyPath"));
  assert.match(reaction, /routeBlockedByBomb\|\|nearbyBomb/);
  assert.match(reaction, /enemy\.bombReactionTimer=0/);
});
test("fantasma aparece rapidamente, patrulha com teletransportes e desvia de bombas", () => {
  assert.match(game, /const duration=fast\?\.48:escape\?\.42:\.48/);
  assert.match(game, /function swampGhostBombEscapePath/);
  assert.match(game, /g\.bombEvading/);
  assert.match(game, /patrolTeleportTimer:4\+Math\.random\(\)\*4/);
  assert.match(game, /if\(!g\.alerted&&swampGhostSees\(g\)\)/);
});
test("fantasma mostra três segmentos de vida após o primeiro dano", () => {
  const draw = game.slice(game.indexOf("function drawSwampGhost"), game.indexOf("const swampDamageEnemyBase"));
  assert.match(draw, /if\(g\.hp<g\.maxHp\)/);
  assert.match(draw, /for\(let i=0;i<3;i\+\+\)/);
  assert.match(draw, /g\.hurtTimer>0/);
});
test("explosões reutilizam sprites de chama e colisões espaciais", () => {
  assert.match(game, /function buildFlameSpriteVariant/);
  assert.match(game, /flameSpriteCache\.push\(buildFlameSpriteVariant\(i\)\)/);
  assert.match(game, /const flameBuckets=new Map\(\)/);
  assert.match(game, /flameBuckets\.clear\(\)/);
  assert.match(game, /flameBuckets\.get\(cellKey\(ex\+dx,ey\+dy\)\)/);
});
