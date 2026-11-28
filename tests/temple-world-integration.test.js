const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"bombardeirojogo.html"),"utf8");
const atlas=fs.readFileSync(path.join(root,"game-assets/sprites/temple_marble_themes.svg"),"utf8");
const world=JSON.parse(fs.readFileSync(path.join(root,"game-assets/worlds/temple-world.json"),"utf8"));

test("Reino dos Templos é o Mundo 7 e possui dez fases",()=>{
 assert.equal(world.world,7);assert.equal(world.id,"temples");assert.equal(world.name,"Reino dos Templos");assert.equal(world.phaseCount,10);assert.equal(world.phases.length,10);
 assert.equal(new Set(world.phases.map(p=>p.name)).size,10);
 assert.equal(new Set(world.phases.map(p=>p.palette.primary)).size,10);
});
test("o atlas possui 40 células em dez linhas e quatro colunas de 128 px",()=>{
 assert.match(atlas,/width="512" height="1280"/);assert.match(atlas,/viewBox="0 0 512 1280"/);
 assert.equal((atlas.match(/<title>Fase \d+ —/g)||[]).length,10);
 assert.equal((atlas.match(/translate\(128 0\)/g)||[]).length,10);
 assert.equal((atlas.match(/translate\(256 0\)/g)||[]).length,10);
 assert.equal((atlas.match(/translate\(384 0\)/g)||[]).length,10);
});
test("o catálogo define piso, mosaico, bloco indestrutível e bloco destrutível",()=>{
 assert.deepEqual(world.columns,["ground","ornamentalFloor","indestructibleBlock","destructibleBlock"]);
 assert.equal(world.destructibleBlock.sameGameplayAsExistingDestructibleBlocks,true);
 assert.match(atlas,/M78 15L65 35/);
});
test("o sétimo mundo entra na seleção com botão e painel temáticos",()=>{
 assert.match(html,/\/\* MUNDO 7 — REINO DOS TEMPLOS: integração temática independente\. \*\//);
 assert.match(html,/card\.id="templesBtn"/);
 assert.match(html,/panel\.id="templePanel"/);
 assert.match(html,/showMenuScreen\("temples"\)/);
 assert.match(html,/REINO DOS TEMPLOS/);
});
test("as dez fases usam spritesheets carregados uma vez e cache de tiles",()=>{
 assert.match(html,/const templeSpriteImage=new Image\(\),templeThemedSpriteSheets=Array\(10\)\.fill\(null\)/);
 assert.match(html,/templeSpriteImage\.src="game-assets\/sprites\/temple_marble_themes\.svg"/);
 assert.match(html,/function buildTempleSpriteSheets\(\)/);
 assert.match(html,/target\.drawImage\(sheet,column\*128,0,128,128,px,py,TILE,TILE\)/);
 assert.match(html,/rebuildStaticMapCache\(\)/);
});
test("o progresso do Reino dos Templos é independente e o mundo entra depois dos Diamantes",()=>{
 assert.match(html,/bomberquest-temples-unlocked/);
 assert.match(html,/worldOrder\.push\("temples"\)/);
 assert.match(html,/currentWorld==="temples"\?level\+60/);
});
test("a seleção das fases usa tema de mármore claro e dourado sem alterar os demais mundos",()=>{
 assert.match(html,/#templePanel/);
 assert.match(html,/#templeLevelNodes \.mapNode/);
 assert.match(html,/Carrara Imperial/);
 assert.match(html,/currentWorld!=="temples"\)return tileBeforeTemples/);
});

test("blocos do Reino dos Templos têm sombra e rotação 3D periódica sem alterar colisões",()=>{
 assert.match(html,/target\.ellipse\(px\+TILE\*\.5,py\+TILE\*\.87,TILE\*\.35,TILE\*\.105/);
 assert.match(html,/function drawTempleDestructibleBlocks\(\)/);
 assert.match(html,/const cycle=gameClock%2,turnDuration=\.64/);
 assert.match(html,/ctx\.scale\(widthScale,1\)/);
 assert.match(html,/drawTempleDestructibleBlocks\(\)/);
});
test("a destruição de blocos dos Templos lança quatro fragmentos quadrados com duas escalas",()=>{
 assert.match(html,/function spawnTempleBlockDebris\(x,y\)/);
 assert.match(html,/sizes=\[\.27,\.24,\.16,\.15\]/);
 assert.match(html,/if\(currentWorld==="temples"\)spawnTempleBlockDebris\(x\+\.5,y\+\.5\)/);
 assert.match(html,/function updateTempleBlockDebris\(dt\)/);
 assert.match(html,/function drawTempleBlockDebris\(\)/);
});
