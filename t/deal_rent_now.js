const L=require('./lib');
(async()=>{
 const p=await L.open({eng:L.chromium,settings:{ai:false,typer:false}});
 const boot=await p.evaluate(()=>{
  try{heroineState({name:'白芷',world:'equal',g:'f',age:19});UI.begin('place');return {ok:1,g:S.gold};}
  catch(e){return {err:String(e&&e.message||e)};}
 });
 console.log('boot',boot);
 if(boot.err){await p.browser_.close();process.exit(1);}
 await p.waitForTimeout(150);
 const r=await p.evaluate(()=>{
  try{
   if(typeof Deal==='undefined')return {err:'no Deal'};
   var lord=genPerson({g:'m',age:55,kind:'npc',job:'owner',met:1,aff:40,trust:30,loc:{r:'xianyang',pl:'clinic'}});
   lord.title='舖主';lord.n='徐福';
   S.place='clinic';S.gold=160;S.fam.clinic.open=0;S.fam.tech.alco=1;
   delete S.fam.clinic.rentFrom;delete S.fam.clinic.rentPrice;S.deals=[];

   // 1) parse immediate rent 50兩 / 50元 / 五十兩
   var p1=Deal.parseOffer('用50兩租下醫館給我',lord.id);
   var p2=Deal.parseOffer('用50元租醫館',lord.id);
   var p3=Deal.parseOffer('五十兩就租給你這間醫館',lord.id);
   var pHeal=Deal.parseOffer('醫好你孫子就用60兩租醫館給我',lord.id);

   // 2) enough gold → apply now
   S.gold=160;S.fam.clinic.open=0;
   var d1=Deal.add({with:lord.id,if:'now',then:'rent_clinic',price:50,src:'test'});
   var enough={gold:S.gold,open:!!S.fam.clinic.open,st:d1&&d1.status,rentPrice:S.fam.clinic.rentPrice,from:S.fam.clinic.rentFrom};

   // 3) insufficient gold → refuse open, keep deal
   S.deals=[];S.fam.clinic.open=0;delete S.fam.clinic.rentFrom;delete S.fam.clinic.rentPrice;S.gold=30;
   var d2=Deal.add({with:lord.id,if:'now',then:'rent_clinic',price:50,src:'test'});
   var poor={gold:S.gold,open:!!S.fam.clinic.open,st:d2&&d2.status,wait:!!(d2&&d2._waitPay)};

   // 4) AI deals JSON if now
   S.deals=[];S.fam.clinic.open=0;S.gold=160;delete S.fam.clinic.rentFrom;delete S.fam.clinic.rentPrice;
   Deal.fromAI([{with:lord.id,if:'now',then:'rent_clinic',price:50,status:'open'}],lord.id);
   var fromAI={gold:S.gold,open:!!S.fam.clinic.open,st:(S.deals[0]||{}).status,price:S.fam.clinic.rentPrice};

   // 5) scene parse + ingest
   S.deals=[];S.fam.clinic.open=0;S.gold=160;delete S.fam.clinic.rentFrom;delete S.fam.clinic.rentPrice;
   Deal.ingestTurn({text:'那我用五十兩租下這醫館',tag:'對白',id:lord.id},{speaker:lord.id,scene:'徐福：「一言為定，五十兩租給你了。」\n他收下銀兩。',deals:[],fx:{}});
   var ingest={gold:S.gold,open:!!S.fam.clinic.open,deals:S.deals.map(x=>({st:x.status,if:x.if,price:x.price,then:x.then}))};

   // 6) place hub label: no 120 button when open
   S.deals=[];S.fam.clinic.open=1;S.fam.clinic.rentPrice=50;S.fam.clinic.rentFrom=lord.id;S.gold=110;
   var acts=Place.acts().map(c=>c.t);
   var has120=acts.some(t=>/120/.test(t)&&/租/.test(t));
   var hasSit=acts.some(t=>/坐堂看診/.test(t));

   // 7) legacy open deal reconcile on hub
   S.deals=[];S.fam.clinic.open=0;delete S.fam.clinic.rentFrom;delete S.fam.clinic.rentPrice;S.gold=160;
   Deal.list().push({id:'dlegacy',type:'deal',with:lord.id,if:'now',then:'rent_clinic',price:50,status:'open',who:'',pid:'',text:'',d:S.day,src:'legacy'});
   var acts2=Place.acts().map(c=>c.t);
   var leg={gold:S.gold,open:!!S.fam.clinic.open,has120:acts2.some(t=>/120/.test(t)&&/租/.test(t)),hasSit:acts2.some(t=>/坐堂看診/.test(t)),label:Deal.rentLabel()};

   return {p1,p2,p3,pHeal,enough,poor,fromAI,ingest,hub:{has120,hasSit,acts:acts.slice(0,5)},leg};
  }catch(e){return {err:String(e&&e.message||e),stack:String(e&&e.stack||'').slice(0,600)};}
 });
 console.log(JSON.stringify(r,null,2));
 const ok=r&&!r.err
  && r.p1&&r.p1.if==='now'&&r.p1.price===50
  && r.p2&&r.p2.price===50
  && r.p3&&r.p3.price===50
  && r.pHeal&&r.pHeal.if==='heal_grandson'
  && r.enough.gold===110&&r.enough.open&&r.enough.st==='done'&&r.enough.rentPrice===50
  && r.poor.gold===30&&!r.poor.open&&r.poor.st==='open'&&r.poor.wait
  && r.fromAI.gold===110&&r.fromAI.open&&r.fromAI.st==='done'
  && r.ingest.open&&r.ingest.gold===110
  && !r.hub.has120&&r.hub.hasSit
  && r.leg.open&&r.leg.gold===110&&!r.leg.has120&&r.leg.hasSit;
 console.log(ok?'PASS':'FAIL');
 console.log('page errs',p.errs);
 await p.browser_.close();
 process.exit(ok?0:1);
})().catch(e=>{console.error(e);process.exit(1);});
