/* ============ ROSTER-ONLY MODE ============
   When DM.roster is on, nothing here may depend on demand data (arrivals,
   covers, room status, cars, guests). Views use only the schedule, the
   staffing template (minimum per role per shift), callouts and assignments. */

/* scheduled vs template, by hour: bars are scheduled people, the step line is the template */
function tplBars({hrs,sched,tmpl,W=560,H=200,bar='#9fb4d8',short='#e8a0a0',line='#14213d',txt='#7a6a4f',font='Inter',fs=10.5}){
  const mx=Math.max(...tmpl,...sched)*1.15||1,n=hrs.length,bw=(W-20)/n-6,bx=i=>14+i*(W-20)/n,y=v=>H-v/mx*(H-24);
  return `<svg viewBox="0 0 ${W} ${H+24}" width="100%">${hrs.map((h,i)=>{const s=sched[i],t=tmpl[i],sh=s<t;
    return `${sh?`<rect x="${bx(i)}" y="${y(t)}" width="${bw}" height="${y(s)-y(t)}" rx="4" fill="none" stroke="${short}" stroke-width="2" stroke-dasharray="4 3"/>`:''}<rect x="${bx(i)}" y="${y(s)}" width="${bw}" height="${H-y(s)}" rx="4" fill="${sh?short:bar}"/>`}).join('')}
    <path d="M${hrs.map((h,i)=>`${bx(i)-3},${y(tmpl[i])} ${bx(i)+bw+3},${y(tmpl[i])}`).join(' L')}" fill="none" stroke="${line}" stroke-width="2.5"/>
    ${hrs.map((h,i)=>`<text x="${bx(i)+bw/2}" y="${H+17}" text-anchor="middle" font-family="${font}" font-size="${fs}" fill="${txt}">${h}</text>`).join('')}</svg>`}
/* "what ops data would add" note, shown where a demand view used to be */
function dmHint(t,st=''){return `<div class="dmHint" style="${st}"><span class="dmBadge">Roster only</span><span>${t}</span></div>`}
const hFmt=h=>h===12?'12p':h===24?'12a':h>24?(h-24)+'a':h>12?(h-12)+'p':h+'a';

