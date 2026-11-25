"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"bombardeirojogo.html"),"utf8");
const image=fs.readFileSync(path.join(root,"game-assets/images/bomb-button.png"));

test("botão da bomba usa a nova imagem sem alterar a área de toque nem distorcer a proporção",()=>{
 assert.ok(html.includes('<button type="button" id="bombBtn" class="control" aria-label="Colocar bomba"><img src="game-assets/images/bomb-button.png" alt=""></button>'));
 assert.ok(html.includes('#bombBtn{width:82px;height:82px;'));
 assert.ok(html.includes('#bombBtn img{position:absolute;left:50%;top:50%;width:234.46%;height:127%;'));
 assert.ok(html.includes('object-fit:fill;pointer-events:none;'));
 assert.equal(image.toString("hex",0,8),"89504e470d0a1a0a");
 assert.equal(image.readUInt32BE(16),1080);
 assert.equal(image.readUInt32BE(20),585);
});
