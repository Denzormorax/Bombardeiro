const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "bombardeirojogo.html"), "utf8");

test("portal secreto aparece apenas na primeira fase da Floresta, escondido em bloco destrutível aleatório", () => {
  assert.match(game, /currentWorld==="forest"&&level===1&&!secretRoom\.usedThisRun\)chooseSecretEntry\(\)/);
  assert.match(game, /map\[y\]\[x\]===2&&distance\(x\+\.5,y\+\.5,player\.x,player\.y\)>3\.5/);
  assert.match(game, /entry\.found=true;entry\.spawnTime=gameClock/);
});

test("sala secreta usa arena pequena e exatamente dois inimigos comuns", () => {
  assert.match(game, /map=buildSecretArenaMap\(\);bombs=\[\];flames=\[\];enemies=\[makeSecretEnemy\(11,4\),makeSecretEnemy\(11,8\)\]/);
  assert.match(game, /isBuilder:false,isHunter:false,isHorned:false,isMushroom:false,isSnowman:false/);
  assert.match(game, /for\(let y=3;y<=9;y\+\+\)for\(let x=6;x<=12;x\+\+\)result\[y\]\[x\]=0/);
});

test("entrada e retorno usam fade e restauram o estado da arena principal", () => {
  assert.match(game, /beginSecretRoomTransition\("enter"\)/);
  assert.match(game, /beginSecretRoomTransition\("return"\)/);
  assert.match(game, /secretRoom\.transition=\{type,phase:"out",time:0,duration:\.34\}/);
  assert.match(game, /map=saved\.map;bombs=saved\.bombs;flames=saved\.flames;enemies=saved\.enemies/);
  assert.match(game, /secretRoom\.usedThisRun=true;secretRoom\.entry=null/);
});

test("portal de retorno e baú verde aparecem quando os dois inimigos forem derrotados", () => {
  assert.match(game, /enemies\.length===2&&enemies\.every\(enemy=>!enemy\.alive\)/);
  assert.match(game, /secretRoom\.returnPortal=\{x:10,y:6,spawnTime:gameClock\}/);
  assert.match(game, /hp:4,maxHp:4[\s\S]*isSecretGreen:true/);
});

test("baú secreto mantém quatro explosões e usa visual verde sem contorno dourado", () => {
  assert.match(game, /function drawSecretGreenChest\(chest\)/);
  assert.match(game, /secretRoom\.visuals=\{body,lid,aura,spark,flame,portalAura,portalCore,reward\}/);
  assert.match(game, /function drawSecretGreenChest\(chest\)/);
  assert.match(game, /chest\.hp--;chest\.hitFlash=\.24/);
  assert.match(game, /if\(chest\.hp<=0\)\{treasureChests\.splice\(i,1\)/);
});

test("recompensa é uma chama com mais branco e aumenta o alcance das bombas em um", () => {
  assert.match(game, /secretRoom\.visuals\.reward/);
  assert.match(game, /firePowerUps=Math\.min\(12,firePowerUps\+1\);firePower=1\+firePowerUps/);
  assert.match(game, /PODER DE FOGO \+1/);
});

test("sala secreta não substitui nem interfere no portal normal de conclusão", () => {
  assert.match(game, /const secretCheckWinBase=checkWin/);
  assert.match(game, /return secretCheckWinBase\(\)/);
  assert.match(game, /const secretSpawnExitPortalBase=spawnExitPortal/);
  assert.match(game, /if\(secretRoom\.active\)return;return secretSpawnExitPortalBase\(\)/);
});
