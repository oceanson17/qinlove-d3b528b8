const L=require('./lib');
(async()=>{
 const p=await L.open({eng:L.chromium,settings:{ai:false,typer:false}});
 // boot game state without UI wizard
 const boot=await p.evaluate(()=>{
  try{
   heroineState({name:'白芷',world:'equal',g:'f',age:19});
   UI.begin('place');
   return {ok:1,n:pc().n,g:S.gold};
  }catch(e){return {err:String(e&&e.message||e)};}
 });
 console.log('boot',boot);
 if(boot.err){await p.browser_.close();process.exit(1);}
 await p.waitForTimeout(200);
 const r=await p.evaluate(()=>{
  try{
   if(typeof Deal==='undefined')return {err:'no Deal'};
   var lord=genPerson({g:'m',age:55,kind:'npc',job:'owner',met:1,aff:40,trust:30,loc:{r:S.region,pl:S.place}});
   lord.title='舖主';
   var mid=genPerson({g:'m',age:32,kind:'npc',job:'none',met:1,par:[lord.id]});
   var kid=genPerson({g:'m',age:8,kind:'npc',job:'child',met:1,aff:10,loc:{r:S.region,pl:S.place},par:[mid.id]});
   kid.n='小安';kid.rel='孫';kid.title='孫子';mid.kids=[kid.id];if(!lord.kids)lord.kids=[];lord.kids.push(mid.id);
   Ill.add(kid,'fever',3);
   S.gold=100;S.fam.clinic.open=0;delete S.fam.clinic.rentFrom;delete S.fam.clinic.rentPrice;
   var offer=Deal.parseOffer('醫好你孫子就用60兩租醫館給我',lord.id);
   if(!offer)return {err:'parse fail'};
   var d=Deal.add(Object.assign({},offer,{pid:kid.id,status:'open',src:'test'}));
   var before={gold:S.gold,open:S.fam.clinic.open,st:d.status,price:d.price,iff:d.if,then:d.then,who:d.who};
   var ci=Med.illCase(kid);if(ci<0)ci=Med.caseOf('fever');
   var m={d:CASES[ci],ci:ci,pid:kid.id,src:'family',fee:0,rev:{},step:'proc',dxOk:true,seq:CASES[ci].seq.slice(),dxOpts:[],cb:''};
   var res={q:1,out:'cure',stamp:'藥到病除'};
   Med.apply(m,res);
   var after={gold:S.gold,open:!!S.fam.clinic.open,rentFrom:S.fam.clinic.rentFrom,rentPrice:S.fam.clinic.rentPrice,
    deal:S.deals.map(function(x){return {st:x.status,then:x.then,price:x.price,who:x.who};}),
    msg:res.msg||'',dealMsgs:res.dealMsgs||[]};
   var resolved=Deal.sceneResolved('舖主：「一言為定。你去醫罷。」\n他拱手告辭。');
   var hasClose=typeof NODES.aiClose==='function';
   return {before:before,after:after,parse:offer,resolved:resolved,hasClose:hasClose};
  }catch(e){return {err:String(e&&e.message||e),stack:String(e&&e.stack||'').slice(0,500)};}
 });
 console.log(JSON.stringify(r,null,2));
 const ok=r&&!r.err&&r.after&&r.after.open&&r.after.gold===40&&r.after.deal.some(d=>d.st==='done')&&r.hasClose;
 console.log(ok?'PASS':'FAIL');
 console.log('page errs',p.errs);
 await p.browser_.close();
 process.exit(ok?0:1);
})().catch(e=>{console.error(e);process.exit(1);});
