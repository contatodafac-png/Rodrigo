const { avatar } = require('./engine');
const { chars } = require('./personagens');
const { chromium } = require('playwright');
const S='/tmp/claude-0/-home-user-Rodrigo/a3003713-89d1-5692-85dd-72821229c068/scratchpad/';
(async()=>{
  const ex=['feliz','triste','surpreso','confuso','bravo'];
  const b=await chromium.launch();
  for (const [name,keys] of [['all1',['pai','mae','avo','irma']],['all2',['professora','vizinho','seguranca','livy']]]){
    let html=`<html><body style="margin:0;background:#f1ecf9;display:grid;grid-template-columns:repeat(5,260px)">`;
    keys.forEach(k=>ex.forEach((e,i)=>{html+=avatar(chars[k],e,k+i).replace('width="512" height="640"','width="260" height="325"');}));
    html+='</body></html>';
    const p=await b.newPage({viewport:{width:1300,height:1300}});
    await p.setContent(html); await p.screenshot({path:S+name+'.png',fullPage:true});
  }
  await b.close();
})();
