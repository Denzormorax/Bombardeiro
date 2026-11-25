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
test("ciclo mantém sete segundos na superfície e esconde o monstro até o jogador passar por cima",()=>{
 assert.match(html,/surfaceCycle:7/);
 assert.match(html,/sinkTime:\.45,emergeTime:\.45/);
 assert.match(html,/if\(log\.surfaceClock>=swampLogTuning\.surfaceCycle\)\{swampLogBeginBurrow\(log\);return\}/);
 assert.match(html,/player\.inv<=0&&distance\(log\.x,log\.y,player\.x,player\.y\)<\.62/);
 assert.match(html,/log\.ambushTriggered=true/);
 assert.match(html,/if\(log\.ambushTriggered\).*hurtPlayer\(\)/s);
 for(const phase of ["surface","sinking","burrow","emerging"])assert.ok(html.includes('phase="'+phase+'"')||html.includes('phase==="'+phase+'"'));
});
test("tronco percorre rotas cardinais pelo centro das células, sem deslizar lateralmente",()=>{
 assert.match(html,/function swampLogRoute\(log,targetX,targetY\)/);
 assert.match(html,/for\(const \[dx,dy\] of \[\[0,-1\],\[1,0\],\[0,1\],\[-1,0\]\]\)/);
 const move=html.slice(html.indexOf("function swampLogMove"),html.indexOf("function swampLogBeginBurrow"));
 assert.match(move,/swampLogCanStand\(nx,ny,log\)/);
 assert.doesNotMatch(move,/for\(const off of \[\.035,\.07,\.11/);
 assert.match(html,/ctx\.scale\(1\.25,1\.25\)/);
});
test("tronco recalcula a rota ao encontrar paredes, blocos e inimigos nos dois modos",()=>{
 assert.match(html,/function swampLogEnemyBlocked\(x,y,log,margin=\.58\)/);
 assert.match(html,/if\(log&&swampLogEnemyBlocked\(x,y,log,\.56\)\)return false/);
 assert.match(html,/if\(seen\.has\(key\)\|\|x<1/);
 assert.match(html,/swampLogEnemyBlocked\(x\+\.5,y\+\.5,log,\.62\)/);
 assert.match(html,/swampLogCanStand\(nx,ny,log\)/);
 assert.match(html,/log\.path=\[\];log\.repath=0/);
});
test("tronco borbulha, pinga no chão e mistura tons de madeira e limo",()=>{
 assert.match(html,/for\(let i=0;i<12;i\+\+\)/);
 assert.match(html,/function swampLogEnemyBlocked/);
 assert.match(html,/log\.splats\.push/);
 assert.match(html,/ctx\.ellipse\(/);
 assert.match(html,/ctx\.fillStyle=/);
 assert.match(html,/drips:\[\],splats:\[\]/);
});
test("criatura só recebe dano na forma física e morre após dois acertos",()=>{
 assert.match(html,/enemy\.burrowing\|\|enemy\.phase!=="surface"/);
 assert.match(html,/enemy\.hp=Math\.max\(0,\(enemy\.hp\|\|2\)-1\)/);
 assert.match(html,/if\(enemy\.hp<=0\)killEnemy\(enemy\)/);
});
test("monstro não detecta bombas e só ataca quando o jogador pisa sobre ele",()=>{
 const section=html.slice(html.indexOf("/* CRIATURA DO PÂNTANO"),html.indexOf("/* BOMBARDEIRO_RUNTIME_DIAGNOSTIC_V1"));
 assert.doesNotMatch(section,/getAllBombDangerCells|getBombDangerCells|reactToNewBomb|swampLogExplodeBase|bombAt\(|danger/);
 assert.match(section,/player\.inv<=0&&distance\(log\.x,log\.y,player\.x,player\.y\)<\.62/);
 assert.match(section,/log\.phase="emerging";log\.phaseTime=0;log\.ambushTriggered=true/);
 assert.match(section,/if\(log\.ambushTriggered\).*hurtPlayer\(\)/s);
 assert.match(section,/if\(phase==="burrow"\)return/);
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
