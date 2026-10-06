const L=require('./lib');(async()=>{const eng=process.argv[2]==='chromium'?L.chromium:L.webkit;const p=await L.open({eng});await L.newGame(p,'豆豆');await L.pick(p,/走進咸陽/);await L.pick(p,/將軍別動/);await L.toMap(p);
await p.evaluate(()=>{S.per=0;});await L.goPl(p,'clinic');
for(const t of ['擁抱他','替他包紮','親他','診脈','撫琴一曲','喝酒']){await p.evaluate(x=>{SET.inmode='cmd';UI.modeSync();},0);await p.fill('#free',t);await p.click('#send');await L.flush(p);if(await p.$eval('#med',e=>e.className.indexOf('on')>=0))await L.medSolve(p,true);await L.flush(p);}
console.log(process.argv[2],'act0 errs',p.errs.length?p.errs:'none',await L.txt(p));await p.browser_.close();process.exit(p.errs.length?1:0);})();
