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

test("o Guardião prepara o golpe por dois segundos e mantém dois segundos de recuperação",()=>{
 assert.ok(html.includes("function templeBruteAttackLane(enemy)"));
 assert.ok(html.includes("range>7"));
 assert.ok(html.includes('enemy.templeBruteAttackState="windup";enemy.templeBruteAttackTimer=2'));
 assert.ok(html.includes('enemy.templeBruteAttackState="slam";enemy.templeBruteAttackTimer=2'));
 assert.ok(html.includes('enemy.templeBruteAttackState="idle"'));
});
test("o fogo do Guardião usa o mesmo desenho e tamanho da chama da bomba, mudando apenas as cores",()=>{
 const bomb=html.slice(html.indexOf("function buildFlameSpriteVariant(variant){"),html.indexOf("\nfunction drawFlame(f){"));
 const brute=html.slice(html.indexOf("function buildTempleBruteFireSprite(variant){"),html.indexOf("\nfunction drawTempleBruteFireCell(cell){"));
 for(const fragment of [
  "sprite.width=Math.ceil(size*1.36*scale);sprite.height=Math.ceil(size*1.24*scale)",
  "c.moveTo(px+7,baseY)",
  "c.bezierCurveTo(px+size*.99,py+size*.53,px+size-2,py+size*.76,px+size-7,baseY)",
  "c.quadraticCurveTo(px+size*.12,py+size*.58,px+size*.3,py+size*.42+flicker*2)",
  "c.bezierCurveTo(px+size*.25,py+size*.66,px+size*.38,py+size*.48,px+size*.49,py+size*.31+flicker*1.5)",
  "c.quadraticCurveTo(px+size*.4,py+size*.62,cx+flicker2*2,py+size*.48)"
 ]){assert.ok(bomb.includes(fragment),`chama da bomba sem geometria esperada: ${fragment}`);assert.ok(brute.includes(fragment),`fogo do Guardião difere da bomba: ${fragment}`)}
 assert.ok(brute.includes('"#ffffff"'));
 assert.ok(brute.includes('"#c5d9eb"'));
 assert.ok(brute.includes('"#829db8"'));
 assert.ok(!brute.includes("for(let i=0;i<4;i++)"));
 const draw=html.slice(html.indexOf("function drawTempleBruteFireCell(cell){"),html.indexOf("\\nfunction updateEnemies(dt){"));
 assert.ok(draw.includes("const w=TILE*1.36*pulse,h=TILE*1.24*pulse"));
 assert.ok(html.includes("remaining:7"));
 assert.ok(html.includes("directions=[{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}]"));
 assert.ok(html.includes("tileAt(wave.x,wave.y)!==0||bombAt(wave.x,wave.y)"));
});
test("a onda de fogo do Guardião é atualizada e desenhada somente no Reino dos Templos",()=>{
 assert.match(html,/if\(currentWorld==="temples"\)updateTempleBruteFireWaves\(dt\)/);
 assert.match(html,/if\(currentWorld==="temples"\)for\(const wave of templeBruteFireWaves\)/);
});
