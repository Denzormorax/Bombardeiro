const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.resolve(__dirname,"../bombardeirojogo.html"),"utf8");

test("perder uma vida inicia uma animação única sem encerrar a fase imediatamente",()=>{
 const start=html.indexOf("function hurtPlayer(){");
 const end=html.indexOf("\nfunction collectCoins()",start);
 const fn=html.slice(start,end);
 assert.match(fn,/if\(player\.inv>0\|\|playerDeathAnimation\)return/);
 assert.match(fn,/lives--;resetPowerUps\(\);updateHUD\(\)/);
 assert.match(fn,/playerDeathAnimation=\{time:0,startX:player\.x,startY:player\.y,respawned:false\}/);
 assert.doesNotMatch(fn,/gameOver\(false\)/);
});

test("a animação fecha os olhos no salto, cai de lado e termina deitado",()=>{
 assert.match(html,/deathTime<\.22\?30\*Math\.sin/);
 assert.match(html,/deathTime<\.50\?30\*/);
 assert.match(html,/death\?1\.22\*deathEase/);
 assert.match(html,/if\(death\)\{ctx\.strokeStyle="#17232b"/);
});

test("durante a morte o mundo e os controles ficam bloqueados até o fade e o respawn",()=>{
 assert.match(html,/playerDeathAnimation\|\|bombCooldown/);
 assert.match(html,/function openShop\(\)\{if\(!running\|\|customizing\|\|playerDeathAnimation\)return/);
 assert.match(html,/pauseBtn"\)\.onclick=\(\)=>\{if\(!running\|\|customizing\|\|playerDeathAnimation\)return/);
 assert.match(html,/if\(playerDeathAnimation\)return true/);
 assert.match(html,/if\(playerDeathAnimation\)\{\s*const death=playerDeathAnimation;death\.time\+=dt;gameClock\+=dt;/);
 assert.match(html,/restorePlayerAtSafeSpawn\(\);player\.passBomb=null;player\.inv=2\.2;death\.respawned=true/);
 assert.match(html,/death\.time>=\.76&&death\.time<\.96/);
 assert.match(html,/death\.time>=\.96\)screenFadeAlpha/);
 assert.match(html,/ctx\.fillRect\(0,0,W,H\)/);
});

test("a animação é limpa ao preparar uma nova fase e mantém o encerramento na última vida",()=>{
 assert.match(html,/playerDeathAnimation=null;screenFadeAlpha=0;heartPurchases=0/);
 assert.match(html,/if\(lives<=0\)\{playerDeathAnimation=null;screenFadeAlpha=1;gameOver\(false\);return\}/);
});

test("o renascimento restaura e valida o canto seguro antes de reaparecer",()=>{
 assert.match(html,/function restorePlayerAtSafeSpawn\(\)\{/);
 assert.match(html,/const safeCells=\[\[1,1\],\[2,1\],\[1,2\],\[2,2\],\[3,1\],\[1,3\]\]/);
 assert.match(html,/for\(const \[x,y\] of safeCells\).*map\[y\]\[x\]=0/);
 assert.match(html,/const spawnBombs=bombs\.filter/);
 assert.match(html,/rebuildStaticMapCache\(\);\s*player\.x=1\.5;player\.y=1\.5/);
 assert.match(html,/restorePlayerAtSafeSpawn\(\);player\.passBomb=null;player\.inv=2\.2;death\.respawned=true/);
});
