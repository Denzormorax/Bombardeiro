const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("minhoca verde aparece somente na floresta entre as fases 3 e 9, com dois pontos de vida", () => {
  assert.match(game, /currentWorld==="forest"&&level>=3&&level<=9/);
  assert.match(game, /specialEnemySpawnOne\("worm"\)/);
  assert.match(game, /isForestWorm:worm/);
  assert.match(game, /hp:worm\?2:3,maxHp:worm\?2:3/);
  assert.match(game, /drawForestWorm\(e\)/);
});

test("furacões dourados aparecem no deserto entre as fases 4 e 9, em grupos aleatórios de dois ou três", () => {
  assert.match(game, /currentWorld==="desert"&&level>=4&&level<=9/);
  assert.match(game, /const count=2\+Math\.floor\(Math\.random\(\)\*2\)/);
  assert.match(game, /specialEnemySpawnOne\("whirlwind"\)/);
  assert.match(game, /isDesertWhirlwind:!worm/);
  assert.match(game, /hp:worm\?2:3,maxHp:worm\?2:3/);
  assert.match(game, /drawDesertWhirlwind\(e\)/);
});

test("os dois inimigos especiais usam rotas ortogonais entre centros de células", () => {
  assert.match(game, /const dirs|for\(const \[dx,dy\] of \[\[0,-1\],\[1,0\],\[0,1\],\[-1,0\]\]\)/);
  assert.match(game, /Um único eixo por vez: o centro do corredor nunca deriva para os lados/);
  assert.match(game, /function specialEnemyMove\(enemy,dt,speed\)/);
});

test("a minhoca engole bombas e libera imediatamente o espaço de bomba sem explodir", () => {
  const start = game.indexOf("function specialEnemyEatBomb(enemy,bomb)");
  const end = game.indexOf("\n}", start);
  const fn = game.slice(start, end + 2);
  assert.match(fn, /activeBombs=Math\.max\(0,activeBombs-1\)/);
  assert.match(fn, /player\.passBomb=null/);
  assert.match(fn, /bombs=bombs\.filter\(b=>b!==bomb\)/);
  assert.doesNotMatch(fn, /explode\(/);
});

test("furacão suga bombas a até cerca de dois blocos e as lança na direção do jogador", () => {
  assert.match(game, /let target=null,best=2\.01/);
  assert.match(game, /const axisDistance=dx<\.25\?dy:\(dy<\.25\?dx:Infinity\)/);
  assert.match(game, /if\(axisDistance<=2&&axisDistance<best/);
  assert.match(game, /ctx\.scale\(1\.18,1\.18\)/);
  assert.match(game, /const enemyCollision=enemies\.some\(other=>other!==enemy&&other\.alive&&distance\(nx,ny,other\.x,other\.y\)<\.72\)/);
  assert.match(game, /distance\(x\+\.5,y\+\.5,other\.x,other\.y\)<\.72/);
  assert.match(game, /tornadoSucked=\{enemy,t:0,duration:\.24/);
  assert.match(game, /tornadoTravel=\{dx:dx\/len,dy:dy\/len,speed:8\.6,source:enemy\}/);
  assert.match(game, /if\(hitPlayer\|\|hitEnemy\|\|otherBomb\)\{delete b\.tornadoTravel;b\.t=\.01\}/);
  assert.match(game, /tileAt\(Math\.floor\(ax\+dx\*t\),Math\.floor\(ay\+dy\*t\)\)!==0/);
});

test("inimigos especiais recebem dano individual e permanecem na contagem de inimigos da fase", () => {
  assert.match(game, /enemy\.hp=Math\.max\(0,\(enemy\.hp\|\|1\)-1\)/);
  assert.match(game, /if\(enemy\.hp<=0\)killEnemy\(enemy\)/);
  assert.match(game, /function allEnemiesDefeated\(\)\{return enemies\.length>0&&enemies\.every\(e=>!e\.alive\)\}/);
});
