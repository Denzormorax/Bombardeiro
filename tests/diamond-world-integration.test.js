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
test("os blocos indestrutíveis e destrutíveis têm silhuetas e construção visual distintas",()=>{
 assert.equal((atlas.match(/muralha indestrutível blindada/g)||[]).length,10);
 assert.equal((atlas.match(/geodo destrutível rachado/g)||[]).length,10);
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
