const L=require('./lib');
(async()=>{const p=await L.open({eng:L[process.argv[2]||'chromium']});
 await L.newStd(p,'白芷','equal');let r=await L.flush(p);console.log('flush',r,await L.btns(p));
 await L.click(p,/踏出/);r=await L.flush(p);console.log('place',r,(await L.btns(p)).join('|'));
 console.log(await p.evaluate(()=>document.getElementById('txt').textContent));
 console.log('errs',p.errs);await p.browser_.close();})();
