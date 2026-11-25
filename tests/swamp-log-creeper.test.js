"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.resolve(__dirname,"../bombardeirojogo.html"),"utf8");

test("criatura do tronco surge exatamente duas vezes nas fases 5 a 9 do Pântano",()=>{
 assert.match(html,/if\(currentWorld!=="swamp"\|\|level<5\|\|level>9\)return/);
 assert.match(html,/for\(let i=0;i<2&&spots\.length;i\+\+\)/);
 assert.match(html,/isSwampLog:true/);
});
test("criatura possui dois pontos de vida e barra dupla sobre a cabeça",()=>{
 assert.match(html,/hp:2,maxHp:2/);
 assert.match(html,/for\(let i=0;i<2;i\+\+\)\{ctx\.fillStyle=i<\(log\.hp\|\|0\)/);
});
test("ciclo mantém sete segundos na superfície, cinco para afundar e cinco para emergir",()=>{
 assert.match(html,/surfaceCycle:7/);
 assert.match(html,/sinkTime:5,emergeTime:5,burrowMin:5,burrowMax:8/);
 assert.match(html,/log\.burrowTime>=swampLogTuning\.burrowMin/);
 for(const phase of ["surface","sinking","burrow","emerging"])assert.ok(html.includes('phase="'+phase+'"')||html.includes('phase==="'+phase+'"'));
 assert.match(html,/swampLogPath\(log,true,danger,true\)/);
 assert.match(html,/tile!==0/);
});
test("tronco percorre rotas cardinais pelo centro das células, sem deslizar lateralmente",()=>{
 assert.match(html,/function swampLogRoute\(log,targetX,targetY,allowCrates=false,danger=null\)/);
 assert.match(html,/for\(const \[dx,dy\] of \[\[0,-1\],\[1,0\],\[0,1\],\[-1,0\]\]\)/);
 const move=html.slice(html.indexOf("function swampLogMove"),html.indexOf("function swampLogBeginBurrow"));
 assert.match(move,/swampLogCanStand\(nx,ny,underground,log\)/);
 assert.doesNotMatch(move,/for\(const off of \[\.035,\.07,\.11/);
 assert.match(html,/ctx\.scale\(1\.25,1\.25\)/);
});
test("tronco recalcula a rota ao encontrar paredes, blocos e inimigos nos dois modos",()=>{
 assert.match(html,/function swampLogEnemyBlocked\(x,y,log,margin=\.58\)/);
 assert.match(html,/if\(log&&swampLogEnemyBlocked\(x,y,log,\.56\)\)return false/);
 assert.match(html,/if\(seen\.has\(k\)\|\|t!==0/);
 assert.match(html,/swampLogEnemyBlocked\(x\+\.5,y\+\.5,log,\.62\)/);
 assert.match(html,/swampLogCanStand\(nx,ny,underground,log\)/);
 assert.match(html,/log\.path=\[\];log\.repath=0/);
});
test("tronco borbulha, pinga no chão e mistura tons de madeira e limo",()=>{
 assert.match(html,/for\\(let i=0;i<12;i\\+\\+\\)/);
 assert.match(html,/function swampLogEnemyBlocked/);
 assert.match(html,/log\.splats\.push/);
 assert.match(html,/const puddle=ctx\.createRadialGradient/);
 assert.match(html,/const slime=ctx\.createLinearGradient/);
 assert.match(html,/drips:\[\],splats:\[\]/);
});
test("criatura só recebe dano na forma física e morre após dois acertos",()=>{
 assert.match(html,/enemy\.burrowing\|\|enemy\.phase!=="surface"/);
 assert.match(html,/enemy\.hp=Math\.max\(0,\(enemy\.hp\|\|2\)-1\)/);
 assert.match(html,/if\(enemy\.hp<=0\)killEnemy\(enemy\)/);
});
test("criatura foge de bombas por baixo da terra e não fere o jogador enquanto submersa",()=>{
 assert.match(html,/danger\.has\(key\)/);
 assert.match(html,/swampLogBeginBurrow\(log,danger\)/);
 assert.match(html,/log\.burrowing=true/);
 assert.match(html,/!log\.burrowing&&log\.phase==="surface"/);
});
test("efeitos do tronco usam desenho procedural e partículas limitadas",()=>{
 assert.match(html,/function drawSwampLog\(log\)/);
 assert.match(html,/log\.drips\.length<10/);
 assert.match(html,/createRadialGradient/);
});
test("controle do tronco não altera moveEntity nem tileAt globalmente",()=>{
 const section=html.slice(html.indexOf("/* CRIATURA DO PÂNTANO"),html.indexOf("/* BOMBARDEIRO_RUNTIME_DIAGNOSTIC_V1"));
 assert.doesNotMatch(section,/moveEntity\s*=|tileAt\s*=/);
 assert.match(section,/swampLogUpdateEnemiesBase=updateEnemies/);
});
