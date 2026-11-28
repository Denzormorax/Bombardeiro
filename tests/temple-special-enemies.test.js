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
 assert.match(html,/hp:isSnowman\?3:isBuilder\?3:isBrute\?4:isHunter\|\|isHorned\?2:1,maxHp:isSnowman\?3:isBuilder\?3:isBrute\?4:isHunter\|\|isHorned\?2:1/);
});

test("o guardião tem paleta distinta, braços grandes animados e acabamento metálico",()=>{
 assert.match(html,/TEMPLE_BRUTE_ENEMY_PALETTE/);
 assert.match(html,/if\(e\.isBrute&&currentWorld==="temples"&&level>=1&&level<=9\)/);
 assert.match(html,/_templeBruteMoving\?Math\.sin\(gameClock\*13\.5/);
 assert.match(html,/ctx\.lineWidth=16/);
 assert.match(html,/ctx\.lineWidth=12\.2/);
 assert.match(html,/ctx\.lineTo\(side\*15,7\)/);
 assert.match(html,/e\.isBrute\?TEMPLE_BRUTE_ENEMY_PALETTE/);
});

test("os braços não alteram a colisão: o movimento usa o mesmo caminho centralizado por blocos",()=>{
 assert.match(html,/moveEntity\(enemy,dx\/dist\*amount,dy\/dist\*amount,ENEMY_RADIUS,"enemy"\)/);
 assert.match(html,/const target=enemy\.path\[0\],tx=target\.x\+\.5,ty=target\.y\+\.5/);
 assert.match(html,/enemy\._templeBruteMoving=Math\.hypot\(movedX,movedY\)>.0005/);
 assert.match(html,/enemy\._templeBruteMoving=false/);
});

test("o Guardião prepara e executa o golpe de chão após quatro segundos",()=>{
 assert.match(html,/function templeBruteAttackLane\(enemy\)/);
 assert.match(html,/range>7/);
 assert.match(html,/enemy\.templeBruteAttackState="windup";enemy\.templeBruteAttackTimer=4/);
 assert.match(html,/attackState==="windup"/);
 assert.match(html,/enemy\.templeBruteAttackState="slam";enemy\.templeBruteAttackTimer=2/);
 assert.match(html,/attackState==="slam"/);
 assert.match(html,/enemy\.templeBruteAttackState="idle"/);
});
test("a onda de fogo branco e cinzento percorre casas livres e elimina o jogador quando alcança sua casa",()=>{
 assert.match(html,/function spawnTempleBruteFireWave\(enemy\)/);
 assert.match(html,/remaining:7/);
 assert.match(html,/wave\.clock>=\.075/);
 assert.match(html,/tileAt\(wave\.x,wave\.y\)!==0\|\|bombAt\(wave\.x,wave\.y\)/);
 assert.match(html,/Math\.floor\(player\.x\)===cell\.x&&Math\.floor\(player\.y\)===cell\.y/);
 assert.match(html,/hurtPlayer\(\)/);
 assert.match(html,/function drawTempleBruteFireCell\(cell\)/);
 assert.match(html,/createRadialGradient/);
 assert.match(html,/#5d6570/);
 assert.match(html,/#ffffff/);
});
test("a onda de fogo do Guardião é atualizada e desenhada somente no Reino dos Templos",()=>{
 assert.match(html,/if\(currentWorld==="temples"\)updateTempleBruteFireWaves\(dt\)/);
 assert.match(html,/if\(currentWorld==="temples"\)for\(const wave of templeBruteFireWaves\)/);
});
