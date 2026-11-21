const { avatarLivy } = require('./livy_ref');
const { chromium } = require('playwright');
const S='/tmp/claude-0/-home-user-Rodrigo/a3003713-89d1-5692-85dd-72821229c068/scratchpad/';
(async()=>{
  const list=['feliz','triste','surpreso','confuso','bravo'];
  let html=`<html><body style="margin:0;background:#f1ecf9;display:flex;width:1700px">`;
  list.forEach((e,i)=>{html+=avatarLivy(e,'u'+i).replace('width="512" height="640"','width="340" height="425"');});
  html+='</body></html>';
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1700,height:430}});
  await p.setContent(html); await p.screenshot({path:S+'ref1.png'});
  const big=await b.newPage({viewport:{width:512,height:640},deviceScaleFactor:2});
  for (const e of ['feliz','bravo','surpreso']) { await big.setContent('<body style="margin:0;background:#f1ecf9">'+avatarLivy(e,'z')+'</body>'); await big.screenshot({path:S+'ref_'+e+'.png'}); }
  await b.close(); console.log('ok');
})();
