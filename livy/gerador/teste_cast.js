const { avatarCast, CAST } = require('./ref_cast');
const { chromium } = require('playwright');
const S='/tmp/claude-0/-home-user-Rodrigo/a3003713-89d1-5692-85dd-72821229c068/scratchpad/';
(async()=>{
  const defs={pai:'feliz',mae:'sorriso',avo:'feliz',irma:'feliz',professora:'sorriso',vizinho:'neutro',seguranca:'neutro'};
  const ks=Object.keys(defs);
  let html=`<html><body style="margin:0;background:#f1ecf9;display:flex;flex-wrap:wrap;width:1600px">`;
  ks.forEach((k,i)=>{html+=avatarCast(k,defs[k],'c'+i).replace('width="512" height="640"','width="400" height="500"');});
  html+='</body></html>';
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1600,height:1000}});
  await p.setContent(html); await p.screenshot({path:S+'cast1.png',fullPage:true});
  // expressões de dois personagens
  let h2=`<html><body style="margin:0;background:#f1ecf9;display:flex;flex-wrap:wrap;width:1700px">`;
  ['pai','vizinho'].forEach((k,r)=>['feliz','triste','surpreso','confuso','bravo'].forEach((e,i)=>{h2+=avatarCast(k,e,'x'+r+i).replace('width="512" height="640"','width="340" height="425"');}));
  h2+='</body></html>';
  await p.setContent(h2); await p.screenshot({path:S+'cast2.png',fullPage:true});
  await b.close(); console.log('ok');
})();
