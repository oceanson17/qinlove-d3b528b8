/* ===== 啟動 ===== */
(function(){
 function boot(){loadSettings();
 /* 微信內建瀏覽器唔載 Google Fonts（易被攔截／異常跳轉）；並攔截 weixin:// 與頁內自動產生的外連 */
 try{var ua=navigator.userAgent||'';var inWX=/MicroMessenger/i.test(ua);
  if(!inWX&&location.protocol==='https:'&&navigator.onLine!==false){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Ma+Shan+Zheng&text='+encodeURIComponent('青囊秦心浮生');document.head.appendChild(l);
   var l2=document.createElement('link');l2.rel='stylesheet';l2.href='https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap';document.head.appendChild(l2);
   var l3=document.createElement('link');l3.rel='stylesheet';l3.href='https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap&text='+encodeURIComponent('青囊秦心·');document.head.appendChild(l3);}
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;var h=String(a.getAttribute('href')||'');if(/^(weixin:|wechat:|wxwork:)/i.test(h)||(/^https?:/i.test(h)&&!/oceanson17\.github\.io/i.test(h)&&a.hostname&&a.hostname!==location.hostname)){e.preventDefault();e.stopPropagation();try{toast('已攔截外連／微信跳轉',2200);}catch(x){}}},true);
 }catch(e){}
  VV.init();UI.bind();Med.bind();Kb.init();applyLook();UI.screen('title');
  window.addEventListener('pagehide',function(){if(S)saveSlot('auto',true);});
  document.addEventListener('visibilitychange',function(){if(document.hidden&&S)saveSlot('auto',true);});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
