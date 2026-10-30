const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1700},deviceScaleFactor:2.4});
for(const t of ['light','dark']){await p.setContent(`<html><body style="margin:0">${fs.readFileSync('geo/art-'+t+'.svg','utf8')}</body></html>`);await p.waitForTimeout(500);await p.screenshot({path:'geo/art-'+t+'.png',clip:{x:0,y:0,width:1600,height:1700}});}
await b.close();})();