/* ---- hotel ---- */
const _lobby=lobby;
lobby=function(V){_lobby(V);if(DM.full)return;
  const ex=asgN('front').length;const base={'10a':5,'2p':6,'4p':7,'6p':8,'9p':6},need={'10a':5,'2p':9,'4p':10,'6p':8,'9p':6};
  const blk=h=>h<12?'10a':h<16?'2p':h<17?'4p':h<20?'6p':'9p';const hrs=[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  const sc=hrs.map(h=>base[blk(h)]+(blk(h)==='2p'||blk(h)==='4p'?ex:0)),tp=hrs.map(h=>need[blk(h)]);
  const sub=V.querySelector('.sub');if(sub)sub.textContent='Saturday desk staffing vs your template · tap a time';
  V.querySelectorAll('.desk text').forEach(t=>{if(/stations staffed/.test(t.textContent))t.textContent=t.textContent.replace('stations staffed','agents vs template')});
  const c=V.querySelector('.hchart');if(c)c.innerHTML=`<h4>Desk agents per hour vs template</h4><p>Bars are scheduled agents. The line is your template minimum. Dashed is the gap.</p>
    ${tplBars({hrs:hrs.map(hFmt),sched:sc,tmpl:tp,W:560,H:170})}${dmHint('Arrivals aren’t connected. With PMS data I’d size the desk to the check-in wave.','margin-top:4px')}`;
};
const _floors=floors;
floors=function(V){if(DM.full)return _floors(V);
  const top=H.floor==='30'?30:+H.floor,fls=[top,top-1,top-2,top-3,top-4];const early=picked('hk');
  const pool=['Hana Cho','Leo Marsh','Mae Ruiz','Gus Hale','Ines Vega','Tom Ng','Lulu Park','Ari Bell','Cam Diaz','Rosa Lin'];let pi=top;
  const pill=(r,n)=>`<div class="hkp"><small>Rooms ${r}</small><b>${n}</b><em>9 AM – 5 PM</em></div>`;
  V.innerHTML=`<div class="hview fadeIn"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h2>Floors ${top-4} – ${top} · Housekeeping</h2><div class="sub">Sunday after fight night · who is assigned to each section</div></div></div>
    <div class="rooms">${fls.map(f=>`<div class="frow"><div class="fl">${f}</div><div class="hkrow">${pill('01 – 12',pool[(pi++)%pool.length])}${pill('13 – 24',pool[(pi++)%pool.length])}</div></div>`).join('')}
      <div style="margin-top:14px;display:flex;gap:16px">${[['Room attendants','168 of 168 · template met'],['Rooms per attendant','12 · from your template'],['Sunday start','9 AM · from the schedule']].map(([a,b])=>`<div style="flex:1;background:#fff;border:1px solid #eadfc8;border-radius:14px;padding:12px 14px"><div style="font-size:11px;color:#7a6a4f;text-transform:uppercase;letter-spacing:.8px">${a}</div><div style="font-family:'Playfair Display';font-size:20px;margin-top:4px">${b}</div></div>`).join('')}</div></div>
    <div class="hcard"><h4>Attendants on shift vs template</h4><p style="font-size:12px;color:#7a6a4f;margin-top:2px">Sunday, all floors</p>
      <div style="margin-top:8px">${tplBars({hrs:['7a','8a','9a','10a','11a','12p','1p','2p','3p'],sched:[0,0,168,168,168,168,168,168,168],tmpl:[0,0,168,168,168,168,168,168,168],W:260,H:150,fs:9.5})}</div>
      ${dmHint('Room status isn’t connected. With it I could spot that 1,140 checkouts would leave rooms late for 3 PM check-in, and suggest earlier starts.','margin-top:10px')}</div></div>`;
};

/* ---- dining ---- */
const _renderDining=renderDining;
renderDining=function(L,keep){_renderDining(L,keep);if(DM.full)return;
  const s=L.querySelector('.dtitle small');if(s)s.textContent=D.venue==='steak'?'STEAKHOUSE · SATURDAY DINNER · 6 SECTIONS':'BUFFET · SATURDAY · 8 STATIONS';
  L.querySelectorAll('.droom svg text').forEach(t=>{if(/covers/.test(t.textContent))t.textContent='Saturday · 5 to 11 PM · 6 sections · template: 1 server per section'})};
const _dBook=dBook;
dBook=function(V){if(DM.full)return _dBook(V);
  const sa=asg('steak');const fixed=sa.length>=2;
  const rows=[['Lena Moore','S1','5 – 11'],['Marco Vidal','S2','5 – 11'],['Priya Rao','S3','5 – 11'],['Owen Clark','S4','5 – 11'],[sa[0]?sa[0].name:'— open —','S5','5 – 11',!sa[0]],[sa[1]?sa[1].name:'— open —','S6','5 – 11',!sa[1]],['Kitchen ×9','Line','2 – 12']];
  const hrs=['4:00','4:30','5:00','5:30','6:00','6:30','7:00','7:30','8:00','8:30','9:00','10:00'];const on=4+sa.length;
  V.innerHTML=`<div class="book fadeIn" style="left:24px;transform:none;width:1156px">
   <div class="page l"><h3>Saturday, November 21</h3><div style="font-size:12px;letter-spacing:2px;color:#8a5a20;margin:2px 0 8px">FLOOR SCHEDULE · FIGHT NIGHT</div>
     ${rows.map(([n,sec,h,open])=>`<div class="hand ${open?'red':''}" style="display:flex;justify-content:space-between"><span>${sec} · ${n}</span><span>${h}</span></div>`).join('')}</div>
   <div class="page r"><h3>Servers vs. template</h3><div style="font-size:12px;letter-spacing:2px;color:#8a5a20;margin:2px 0 10px">EVERY 30 MINUTES</div>
     ${tplBars({hrs,sched:hrs.map((h,i)=>i<2?2:on),tmpl:hrs.map((h,i)=>i<2?2:6),W:460,H:300,bar:'#5a3c22',short:'#b3261e',line:'#1d3a6b',txt:'#1d3a6b',font:'Caveat',fs:17})}
     <div class="hand ${fixed?'':'red'}" style="font-size:26px;margin-top:4px">${fixed?'Covered ✓ '+sa.map(c=>c.name.split(' ')[0]).join(' + ')+' join at 5':'Short 2 servers from 5 to 11!'}</div>
     ${dmHint('Reservations aren’t connected. With them I’d size the floor to covers instead of a fixed template.','margin-top:10px;background:rgba(42,26,12,.08);color:#2a1a0c')}</div></div>`};

/* ---- retail ---- */
const _renderRetail=renderRetail;
renderRetail=function(L,keep){_renderRetail(L,keep);if(DM.full)return;
  const fixed=asgN('shop').length>=1;
  const s=L.querySelector('.window > div[style*="top:26px"] > div:nth-child(2)');if(s)s.textContent='Your template adds a 4th register from 6 to 10 PM for the merch drop';
  const rows=[['12P',2,2],['2P',2,2],['4P',3,3],['6P',3,4],['7P',3,4],['8P',3,4],['9P',3,4],['10P',3,3]].map(([h,s,n])=>[h,s+((h==='6P'||h==='7P'||h==='8P'||h==='9P')&&fixed?1:0),n]);
  const R=L.querySelector('.receipt');if(R)R.innerHTML=`<div style="text-align:center;font-weight:700">RESORT SHOP</div><div style="text-align:center;font-size:11px">STAFFING RECEIPT · SAT 11/21</div><div style="border-top:1px dashed #999;margin:8px 0"></div>
    <div class="ln" style="opacity:.6"><span>HOUR</span><span>SCHEDULED</span><span>TMPL</span></div>
    ${rows.map(([h,s,n])=>`<div class="ln"><span>${h}</span><span class="bar">${'█'.repeat(s)}${s<n?'<span style="color:#ccc">'+'░'.repeat(n-s)+'</span>':''}</span><span>${s}/${n} ${s>=n?'✓':'✗'}</span></div>`).join('')}
    <div style="border-top:1px dashed #999;margin:8px 0"></div><div class="ln"><b>TEMPLATE HRS</b><b>26</b></div><div class="ln"><b>SHORT</b><b>${fixed?'0':'1 ASSOC 6–10P'}</b></div>
    <div style="text-align:center;margin-top:12px;font-family:Inter;font-weight:900;font-size:20px;letter-spacing:3px;color:${fixed?'#15803d':'#be185d'};border:3px solid currentColor;border-radius:6px;padding:4px;transform:rotate(-4deg)">${fixed?'COVERED':'1 SHORT'}</div>
    <div style="text-align:center;font-size:10.5px;margin-top:10px">THANK YOU · COME AGAIN</div>`;
  const W=L.querySelector('.window');if(W)W.insertAdjacentHTML('beforeend',dmHint('Point of sale isn’t connected. With guest counts I’d tell you when the rush actually starts.','position:absolute;left:30px;bottom:24px;width:730px;background:#fff;color:#3a1430'))};

/* ---- back of house ---- */
const _opsViz=opsViz;
opsViz=function(V,d,fixed){_opsViz(V,d,fixed);if(DM.full)return;
  const head=(t,s)=>`<h3>${t}</h3><p class="s">${s}</p>`;
  if(d==='valet'){const hrs=['4P','5P','6P','7P','8P','9P','10P','11P'],need=[10,18,28,33,30,24,19,15],sch=[10,18,24,27,26,22,19,15];const done=filledOf(MISSIONS.find(m=>m.id==='valet'));
    V.innerHTML=head('Valet shifts · attendants per hour','Each ticket is an hour: scheduled attendants vs your staffing template.')+
     `<div style="display:flex;gap:12px;margin-top:26px;justify-content:space-between">${hrs.map((h,i)=>{const s=Math.min(need[i],sch[i]+(i>=1&&i<=7?done:0));const short=s<need[i];
       return `<div class="vtk ${short?'short':''}"><div style="display:flex;justify-content:space-between;font-size:10px"><span>NO. 04${17+i}</span><span>${h}</span></div><div style="font-size:10px;opacity:.6;margin-top:18px">ATTENDANTS</div><div class="n" style="margin-top:4px">${s}</div><div style="font-size:10px">of ${need[i]} in template</div><div style="position:absolute;left:10px;right:10px;top:150px;font-family:Inter;font-weight:900;font-size:15px;color:${short?'#e11d48':'#15803d'}">${short?'−'+(need[i]-s):'✓ met'}</div></div>`}).join('')}</div>
     ${dmHint('Valet ticketing isn’t connected. With live car counts I’d size the stand to the queue and show wait times.','margin-top:28px')}`}
  else if(d==='slots'){const banks='ABCDEFGH'.split('');const tech=['Ari Stone','Ari Stone','Kai Brooks','Kai Brooks','Em Rao','Em Rao','Drew Singh','Drew Singh'];
    const box=V.lastElementChild&&V.lastElementChild.outerHTML||'';
    V.innerHTML=head('Slot floor · tech coverage by bank','Each bank has a tech assigned for the shift. Template: 1 tech per 2 banks.')+`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:16px">${banks.map((b,i)=>`<div style="border-radius:16px;padding:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)"><div style="font-size:12px;font-weight:800">BANK ${b}</div><div style="display:flex;align-items:center;gap:10px;margin-top:12px"><span style="width:34px;height:34px;border-radius:50%;background:#fbbf24;color:#1a1000;display:grid;place-items:center;font-weight:900;font-size:12px">${ini(tech[i])}</span><div><b style="font-size:13px">${tech[i]}</b><div style="font-size:11px;opacity:.6">${i>=6?'On call · 3 to 11 PM':'Slot tech'}</div></div></div></div>`).join('')}</div>${box}`+dmHint('Machine service calls aren’t connected. With them I’d show which banks are waiting for a tech.','margin-top:16px')}
  else if(d==='mkt'){const hrs=[13,14,15,16,17,18,19,20];const add=filledOf(MISSIONS.find(m=>m.id==='mkt'));
    V.innerHTML=head('VIP check-in · hosts per hour','Scheduled hosts vs your template. The template adds 2 hosts from 3 to 7 PM on event nights.')+`<div style="margin-top:20px">${tplBars({hrs:hrs.map(hFmt),sched:hrs.map(h=>6+(h>=15&&h<19?add:0)),tmpl:hrs.map(h=>h>=15&&h<19?8:6),W:900,H:300,bar:'#e879f9',short:'#ff3d6e',line:'#fff',txt:'rgba(255,255,255,.6)',fs:12})}</div>`+dmHint('Guest check-in isn’t connected. With it I’d size hosts to VIP arrivals per hour.','margin-top:14px')}
};

/* ---- casino: table states are schedule, play levels are data ---- */
const _renderCasino=renderCasino;
renderCasino=function(L,keep){_renderCasino(L,keep);if(DM.full)return;L.querySelectorAll('.pt small').forEach(s=>s.textContent='Dealt')};

/* ---- toggle placement + chips that quote demand data ---- */
const _mountRail=mountRail;
mountRail=function(){_mountRail();const L=document.getElementById('dept');if(!L||!L.classList.contains('show'))return;
  const ch=L.querySelector('.dchrome');if(ch&&!ch.querySelector('.dmT')){const light=/hotel|retail/.test(L.className);DM.mount(ch,{light})}
  L.querySelectorAll('.dchip').forEach(c=>{if(/arrivals/.test(c.textContent))c.style.display=DM.roster?'none':''})};
function dmRefresh(){document.body.classList.toggle('dm-roster',DM.roster);
  const L=document.getElementById('dept');const open=L&&L.classList.contains('show');
  drawPins();hudTop();board();if(!open)npcDefault();
  if(open){if(/hotel/.test(L.className)){hotelBtns();hotelView()}deptRefresh()}}
DM.on(()=>{dmRefresh();toast(DM.roster?'Roster only: schedule, template, callouts and certifications':'Ops data on: arrivals, covers, room status and guest counts')});
(function(){const b=document.querySelector('.setupBtn');if(b)DM.mount(b,{before:true});document.body.classList.toggle('dm-roster',DM.roster)})();
(function(){const st=document.createElement('style');st.textContent=`
.dmHint{display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.45;padding:10px 12px;border-radius:12px;background:rgba(251,191,36,.08);border:1px dashed rgba(251,191,36,.5);font-family:Inter,sans-serif}
.dmHint .dmBadge{flex:0 0 auto}
.hcard .dmHint{flex-direction:column;align-items:flex-start;gap:6px}
.hotel .dmHint{background:#fff8e6;border-color:#d9a441;color:#5a4a30}.hotel .dmHint .dmBadge{color:#b45309;background:#fdecc8;border-color:#e9b860}
.retail .dmHint .dmBadge{color:#b45309;background:#fdecc8;border-color:#e9b860}
.dining .page .dmHint .dmBadge{color:#8a5a20;background:#f3dfb8;border-color:#c9a978}
.hkrow{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1}
.hkp{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #eadfc8;border-radius:12px;padding:10px 14px}
.hkp small{font-size:11px;color:#7a6a4f;width:80px}.hkp b{font-family:'Playfair Display';font-size:16px;flex:1}.hkp em{font-style:normal;font-size:11.5px;color:#0f766e;font-weight:700}
.hud-top .dmT{margin-right:10px}
#dept .dchrome .dmT{margin-left:4px}`;document.head.appendChild(st)})();

/* ===== demo guide: presenter shortcuts to the moments worth showing ===== */
function demoGuide(){let g=document.getElementById('dguide');if(g){g.remove();return}g=document.createElement('div');g.id='dguide';g.className='dguide';
  const reqDone=id=>REQ[id]&&REQ[id].st&&['FILLED','UNABLE_TO_FILL'].includes(REQ[id].st.status);
  const items=[['⚖','Your call: Casino Floor','3 dealers say yes for 2 Baccarat tables. Policy: avoid overtime.',()=>openFlow('casino'),reqDone('casino')],
    ['⚖','Your call: Ember & Oak','3 servers say yes for 2 sections. Union seniority decides.',()=>openFlow('steak'),reqDone('steak')],
    ['＋','Bonus round: Bell & Valet','Only 4 of 6 fill. A $75 bonus needs a second manager, then a second round.',()=>openFlow('valet'),reqDone('valet')],
    ['⇄','Decision: Jane Doe wanted twice','Front Desk and Ember & Oak both want her.',()=>decision(MISSIONS.find(m=>m.id==='jane')),isDone('jane')],
    ['⇄','Decision: Drew Singh double-booked','Slot Ops and Grounds both have him.',()=>decision(MISSIONS.find(m=>m.id==='slots')),isDone('slots')],
    ['▦','Run the whole plan','All 8 requests together: confirm, send, replies, assign.',approvePlan,!MISSIONS.some(m=>isReq(m)&&mlive(m)&&(!stOf(m)||stOf(m).status==='DRAFT'))],
    ['🏨','Inside a department','Same layout everywhere, themed stage. Try the Hotel elevator.',()=>openDept('front'),false],
    ['⚙','Resort setup · look & feel','Upload a photo of their property and the map restyles.',()=>{openSetup();Object.keys(DEPTS).forEach(k=>SU.draft[k]=MAP[k]);SU.step=3;suRender()},false]];
  g.innerHTML=`<h4>Demo scenarios</h4><p>Jump straight to the moments worth showing. Purple “Your call” and orange “Bonus round” tags mark them on the board too.</p>
   ${items.map(([ic,t,d,f,dn],i)=>`<div class="gi"><span class="ic">${ic}</span><div class="tx"><b>${t}</b><small>${d}</small></div><button class="btn ${dn?'g':'w'}" data-g="${i}">${dn?'Done ✓':'Go'}</button></div>`).join('')}`;
  document.getElementById('app').appendChild(g);
  g.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{g.remove();const k=+b.dataset.g;if(k<6&&document.getElementById('dept').classList.contains('show'))closeDept();setTimeout(items[k][3],k<6?50:0)});
  setTimeout(()=>document.addEventListener('click',function c(e){if(!g.contains(e.target)&&e.target.id!=='guideBtn'){g.remove();document.removeEventListener('click',c)}}),0)}
(function(){const st=document.createElement('style');st.textContent=`.dguide{position:absolute;right:24px;top:84px;width:430px;z-index:450;border-radius:22px;padding:18px 18px 10px;background:linear-gradient(170deg,#171a30,#0d0f1e);border:1px solid rgba(255,255,255,.14);color:#eef0ff;box-shadow:0 30px 70px rgba(0,0,0,.55);font-family:Inter,sans-serif;animation:fadeIn .25s both}
 .dguide h4{font-size:15px}.dguide>p{font-size:12px;opacity:.6;margin:3px 0 10px;line-height:1.45}
 .dguide .gi{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(255,255,255,.08)}.dguide .tx{flex:1}.dguide b{display:block;font-size:13px}.dguide small{display:block;font-size:11.5px;opacity:.6;line-height:1.4;margin-top:1px}
 .dguide .ic{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:14px;flex:0 0 30px;background:rgba(255,255,255,.07)}
 .dguide .btn{padding:7px 12px;font-size:12px}`;document.head.appendChild(st)})();
