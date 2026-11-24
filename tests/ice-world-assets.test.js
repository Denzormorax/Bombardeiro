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


test("poças congeladas usam reflexo azul cristalino e brilho diagonal em cache", () => {
  assert.ok(game.includes("iceWaterPuddleFrames=[]"));
  assert.ok(game.includes('if(currentWorld==="ice")drawIcePuddleShimmer(p,px,py)'));
  assert.ok(game.includes('["#061b46","#0b3d82","#2879bd","#8fdcff","#f7fdff"]'));
  assert.ok(game.includes("function drawIcePuddleShimmer(p,px,py)"));
  assert.ok(game.includes("ctx.drawImage(pillarShimmerCanvas,-20,-28,40,56)"));
});

test("bombas colocadas nas poças do gelo deslizam na direção atual do personagem", () => {
  assert.ok(game.includes('if(currentWorld==="ice"&&waterPuddleCells.has(cellKey(x,y)))'));
  assert.ok(game.includes("const directionX=player.facingX||0,directionY=player.facingY||(directionX===0?1:0)"));
  assert.ok(game.includes("bomb.slide={dx:directionX,dy:directionY}"));
  assert.ok(game.includes("function updateSlidingBombs(dt)"));
  assert.ok(game.includes("if(nextTile!==0||otherBomb)"));
  assert.ok(game.includes("const enemy=enemies.find(e=>e.alive&&!e.burrowing&&Math.floor(e.x)===nx&&Math.floor(e.y)===ny)"));
});

test("poças continuam sendo sorteadas apenas em piso livre, de 10 a 15 por mapa", () => {
  assert.ok(game.includes("if(map[y][x]!==0||isStartSafeCell(x,y))continue"));
  assert.ok(game.includes("const amount=10+Math.floor(Math.random()*6)"));
  assert.ok(game.includes("waterPuddleCells.add(key)"));
});
