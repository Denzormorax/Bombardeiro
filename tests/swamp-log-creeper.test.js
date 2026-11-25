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
test("ciclo de superfície dura sete segundos e inclui afundar, atravessar e emergir",()=>{
 assert.match(html,/surfaceCycle:7/);
 for(const phase of ["surface","sinking","burrow","emerging"])assert.ok(html.includes('phase="'+phase+'"')||html.includes('phase==="'+phase+'"'));
 assert.match(html,/swampLogPath\(log,true,danger,true\)/);
 assert.match(html,/tileAt\(x,y\)!==0/);
});
test("criatura só recebe dano na forma física e morre após dois acertos",()=>{
 assert.match(html,/enemy\.burrowing\|\|enemy\.phase!=="surface"/);
 assert.match(html,/enemy\.hp=Math\.max\(0,\(enemy\.hp\|\|2\)-1\)/);
 assert.match(html,/if\(enemy\.hp<=0\)killEnemy\(enemy\)/);
});
test("criatura foge de bombas por baixo da terra e não fere o jogador enquanto submersa",()=>{
 assert.match(html,/danger\.has\(cellKey\(Math\.floor\(log\.x\),Math\.floor\(log\.y\)\)\)\)swampLogBeginBurrow/);
 assert.match(html,/log\.burrowing=true/);
 assert.match(html,/!log\.burrowing&&log\.phase==="surface"/);
});
test("efeitos do tronco usam desenho procedural e partículas limitadas",()=>{
 assert.match(html,/function drawSwampLog\(log\)/);
 assert.match(html,/log\.drips\.length<8/);
 assert.match(html,/createRadialGradient/);
});
test("controle do tronco não altera moveEntity nem tileAt globalmente",()=>{
 const section=html.slice(html.indexOf("/* CRIATURA DO PÂNTANO"),html.indexOf("/* BOMBARDEIRO_RUNTIME_DIAGNOSTIC_V1"));
 assert.doesNotMatch(section,/moveEntity\s*=|tileAt\s*=/);
 assert.match(section,/swampLogUpdateEnemiesBase=updateEnemies/);
});
