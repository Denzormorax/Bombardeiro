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
