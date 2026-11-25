"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.resolve(__dirname,"../bombardeirojogo.html"),"utf8");

test("aranhas surgem em quantidade aleatória de 2 ou 3 nos mundos Floresta e Pântano até a fase 9",()=>{
 assert.match(html,/currentWorld==="forest"\|\|currentWorld==="swamp"/);
 assert.match(html,/level>=1&&level<=9/);
 assert.match(html,/2\+Math\.floor\(Math\.random\(\)\*2\)/);
 assert.match(html,/map\[p\.y\]\[p\.x\]=0/);
});

test("disfarces se movem em passos cardinais, centralizados e com intervalo de cinco segundos",()=>{
 assert.match(html,/moveTimer:5/);
 assert.match(html,/const dirs=\[\[0,-1\],\[1,0\],\[0,1\],\[-1,0\]\]/);
 assert.match(html,/d\.renderX=d\.fromX\+\(d\.toX-d\.fromX\)\*d\.moveProgress/);
 assert.match(html,/d\.renderY=d\.fromY\+\(d\.toY-d\.fromY\)\*d\.moveProgress/);
 assert.match(html,/function drawSpiderDisguise\(d\)/);
 assert.match(html,/drawTileTo\(ctx,cx,cy,2\)/);
});

test("aranha revelada pela bomba explora continuamente caminhos aleatórios em quatro direções",()=>{
 assert.match(html,/function spiderFindWanderPath/);
 assert.match(html,/let choices=queue\.filter\(p=>cellKey\(p\.x,p\.y\)!==start&&!danger\.has\(cellKey\(p\.x,p\.y\)\)\)/);
 assert.match(html,/choices\[Math\.floor\(Math\.random\(\)\*choices\.length\)\]/);
 assert.match(html,/spider\.speed\*dt/);
 assert.match(html,/speed:1\.72,baseSpeed:1\.72/);
 assert.match(html,/!danger\.has\(cellKey\(p\.x,p\.y\)\)/);
 assert.match(html,/spider\.path=\[\];spider\.wanderTarget=null;spider\.repath=0/);
});


test("aranha passiva detecta bomba cardinalmente adjacente e recalcula a rota imediatamente",()=>{
 assert.match(html,/const spiderReactToNewBombBase=reactToNewBomb/);
 assert.match(html,/reactToNewBomb=function\(newBomb=null\)/);
 assert.match(html,/Math\.abs\(sx-bx\)\+Math\.abs\(sy-by\)<=1/);
 assert.match(html,/spider\.path=\[\];spider\.wanderTarget=null;spider\.repath=0;spider\.bombAvoiding=true/);
 assert.match(html,/if\(seen\.has\(key\)\|\|tileAt\(x,y\)!==0\|\|bombAt\(x,y\)\)continue/);
 assert.match(html,/let choices=queue\.filter\(p=>cellKey\(p\.x,p\.y\)!==start&&!danger\.has\(cellKey\(p\.x,p\.y\)\)\)/);
});

test("primeira bomba revela sem dano simultâneo e uma bomba posterior pode matar",()=>{
 assert.match(html,/const spiderExplodeBase=explode;\s*explode=function\(b\)/);
 assert.match(html,/spiderReveal\(d,"bomb"\)/);
 assert.match(html,/spider\.revealProtection=\.7/);
 assert.match(html,/if\(!enemy\.alive\|\|enemy\.revealProtection>0\)return/);
 assert.match(html,/hp:1,maxHp:1/);
});

test("aranha revelada por proximidade continua perigosa, mas a revelada por bomba só causa dano por contato",()=>{
 assert.match(html,/passive:reason==="bomb"/);
 assert.match(html,/const contact=distance\(spider\.x,spider\.y,player\.x,player\.y\)<\.48/);
 assert.match(html,/\(spider\.passive&&contact\)\|\|\(!spider\.passive&&spiderAdjacentToPlayer\(spider\)\)/);
 assert.doesNotMatch(html,/function spiderHideAfterAttack/);
});

test("aranha mantém 5 moedas, inimigos de três níveis mantêm 8 moedas",()=>{
 assert.match(html,/if\(enemy&&enemy\.isSpider\)dropped\.value=5/);
 assert.match(html,/enemy\.isBuilder\|\|enemy\.isSnowman\|\|enemy\.isSwampGhost\|\|enemy\.isBlueFlame\)\)dropped\.value=8/);
});

test("disfarces continuam contando como inimigos restantes e a aranha revelada não volta a se esconder",()=>{
 assert.match(html,/allEnemiesDefeated=function\(\)\{return spiderDisguises\.length===0/);
 assert.match(html,/spiderDisguises\.push\(\{x:p\.x,y:p\.y,wait:5/);
 assert.doesNotMatch(html,/function spiderHideAfterAttack/);
});

test("bloco acompanha a aranha nos dois eixos durante a interpolação vertical e horizontal",()=>{
 assert.match(html,/ctx\.translate\(\(rx-cx\)\*TILE,\(ry-cy\)\*TILE-\(d\.lift\|\|0\)\*15\)/);
});

test("pernas sob o disfarce ficam maiores, definidas e com articulações destacadas",()=>{
 assert.match(html,/hidden\?16:17/);
 assert.match(html,/hidden\?25:23/);
 assert.match(html,/hidden\?4\.2:4\.1/);
 assert.match(html,/hidden\?2\.15:1\.35/);
 assert.match(html,/ctx\.arc\(mx,my,2\.5/);
});
