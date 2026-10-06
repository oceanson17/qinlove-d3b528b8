const L=require('./lib');(async()=>{const p=await L.open({eng:L.chromium});
await L.newGame(p,'豆豆');await L.pick(p,/走進咸陽/);await L.pick(p,/將軍別動/);await L.pick(p,/前往醫館/);await L.pick(p,/開始在咸陽/);
console.log(await p.evaluate(()=>{S.pend={text:'再說一次',id:'mengtian',req:{type:'free',text:'x'},d:1,shown:1};saveSlot(2,true);UI.loadGame(2);return [UI.cur,JSON.stringify(S.pend),JSON.stringify(Eng.pending()),UI.sc&&UI.sc.lines[0].t];}));
console.log(p.errs);await p.browser_.close();})();
