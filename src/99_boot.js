/* ===== 啟動 ===== */
(function(){
 function boot(){loadSettings();try{if(location.protocol==='https:'&&navigator.onLine!==false){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Ma+Shan+Zheng&text='+encodeURIComponent('青囊秦心乙女');
   var l2=document.createElement('link');l2.rel='stylesheet';l2.href='https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap';document.head.appendChild(l2);
   var l3=document.createElement('link');l3.rel='stylesheet';l3.href='https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap&text='+encodeURIComponent('青囊秦心·');document.head.appendChild(l3);}}catch(e){}
  VV.init();UI.bind();Med.bind();Kb.init();applyLook();UI.screen('title');
  window.addEventListener('pagehide',function(){if(S)saveSlot('auto',true);});
  document.addEventListener('visibilitychange',function(){if(document.hidden&&S)saveSlot('auto',true);});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
