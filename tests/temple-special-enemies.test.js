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

test("dois ou três Guardiões aparecem somente das fases 3 a 6 do Reino dos Templos",()=>{
 assert.match(html,/templeBruteCount=currentWorld==="temples"&&level>=3&&level<=6\?2\+Math\.floor\(Math\.random\(\)\*2\):0/);
 assert.match(html,/createEnemySpawnPositions\(count\+builderCount\+snowmanCount\+templeBruteCount\)/);
 assert.match(html,/templeBruteSlots=new Set\(slots\.splice\(0,templeBruteCount\)\)/);
 assert.match(html,/isBrute=templeBruteSlots\.has\(index\)/);
 assert.match(html,/isBrute,isEnraged:false/);
 assert.match(html,/hp:isSnowman\?3:isBuilder\?3:isBrute\?4/);
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

test("o Guardião percebe o jogador a sete blocos, ergue os braços por 1,5 segundo e golpeia em cruz",()=>{
 assert.ok(html.includes("function templeBruteCanSeePlayer(enemy){"));assert.ok(html.includes("if(dist>7)return false;"));assert.ok(html.includes("function templeBruteAttackLane(enemy){"));
 assert.ok(html.includes("enemy.templeBruteAttackState=\"windup\";enemy.templeBruteAttackTimer=1.5"));assert.ok(html.includes('enemy.templeBruteAttackState="slam";enemy.templeBruteAttackTimer=2'));
 assert.ok(html.includes('enemy.templeBruteAttackState="idle"'));assert.ok(html.includes("directions=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}]"));
});
test("o impacto usa fumaça branca, prata e azulada que cresce e desaparece suavemente",()=>{
 for(const fragment of ["function buildTempleBruteSmokeSprite(variant){","rgba(255,255,255,.82)","rgba(220,232,243,.64)","rgba(169,196,220,.36)","function drawTempleBruteSmokeCell(cell){","const scale=.42+progress*.92","Math.pow(Math.sin(Math.PI*progress),.72)","life:.72,age:0,phase:Math.random()*Math.PI*2","drawTempleBruteSmokeCell(cell)"])assert.ok(html.includes(fragment),fragment);
 assert.ok(!html.includes("buildTempleBruteFireSprite"));assert.ok(!html.includes("drawTempleBruteFireCell"));assert.ok(html.includes("remaining:7"));assert.ok(html.includes("tileAt(wave.x,wave.y)!==0||bombAt(wave.x,wave.y)"));
});
test("a patrulha do Guardião recalcula rotas e caça o jogador sem pausas longas",()=>{
 for(const fragment of ["function chooseTempleBrutePatrolPath(enemy,blockedDanger=null){","enemy.patrolWait=.015+Math.random()*.055","if(enemy.isBrute)chooseTempleBrutePatrolPath(enemy,danger)","if(dist>vision&&!enemy.isBrute)return false;","if(enemy.isBrute&&dist>7)return false;","const seesPlayer=canSeePlayer(enemy);","enemy.patrolWait=enemy.isBrute?.035:.22","enemy.speed=enemy.isBrute?enemy.huntSpeed*1.3"])assert.ok(html.includes(fragment),fragment);
});
test("a onda de fumaça é atualizada e desenhada somente no Reino dos Templos",()=>{
 assert.match(html,/if\(currentWorld==="temples"\)updateTempleBruteFireWaves\(dt\)/);
 assert.match(html,/if\(currentWorld==="temples"\)for\(const wave of templeBruteFireWaves\)/);
});

test("o impacto sonoro original toca exatamente quando o Guardião golpeia o chão",()=>{
 assert.match(html,/bruteSlam:"game-assets\\/audio\\/guardiao_impacto\\.wav"/);
 assert.match(html,/case "bruteSlam":playSample\\("bruteSlam",1\\);break/);
 assert.match(html,/enemy\\.templeBruteAttackState="slam";enemy\\.templeBruteAttackTimer=2;playSfx\\("bruteSlam"\\);spawnTempleBruteFireWave\\(enemy\\)/);
});
