const L=require('./lib');(async()=>{const p=await L.open({eng:L.chromium,settings:{typer:false}});const st=e=>p.evaluate(e);
await p.click('#tNew');await p.waitForTimeout(100);await L.shot(p,'06_name');await p.locator('#dlA .btn.pri').click();
await L.pick(p,/走進咸陽/);await L.flush(p);await st(()=>UI.showLine(UI.sc.lines.length-1));await L.shot(p,'07_heroine_speaks');
await L.pick(p,/將軍別動/);await L.toMap(p);await st(()=>{S.per=2;});await L.goPl(p,'market');await L.talk(p,'mengtian');await L.shot(p,'08_talk_menu');
await st(()=>{S.ch=1;S.flags.palace_ok=1;S.c.lisi.met=1;S.c.jingke.met=1;S.per=1;UI.go('hub');});await L.flush(p);await L.shot(p,'09_map_ch2');
console.log(p.errs);await p.browser_.close();})();
