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
  assert.match(reaction, /const baseRadius=enemy\.isMushroom\?4\.8:enemy\.isHorned\?5\.2:4\.8/);
  assert.match(reaction, /<=Math\.max\(baseRadius,range\+2\.2\)/);
  assert.match(reaction, /if\(isStandardBombEvader\(enemy\)\)/);
  const update = game.slice(game.indexOf("function updateEnemies(dt)"), game.indexOf("/* BOMBAS E COMBATE */"));
  assert.match(update, /const routeBlockedByBomb=!!\(enemy\.path&&enemy\.path\.some\(p=>bombAt\(p\.x,p\.y\)\)\)/);
  assert.match(update, /if\(routeInDanger\|\|routeBlockedByBomb\)/);
});

test("fantasminha volta à patrulha após receber dano e persegue mais rápido quando detecta o jogador", () => {
  assert.match(game, /enemy\.alerted=false;enemy\.mode="patrol";enemy\.lastSeen=null;enemy\.path=\[\]/);
  assert.match(game, /enemy\.patrolTeleportTimer=2\+Math\.random\(\)\*2/);
  assert.match(game, /enemy\.bombEvading=false;enemy\.bombEvadeRepath=0/);
  assert.match(game, /g\.speed=\(g\.baseSpeed\|\|g\.speed\|\|1\.12\)\*1\.45/);
});

test("fuga de bombas é limitada a cinco casas, prioriza abrigo e reage sem pausa", () => {
  const escape = game.slice(game.indexOf("function findBombEscapePath"), game.indexOf("function findBlueFlameEscapePath"));
  assert.match(escape, /const maxSteps=preferCover\?5:\(shortFlee\?2:COLS\*ROWS\)/);
  assert.match(escape, /const desertHunter=currentWorld==="desert"&&enemy\.isHunter/);
  assert.match(escape, /isBehindBombCover/);
  const iceEscape = game.slice(game.indexOf("function findBlueFlameEscapePath"), game.indexOf("function spawnSandBuildParticles"));
  assert.match(iceEscape, /p\.path\.length>=\(\(enemy\.isHunter\|\|enemy\.isSnowman\)\?2:COLS\*ROWS\)/);
  assert.match(iceEscape, /return findBombEscapePath\(enemy,danger,false,true\)/);
  const update = game.slice(game.indexOf("function updateEnemies(dt)"), game.indexOf("/* BOMBAS E COMBATE */"));
  assert.match(update, /findBombEscapePath\(enemy,danger,true\)/);
  assert.match(update, /enemy\.baseSpeed\*1\.45/);
  const reaction = game.slice(game.indexOf("function reactToNewBomb"), game.indexOf("function followEnemyPath"));
  assert.match(game, /function isStandardBombEvader\(enemy\)/);
  assert.match(game, /!enemy\.isBuilder&&!enemy\.isMushroom&&!enemy\.isHorned&&!enemy\.isSnowman&&!enemy\.isBlueFlame&&!enemy\.isSwampGhost/);
  assert.match(reaction, /isStandardBombEvader\(enemy\)/);
  assert.match(reaction, /routeBlockedByBomb\|\|bombs\.some/);
  assert.match(reaction, /enemy\.bombReactionTimer=0/);
});
test("fantasma aparece rapidamente, patrulha com teletransportes e desvia de bombas", () => {
  assert.match(game, /const duration=fast\?\.48:escape\?\.42:\.48/);
  assert.match(game, /function swampGhostBombEscapePath/);
  assert.match(game, /g\.bombEvading/);
  assert.match(game, /patrolTeleportTimer:2\+Math\.random\(\)\*2/);
  assert.match(game, /if\(!g\.alerted&&swampGhostSees\(g\)\)/);
});
test("fantasma exibe três segmentos brancos desde o início e deixa cada segmento transparente ao perder vida", () => {
  const draw = game.slice(game.indexOf("function drawSwampGhost"), game.indexOf("const swampDamageEnemyBase"));
  assert.doesNotMatch(draw, /if\(g\.hp<g\.maxHp\)/);
  assert.match(draw, /for\(let i=0;i<3;i\+\+\)/);
  assert.match(draw, /active\?"#ffffff":"rgba\(255,255,255,\.10\)"/);
  assert.match(draw, /active\?"#ffffff":"rgba\(255,255,255,\.48\)"/);
  assert.match(draw, /g\.hurtTimer>0/);
});
test("fantasma se move apenas na horizontal ou vertical e desliza pelas quinas dos blocos indestrutíveis", () => {
  const move = game.slice(game.indexOf("function swampGhostMove"), game.indexOf("function swampGhostSees"));
  assert.match(move, /Math\.abs\(remainX\)>=Math\.abs\(remainY\)/);
  assert.match(move, /Math\.ceil\(step\/\.012\)/);
  assert.match(move, /const offsets=\[\.015,\.03,\.045,\.06,\.075,\.09,\.105,\.12,\.135,\.15,\.165,\.18,\.195,\.21,\.225,\.24\]/);
  assert.match(move, /!swampGhostCanOccupy\(ghost,ghost\.x,sideY\)\|\|!swampGhostCanOccupy\(ghost,nx,sideY\)/);
  assert.match(move, /!swampGhostCanOccupy\(ghost,sideX,ghost\.y\)\|\|!swampGhostCanOccupy\(ghost,sideX,ny\)/);
  assert.match(move, /ghost\.path=\[\]/);
  const stand = game.slice(game.indexOf("function swampGhostStand"), game.indexOf("function swampGhostPath"));
  assert.match(stand, /tileAt\(tx,ty\)===1/);
  assert.doesNotMatch(stand, /tileAt\(tx,ty\)===2/);
});
test("fantasma detecta o jogador em raio circular ampliado de cinco blocos", () => {
  const vision = game.slice(game.indexOf("function swampGhostSees"), game.indexOf("function swampGhostTarget"));
  assert.match(vision, /dist>5\)return false/);
  assert.match(vision, /Math\.hypot\(dx,dy\)/);
});
test("após sofrer dano o fantasma limpa o estado de fuga e reinicia patrulha e teleporte", () => {
  const damage = game.slice(game.indexOf("const swampDamageEnemyBase"), game.indexOf("const swampNewLevelBase"));
  assert.match(damage, /enemy\.alerted=false;enemy\.mode="patrol"/);
  assert.match(damage, /enemy\.bombEvading=false;enemy\.bombEvadeRepath=0/);
  assert.match(damage, /enemy\.patrolWait=0/);
  assert.match(damage, /enemy\.patrolTeleportTimer=2\+Math\.random\(\)\*2/);
  assert.match(damage, /swampGhostStartTeleport\(enemy,destination,true,true\)/);
});
test("explosões reutilizam sprites de chama e colisões espaciais", () => {
  assert.match(game, /function buildFlameSpriteVariant/);
  assert.match(game, /flameSpriteCache\.push\(buildFlameSpriteVariant\(i\)\)/);
  assert.match(game, /const flameBuckets=new Map\(\)/);
  assert.match(game, /flameBuckets\.clear\(\)/);
  assert.match(game, /flameBuckets\.get\(cellKey\(ex\+dx,ey\+dy\)\)/);
});


