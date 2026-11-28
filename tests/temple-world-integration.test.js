const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"bombardeirojogo.html"),"utf8");
const atlas=fs.readFileSync(path.join(root,"game-assets/sprites/temple_marble_themes.svg"),"utf8");
const destructibleAtlas=fs.readFileSync(path.join(root,"game-assets/sprites/temple_destructible_blocks.svg"),"utf8");
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

test("blocos do Reino dos Templos usam PNG transparente estático, maior e com sombra",()=>{
 assert.match(html,/blockCanvas\.toDataURL\("image\/png"\)/);
 assert.match(html,/templeDestructibleAtlasImage\.src="game-assets\/sprites\/temple_destructible_blocks\.svg"/);
 assert.match(html,/drawImage\(templeDestructibleAtlasImage,\(i%5\)\*256,Math\.floor\(i\/5\)\*256,256,256,0,0,128,128\)/);
 assert.match(destructibleAtlas,/width="1280" height="512"/);
 assert.match(destructibleAtlas,/viewBox="0 0 1280 512"/);
 assert.match(html,/if\(type===1\)/);
 assert.match(html,/TILE\*1\.08,TILE\*1\.08/);
 assert.doesNotMatch(html,/function drawTempleDestructibleBlocks\(\)/);
 assert.doesNotMatch(html,/const angle=gameClock\*\(Math\.PI\*2\/3\.2\)/);
 assert.doesNotMatch(html,/face=Math\.cos\(angle\),side=Math\.sin\(angle\)/);
 assert.match(html,/drawTempleBlockDebris\(\)/);
});
test("a destruição de blocos dos Templos lança muitos fragmentos facetados com a paleta da fase",()=>{
 assert.match(html,/function spawnTempleBlockDebris\(x,y,world=currentWorld\)/);
 assert.match(html,/getDestructibleBlockFragmentColors\(world\)/);
 assert.match(html,/pushTempleDebrisEffect\(x,y,getDestructibleBlockFragmentColors\(world\),22/);
 assert.match(html,/spawnTempleBlockDebris\(x\+\.5,y\+\.5,currentWorld\)/);
 assert.match(html,/function updateTempleBlockDebris\(dt\)/);
 assert.match(html,/function drawTempleBlockDebris\(\)/);
});;

test("blocos destrutíveis flutuam e fazem gangorra com sombra PNG separada e fixa no chão",()=>{
 assert.match(html,/templeDestructibleBlockPngs=Array\(10\)\.fill\(null\)/);
 assert.match(html,/templeDestructibleBlockShadowPngs=Array\(10\)\.fill\(null\)/);
 assert.match(html,/templeDestructibleBlockPngs\[i\]=blockCanvas\.toDataURL\("image\/png"\)/);
 assert.match(html,/templeDestructibleBlockShadowPngs\[i\]=shadowCanvas\.toDataURL\("image\/png"\)/);
 assert.match(html,/function drawTempleFloatingBlocks\(\)/);
 assert.match(html,/ctx\.drawImage\(shadow,px,py\+TILE\*\.12,TILE,TILE\)/);
 assert.match(html,/py\+TILE\*\.955/);
 assert.match(html,/Math\.sin\(gameClock\*2\.55\+phase\)/);
 assert.match(html,/Math\.sin\(gameClock\*1\.7\+phase\)\*\.055/);
 assert.match(html,/if\(currentWorld==="temples"\)drawTempleFloatingBlocks\(\)/);
 assert.match(html,/if\(type===2\)return/);
});

test("as poças do Reino dos Templos são substituídas por exatamente 20 moitas animadas por vento em cada fase",()=>{
 assert.match(html,/function createTempleGrassTufts\(\)/);
 assert.match(html,/candidates\.slice\(0,20\)/);
 assert.match(html,/function drawTempleGrassTufts\(\)/);
 assert.match(html,/Math\.sin\(frame\/TEMPLE_GRASS_FRAMES\*Math\.PI\*2\)/);
 assert.match(html,/Math\.floor\(gameClock\*12\)%TEMPLE_GRASS_FRAMES/);
 assert.match(html,/#174b2b/);assert.match(html,/#edf3d9/);
 assert.match(html,/if\(currentWorld==="temples"\)drawTempleGrassTufts\(\)/);
 assert.match(html,/createPuddlesBeforeTempleGrass/);
});

test("gramados das nove fases do Reino dos Templos pegam fogo com muitos focos e ficam carbonizados",()=>{
 assert.match(html,/const TEMPLE_GRASS_FIRE_DURATION=6\.7,TEMPLE_GRASS_FIRE_POINTS=28/);
 assert.match(html,/function igniteTempleGrass\(cells\)/);
 assert.match(html,/for\(let i=0;i<TEMPLE_GRASS_FIRE_POINTS;i\+\+\)points\.push/);
 assert.match(html,/if\(currentWorld==="temples"&&level>=1&&level<=9\)igniteTempleGrass\(cells\)/);
 assert.match(html,/function updateTempleGrassFire\(dt\)/);
 assert.match(html,/tuft\.charAlpha=Math\.min\(\.94,Math\.max\(0,/);
 assert.match(html,/if\(tuft\.fireAge>=TEMPLE_GRASS_FIRE_DURATION\)\{tuft\.burning=false;tuft\.burnt=true;tuft\.charAlpha=\.94/);
 assert.match(html,/function drawTempleGrassFire\(tuft,px,py\)/);
 assert.match(html,/fade=Math\.max\(0,1-Math\.max\(0,tuft\.fireAge-5\.25\)\/1\.45\)/);
 assert.match(html,/drawTempleGrassFire\(tuft,px,py\)/);
 assert.match(html,/if\(currentWorld==="temples"\)updateTempleGrassFire\(dt\)/);
 assert.match(html,/if\(currentWorld!=="temples"\|\|level<1\|\|level>9\|\|!map\|\|!map\.length\)return/);
});
test("as sombras dos dois tipos de bloco ficam junto aos pés, sem acompanhar a flutuação",()=>{
 assert.match(html,/ellipse\(px\+TILE\*\.5,py\+TILE\*\.955,TILE\*\.43,TILE\*\.075/);
 assert.match(html,/ctx\.drawImage\(shadow,px,py\+TILE\*\.12,TILE,TILE\)/);
 assert.match(html,/ellipse\(64,103,43,14/);
});

test("o brilho diagonal dos blocos indestrutíveis é totalmente desativado apenas no Reino dos Templos",()=>{
 assert.match(html,/function drawIndestructibleShimmer\(\)\{\s*if\(currentWorld==="temples"\|\|currentWorld==="diamonds"\)return;/);
});
test("a grama do Reino dos Templos tem folhas reais que ultrapassam topo e laterais sem perder o cache",()=>{
 assert.match(html,/TEMPLE_GRASS_BLEED=5/);
 assert.match(html,/canvas\.width=TILE\+TEMPLE_GRASS_BLEED\*2/);
 assert.match(html,/edge=blade%4/);
 assert.match(html,/edge===0\?B\+rand\(\)\*10:edge===1\?B\+TILE-rand\(\)\*10/);
 assert.match(html,/y=blade%5===0\?B\+rand\(\)\*12:B\+rand\(\)\*TILE/);
 assert.match(html,/tipX=Math\.max\(1,Math\.min\(canvas\.width-1/);
 assert.match(html,/ctx\.drawImage\(frames\[frame\],ox\+tuft\.x\*TILE-TEMPLE_GRASS_BLEED,oy\+tuft\.y\*TILE-TEMPLE_GRASS_BLEED,TILE\+TEMPLE_GRASS_BLEED\*2,TILE\+TEMPLE_GRASS_BLEED\*2\)/);
 assert.match(html,/templeGrassSpriteVariants\.length\)return/);
 assert.match(html,/Math\.floor\(gameClock\*12\)%TEMPLE_GRASS_FRAMES/);
});

test("a grama dos Templos cria pequenas folhas frontais sobre jogador, inimigos comuns rastejantes e bombas",()=>{
 assert.match(html,/function drawTempleForegroundGrass\(x,y,phase=0\)/);
 assert.match(html,/if\(currentWorld!=="temples"\|\|!templeGrassTufts\.length\)return/);
 assert.match(html,/ctx\.quadraticCurveTo\(cx\+b\[0\]\+wave,baseY-3,cx\+b\[2\]\+wave,baseY\+b\[3\]\)/);
 assert.match(html,/drawTempleForegroundGrass\(b\.x\+\.5,b\.y\+\.5,b\.animTime\|\|0\)/);
 assert.match(html,/drawTempleForegroundGrass\(e\.x,e\.y,e\.x\*17\+e\.y\)/);
 assert.match(html,/drawTempleForegroundGrass\(player\.x,player\.y,player\.x\*13\+player\.y\)/);
 assert.match(html,/!e\.isBuilder&&!e\.isHunter&&!e\.isHorned&&!e\.isMushroom&&!e\.isSnowman/);
});

test("inimigos comuns das fases 1 a 9 recebem armadura 3D e paleta do tema de cada templo",()=>{
 assert.match(html,/const TEMPLE_COMMON_ENEMY_PALETTES=\[/);
 assert.equal((html.match(/light:"#[0-9a-f]{6}",body:"#[0-9a-f]{6}"/g)||[]).length,11);
 assert.match(html,/function templeCommonEnemyPalette\(\)\{return TEMPLE_COMMON_ENEMY_PALETTES\[Math\.max\(0,Math\.min\(8,\(level\|\|1\)-1\)\)\]\}/);
 assert.match(html,/function drawTempleCommonEnemyDetails\(e,palette=templeCommonEnemyPalette\(\)\)/);
 assert.match(html,/drawTempleCommonEnemyDetails\(e,templePalette\)/);
 assert.match(html,/const isTempleCommon=templeActive&&!e\.isSnowman&&!e\.isBuilder&&!e\.isMushroom&&!e\.isHorned&&!e\.isHunter&&!e\.isBrute/);
 assert.match(html,/ctx\.createRadialGradient\(-5,-8,2,0,1,19\)/);
 assert.match(html,/ctx\.quadraticCurveTo\(0,-16\.1,10\.2,-10\.4\)/);
 assert.match(html,/ctx\.lineTo\(0,-20\.1\)/);
 assert.match(html,/ctx\.lineTo\(2\.1,-15\.1\)/);
});
