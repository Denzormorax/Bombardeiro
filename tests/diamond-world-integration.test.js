const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"bombardeirojogo.html"),"utf8");
const atlas=fs.readFileSync(path.join(root,"game-assets/sprites/diamond_themes.svg"),"utf8");

test("Mundo dos Diamantes está integrado à seleção de mundos",()=>{
 assert.match(html,/id="diamondsBtn"/);
 assert.match(html,/showMenuScreen\("diamonds"\)/);
 assert.match(html,/id="diamondPanel"/);
});
test("o mapa do Mundo dos Diamantes cria dez fases com progresso independente",()=>{
 assert.match(html,/function buildDiamondMap\(\)/);
 assert.match(html,/diamondProgressKey="bomberquest-diamonds-unlocked"/);
 assert.match(html,/diamondLevelNodes/);
 assert.match(html,/FASES CONCLUÍDAS:/);
});
test("as dez temáticas usam o atlas facetado e sprites em cache",()=>{
 assert.match(html,/const diamondThemes=\[/);
 assert.match(html,/diamond_themes\.svg/);
 assert.match(html,/buildDiamondSpriteSheets/);
 assert.match(html,/diamondThemedSpriteSheets/);
 assert.match(atlas,/width="384" height="960"/);
 assert.equal((atlas.match(/<g transform="translate\(/g)||[]).length,40);
});
test("as dez arenas usam pisos de terra com pequenos cristais encrustados, sem alterar geodos ou muralhas",()=>{
 assert.equal((atlas.match(/— piso de terra com cristais/g)||[]).length,20);
 assert.equal((atlas.match(/<title>[^<]*geodo destrutível rachado<\/title>/g)||[]).length,10);
 assert.equal((atlas.match(/<title>[^<]*muralha indestrutível blindada<\/title>/g)||[]).length,10);
 assert.match(atlas,/piso de terra com cristais/);
});
test("os blocos indestrutíveis e destrutíveis têm silhuetas e construção visual distintas",()=>{
 assert.equal((atlas.match(/<title>[^<]*muralha indestrutível blindada<\/title>/g)||[]).length,10);
 assert.equal((atlas.match(/<title>[^<]*geodo destrutível rachado<\/title>/g)||[]).length,10);
 assert.match(atlas,/muralha indestrutível blindada/);
 assert.match(atlas,/geodo destrutível rachado/);
});
test("o mundo é incluído na progressão sem substituir os mundos existentes",()=>{
 assert.match(html,/worldOrder\.push\("diamonds"\)/);
 for(const world of ["forest","desert","volcano","ice","swamp"]) assert.ok(html.includes('"'+world+'"'));
});

test("o Mundo dos Diamantes usa apenas inimigos comuns com aparência cristalina",()=>{
 assert.match(html,/mushroomCount=currentWorld==="diamonds"\?0:/);
 assert.match(html,/hornedCount=currentWorld==="diamonds"\?0:/);
 assert.match(html,/isHunter=isSnowman\|\|\(!isBuilder&&!isMushroom&&!isHorned&&currentWorld!=="diamonds"/);
 assert.match(html,/const enemyFaceBeforeDiamonds=drawEnemyFace;/);
 assert.match(html,/drawDiamondEnemyDetails\(e,deathProgress\)/);
});

test("o desenho dos inimigos acessa os temas de diamantes somente no escopo correto",()=>{
 const baseStart=html.indexOf("function drawEnemyFace(");
 const baseEnd=html.indexOf("function drawSnowmanBreath(",baseStart);
 assert.ok(baseStart>=0&&baseEnd>baseStart,"função-base drawEnemyFace localizada");
 const baseFace=html.slice(baseStart,baseEnd);
 assert.doesNotMatch(baseFace,/diamondThemes|diamondIndex/,"a função-base não pode acessar constantes privadas do módulo de diamantes");
 assert.match(html,/const enemyFaceBeforeDiamonds=drawEnemyFace;/);
 assert.match(html,/function drawDiamondEnemyDetails\(e,deathProgress=0\)/);
 assert.match(html,/drawEnemyFace=function\(e,color,helmetColor,deathProgress=0\)\{[\s\S]*?currentWorld!=="diamonds"[\s\S]*?diamondThemes\[diamondIndex\(\)\]/);
 assert.match(html,/enemyFaceBeforeDiamonds\(e,dt\.wall\[0\],dt\.wall\[1\],deathProgress\)/);
 assert.match(html,/drawDiamondEnemyDetails\(e,deathProgress\)/);
});

test("o brilho diagonal do Mundo dos Diamantes aparece apenas nos geodos destrutíveis e usa as dez cores",()=>{
 assert.match(html,/function drawDiamondDestructibleShimmer\(\)/);
 assert.match(html,/if\(currentWorld==="diamonds"\)return;[\s\S]*?function drawDiamondDestructibleShimmer/);
 assert.match(html,/destructibleTilePositions\.push\(\{x,y\}\)/);
 assert.match(html,/diamondShimmerCanvases=diamondThemes\.map/);
 assert.match(html,/drawDiamondDestructibleShimmer\(\)/);
 assert.match(html,/diamondShimmerTileCanvas=null/);
 assert.match(html,/effectCtx\.globalCompositeOperation="destination-in"/);
 assert.match(html,/effectCtx\.drawImage\(sheet,288,0,96,96,0,0,TILE,TILE\)/);
 assert.match(html,/if\(!shimmerCanvas\|\|!sheet\)return/);
 const shimmerStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const shimmerEnd=html.indexOf("\nfunction draw()",shimmerStart);
 assert.ok(shimmerStart>=0&&shimmerEnd>shimmerStart,"renderizador do brilho localizado");
 assert.doesNotMatch(html.slice(shimmerStart,shimmerEnd),/diamondThemedSpriteSheets/,"o renderizador não pode acessar diretamente a variável privada do atlas");
 assert.match(html,/window\.__bombardeiroGetDiamondSpriteSheet=function\(themeIndex\)\{[\s\S]*?diamondThemedSpriteSheets\[index\]/);
 assert.match(html,/spriteGetter=window\.__bombardeiroGetDiamondSpriteSheet[\s\S]*?typeof spriteGetter==="function"\?spriteGetter\(index\):null/);

});
test("o brilho dos geodos usa quadros pré-renderizados e elimina composição alfa por bloco a cada quadro",()=>{
 assert.match(html,/DIAMOND_SHIMMER_FRAME_COUNT=384,DIAMOND_SHIMMER_FRAME_COLUMNS=24/);
 const buildStart=html.indexOf("function buildDiamondShimmerFrameAtlas(");
 const drawStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const drawEnd=html.indexOf("\nfunction draw(){",drawStart);
 assert.ok(buildStart>=0&&drawStart>buildStart&&drawEnd>drawStart,"pré-renderizador e renderizador localizados");
 const builder=html.slice(buildStart,drawStart),renderer=html.slice(drawStart,drawEnd);
 assert.match(builder,/effectCtx\.globalCompositeOperation="destination-in"/);
 assert.match(builder,/effectCtx\.drawImage\(sheet,288,0,96,96,0,0,TILE,TILE\)/);
 assert.match(builder,/atlasCtx\.drawImage\(diamondShimmerTileCanvas/);
 assert.doesNotMatch(renderer,/destination-in|clearRect|createElement\("canvas"\)/,"o quadro não pode recriar máscaras nem canvases por geodo");
 assert.match(renderer,/ctx\.drawImage\(atlas,sx,sy,TILE,TILE,ox\+tile\.x\*TILE,oy\+tile\.y\*TILE,TILE,TILE\)/);
 assert.match(html,/startGame=function\(n=1\)\{[\s\S]*?buildDiamondShimmerFrameAtlas\(themeIndex,shimmer,sheet\)[\s\S]*?return startBeforeDiamonds\(n\)/,"a animação é pré-aquecida antes de iniciar a fase");
});
test("a destruição dos geodos cria muitos estilhaços facetados na cor da fase com sprites e brilhos em cache",()=>{
 assert.match(html,/world==="diamonds"\?72/);
 assert.match(html,/function buildDiamondDestroyedBlockGlow\(themeIndex\)/);
 assert.match(html,/diamondDestroyedGlowCanvases=Array\(10\)\.fill\(null\)/);
 assert.match(html,/p\.themeIndex\+":"\+p\.kind\+":"\+sizeKey/);
 assert.match(html,/q\.moveTo\(0,-w\*2\.05\)/);
 assert.match(html,/currentWorld==="diamonds"\)spawnDestroyedBlockEffect/);
 assert.match(html,/world==="diamonds"\?1\.08/);
});

test("os efeitos de destruição dos geodos não dependem de diamondIndex fora do módulo isolado",()=>{
 const start=html.indexOf("function spawnDestroyedBlockEffect(");
 const end=html.indexOf("function updateDestroyedBlockEffects(",start);
 assert.ok(start>=0&&end>start,"função de criação dos efeitos localizada");
 const effectFactory=html.slice(start,end);
 assert.doesNotMatch(effectFactory,/diamondIndex/,"a função principal não pode acessar diamondIndex privado");
 assert.match(effectFactory,/world==="diamonds"\?Math\.max\(0,Math\.min\(9,level-1\)\):0/);
});

test("os efeitos de destruição dos diamantes usam uma ponte pública estreita, sem acessar diamondThemes privado",()=>{
 const glowStart=html.indexOf("function buildDiamondDestroyedBlockGlow(");
 const glowEnd=html.indexOf("function buildDestroyedBlockGlow(",glowStart);
 const particleStart=html.indexOf("function getDestroyedBlockParticleSprite(");
 const particleEnd=html.indexOf("function spawnDestroyedBlockEffect(",particleStart);
 assert.ok(glowStart>=0&&glowEnd>glowStart,"função do brilho localizada");
 assert.ok(particleStart>=0&&particleEnd>particleStart,"função dos fragmentos localizada");
 assert.doesNotMatch(html.slice(glowStart,glowEnd),/diamondThemes/,"o brilho não pode acessar o catálogo privado");
 assert.doesNotMatch(html.slice(particleStart,particleEnd),/diamondThemes/,"os fragmentos não podem acessar o catálogo privado");
 assert.match(html,/window\.__bombardeiroGetDiamondEffectPalette=function\(themeIndex\)/);
 assert.match(html,/window\.__bombardeiroGetDiamondEffectPalette\?window\.__bombardeiroGetDiamondEffectPalette\(index\)/);
});


test("o controlador de introdução das fases termina antes do módulo Diamante",()=>{
 const outerStart=html.indexOf('(()=>{\n"use strict";');
 const shimmerStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const introStart=html.indexOf('(function(){\n "use strict";\n let introToken');
 const introClose=html.indexOf("})();",introStart);
 const diamondStart=html.indexOf("/* MUNDO 6 — REINO DOS DIAMANTES */");
 const spriteSheetsDecl=html.indexOf("const diamondSpriteSheet=new Image(),diamondThemedSpriteSheets=Array(10).fill(null)");
 const outerClose=html.indexOf("})();",html.indexOf('if(!worldOrder.includes("diamonds"))worldOrder.push("diamonds");'));
 assert.ok(outerStart>=0&&shimmerStart>outerStart&&shimmerStart<introStart);
 assert.ok(introStart>shimmerStart&&introClose>introStart&&introClose<diamondStart);
 assert.ok(diamondStart>introClose&&spriteSheetsDecl>diamondStart);
 assert.ok(outerClose>spriteSheetsDecl,"o escopo principal só fecha depois das declarações do Mundo Diamante");
 assert.ok(html.indexOf('const worldOrder=["forest","desert","volcano","ice","swamp"]')<introStart);
 assert.match(html,/if\(!worldOrder\.includes\("diamonds"\)\)worldOrder\.push\("diamonds"\)/);
});

test("o renderizador dos diamantes acessa o spritesheet por uma ponte global segura",()=>{
 const outerStart=html.indexOf('(()=>{\n"use strict";');
 const shimmerStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const introStart=html.indexOf('(function(){\n "use strict";\n let introToken');
 const introClose=html.indexOf("})();",introStart);
 const diamondStart=html.indexOf("/* MUNDO 6 — REINO DOS DIAMANTES */");
 const spriteSheetsDecl=html.indexOf("const diamondSpriteSheet=new Image(),diamondThemedSpriteSheets=Array(10).fill(null)");
 const outerClose=html.indexOf("})();",html.indexOf('if(!worldOrder.includes("diamonds"))worldOrder.push("diamonds");'));
 assert.ok(outerStart<shimmerStart&&shimmerStart<introStart);
 assert.ok(introClose<diamondStart&&diamondStart<spriteSheetsDecl&&spriteSheetsDecl<outerClose);
 assert.doesNotMatch(html.slice(shimmerStart,introStart),/diamondThemedSpriteSheets/);
 assert.match(html,/window\.__bombardeiroGetDiamondSpriteSheet=function\(themeIndex\)/);
 assert.match(html,/spriteGetter=window\.__bombardeiroGetDiamondSpriteSheet/);
 assert.match(html.slice(diamondStart,outerClose),/const diamondSpriteSheet=new Image\(\),diamondThemedSpriteSheets=Array\(10\)\.fill\(null\)/);
});

test("todos os blocos JavaScript embutidos no HTML passam pela análise de sintaxe",()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(match=>match[1]).filter(source=>source.trim());
 assert.ok(scripts.length>=2,"scripts JavaScript inline localizados");
 scripts.forEach((source,index)=>assert.doesNotThrow(()=>new Function(source),"script inline "+(index+1)+" deve ter sintaxe válida"));
});
