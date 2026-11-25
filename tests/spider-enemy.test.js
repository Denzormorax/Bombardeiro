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

test("aranha revelada foge do jogador e usa caminho em quatro direções",()=>{
 assert.match(html,/function spiderFindFleePath/);
 assert.match(html,/score=distance\(p\.x\+\.5,p\.y\+\.5,player\.x,player\.y\)/);
 assert.match(html,/const dirs=\[\[0,-1\],\[1,0\],\[0,1\],\[-1,0\]\]/);
});

test("primeira bomba revela sem dano simultâneo e uma bomba posterior pode matar",()=>{
 assert.match(html,/const spiderExplodeBase=explode;\s*explode=function\(b\)/);
 assert.match(html,/spiderReveal\(d,"bomb"\)/);
 assert.match(html,/spider\.revealProtection=\.7/);
 assert.match(html,/if\(!enemy\.alive\|\|enemy\.revealProtection>0\)return/);
 assert.match(html,/hp:1,maxHp:1/);
});

test("ataque só ocorre em uma das quatro casas imediatamente adjacentes",()=>{
 assert.match(html,/Math\.abs\(px-sx\)\+Math\.abs\(py-sy\)===1/);
 assert.match(html,/if\(spider\.noAttackUntilLeave\|\|player\.inv>0\)continue/);
 assert.match(html,/function spiderHideAfterAttack/);\n assert.match(html,/d.hideAnim=Math.max\\(0,d.hideAnim-dt\\*2.2\\)/);
});

test("aranha mantém 5 moedas, inimigos de três níveis mantêm 8 moedas",()=>{
 assert.match(html,/if\(enemy&&enemy\.isSpider\)dropped\.value=5/);
 assert.match(html,/enemy\.isBuilder\|\|enemy\.isSnowman\|\|enemy\.isSwampGhost\|\|enemy\.isBlueFlame\)\)dropped\.value=8/);
});

test("disfarce continua contando como inimigo restante e pode se esconder novamente",()=>{
 assert.match(html,/allEnemiesDefeated=function\(\)\{return spiderDisguises\.length===0/);
 assert.match(html,/spiderDisguises\.push\(\{x,y,wait:5,moveTimer:5/);
});
