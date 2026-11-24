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
  assert.ok(game.includes("ctx.drawImage(icePuddleShimmerCanvas,-31,-28,40,56)"));
  assert.ok(game.includes("ctx.drawImage(icePuddleShimmerCanvas,-9,-28,40,56)"));
});

test("poças congeladas mantêm a textura parada e usam duas linhas nítidas em movimento mais rápido", () => {
  assert.ok(game.includes('const frame=currentWorld==="ice"?0:Math.floor(gameClock*5.5+p.phase)%frames.length;'));
  assert.ok(game.includes("const phase=(gameClock*.55+((p.x*7+p.y*13)%23)/23)%1"));
  assert.ok(game.includes("ctx.globalAlpha=.94"));
  assert.ok(game.includes("const travel=(phase-.5)*(TILE+40)"));
  const shimmer=game.slice(game.indexOf("const icePuddleShimmerCanvas"),game.indexOf("const $=id"));
  assert.ok(shimmer.includes('c.fillStyle="#ffffff";c.fillRect(18,0,4,56)'));
  assert.ok(!shimmer.slice(0,shimmer.indexOf("function createPillarShimmerCanvas")).includes("createRadialGradient"));
  assert.ok(!shimmer.slice(0,shimmer.indexOf("function createPillarShimmerCanvas")).includes("createLinearGradient"));
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

test("blocos indestrutíveis recuperam o brilho difuso com cores temáticas por mundo", () => {
  assert.ok(game.includes('forest:createPillarShimmerCanvas("rgb(70,220,105)"'));
  assert.ok(game.includes('desert:createPillarShimmerCanvas("rgb(255,151,48)"'));
  assert.ok(game.includes('volcano:createPillarShimmerCanvas("rgb(235,48,35)"'));
  assert.ok(game.includes('ice:createPillarShimmerCanvas("rgb(75,170,255)"'));
  const draw = game.slice(game.indexOf("function drawIndestructibleShimmer"),game.indexOf("function draw(){"));
  assert.ok(draw.includes("const shimmerCanvas=pillarShimmerCanvases[currentWorld]||pillarShimmerCanvases.forest"));
  assert.ok(draw.includes("ctx.drawImage(shimmerCanvas,-20,-28,40,56)"));
  assert.ok(game.includes("cloud.addColorStop(0,highlight)"));
  assert.ok(game.includes("cloud.addColorStop(.45,color.replace"));
});


test("brilho dos blocos indestrutíveis tem maior intensidade sem perder o cache", () => {
  assert.ok(game.includes('band.addColorStop(.28,color.replace(")",",.22)").replace("rgb","rgba"))'));
  assert.ok(game.includes('band.addColorStop(.72,color.replace(")",",.22)").replace("rgb","rgba"))'));
  assert.ok(game.includes('cloud.addColorStop(.45,color.replace(")",",.40)").replace("rgb","rgba"))'));
  assert.ok(game.includes('"rgba(205,255,215,.94)"'));
  assert.ok(game.includes('"rgba(255,232,185,.96)"'));
  assert.ok(game.includes('"rgba(255,195,150,.95)"'));
  assert.ok(game.includes('"rgba(245,253,255,1)"'));
  assert.ok(game.includes("const pulse=.68+.32*Math.sin(phase*Math.PI*2)"));
});


test("Boneco de Neve aparece em 3 ou 4 unidades nas fases 1 a 9 do Gelo", () => {
  assert.ok(game.includes('snowmanCount=currentWorld==="ice"&&level>=1&&level<=9?3+Math.floor(Math.random()*2):0'));
  assert.ok(game.includes('createEnemySpawnPositions(count+builderCount+snowmanCount)'));
  assert.ok(game.includes('snowmanSlots=new Set(slots.splice(0,snowmanCount))'));
  assert.ok(game.includes('isSnowman=snowmanSlots.has(index)'));
  assert.ok(game.includes('freezingBomb:null,freezeCooldown:0'));
});

test("Boneco de Neve usa a perseguição do Caçador e precisa de três acertos", () => {
  assert.ok(game.includes('isHunter=isSnowman||(!isBuilder&&!isMushroom&&!isHorned'));
  assert.ok(game.includes('hp:isSnowman?3:isBuilder?3:isHunter||isHorned?2:1'));
  assert.ok(game.includes('enemy.isSnowman||enemy.isBuilder||enemy.isHunter||enemy.isHorned||enemy.isBlueFlame'));
  assert.ok(game.includes('if(e.isSnowman){'));
  assert.ok(game.includes('faceYOffset=e.isSnowman?-17:0'));
  assert.ok(game.includes('function drawSnowmanBreath(e)'));
});

test("sopro congela a bomba de baixo para cima e libera imediatamente o limite de bombas", () => {
  assert.ok(game.includes('function startSnowmanFreeze(enemy,bomb)'));
  assert.ok(game.includes('bomb.freezeDuration=1.15'));
  assert.ok(game.includes('activeBombs=Math.max(0,activeBombs-1);bomb.activeSlotReleased=true'));
  assert.ok(game.includes('if((b.freezing||b.frozen)&&!b.chainTriggered)'));
  assert.ok(game.includes('const top=16-progress*32'));
  assert.ok(game.includes('ctx.fillRect(-17,top,34,32*progress)'));
});

test("bomba congelada funciona como bloco destrutível e entra na detonação em cadeia", () => {
  assert.ok(game.includes('if(bomb.freezing||bomb.frozen)return new Set()'));
  assert.ok(game.includes('const frozenBomb=bombs.find(other=>other!==b&&(other.freezing||other.frozen)'));
  assert.ok(game.includes('frozenBomb.chainTriggered=true;frozenBomb.t=0;break'));
  assert.ok(game.includes('if(other.freezing||other.frozen){other.chainTriggered=true;other.t=0}'));
  assert.ok(game.includes('if(!b.activeSlotReleased)activeBombs=Math.max(0,activeBombs-1)'));
});


test("Boneco de Neve mantém a perseguição após terminar o sopro de gelo", () => {
  assert.ok(game.includes('enemy.alert=3.2;enemy.lastSeen={x:player.x,y:player.y}'));
  assert.ok(game.includes("if(player.passBomb===bomb)player.passBomb=null")===false);
});
