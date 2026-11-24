const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const atlas = fs.readFileSync(path.join(root, "game-assets/sprites/ice_themes.svg"), "utf8");
const game = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
const snowball = fs.readFileSync(path.join(root, "game-assets/sprites/snowball_destructible.svg"), "utf8");

test("Reino do Gelo possui 40 texturas em dez faixas", () => {
  assert.match(atlas, /width="384" height="960"/);
  assert.equal((atlas.match(/<g transform="translate\(/g) || []).length, 40);
  assert.equal((atlas.match(/<title>(?:Terreno|Variação|Bloco)/g) || []).length, 40);
});

test("cada uma das dez fases do Reino do Gelo está declarada no jogo", () => {
  const phases = [
    "Floresta Congelada", "Lago Congelado", "Grutas de Cristal",
    "Montanhas Nevadas", "Vale da Nevasca", "Pinheiros Congelados",
    "Palácio de Gelo", "Geleira Profunda", "Tempestade Polar", "Reino do Gelo"
  ];
  for (const phase of phases) assert.ok(game.includes(phase), `Fase ausente: ${phase}`);
  assert.match(game, /iceSpriteSheet\.src="game-assets\/sprites\/ice_themes\.svg"/);
  assert.match(game, /bomberquest-ice-unlocked/);
});


test("flocos da bola de neve caem dentro da bola e desaparecem no montinho", () => {
  assert.ok(game.includes("function snowballParticleSeed(x,y,k,salt)"));
  assert.ok(game.includes("for(let k=0;k<4;k++)"));
  assert.ok(game.includes("const localY=.12+phase*.76"));
  assert.ok(game.includes("const fadeOut=Math.min(1,(1-phase)/.20)"));
  assert.ok(game.includes("color:ICE_SNOWFALL_COLORS[Math.min(2,Math.floor(colorSeed*3))]"));
  assert.ok(game.includes('if(currentWorld!=="ice"||!snowballParticleSpecs.length)return'));
  assert.ok(game.includes("buildSnowballParticleSpecs();"));
  assert.ok(game.includes("drawSnowballParticles();"));
  assert.ok(game.includes('currentWorld==="ice")spawnDestroyedBlockEffect'));
  assert.ok(!snowball.includes("<animate"));
});


test("poças congeladas são sorteadas em piso livre e mantêm o total entre 10 e 15", () => {
  assert.ok(game.includes('if(currentWorld!=="ice")return puddlesBeforeIce()'));
  assert.ok(game.includes('waterPuddles=[];waterPuddleCells.clear();iceDetails=[];'));
  assert.ok(game.includes('const amount=10+Math.floor(Math.random()*6)'));
  assert.ok(game.includes('waterPuddleCells.add(key)'));
  assert.ok(game.includes('waterPuddles.push({x:p.x,y:p.y,phase:Math.random()*4})'));
  assert.ok(game.includes('if(map[y][x]!==0||isStartSafeCell(x,y)||x<=3&&y<=3)continue'));
});

test("poças de gelo usam paleta azul cristalina e brilho diagonal em cache", () => {
  assert.ok(game.includes('iceWaterPuddleFrames=[]'));
  assert.ok(game.includes('["#061b46","#0b3d82","#2879bd","#8fdcff","#f7fdff"]'));
  assert.ok(game.includes('if(currentWorld==="ice")drawIcePuddleShimmer(p,px,py)'));
  assert.ok(game.includes("function drawIcePuddleShimmer(p,px,py)"));
  assert.ok(game.includes("ctx.drawImage(pillarShimmerCanvas,-31,-28,40,56)"));
  assert.ok(game.includes("ctx.drawImage(pillarShimmerCanvas,-9,-28,40,56)"));
});

test("poças congeladas mantêm a textura parada e usam duas linhas nítidas em movimento mais rápido", () => {
  assert.ok(game.includes('const frame=currentWorld==="ice"?0:Math.floor(gameClock*5.5+p.phase)%frames.length;'));
  assert.ok(game.includes("const phase=(gameClock*.55+((p.x*7+p.y*13)%23)/23)%1"));
  assert.ok(game.includes("ctx.globalAlpha=.94"));
  assert.ok(game.includes("const travel=(phase-.5)*(TILE+40)"));
  const shimmer=game.slice(game.indexOf("const pillarShimmerCanvas"),game.indexOf("const $=id"));
  assert.ok(shimmer.includes('c.fillStyle="#ffffff";c.fillRect(18,0,4,56)'));
  assert.ok(!shimmer.includes("createRadialGradient"));
  assert.ok(!shimmer.includes("createLinearGradient"));
});

test("inimigos do Gelo fogem da bomba recém-colocada e o Caçador acelera na fuga", () => {
  const reaction=game.slice(game.indexOf("function reactToNewBomb"),game.indexOf("function followEnemyPath"));
  assert.ok(reaction.includes('currentWorld==="ice"&&bombs.some'));
  assert.ok(reaction.includes('enemy.bombReactionTimer=currentWorld==="ice"?(enemy.isHunter ? .01 : .025)'));
  const update=game.slice(game.indexOf("function updateEnemies(dt)"),game.indexOf("/* BOMBAS E COMBATE */"));
  assert.ok(update.includes("currentWorld==="+'"'+"ice"+'"'+"?findBlueFlameEscapePath(enemy,danger):findBombEscapePath"));
  assert.ok(update.includes("enemy.isHunter?enemy.huntSpeed*1.3"));
});

test("bombas nas poças congeladas deslizam na direção para a qual o jogador olha", () => {
  assert.ok(game.includes('if(currentWorld==="ice"&&waterPuddleCells.has(cellKey(x,y)))'));
  assert.ok(game.includes("bomb.slide={dx:directionX,dy:directionY,icePuddle:true}"));
  assert.ok(game.includes("if(b.slide.icePuddle){b.slide=null;b.t=Math.min(b.t,dt);continue}"));
  assert.ok(game.includes("function updateSlidingBombs(dt)"));
});
