const L=require('./lib');
(async()=>{const p=await L.open({eng:L[process.argv[2]||'chromium']});await p.click('#tNew');await p.waitForTimeout(100);await p.click('[data-act="suEra"][data-v="y1"]');await p.waitForTimeout(100);await L.shot(p,'v3_setup_era');
await p.click('[data-act="suGo"]');await p.waitForTimeout(300);await L.flush(p);
const r=await p.evaluate(()=>({bc:Eng.yb(),era:Eng.era(),ages:['yingzheng','mengtian','lisi','fusu','lvbuwei','zhaoji','xuanye'].map(k=>P(k).n+ageOf(P(k))+P(k).title+(P(k).away?'(away)':'')).join(' '),why:Rom.why('yingzheng'),ln:UI.sc.lines.map(l=>l.t).join('|').slice(0,120)}));
console.log(JSON.stringify(r),p.errs);await p.browser_.close();})();
