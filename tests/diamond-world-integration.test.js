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
 assert.match(html,/isHunter=isSnowman\|\|\(!isBuilder&&!isMushroom&&!isHorned&&\(level>=5&&level<=9\?true:hunterSlots\.has\(index\)\)\)/);
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
test("os geodos recebem contorno luminoso justo na silhueta, na cor do tema e sem halo externo",()=>{
 const haloStart=html.indexOf("function drawDiamondCrystalSilhouette(");
 const drawStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const builder=html.slice(haloStart,drawStart);
 assert.match(html,/DIAMOND_SHIMMER_PADDING=8,DIAMOND_SHIMMER_FRAME_SIZE=TILE\+DIAMOND_SHIMMER_PADDING\*2/);
 assert.match(builder,/outlineColor/);
 assert.match(builder,/outlineCtx\.globalCompositeOperation="source-in"/);
 assert.match(builder,/outlineCtx\.globalCompositeOperation="destination-out"/);
 assert.match(builder,/drawDiamondCrystalSilhouette\(outlineCtx,x\+dx,y\+dy,spriteScale\)/);
 assert.match(builder,/drawDiamondCrystalSilhouette\(outlineCtx,x,y,spriteScale\)/);
 assert.match(builder,/maskCtx\.moveTo\(12,54\).*maskCtx\.lineTo\(31,85\)/s);
 assert.match(builder,/Silhueta vetorial do geodo/);
 assert.doesNotMatch(builder,/outlineCtx\.ellipse/);
 assert.match(builder,/outlineCtx\.fillStyle=outlineColor/);
 assert.doesNotMatch(builder,/shadowBlur|shadowColor|Halo em três camadas/);
 assert.match(builder,/effectCtx\.drawImage\(diamondOutlineGlowCanvas,0,0\)/);
 assert.match(builder,/effectCtx\.globalAlpha=\.72\+\.28\*glowPulse/);
 const renderer=html.slice(drawStart,html.indexOf("\nfunction draw(){",drawStart));
 assert.match(renderer,/ctx\.drawImage\(atlas,sx,sy,DIAMOND_SHIMMER_FRAME_SIZE,DIAMOND_SHIMMER_FRAME_SIZE,dx,dy,DIAMOND_SHIMMER_FRAME_SIZE,DIAMOND_SHIMMER_FRAME_SIZE\)/);
 assert.doesNotMatch(renderer,/whitePreview|reveal|shadowBlur/);
});
test("contorno e brilho interno usam atlas pré-renderizado em cache, sem processamento por diamante a cada quadro",()=>{
 assert.match(html,/DIAMOND_SHIMMER_FRAME_COUNT=64,DIAMOND_SHIMMER_FRAME_COLUMNS=8/);
 const buildStart=html.indexOf("function renderDiamondShimmerAtlasFrame(");
 const drawStart=html.indexOf("function drawDiamondDestructibleShimmer()");
 const drawEnd=html.indexOf("\nfunction draw(){",drawStart);
 assert.ok(buildStart>=0&&drawStart>buildStart&&drawEnd>drawStart);
 const builder=html.slice(buildStart,drawStart),renderer=html.slice(drawStart,drawEnd);
 assert.match(builder,/effectCtx\.globalCompositeOperation="destination-in"/);
 assert.match(builder,/atlasCtx\.drawImage\(diamondShimmerTileCanvas/);
 assert.doesNotMatch(renderer,/destination-in|clearRect|createElement\("canvas"\)/);
 assert.match(builder,/requestIdleCallback/);
 assert.match(builder,/Date\.now\(\)-started<2/);
 assert.match(builder,/renderDiamondShimmerAtlasFrame\(state,0\)/);
 assert.match(html,/diamondShimmerPreviewCanvas\.getContext\("2d"\)\.drawImage\(diamondShimmerTileCanvas,0,0\)/);
 assert.doesNotMatch(html,/diamondShimmerFrameWhitePreview|diamondShimmerWhitePreviewCanvas|diamondShimmerRevealStartedAt|DIAMOND_SHIMMER_REVEAL_MS/);
 assert.match(html,/function prepareDiamondShimmerAtlasForLevel\(n\)/);
});
test("a destruição dos geodos cria muitos estilhaços facetados na cor da fase com sprites e brilhos em cache",()=>{
 assert.match(html,/world==="diamonds"\?72/);
 assert.doesNotMatch(html,/buildDiamondDestroyedBlockGlow|diamondDestroyedGlowCanvases/);
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

test("os fragmentos de diamante usam a ponte pública da paleta sem acessar diamondThemes privado",()=>{
 const particleStart=html.indexOf("function getDestroyedBlockParticleSprite(");
 const particleEnd=html.indexOf("function spawnDestroyedBlockEffect(",particleStart);
 assert.ok(particleStart>=0&&particleEnd>particleStart,"função dos fragmentos localizada");
 assert.doesNotMatch(html.slice(particleStart,particleEnd),/diamondThemes/,"os fragmentos não podem acessar o catálogo privado");
 assert.doesNotMatch(html,/buildDiamondDestroyedBlockGlow|diamondDestroyedGlowCanvases/,"não há clarão radial na destruição dos diamantes");
 assert.match(html,/window\.__bombardeiroGetDiamondEffectPalette=function\(themeIndex\)/);
 assert.match(html,/const paletteGetter=window\.__bombardeiroGetDiamondEffectPalette/);
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

test("o foguete aumenta visualmente sem ampliar o raio de colisão",()=>{
 assert.match(html,/const DIAMOND_CHARGER_RADIUS=\.17/);
 assert.match(html,/bodyScale=1\.34/);
});
test("a patrulha do foguete centraliza o eixo transversal antes de avançar pelo corredor",()=>{
 const start=html.indexOf("function followDiamondChargerPath(enemy,dt){");
 const end=html.indexOf("\nfunction diamondChargerStun",start);
 const move=html.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(move,/const horizontal=target\.y===Math\.floor\(enemy\.y\)&&target\.x!==Math\.floor\(enemy\.x\)/);
 assert.match(move,/const offset=ty-enemy\.y/);
 assert.match(move,/const offset=tx-enemy\.x/);
 assert.match(move,/enemy\.x=tx;enemy\.y=ty;enemy\.path\.shift\(\)/);
});
test("a investida espera o alinhamento exato no centro da faixa e percorre uma linha livre",()=>{
 assert.match(html,/const lane=ey\+\.5;return \{x:step,y:0,axis:"x",lane,aligned:Math\.abs\(enemy\.y-lane\)<=\.012\}/);
 assert.match(html,/const lane=ex\+\.5;return \{x:0,y:step,axis:"y",lane,aligned:Math\.abs\(enemy\.x-lane\)<=\.012\}/);
 assert.match(html,/diamondChargerLineTarget\(enemy\);[\s\S]*?if\(!target\.aligned\)/);
 assert.match(html,/if\(target\.axis==="x"\)enemy\.y=target\.lane;else enemy\.x=target\.lane/);
});
test("o corpo do foguete recebe um brilho branco diagonal animado e recortado na silhueta",()=>{
 assert.match(html,/const shine=\(gameClock\*\.62\)%1,shineX=-25\+shine\*50/);
 assert.match(html,/createLinearGradient\(shineX-12,20,shineX\+12,-20\)/);
 assert.match(html,/rgba\(255,255,255,\.82\)/);
 assert.match(html,/shineGradient;bodyPath\(\);ctx\.fill\(\)/);
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

test("a travessia dos espirais anima o encolhimento e o crescimento do jogador e dos inimigos",()=>{
 assert.match(html,/entity\._diamondPortalTransit=\{fromX,fromY,toX,toY,elapsed:0,duration:\.78\}/);
 assert.match(html,/function diamondPortalTransitPose\(entity\)/);
 assert.match(html,/Math\.cos\(local\*Math\.PI\*\.5\)/);
 assert.match(html,/Math\.sin\(local\*Math\.PI\*\.5\)/);
 assert.match(html,/drawPlayerBeforeDiamondTransit/);
 assert.match(html,/drawEnemyBeforeDiamondTransit/);
 assert.match(html,/transit\.elapsed\+=dt/);
});

test("caçador e inimigos comuns do Mundo dos Diamantes usam fragmentos de cristal da paleta de cada fase",()=>{
 assert.match(html,/isHunter=isSnowman\|\|\(!isBuilder&&!isMushroom&&!isHorned&&\(level>=5&&level<=9\?true:hunterSlots\.has\(index\)\)\)/);
 assert.match(html,/function drawDiamondEnemyDetails\(e,deathProgress=0\)[\s\S]*?drawEnemyRockDetails\(e,dt\.wall\[1\],dt\.wall\[0\],deathProgress\)/);
 assert.match(html,/function drawEnemyRockDetails\(e,color,helmetColor,deathProgress=0\)/);
 assert.match(html,/rockFill=e\.isBuilder\?"#080808":color,rockEdge=e\.isBuilder\?"#8c592f":helmetColor/);
 assert.match(html,/currentWorld==="diamonds"\?currentForestTheme\(\)\.glow/);
});

 
test("novo inimigo foguete de diamante aparece de 2 a 3 vezes nas fases 2 a 6 com quatro níveis de dano",()=>{
 assert.ok(html.includes('currentWorld!=="diamonds"||level<2||level>6'));
 assert.ok(html.includes("2+Math.floor(Math.random()*2)"));
 assert.ok(html.includes("enemy.isDiamondCharger=true"));
 assert.ok(html.includes("enemy.hp=4;enemy.maxHp=4"));
 assert.ok(html.includes("for(let i=0;i<4;i++)"));
 assert.ok(html.includes('"#67e4ff"')&&html.includes('"#f18adf"')&&html.includes('"#9b70ed"'));
});
test("o foguete de diamante investe alinhado em até cinco blocos com linha livre e fica atordoado por três segundos e meio",()=>{
 assert.ok(html.includes("function diamondChargerLineTarget(enemy)"));
 assert.ok(html.includes("Math.abs(dx)<=5")&&html.includes("Math.abs(dy)<=5"));
 assert.ok(html.includes("tileAt(x,ey)!==0")&&html.includes("tileAt(ex,y)!==0"));
 assert.ok(html.includes("DIAMOND_CHARGER_SPEED=8.6"));
 assert.ok(html.includes('enemy.diamondStunTimer=3.5'));
 assert.ok(html.includes('enemy.diamondState==="stunned"'));
});
test("o foguete de diamante tem desenho facetado próprio, olhos zonzos e cores fixas",()=>{
 assert.ok(html.includes("function drawDiamondCharger(enemy)"));
 assert.ok(html.includes("ctx.moveTo(0,-23)"));
 assert.ok(html.includes("eyeX-2.2,-2.5"));
 assert.ok(html.includes("diamondChargerDrawEnemyBase=drawEnemy"));
 assert.ok(html.includes("diamondChargerDamageEnemyBase=damageEnemy"));
});

test("o inimigo de diamante fica inofensivo enquanto está atordoado e mantém as cores próprias",()=>{
 assert.ok(html.includes('!(e.isDiamondCharger&&(e.diamondState==="stunned"||e.diamondState==="impact"))'));
 assert.ok(html.includes("window.__bombardeiroGetDiamondSpriteSheet"));
 assert.ok(html.includes("ctx.drawImage(sheet,288,0,96,96,-21,-25,42,42)"));
 assert.ok(html.includes('ctx.globalCompositeOperation="source-atop"'));
 assert.ok(html.includes('rgba(238,116,230,.78)'));
});

test("o foguete de diamante usa a textura do geodo com uma ponta, expressão de investida e postura sentada",()=>{
 const start=html.indexOf("function drawDiamondCharger(enemy){");
 const end=html.indexOf("const diamondChargerDrawEnemyBase=drawEnemy;",start);
 const draw=html.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(draw,/ctx\.moveTo\(0,-23\)/);
 assert.match(draw,/if\(stunned\|\|impacting\)/);
 assert.match(draw,/else if\(charging\)/);
 assert.match(draw,/ctx\.quadraticCurveTo\(eyeX,2,eyeX\+3,-1\)/);
 assert.match(draw,/ctx\.lineTo\(-4,11\)/);
 assert.match(draw,/const seatedY=stunned\?5:0/);
 assert.ok(draw.includes("bodyScaleY=stunned?.78:1"));
 assert.ok(draw.includes("bodyScale=1.34"));
 assert.ok(draw.includes("impacting?Math.sin(gameClock*105)*2.4:0"));
 assert.ok(html.includes("enemy.diamondStunTimer=3.5"));
});

test("o foguete de diamante levanta e aponta antes da investida, com rastro de fragmentos cristalinos",()=>{
 assert.match(html,/enemy\.diamondState="aim";enemy\.diamondAimTimer=\.28/);
 assert.match(html,/enemy\.diamondState==="aim"/);
 assert.match(html,/ctx\.rotate\(bodyAngle\)/);
 assert.match(html,/spawnDiamondChargerTrail\(enemy\)/);
 assert.match(html,/function drawDiamondChargerParticles\(\)/);
 assert.match(html,/updateDiamondChargerParticles\(dt\)/);
});
test("o impacto do foguete solta estilhaços na cor dos diamantes e a recuperação dura três segundos e meio",()=>{
 assert.match(html,/function spawnDiamondChargerImpact\(x,y\)/);
 assert.match(html,/diamondChargerStun\(enemy,enemy\.x\+enemy\.diamondChargeX\*\.16,enemy\.y\+enemy\.diamondChargeY\*\.16\)/);
 assert.match(html,/enemy\.diamondStunTimer=3\.5/);
 assert.match(html,/DIAMOND_CHARGER_COLORS=\["#67e4ff","#f18adf","#9b70ed"/);
});

test("as funções do foguete de diamante ficam fora do escopo de sincronização dos controles",()=>{
 const diamondStart=html.indexOf("/* INIMIGO FOGUETE DE DIAMANTE — cores próprias");
 const syncStart=html.lastIndexOf("syncThemedBackdrop=function(){",diamondStart);
 assert.ok(syncStart>=0&&diamondStart>syncStart,"bloco do foguete deve vir depois do fechamento da sincronização");
 const syncBlock=html.slice(syncStart,diamondStart);
  assert.match(syncBlock,/controls\.style\.setProperty\("--control-pause-border",theme\.accent\);/);
  assert.match(syncBlock,/if\(el\)el\.dataset\.world=currentWorld/);
  assert.match(syncBlock,/else if\(controls\)[\s\S]*?controls\.style\.removeProperty\(property\)/);
  assert.match(syncBlock,/for\(const property of \[.*--control-pause-border.*\]\)/);
 assert.doesNotMatch(syncBlock,/function (?:spawnDiamondChargerTrail|spawnDiamondChargerImpact|updateDiamondChargerParticles|drawDiamondChargerParticles)\(/);
 assert.equal((html.match(/function drawDiamondChargerParticles\(\)/g)||[]).length,1);
 assert.equal((html.match(/function updateDiamondChargerParticles\(dt\)/g)||[]).length,1);
 assert.match(html,/function update\(dt\)[\s\S]*?updateDiamondChargerParticles\(dt\)/);
 assert.match(html,/function draw\(\)[\s\S]*?drawDiamondChargerParticles\(\)/);
});

test("o foguete explode imediatamente a bomba atingida durante a investida e recebe dano da explosão",()=>{
 assert.match(html,/const hitBomb=bombs\.find\(b=>circleRectCollision\(nx,ny,DIAMOND_CHARGER_RADIUS,b\.x\+\.12,b\.y\+\.12,\.76,\.76\)\)/);
 assert.match(html,/bombs=bombs\.filter\(b=>b!==hitBomb\);hitBomb\.t=0;explode\(hitBomb\)/);
 assert.match(html,/if\(enemy\.alive\)diamondChargerStun\(enemy,nx,ny\)/);
 assert.match(html,/function explode\(b\)[\s\S]*?damageEnemy\(enemy\)/);
});
test("o impacto do foguete tem tremor rápido antes de sentar e retomar a patrulha após 3,5 segundos",()=>{
 assert.match(html,/enemy\.diamondState="impact";enemy\.diamondImpactTimer=\.14/);
 assert.match(html,/enemy\.diamondImpactTimer=Math\.max\(0,\(enemy\.diamondImpactTimer\|\|0\)-dt\)/);
 assert.match(html,/enemy\.diamondState="stunned";enemy\.diamondStunTimer=3\.5/);
 assert.match(html,/impacting\?Math\.sin\(gameClock\*105\)\*2\.4/);
});
test("o foguete apresenta quatro barras individuais de vida",()=>{
 assert.match(html,/enemy\.hp=4;enemy\.maxHp=4/);
 assert.match(html,/const colors=\["#67e4ff","#f18adf","#9b70ed","#b8a0ff"\],barY=py-43;for\(let i=0;i<4;i\+\+\)/);
});



test("a bomba cristalizada aparece apenas no Mundo dos Diamantes, das fases 5 a 9, junto aos inimigos existentes",()=>{
 assert.ok(html.includes('if(currentWorld!=="diamonds"||level<5||level>9)return'));
 assert.ok(html.includes("enemy.isCrystalBomb=true"));
 assert.ok(html.includes("!enemy.isDiamondCharger&&!enemy.isSnowman&&!enemy.isBuilder&&!enemy.isMushroom&&!enemy.isHorned"));
 assert.ok(html.includes("1+Math.floor(Math.random()*2)"));
});
test("a bomba cristalizada patrulha em corredores ortogonais, centralizando o corpo entre os blocos",()=>{
 const pathStart=html.indexOf("function followCrystalBombPath(enemy,dt){");
 const pathEnd=html.indexOf("\nfunction updateCrystalBombEnemy",pathStart);
 const movement=html.slice(pathStart,pathEnd);
 assert.ok(pathStart>=0&&pathEnd>pathStart);
 assert.ok(movement.includes("const horizontal=target.y===Math.floor(enemy.y)&&target.x!==Math.floor(enemy.x)"));
 assert.ok(movement.includes("const offset=ty-enemy.y"));
 assert.ok(movement.includes("const offset=tx-enemy.x"));
 assert.ok(movement.includes("enemy.x=tx;enemy.y=ty;enemy.path.shift()"));
 assert.ok(movement.includes("canOccupy(nx,ny,CRYSTAL_BOMB_RADIUS"));
});
test("a bomba cristalizada arma o fusível entre patrulhas de 5 a 7 segundos e retorna à patrulha sem morrer ao explodir",()=>{
 assert.ok(html.includes("CRYSTAL_BOMB_FUSE=2.45"));
 assert.ok(html.includes("enemy.crystalBombTimer=6+Math.random()*2"));
 assert.ok(html.includes('enemy.crystalBombState==="arming"'));
 assert.ok(html.includes('enemy.crystalBombState="recover";enemy.crystalBombRecover=1.05'));
 assert.ok(html.includes("range:2,activeSlotReleased:true,isCrystalBomb:true"));
 assert.ok(html.includes('for(const enemy of enemies)if(!b.isCrystalBomb&&enemy.alive'));
 assert.ok(html.includes('if(!f.isCrystalBomb&&!f.hitEnemies.has(enemy)&&circleRectCollision'));
 assert.ok(html.includes('if(!f.isCrystalBomb&&isInsideFlameDamage(player,{x:f.x,y:f.y}))'));
  assert.ok(html.includes('if(!enemy.isCrystalBomb||enemy.crystalBombState==="patrol")damageEnemy(enemy)'));
 assert.ok(html.includes('enemy.crystalBombState="patrol"'));
});
test("a explosão da bomba cristalizada tem alcance de dois blocos e fogo animado na cor da fase",()=>{
 assert.ok(html.includes("crystalThemeIndex:b.crystalThemeIndex??0"));
 assert.ok(html.includes("function buildCrystalBombFlameSprites(themeIndex)"));
 assert.ok(html.includes("theme.accent"));
 assert.ok(html.includes("theme.glow"));
 assert.ok(html.includes("function drawCrystalBombFlame(flame)"));
 assert.ok(html.includes("if(flame&&flame.isCrystalBomb){drawCrystalBombFlame(flame);return}"));
});
test("a bomba cristalizada tem corpo esférico 3D facetado, olhos, boquinha e expressão própria ao levar dano",()=>{
 assert.ok(html.includes("function drawCrystalBombEnemy(enemy)"));
 assert.ok(html.includes("createRadialGradient(-7,-9,1,2,2,25)"));
 assert.ok(html.includes("function crystalBombSpherePath()"));
 assert.ok(html.includes("if(hurt){"));
 assert.ok(html.includes("ctx.moveTo(eyeX-2.2,-4)"));
 assert.ok(html.includes("ctx.quadraticCurveTo(0,5,4,9)"));
 assert.ok(html.includes("ctx.quadraticCurveTo(0,11,4,8)"));
 assert.ok(html.includes("const crystalBombDrawEnemyBase=drawEnemy"));
});


test("bomba cristalizada: preparo lento, escala visual sem alterar colisão, brilho diagonal e pavio",()=>{
 assert.ok(html.includes("CRYSTAL_BOMB_RADIUS=.20,CRYSTAL_BOMB_VISUAL_SCALE=1.10,CRYSTAL_BOMB_FUSE=2.45,CRYSTAL_BOMB_DEATH_TIME=.58"));
 assert.ok(html.includes("Math.sin(gameClock*6.4)*.12"));
 assert.ok(html.includes("ctx.scale(scale*pulse*CRYSTAL_BOMB_VISUAL_SCALE"));
 assert.ok(html.includes("function drawCrystalBombWick(enemy,px,py,alpha,bob,arming,scale,pulse,squash,shake)"));
 assert.ok(html.includes("wickGlow=ctx.createRadialGradient"));
 assert.ok(html.includes("flameY=-35"));
 assert.ok(html.includes("ctx.lineWidth=3.6"));
 assert.ok(html.includes("sway*.35,-29"));
 assert.ok(html.includes("sway*.35,-28"));
 assert.ok(html.includes("drawCrystalBombWick(enemy,px,py,alpha,bob,arming,scale,pulse,squash,shake)"));
 assert.ok(html.includes("Reflexo branco diagonal em forma de diamante"));
 assert.ok(html.includes("const shine=(gameClock*.82)%1,shineX=-24+shine*48"));
 assert.ok(html.includes("createLinearGradient(-5,0,5,0)"));
 assert.ok(html.includes("rgba(255,255,255,.96)"));
});
test("a bombinha infla, desinfla e explode visualmente ao receber o dano final",()=>{
 assert.ok(html.includes("CRYSTAL_BOMB_DEATH_TIME=.58"));
 assert.ok(html.includes("enemy.deathTimer=CRYSTAL_BOMB_DEATH_TIME"));
 assert.ok(html.includes("enemy.crystalBombState=\"dying\""));
 assert.ok(html.includes("1+.58*(deathProgress/.34)"));
 assert.ok(html.includes("1.58-.88*Math.min(1,(deathProgress-.34)/.24)"));
 assert.ok(html.includes("if(dying&&deathProgress>=.58)"));
 assert.ok(html.includes('if(!enemy.alive){enemy.deathTimer=Math.max(0,(enemy.deathTimer||0)-dt);continue}'));
 assert.ok(html.includes("const blast=ctx.createRadialGradient"));
 assert.ok(html.includes("if(dying&&deathProgress>=.28)"));
 assert.ok(html.includes("drawCrystalBombFlame({x:enemy.x-.5,y:enemy.y-.5"));
});
test("explosão cristalizada não causa dano aos inimigos e bomba cristalina em preparo/recuperação é imune",()=>{
 assert.ok(html.includes('for(const enemy of enemies)if(!b.isCrystalBomb&&enemy.alive'));
 assert.ok(html.includes('if(!f.isCrystalBomb&&!f.hitEnemies.has(enemy)&&circleRectCollision'));
 assert.ok(html.includes('if(!f.isCrystalBomb&&isInsideFlameDamage(player,{x:f.x,y:f.y}))'));
  assert.ok(html.includes('if(!enemy.isCrystalBomb||enemy.crystalBombState==="patrol")damageEnemy(enemy)'));
 assert.ok(html.includes('if(!enemy.alive||enemy.crystalBombState!=="patrol")return'));
});
test("bomba cristalizada atravessa portais de diamante com destino aleatório e transição animada",()=>{
 assert.ok(html.includes("function checkCrystalBombDiamondPortal(enemy,dt)"));
 assert.ok(html.includes("findDiamondPortalDestination(enemy,inside,CRYSTAL_BOMB_RADIUS,false)"));
 assert.ok(html.includes("enemy._diamondPortalTransit={fromX,fromY,toX,toY,elapsed:0,duration:.78}"));
 assert.ok(html.includes("if(checkCrystalBombDiamondPortal(enemy,dt))continue"));
 assert.ok(html.includes("if(!enemy._diamondPortalTransit)checkCrystalBombDiamondPortal(enemy,dt)"));
 assert.match(html,/if\(enemy&&enemy\.isCrystalBomb\)\{[\s\S]*?const pose=diamondPortalTransitPose\(enemy\)/);
 assert.match(html,/ctx\.scale\(pose\.scale,pose\.scale\)/);
 assert.match(html,/try\{drawCrystalBombEnemy\(enemy\)\}finally\{ctx\.restore\(\);enemy\.x=oldX;enemy\.y=oldY\}/);
});

test("a explosão da bomba cristalizada só afeta blocos destrutíveis e encadeia bombas do jogador",()=>{
 assert.match(html,/if\(!b\.isCrystalBomb\)for\(let i=treasureChests\.length-1/);
 assert.match(html,/if\(!b\.isCrystalBomb&&player\.inv<=0&&isInsideFlameDamage\(player,c\)\)hurtPlayer\(\)/);
 assert.match(html,/if\(!b\.isCrystalBomb&&enemy\.alive/);
 assert.match(html,/bombs\.forEach\(other=>\{if\(other!==b&&Math\.floor\(other\.x\)===c\.x&&Math\.floor\(other\.y\)===c\.y\)/);
});
test("inimigos que se encostam recalculam a rota para contornar uns aos outros",()=>{
 assert.match(html,/function enemyCanRerouteAfterContact\(enemy\)/);
 assert.match(html,/function rerouteEnemyAwayFromContact\(enemy,other,danger,all\)/);
 assert.match(html,/const separation=distance\(x\+\.5,y\+\.5,otherX,otherY\)/);
 assert.match(html,/const path=findGridPath\(sx,sy,x,y,blocked\)/);
 assert.match(html,/function resolveEnemyContactRoutes\(\)/);
 assert.match(html,/const collisionAwareUpdateEnemiesBase=updateEnemies/);
 assert.match(html,/collisionAwareUpdateEnemiesBase\(dt\);\s*resolveEnemyContactRoutes\(\)/);
 assert.match(html,/enemy\.collisionRepathCooldown=\.48/);
 assert.match(html,/enemy\.diamondState="patrol"/);
});
test("a bomba cristalizada atravessa as espirais e patrulha um pouco mais devagar",()=>{
 assert.match(html,/checkCrystalBombDiamondPortal\(enemy,dt\)/);
 assert.match(html,/enemy\.speed=enemy\.baseSpeed\*\.86/);
 assert.match(html,/enemy\.crystalBombTimer=6\+Math\.random\(\)\*2/);
});
