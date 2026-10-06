var fs=require('fs');var dir=__dirname+'/src/';
var files=fs.readdirSync(dir).filter(function(f){return /^\d\d_.*\.js$/.test(f);}).sort();
var af=[];try{af=fs.readdirSync(__dirname+'/assets').filter(function(f){return /\.(png|webp|jpe?g)$/i.test(f);});}catch(e){}
var js='var ASSET_FILES='+JSON.stringify(af)+';\n'+files.map(function(f){return '/* ---- '+f+' ---- */\n'+fs.readFileSync(dir+f,'utf8');}).join('\n');
if(/<\/script/i.test(js))throw new Error('script contains </script');
var shell=fs.readFileSync(__dirname+'/shell.html','utf8');
var css=fs.readFileSync(__dirname+'/ui/style.css','utf8');
var out=shell.replace('/*@@CSS@@*/',function(){return css;}).replace('/*@@SCRIPT@@*/',function(){return js;});
fs.writeFileSync(__dirname+'/index.html',out);
console.log('built',files.length,'files',(out.length/1024).toFixed(0)+'KB');
