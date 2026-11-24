const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const atlas = fs.readFileSync(path.join(root, "game-assets/sprites/ice_themes.svg"), "utf8");
const game = fs.readFileSync(path.join(root, "bombardeirojogo.html"), "utf8");
const snowball = fs.readFileSync(path.join(root, "game-assets/sprites/snowball_destructible.svg"), "utf8");

test("Reino do Gelo possui 40 texturas em dez faixas", () => {
  assert.match(atlas, /width="384" height="960"/);
  assert.equal((atlas.match(/<g transform="translate\(/g) || []).length, 40);
  assert.equal((atlas.match(/<title>(?:Terreno|Variação|Bloco)/g) || []).length, 40);
});

test("cada uma das dez fases do Reino do Gelo está declarada no jogo", () => {
  const phases = [
    "Floresta Congelada", "Lago Congelado", "Grutas de Cristal",
    "Montanhas Nevadas", "Vale da Nevasca", "Pinheiros Congelados",
    "Palácio de Gelo", "Geleira Profunda", "Tempestade Polar", "Reino do Gelo"
  ];
  for (const phase of phases) assert.ok(game.includes(phase), `Fase ausente: ${phase}`);
  assert.match(game, /iceSpriteSheet\.src="game-assets\/sprites\/ice_themes\.svg"/);
  assert.match(game, /bomberquest-ice-unlocked/);
});


test("flocos da bola de neve caem dentro da bola e desaparecem no montinho", () => {
  assert.match(game, /function snowballParticleSeed\(x,y,k,salt\)/);
  assert.match(game, /for\(let k=0;k<4;k\+\+\)/);
  assert.match(game, /const localY=\.12\+phase\*\.76/);
  assert.match(game, /const fadeOut=Math\.min\(1,\(1-phase\)\/\.20\)/);
  assert.match(game, /color:ICE_SNOWFALL_COLORS\\[Math\\.min\\(2,Math\\.floor\\(colorSeed\\*3\\)\\)\\]/);
  assert.match(game, /if\\(currentWorld!==\\"ice\\"\\|\\|!snowballParticleSpecs\\.length\\)return/);
  assert.match(game, /buildSnowballParticleSpecs\\(\\);/);
  assert.match(game, /drawSnowballParticles\(\);/);
  assert.match(game, /currentWorld===\"ice\"\)spawnDestroyedBlockEffect/);
  assert.doesNotMatch(snowball, /<animate\b/i);
});