test("fantasmas se afastam suavemente sem bloquear as rotas uns dos outros", () => {
  assert.ok(game.includes("function swampGhostBlockedByOther(ghost,x,y,radius=.445){return false}"));
  assert.ok(game.includes("function swampGhostCanOccupy(ghost,x,y){return swampGhostStand(x,y)}"));
  assert.ok(game.includes("function swampGhostSpread(ghost,dt)"));
  const move = game.slice(game.indexOf("function swampGhostMove"), game.indexOf("function swampGhostSees"));
  assert.ok(move.includes("swampGhostCanOccupy(ghost,nx,ghost.y)"));
  assert.ok(move.includes("swampGhostCanOccupy(ghost,ghost.x,ny)"));
  assert.ok(move.includes("swampGhostSpread(ghost,dt)"));
  const patrol = game.slice(game.indexOf("function swampGhostPath"), game.indexOf("function swampGhostChasePath"));
  const chase = game.slice(game.indexOf("function swampGhostChasePath"), game.indexOf("function swampGhostBombEscapePath"));
  assert.ok(patrol.includes("swampGhostBlockedByOther(ghost,x+.5,y+.5,.72)"));
  assert.ok(chase.includes("const score=Math.min(nearest,3)*2.2"));
  assert.ok(game.includes("swampGhostSpread(ghost,dt);"));
});
test("teleporte aleatório de patrulha acontece em intervalo variável de dois a quatro segundos", () => {
  assert.match(game, /patrolTeleportTimer:2\+Math\.random\(\)\*2/);
  assert.match(game, /g\.patrolTeleportTimer=2\+Math\.random\(\)\*2/);
  assert.match(game, /enemy\.patrolTeleportTimer=2\+Math\.random\(\)\*2/);
  assert.match(game, /if\(!g\.alerted&&swampGhostSees\(g\)\)/);
});
