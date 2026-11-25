"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"bombardeirojogo.html"),"utf8");
test("aranha disfarçada só aparece na Floresta e no Pântano até a fase 9",()=>{
 assert.match(html,/currentWorld==="forest"\|\|currentWorld==="swamp"/);
 assert.match(html,/level>=1&&level<=9/);
 assert.match(html,/spiderDisguises\.push/);
});
test("primeira explosão revela a aranha depois da explosão, sem acertá-la",()=>{
 assert.match(html,/const spiderExplodeBase=explode;\s*explode=function\(b\)\{\s*const danger=getBombDangerCells\(b\);\s*spiderExplodeBase\(b\);\s*for\(const d of spiderDisguises\.slice\(\)\)if\(danger\.has\(cellKey\(d\.x,d\.y\)\)\)spiderReveal\(d,"bomb"\)/);
 assert.match(html,/hp:1,maxHp:1/);
});
test("aranha recebe 5 moedas e inimigos de três níveis recebem 8",()=>{
 assert.match(html,/if\(enemy&&enemy\.isSpider\)dropped\.value=5/);
 assert.match(html,/enemy\.isBuilder\|\|enemy\.isSnowman\|\|enemy\.isSwampGhost\|\|enemy\.isBlueFlame\)\)dropped\.value=8/);
});
test("disfarce conta como inimigo restante e pode ser refeito após contato",()=>{
 assert.match(html,/allEnemiesDefeated=function\(\)\{return spiderDisguises\.length===0/);
 assert.match(html,/function spiderHideAfterAttack/);
 assert.match(html,/hurtPlayer=function\(\)\{\s*const touching=enemies\.find\(e=>e&&e\.isSpider/);
});
test("aranha usa animação de pernas e movimento separado sem alterar o corpo verticalmente",()=>{
 assert.match(html,/function drawSpiderLegs/);\n assert.match(html,/for\\(const d of spiderDisguises\\)if\\(d\\.y===y\\)drawSpiderDisguise\\(d\\)/);
 assert.match(html,/function spiderUpdateEnemy/);
 assert.match(html,/drawEnemy=function\(e\)\{if\(e&&e\.isSpider\)\{drawSpider\(e\);return\}/);
});
