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
 assert.match(html,/effectCtx\.drawImage\(sheet,288,0,96,96,DIAMOND_SHIMMER_PADDING,DIAMOND_SHIMMER_PADDING,TILE,TILE\)/);
 assert.match(html,/if\(!shimmerCanvas\|\|!sheet\)return/);
 const shimmerStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const shimmerEnd=html.indexOf("\nfunction draw()",shimmerStart);
 assert.ok(shimmerStart>=0&&shimmerEnd>shimmerStart,"renderizador do brilho localizado");
 assert.doesNotMatch(html.slice(shimmerStart,shimmerEnd),/diamondThemedSpriteSheets/,"o renderizador não pode acessar diretamente a variável privada do atlas");
 assert.match(html,/window\.__bombardeiroGetDiamondSpriteSheet=function\(themeIndex\)\{[\s\S]*?diamondThemedSpriteSheets\[index\]/);
 assert.match(html,/spriteGetter=window\.__bombardeiroGetDiamondSpriteSheet[\s\S]*?typeof spriteGetter==="function"\?spriteGetter\(index\):null/);
});
test("a espiral dos portais cresce visualmente sem alterar a área central de colisão",()=>{
 const portalStart=html.indexOf("function buildDiamondPortalFrames(");
 const portalEnd=html.indexOf("\nfunction createDiamondPortals(",portalStart);
 const portalBuilder=html.slice(portalStart,portalEnd);
 assert.ok(portalStart>=0&&portalEnd>portalStart,"construtor dos portais localizado");
 assert.match(portalBuilder,/r=37-t\*29/);
 assert.match(portalBuilder,/r=33-t\*25/);
 const portalDrawStart=html.indexOf("function drawDiamondPortals()");
 const portalDrawEnd=html.indexOf("\nconst newLevelBeforeDiamondPortals",portalDrawStart);
 assert.match(html.slice(portalDrawStart,portalDrawEnd),/ctx\.drawImage\(frames\[frame\],px,py,TILE,TILE\)/);
 const collisionStart=html.indexOf("function checkDiamondPortal(");
 const collisionEnd=html.indexOf("\nfunction drawDiamondPortals(",collisionStart);
 assert.match(html.slice(collisionStart,collisionEnd),/portal\.x\+\.5,portal\.y\+\.5\)<\.39/);
});
test("o contorno dos geodos recebe halo pulsante temático com margem para não ser cortado",()=>{
 const buildStart=html.indexOf("function renderDiamondShimmerAtlasFrame(");
 const drawStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const builder=html.slice(buildStart,drawStart);
 assert.match(html,/DIAMOND_SHIMMER_PADDING=24,DIAMOND_SHIMMER_FRAME_SIZE=TILE\+DIAMOND_SHIMMER_PADDING\*2/);
 assert.match(builder,/paletteGetter=window\.__bombardeiroGetDiamondEffectPalette/);
 assert.match(builder,/outlineColor=palette&&palette\.glow\?palette\.glow/);
 assert.match(builder,/outlineCtx\.shadowColor=outlineColor/);
 assert.match(builder,/outlineCtx\.shadowBlur=28\+12\*glowPulse/);
 assert.match(builder,/outlineCtx\.shadowBlur=18\+8\*glowPulse/);
 assert.match(builder,/outlineCtx\.shadowBlur=9\+5\*glowPulse/);
 assert.match(builder,/Halo em três camadas/);
 assert.match(builder,/outlineCtx\.globalAlpha=\.82\+\.16\*glowPulse/);
 assert.match(builder,/outlineCtx\.globalCompositeOperation="destination-out"/);
 assert.match(builder,/outlineCtx\.drawImage\(sheet,288,0,96,96,DIAMOND_SHIMMER_PADDING,DIAMOND_SHIMMER_PADDING,TILE,TILE\)/);
 assert.match(builder,/effectCtx\.drawImage\(diamondOutlineGlowCanvas,0,0\)/);
 const renderer=html.slice(drawStart,html.indexOf("\nfunction draw(){",drawStart));
 assert.match(renderer,/ctx\.drawImage\(atlas,sx,sy,DIAMOND_SHIMMER_FRAME_SIZE,DIAMOND_SHIMMER_FRAME_SIZE,dx,dy,DIAMOND_SHIMMER_FRAME_SIZE,DIAMOND_SHIMMER_FRAME_SIZE\)/);
 assert.doesNotMatch(renderer,/destination-out|clearRect|createElement\("canvas"\)/,"o halo é pré-renderizado e reutilizado, sem máscaras por geodo a cada quadro");
});
test("o brilho dos geodos usa quadros pré-renderizados e elimina composição alfa por bloco a cada quadro",()=>{
 assert.match(html,/DIAMOND_SHIMMER_FRAME_COUNT=64,DIAMOND_SHIMMER_FRAME_COLUMNS=8/);
 const buildStart=html.indexOf("function renderDiamondShimmerAtlasFrame(");
 const drawStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const drawEnd=html.indexOf("\nfunction draw(){",drawStart);
 assert.ok(buildStart>=0&&drawStart>buildStart&&drawEnd>drawStart,"pré-renderizador e renderizador localizados");
 const builder=html.slice(buildStart,drawStart),renderer=html.slice(drawStart,drawEnd);
 assert.match(builder,/effectCtx\.globalCompositeOperation="destination-in"/);
 assert.match(builder,/effectCtx\.drawImage\(sheet,288,0,96,96,DIAMOND_SHIMMER_PADDING,DIAMOND_SHIMMER_PADDING,TILE,TILE\)/);
 assert.match(builder,/atlasCtx\.drawImage\(diamondShimmerTileCanvas/);
 assert.doesNotMatch(renderer,/destination-in|clearRect|createElement\("canvas"\)/,"o quadro não pode recriar máscaras nem canvases por geodo");
 assert.match(renderer,/ctx\.drawImage\(atlas,sx,sy,DIAMOND_SHIMMER_FRAME_SIZE,DIAMOND_SHIMMER_FRAME_SIZE,dx,dy,DIAMOND_SHIMMER_FRAME_SIZE,DIAMOND_SHIMMER_FRAME_SIZE\)/);
 assert.match(builder,/diamondShimmerFrameBuild!==state/);
 assert.match(builder,/requestIdleCallback/,"a montagem usa o tempo ocioso do navegador");
 assert.match(builder,/setTimeout\(\(\)=>renderChunk\(null\),24\)/,"há alternativa leve quando requestIdleCallback não existe");
 assert.match(builder,/buildDiamondShimmerHalo\(outlineCtx,sheet,outlineColor\)/,"o halo caro é pré-renderizado uma única vez por tema");
 assert.match(builder,/if\(!palette\|\|typeof palette\.glow!=="string"\|\|!palette\.glow\)return null/,"não existe preview branco de fallback");
 assert.match(builder,/window\.__bombardeiroPhaseIntroState&&window\.__bombardeiroPhaseIntroState\.active[\s\S]*?setTimeout\(scheduleChunk,140\)/,"a montagem do atlas aguarda o fim da transição numérica");
 assert.match(builder,/Date\.now\(\)-started<2/,"cada lote de preparação tem orçamento menor de CPU");
 assert.match(builder,/renderDiamondShimmerAtlasFrame\(state,0\)/,"o primeiro quadro é preparado imediatamente");
 assert.match(html,/diamondShimmerPreviewCanvas\.getContext\("2d"\)\.drawImage\(diamondShimmerTileCanvas,0,0\)/,"o preview é isolado para não ser sobrescrito pelos próximos quadros");
 assert.match(renderer,/if\(!atlas&&!preview\)return/,"o renderizador mostra o halo inicial antes do atlas animado");
 assert.match(renderer,/ctx\.drawImage\(preview,0,0,DIAMOND_SHIMMER_FRAME_SIZE/,"o halo inicial aparece desde o começo da fase");
 assert.match(html,/function prepareDiamondShimmerAtlasForLevel\(n\)/);
 assert.match(html,/startGame=function\(n=1\)\{[\s\S]*?prepareDiamondShimmerAtlasForLevel\(n\);return startBeforeDiamonds\(n\)/,"a fase começa imediatamente enquanto o atlas termina em segundo plano");
 assert.match(html,/buildDiamondMap\(\);buildBurningCrateSprite\(\);prepareDiamondShimmerAtlasForLevel\(selectedMapLevel\)/,"o pré-aquecimento começa ao abrir o mapa");
 assert.match(html,/selectedMapLevel=i;prepareDiamondShimmerAtlasForLevel\(i\)/,"o tema da fase escolhida é preparado durante a animação do mascote");
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


test("a busca do inimigo avalia os cinco destinos com uma única BFS",()=>{
 const start=html.indexOf("function findEnemyRoute(");
 const end=html.indexOf("\nfunction canSeePlayer",start);
 const route=html.slice(start,end);
 assert.ok(start>=0&&end>start,"busca de rota localizada");
 assert.match(route,/goalByKey=new Map/);
 assert.match(route,/queue=\[\{x:sx,y:sy,depth:0\}\]/);
 assert.match(route,/parent=new Map/);
 assert.match(route,/reconstructGridPath/);
 assert.doesNotMatch(route,/findEnemyPath|goals\.sort|path\.concat/);
});
test("patrulha e fugas reconstroem apenas o caminho escolhido, sem copiar rotas por nó",()=>{
 const patrolStart=html.indexOf("function choosePatrolPath(");
 const patrolEnd=html.indexOf("\nfunction isBehindBombCover",patrolStart);
 const bombStart=html.indexOf("function findBombEscapePath(");
 const bombEnd=html.indexOf("\nfunction findBlueFlameEscapePath",bombStart);
 const blueStart=html.indexOf("function findBlueFlameEscapePath(");
 const blueEnd=html.indexOf("\nfunction spawnSandBuildParticles",blueStart);
 const sections=[html.slice(patrolStart,patrolEnd),html.slice(bombStart,bombEnd),html.slice(blueStart,blueEnd)];
 assert.ok(sections.every(section=>section.length>0),"rotinas de busca localizadas");
 for(const section of sections){
  assert.match(section,/parent=new Map/);
  assert.match(section,/reconstructGridPath/);
  assert.doesNotMatch(section,/path\.concat|safe\.sort|candidates\.sort/);
 }
});
test("a IA valida cada rota em uma passagem e reutiliza a percepção visual do inimigo",()=>{
 const start=html.indexOf("function updateEnemies(dt){");
 const end=html.indexOf("/* BOMBAS E COMBATE */",start);
 const update=html.slice(start,end);
 assert.match(update,/for\(const step of enemy\.path\)/);
 assert.doesNotMatch(update,/enemy\.path\.some/);
 assert.match(update,/const seesPlayer=canSeePlayer\(enemy\)/);
 assert.match(update,/enemy\.isBuilder&&enemy\.isEnraged&&seesPlayer/);
 assert.match(update,/enemy\.isHorned&&enemy\.isEnraged&&seesPlayer/);
 assert.doesNotMatch(update,/enemy\.isBuilder&&enemy\.isEnraged&&canSeePlayer/);
});

test("o rastreamento de movimento evita arrays e objetos temporários em cada quadro",()=>{
 const updateStart=html.indexOf("function update(dt){");
 const updateEnd=html.indexOf("\n/* DESENHO DO CENÁRIO */",updateStart);
 const update=html.slice(updateStart,updateEnd);
 const walkersStart=html.indexOf("function updateWaterWalkers(");
 const walkersEnd=html.indexOf("\nfunction ",walkersStart+12);
 const walkers=html.slice(walkersStart,walkersEnd);
 assert.match(update,/player\._previousX=player\.x;player\._previousY=player\.y/);
 assert.match(update,/for\(const enemy of enemies\)\{enemy\._previousX=enemy\.x;enemy\._previousY=enemy\.y\}/);
 assert.doesNotMatch(update,/enemies\.map\(e=>\(\{x:e\.x,y:e\.y\}\)\)/);
 assert.match(update,/updateWaterWalkers\(dt\)/);
 assert.match(walkers,/for\(const entity of enemies\)/);
 assert.doesNotMatch(walkers,/walkers=\[|enemies\.map/);
});
