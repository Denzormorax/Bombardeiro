const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");const root=path.resolve(__dirname,"..");
const atlas=fs.readFileSync(path.join(root,"game-assets/sprites/diamond_themes.svg"),"utf8");const world=JSON.parse(fs.readFileSync(path.join(root,"game-assets/worlds/diamond-world.json"),"utf8"));
test("Mundo dos Diamantes possui 40 texturas SVG em dez linhas",()=>{assert.match(atlas,/width="384" height="960"/);assert.equal((atlas.match(/<g transform="translate\(/g)||[]).length,40);});
test("as dez fases possuem identidades e paletas próprias",()=>{assert.equal(world.phases.length,10);assert.equal(new Set(world.phases.map(p=>p.name)).size,10);assert.equal(new Set(world.phases.map(p=>p.palette.primary)).size,10);});
test("o atlas define quatro tipos de peças e mantém regras de jogo",()=>{assert.deepEqual(world.columns,["ground","terrainDetail","indestructibleBlock","destructibleGeode"]);assert.equal(world.destructibleBlock.sameGameplayAsExistingDestructibleBlocks,true);assert.match(atlas,/geodo destrutível/);});
function extractSvgGroup(source,start){const tags=/<\/?g\b[^>]*>/g;tags.lastIndex=start;let depth=0,match;while((match=tags.exec(source))){if(match[0].startsWith("</"))depth--;else depth++;if(depth===0)return source.slice(start,tags.lastIndex);}throw new Error("Grupo SVG sem fechamento");}
test("as dez fases usam exatamente o mesmo piso de terra com três pequenas gemas azuis",()=>{
 const starts=[...atlas.matchAll(/<g transform="translate\(0 (\d+)\)">/g)];
 assert.equal(starts.length,10);
 const normalized=starts.map(match=>extractSvgGroup(atlas,match.index)
  .replace(/transform="translate\(0 \d+\)"/,'transform="translate(0 0)"')
  .replace(/Fase \d+ — piso de terra/,"Fase N — piso de terra"));
 assert.equal(new Set(normalized).size,1,"todas as dez texturas de chão devem ser visualmente idênticas");
 assert.equal((atlas.match(/rx="3\.2" ry="1\.9"/g)||[]).length,60);
 assert.equal((atlas.match(/pedrinhas azuis/g)||[]).length,20);
 assert.doesNotMatch(atlas,/pedrinhas (vermelhas|verdes|roxas|douradas|rosas)/);
 assert.equal((atlas.match(/<g transform="translate\(96 \d+\)">/g)||[]).length,10,"a segunda camada deve existir nas dez fases");
 assert.equal((atlas.match(/<title>Fase \d+ — piso de terra com cristais naturais e três pedrinhas azuis<\/title>/g)||[]).length,20,"as duas camadas devem usar o piso de terra");
});

test("a camada terrainDetail repete exatamente o piso com três pedrinhas nas dez fases",()=>{
 const details=[...atlas.matchAll(/<g transform="translate\(96 (\d+)\)">/g)];
 assert.equal(details.length,10);
 for(const match of details){
  const y=Number(match[1]);
  const groundStart=atlas.indexOf('<g transform="translate(0 '+y+')">');
  const detail=extractSvgGroup(atlas,match.index).replace(/transform="translate\(96 \d+\)"/,'transform="translate(0 0)"').replace(/Fase \d+ — piso de terra/,"Fase N — piso de terra");
  const ground=extractSvgGroup(atlas,groundStart).replace(/transform="translate\(0 \d+\)"/,'transform="translate(0 0)"').replace(/Fase \d+ — piso de terra/,"Fase N — piso de terra");
  assert.equal(detail,ground,"as duas camadas devem ser idênticas na fase "+(y/96+1));
 }
});
