const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.resolve(__dirname,"../bombardeirojogo.html"),"utf8");

test("Caçadores do Reino dos Templos usam armadura 3D com paleta exclusiva",()=>{
 assert.match(html,/TEMPLE_HUNTER_ENEMY_PALETTE/);
 assert.match(html,/isTempleHunter=templeActive&&!!e\.isHunter/);
 assert.match(html,/isTempleHunter\?templeHunterEnemyPalette\(\)/);
 assert.match(html,/drawTempleCommonEnemyDetails\(e,templePalette\)/);
 assert.match(html,/e\.isHunter\?templeHunterEnemyPalette\(\)/);
 assert.match(html,/currentWorld==="temples"&&level>=1&&level<=9/);
});

test("o novo guardião musculoso aparece uma vez por fase 1 a 9 do Reino dos Templos",()=>{
 assert.match(html,/templeBruteCount=currentWorld==="temples"&&level>=1&&level<=9\?1:0/);
 assert.match(html,/templeBruteSlots=new Set\(slots\.splice\(0,templeBruteCount\)\)/);
 assert.match(html,/isBrute=templeBruteSlots\.has\(index\)/);
 assert.match(html,/isBrute,isEnraged:false/);
 assert.match(html,/hp:isSnowman\|\|isBrute\?3/);
});

test("o guardião tem paleta distinta, braços grandes animados e acabamento metálico",()=>{
 assert.match(html,/TEMPLE_BRUTE_ENEMY_PALETTE/);
 assert.match(html,/if\(e\.isBrute&&currentWorld==="temples"&&level>=1&&level<=9\)/);
 assert.match(html,/_templeBruteMoving\?Math\.sin\(gameClock\*13\.5/);
 assert.match(html,/ctx\.lineWidth=9\.2/);
 assert.match(html,/ctx\.lineWidth=6\.4/);
 assert.match(html,/ctx\.lineTo\(side\*11,5\)/);
 assert.match(html,/e\.isBrute\?TEMPLE_BRUTE_ENEMY_PALETTE/);
});

test("os braços não alteram a colisão: o movimento usa o mesmo caminho centralizado por blocos",()=>{
 assert.match(html,/moveEntity\(enemy,dx\/dist\*amount,dy\/dist\*amount,ENEMY_RADIUS,"enemy"\)/);
 assert.match(html,/const target=enemy\.path\[0\],tx=target\.x\+\.5,ty=target\.y\+\.5/);
 assert.match(html,/enemy\._templeBruteMoving=Math\.hypot\(movedX,movedY\)>.0005/);
 assert.match(html,/enemy\._templeBruteMoving=false/);
});
