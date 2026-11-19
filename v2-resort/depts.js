/* ============ V2 DEPARTMENT SCREENS ============ */
const SCREENS={};
let curRefresh=null;
window.onResolve=id=>{if(curRefresh)setTimeout(()=>curRefresh(id),150)};
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ini=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2);
function chrome(title,sub,extra=''){return `<div class="dchrome"><button class="backBtn" id="backBtn">← Resort</button><div class="dtitle"><b>${title}</b><small>${sub}</small></div><div class="sp"></div>${extra}</div>`}
function bindBack(L){const b=L.querySelector('#backBtn');if(b)b.onclick=closeDept}
function missionFor(ids){return MISSIONS.find(m=>ids.includes(m.d)&&!STATE.resolved.has(m.id))}
function aiCard(ids,opts={}){const m=missionFor(ids);
  if(!m)return `<div class="aiCard fadeIn done" id="ai"><div class="k"><i></i>Coverage agent</div><h4>${opts.doneT||'All covered here'}</h4><p>${opts.doneP||'Nothing needs you. I’ll flag anything that changes.'}</p></div>`;
  return `<div class="aiCard fadeIn" id="ai"><div class="k"><i></i>Coverage agent · ${m.kind}</div><h4>${m.t}</h4><p>${m.p}</p><div class="acts"><button class="btnx w" data-mid="${m.id}">${opts.okLabel||(m.kind==='conflict'?'Resolve':m.kind==='approval'?'Approve bonus':'Approve')}</button><button class="btnx g" data-alt="1">See alternates</button></div></div>`}
function bindAi(L){$$('[data-mid]',L).forEach(b=>b.onclick=()=>{b.disabled=true;b.textContent='Sending…';resolve(b.dataset.mid,true)});
  $$('[data-alt]',L).forEach(b=>b.onclick=()=>toast('Alternates: 2 more options ranked by fit and cost (concept)'))}

/* ============ CASINO (classic, felt and all) ============ */
SCREENS.casino=(L)=>{curRefresh=null;L.innerHTML=`<iframe id="casinoFrame" src="../classic/index.html#embed" title="Casino floor"></iframe>`};
addEventListener('message',e=>{if(e.data&&e.data.type==='sca-filled')resolve('casino',true)});

/* ============ HOTEL ============ */
const H={floor:'L',time:'4p',day:'sun9',busy:false};
const FLOORS=[['30','PH','Suites'],['25','25',''],['20','20','16 – 20'],['15','15',''],['10','10',''],['5','5',''],['L','L','Lobby'],['B','B','Bell desk']];
const fnum=f=>f==='B'?-1:f==='L'?0:+f;
SCREENS.hotel=(L,k)=>{H.floor=DEPTS[k].sub||'L';
  L.innerHTML=`<div class="scr">${chrome('The Hotel','Front Office & Housekeeping · Example Tower','<span class="dchip">1,380 arrivals Sat</span><span class="dchip red">Fight night</span>')}
   <div class="shaft" id="shaft"><div id="hv"></div><div class="door l"><span class="logo2">EXAMPLE</span></div><div class="door r"><span class="logo2">RESORT</span></div></div>
   <div class="epanel"><span class="screw" style="left:12px;top:12px"></span><span class="screw" style="right:12px;top:12px"></span><span class="screw" style="left:12px;bottom:12px"></span><span class="screw" style="right:12px;bottom:12px"></span>
     <div class="ind" id="ind"><i id="up">▲</i><b id="fl">${H.floor==='30'?'PH':H.floor}</b><i id="dn">▼</i></div>
     <div class="ebtns" id="ebtns"></div>
     <div class="ebell" id="bell"><svg width="60" height="46" viewBox="0 0 60 46"><ellipse cx="30" cy="42" rx="28" ry="4" fill="#7a5a2a"/><path d="M6 40 Q6 14 30 12 Q54 14 54 40 Z" fill="url(#bg)"/><rect x="27" y="4" width="6" height="8" rx="2" fill="#7a5a2a"/><defs><linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#fff2cf"/><stop offset=".5" stop-color="#d9bf8c"/><stop offset="1" stop-color="#8a6a36"/></linearGradient></defs></svg>Ring the agent</div>
   </div></div>`;
  bindBack(L);hotelBtns();hotelView();
  L.querySelector('#bell').onclick=()=>{const m=missionFor(['front','hk']);if(m){toast('Ding! The agent has a proposal for you');const a=L.querySelector('#ai');if(a)a.animate([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}],{duration:400})}else toast('Ding! Everything at the hotel is covered')};
  curRefresh=()=>{hotelBtns();hotelView()};
};
function hotelBtns(){const E=document.getElementById('ebtns');if(!E)return;
  E.innerHTML=FLOORS.map(([f,l,s])=>{const dot=(f==='L'&&missionFor(['front']))||((f==='20'||f==='25')&&missionFor(['hk']));return `<button class="ebtn ${H.floor===f?'on':''}" data-f="${f}">${l}${dot?'<span class="dot"></span>':''}${s?`<small>${s}</small>`:''}</button>`}).join('');
  $$('.ebtn',E).forEach(b=>b.onclick=()=>goFloor(b.dataset.f))}
async function goFloor(f){if(H.busy||f===H.floor)return;H.busy=true;const sh=document.getElementById('shaft');sh.classList.add('closed');
  const from=fnum(H.floor),to=fnum(f);H.floor=f;hotelBtns();await sleep(700);
  const up=to>from;document.getElementById('up').classList.toggle('on',up);document.getElementById('dn').classList.toggle('on',!up);
  const seq=[];for(let i=from;up?i<=to:i>=to;i+=up?1:-1)seq.push(i);const stepT=Math.max(25,Math.min(80,900/seq.length));
  for(const n of seq){document.getElementById('fl').textContent=n===-1?'B':n===0?'L':n===30?'PH':n;await sleep(stepT)}
  const ind=document.getElementById('ind');ind.classList.remove('ding');void ind.offsetWidth;ind.classList.add('ding');
  document.getElementById('up').classList.remove('on');document.getElementById('dn').classList.remove('on');
  if(f==='B'){toast('Bell desk is part of Bell & Valet · taking you there');await sleep(500);H.busy=false;const L=document.getElementById('dept');L.innerHTML='';L.className='show ops';SCREENS.ops(L,'valet');return}
  hotelView();await sleep(150);sh.classList.remove('closed');await sleep(650);H.busy=false}
function hotelView(){const V=document.getElementById('hv');if(!V)return;
  const old=V.parentNode.parentNode.querySelector('#ai');if(old)old.remove();
  if(H.floor==='L')lobby(V);else floors(V);
  bindAi(V.closest('.scr'))}
function lobby(V){
  const need={'10a':5,'2p':9,'4p':10,'6p':8,'9p':6},base={'10a':5,'2p':6,'4p':7,'6p':8,'9p':6};
  const fixed=!missionFor(['front']);const t=H.time;const sched=base[t]+((t==='2p'||t==='4p')&&fixed?3:0);
  const names=['Alex Smith','Jordan Blake','Quinn Hart','Logan Price','Casey Nguyen','Dana Fox','Jane Doe','Lee Moss'];const extra=['Kai Lowe','Rowan Ellis','Ari Stone'];
  const st=[];for(let i=0;i<10;i++){if(i<base[t])st.push({n:names[i%names.length]});else if(i<sched)st.push({n:extra[i-base[t]],nw:1});else if(i<need[t])st.push({open:1});else st.push({off:1})}
  const W=1222,sp=W/10;
  const desk=`<svg viewBox="0 0 ${W} 330" width="100%" height="300">
    <defs><linearGradient id="mrb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fbf8f1"/><stop offset="1" stop-color="#e6dcc8"/></linearGradient><linearGradient id="wd" x1="0" x2="1"><stop offset="0" stop-color="#5a3c22"/><stop offset=".5" stop-color="#7a5434"/><stop offset="1" stop-color="#5a3c22"/></linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="200" fill="url(#wd)" rx="10"/>${[...Array(12)].map((_,i)=>`<rect x="${i*W/12+4}" y="6" width="${W/12-8}" height="188" fill="none" stroke="rgba(0,0,0,.18)"/>`).join('')}
    <text x="${W/2}" y="62" text-anchor="middle" font-family="Playfair Display" font-size="34" font-weight="700" fill="#e9d3a2" letter-spacing="14">RECEPTION</text>
    ${st.map((s,i)=>{const x=sp*i+sp/2;if(s.off)return `<g opacity=".35"><rect x="${x-26}" y="140" width="52" height="34" rx="4" fill="#2a1d10"/></g>`;
      if(s.open)return `<g class="post open"><circle cx="${x}" cy="128" r="26" fill="none" stroke="#d6453b" stroke-width="3" stroke-dasharray="6 5"/><text x="${x}" y="134" text-anchor="middle" font-size="12" font-weight="800" fill="#ffd6d0">OPEN</text></g>`;
      return `<g class="${s.nw?'newd':''}"><circle cx="${x}" cy="118" r="22" fill="${s.nw?'#0f5f5a':'#14213d'}" stroke="#e9d3a2" stroke-width="2"/><text x="${x}" y="123" text-anchor="middle" font-size="13" font-weight="800" fill="#f7f3ea">${ini(s.n)}</text><path d="M${x-34} 172 Q${x} 132 ${x+34} 172 Z" fill="${s.nw?'#0f5f5a':'#14213d'}"/><text x="${x}" y="${s.nw?96:96}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${s.nw?'#a7f3d0':'#e9d3a2'}">${s.n.split(' ')[0]}${s.nw?' · new':''}</text></g>`}).join('')}
    <rect x="0" y="170" width="${W}" height="160" rx="10" fill="url(#mrb)" stroke="#c9ad7a" stroke-width="2"/>
    <path d="M0 220 C200 200 300 260 520 230 S900 210 ${W} 240" fill="none" stroke="rgba(176,141,87,.25)" stroke-width="2"/><path d="M0 280 C260 300 420 250 700 290 S1000 270 ${W} 300" fill="none" stroke="rgba(20,33,61,.08)" stroke-width="2"/>
    <rect x="0" y="170" width="${W}" height="10" fill="#b08d57"/>
    ${st.map((s,i)=>`<text x="${sp*i+sp/2}" y="214" text-anchor="middle" font-size="11" font-weight="700" fill="#7a6a4f" letter-spacing="1">${String(i+1).padStart(2,'0')}</text>`).join('')}
    <g transform="translate(${W-70},150)"><ellipse cx="0" cy="18" rx="20" ry="4" fill="#7a5a2a"/><path d="M-16 16 Q-16 -2 0 -3 Q16 -2 16 16 Z" fill="#d9bf8c"/></g>
    <text x="20" y="312" font-size="13" font-weight="700" fill="#14213d">Saturday ${t.replace('a',' AM').replace('p',' PM')} · ${Math.min(sched,need[t])}/${need[t]} stations staffed</text></svg>`;
  const hrs=[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],arr=[20,30,45,60,80,110,150,170,165,140,110,80,50,30,20],cap=h=>{const tt=h<12?'10a':h<16?'2p':h<17?'4p':h<20?'6p':'9p';const s=base[tt]+((tt==='2p'||tt==='4p')&&fixed?3:0);return s*16};
  const cw=560,ch=200,bx=i=>14+i*(cw-20)/hrs.length,bw=(cw-20)/hrs.length-6,y=v=>ch-v/180*(ch-30);
  const chart=`<svg viewBox="0 0 ${cw} ${ch+24}" width="100%">${hrs.map((h,i)=>{const c=cap(h),short=arr[i]>c;return `<rect x="${bx(i)}" y="${y(arr[i])}" width="${bw}" height="${ch-y(arr[i])}" rx="4" fill="${short?'#e8a0a0':'#e9d3a2'}"/>`}).join('')}
    <path d="M${hrs.map((h,i)=>`${bx(i)},${y(cap(h))} ${bx(i)+bw+6},${y(cap(h))}`).join(' L')}" fill="none" stroke="#14213d" stroke-width="2.5"/>
    ${hrs.map((h,i)=>i%2?'':`<text x="${bx(i)+bw/2}" y="${ch+18}" text-anchor="middle" font-size="10.5" fill="#7a6a4f">${h>12?h-12:h}${h>=12?'p':'a'}</text>`).join('')}</svg>`;
  const cards=(fixed?extra.map(n=>({n,r:'Moved to desk · 2–6 PM',nw:1})):[]).concat([{n:'Alex Smith',r:'Desk agent · 10 hrs'},{n:'Jordan Blake',r:'Desk agent · 8 hrs'},{n:'Jane Doe',r:'Desk agent · to Ember & Oak 5 PM'}]).slice(0,5);
  V.innerHTML=`<div class="hview fadeIn"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h2>Lobby · Front Desk</h2><div class="sub">Saturday arrival wave for fight night · tap a time</div></div>
    <div class="tchips">${Object.keys(need).map(x=>`<button class="${x===t?'on':''}" data-t="${x}">${x.replace('a',' AM').replace('p',' PM')}</button>`).join('')}</div></div>
    <div class="desk">${desk}</div>
    <div class="hchart"><h4>Check-ins per hour vs desk capacity</h4><p>Bars are arrivals. The line is what the scheduled agents can handle.</p>${chart}</div>
    <div class="kcards">${cards.map((c,i)=>`<div class="kcard ${c.nw?'new':''}" style="left:${i*16}px;top:${i*44}px;transform:rotate(${-6+i*3}deg);z-index:${i}"><small>Example Resort · Staff key</small><b style="margin-top:6px">${c.n}</b><div class="ft">${c.r}</div></div>`).join('')}</div></div>`;
  V.parentNode.parentNode.insertAdjacentHTML('beforeend',aiCard(['front'],{doneT:'The arrival wave is covered',doneP:'Kai, Rowan and Ari are on the desk from 2 to 6 PM.'}));
  $$('.tchips button',V).forEach(b=>b.onclick=()=>{H.time=b.dataset.t;hotelView()});
}
function floors(V){
  const top=H.floor==='30'?30:+H.floor,fls=[top,top-1,top-2,top-3,top-4];const fixed=!missionFor(['hk']);const d=H.day;
  const COL={occ:'#2b3a67',dirty:'#e8a0a0',cln:'#e9c46a',clean:'#9cc5a1',insp:'#2a9d8f'};
  let sd=top*31;const r=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  const rooms=fls.map(f=>[...Array(24)].map((_,i)=>{const x=r();let s;
    if(d==='sat')s=x<.92?'occ':'clean';
    else if(d==='sun9')s=x<.55?'dirty':x<.75?'occ':x<(fixed?.95:.85)?'cln':'clean';
    else s=fixed?(x<.08?'cln':x<.18?'occ':x<.55?'clean':'insp'):(x<.3?'dirty':x<.45?'cln':x<.58?'occ':x<.85?'clean':'insp');
    return s}));
  const cnt=s=>rooms.flat().filter(x=>x===s).length;
  const pw=310,phh=170,X=i=>10+i*(pw-20)/8,Y=v=>phh-v/1140*(phh-20);
  const cur=[0,0,90,260,430,600,760,900,1010],plan=[0,150,330,520,700,860,990,1100,1140];
  V.innerHTML=`<div class="hview fadeIn"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h2>Floors ${top-4} – ${top} · Housekeeping</h2><div class="sub">Sunday checkout after fight night · 1,140 departures resort-wide</div></div>
    <div class="tchips">${[['sat','Sat night'],['sun9','Sun 9 AM'],['sun1','Sun 1 PM']].map(([x,l])=>`<button class="${x===d?'on':''}" data-d="${x}">${l}</button>`).join('')}</div></div>
    <div class="rooms">${fls.map((f,fi)=>`<div class="frow"><div class="fl">${f}</div><div class="doors">${rooms[fi].map((s,i)=>`<div class="drm" title="Room ${f}${String(i+1).padStart(2,'0')}" style="background:${COL[s]}">${s==='cln'?'<span class="cart">⌂</span>':''}</div>`).join('')}</div></div>`).join('')}
      <div class="legend">${[['occ','Occupied'],['dirty','Checked out · dirty'],['cln','Being cleaned'],['clean','Clean'],['insp','Inspected']].map(([k,l])=>`<span><i style="background:${COL[k]}"></i>${l} · ${cnt(k)}</span>`).join('')}</div>
      <div style="margin-top:20px;display:flex;gap:16px">${[['Room attendants',fixed?'168 · 14 start 7 AM':'168 · all start 9 AM'],['Rooms per attendant','13.6'],['Ready by 3 PM',fixed?'1,140 of 1,140':'~930 of 1,140']].map(([a,b],i)=>`<div style="flex:1;background:#fff;border:1px solid #eadfc8;border-radius:14px;padding:12px 14px"><div style="font-size:11px;color:#7a6a4f;text-transform:uppercase;letter-spacing:.8px">${a}</div><div style="font-family:'Playfair Display';font-size:21px;font-weight:800;margin-top:2px;color:${i===2&&!fixed?'#a3312a':'#14213d'}">${b}</div></div>`).join('')}</div></div>
    <div class="hcard"><h4>Rooms ready before 3 PM check-in</h4><p style="font-size:12px;color:#7a6a4f;margin-top:2px">Sunday, all floors</p>
      <svg viewBox="0 0 ${pw} ${phh+22}" width="100%" style="margin-top:8px"><line x1="0" x2="${pw}" y1="${Y(1140)}" y2="${Y(1140)}" stroke="#14213d" stroke-dasharray="4 4" opacity=".4"/><text x="4" y="${Y(1140)-5}" font-size="10" fill="#14213d" opacity=".6">1,140 departures</text>
        <path d="M${cur.map((v,i)=>X(i)+','+Y(v)).join(' L')}" fill="none" stroke="#e8a0a0" stroke-width="3"/>
        <path d="M${plan.map((v,i)=>X(i)+','+Y(v)).join(' L')}" fill="none" stroke="#2a9d8f" stroke-width="3" stroke-dasharray="${fixed?'0':'6 5'}"/>
        ${['7a','8a','9a','10a','11a','12p','1p','2p','3p'].map((l,i)=>`<text x="${X(i)}" y="${phh+16}" text-anchor="middle" font-size="9.5" fill="#7a6a4f">${l}</text>`).join('')}</svg>
      <div style="display:flex;gap:14px;font-size:11.5px;margin-top:6px"><span style="color:#c26a6a">● Start at 9 AM</span><span style="color:#2a9d8f">● ${fixed?'Approved: 7 AM start':'Proposed: 7 AM start'}</span></div></div></div>`;
  V.parentNode.parentNode.insertAdjacentHTML('beforeend',aiCard(['hk'],{doneT:'Sunday checkout is on track',doneP:'14 attendants start at 7 AM. Every room is ready before 3 PM.'}));
  $$('.tchips button',V).forEach(b=>b.onclick=()=>{H.day=b.dataset.d;hotelView()});
}

/* ============ DINING ============ */
const D={venue:'steak',course:'floor'};
SCREENS.dining=(L,k)=>{D.venue=k==='market'?'market':'steak';D.course='floor';renderDining(L);curRefresh=()=>renderDining(L,true)};
function renderDining(L,keep){
  const ven=D.venue==='steak'?{t:'Ember & Oak',s:'STEAKHOUSE · SATURDAY DINNER · 212 COVERS'}:{t:'The Market',s:'BUFFET · SATURDAY · 1,900 GUESTS'};
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome(ven.t,ven.s,`<button class="dchip ${D.venue==='steak'?'on':''}" data-v="steak">Ember &amp; Oak</button><button class="dchip ${D.venue==='market'?'on':''}" data-v="market">The Market</button>`)}
   ${D.venue==='steak'?`<div class="courses">${[['floor','I','The Floor'],['book','II','The Book'],['pass','III','The Pass']].map(([c,n,l],i)=>`${i?'<span class="sep">◆</span>':''}<button class="${D.course===c?'on':''}" data-c="${c}"><em>${n}</em>${l}</button>`).join('')}</div>`:''}
   <div class="dview" id="dv"></div></div>`;
  bindBack(L);
  $$('[data-v]',L).forEach(b=>b.onclick=()=>{D.venue=b.dataset.v;D.course='floor';renderDining(L)});
  $$('[data-c]',L).forEach(b=>b.onclick=()=>{D.course=b.dataset.c;renderDining(L,true)});
  const V=L.querySelector('#dv');
  if(D.venue==='market')market(V);else if(D.course==='floor')dFloor(V);else if(D.course==='book')dBook(V);else dPass(V);
  bindAi(L);
}
const SRV=[['Lena Moore','#e0b872'],['Marco Vidal','#9fb4d8'],['Priya Rao','#c9a0c4'],['Owen Clark','#9cc5a1']];
function dFloor(V){
  const fixed=!missionFor(['steak']);
  const secs=[[70,130,'Lena Moore'],[370,130,'Marco Vidal'],[670,130,'Priya Rao'],[70,410,'Owen Clark'],[370,410,fixed?'Jane Doe':null,'Front Desk'],[670,410,fixed?'Sam Patel':null,'The Market']];
  const cols=['#e0b872','#9fb4d8','#c9a0c4','#9cc5a1','#f4a6a6','#a6e3d7'];
  const svg=`<svg viewBox="0 0 1030 738" width="100%" height="100%"><defs><pattern id="plank" width="120" height="24" patternUnits="userSpaceOnUse"><rect width="120" height="24" fill="#3b2616"/><rect width="120" height="1.5" fill="#2a1a0e"/><rect x="60" y="0" width="1.5" height="24" fill="#2a1a0e"/><rect x="0" y="6" width="120" height="1" fill="rgba(255,220,180,.05)"/></pattern>
     <radialGradient id="cdl"><stop offset="0" stop-color="rgba(255,190,100,.55)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="10" fill="rgba(244,166,166,.25)"/></pattern></defs>
    <rect width="1030" height="738" fill="url(#plank)"/>
    <rect x="40" y="26" width="950" height="64" rx="14" fill="#140c06" stroke="#8a6a3a"/><text x="515" y="64" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="22" fill="#e8c98a">The Bar</text>
    ${[...Array(16)].map((_,i)=>`<circle cx="${80+i*58}" cy="104" r="9" fill="#5a3c22" stroke="#8a6a3a"/>`).join('')}
    ${secs.map(([x,y,n,from],i)=>{const open=!n;const w=280,h=250;return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${open?'url(#hatch)':cols[i]}" fill-opacity="${open?1:.1}" stroke="${open?'#f4a6a6':cols[i]}" stroke-opacity="${open?.9:.5}" stroke-width="2" ${open?'stroke-dasharray="8 6" class="post open"':''}/>
      ${[[70,80],[210,80],[70,185],[210,185]].map(([tx,ty])=>`<circle cx="${x+tx}" cy="${y+ty}" r="62" fill="url(#cdl)"/>${[0,90,180,270].map(a=>`<circle cx="${x+tx+Math.cos(a*Math.PI/180)*40}" cy="${y+ty+Math.sin(a*Math.PI/180)*40}" r="9" fill="#5a3c22" stroke="#2a1a0e"/>`).join('')}<circle cx="${x+tx}" cy="${y+ty}" r="30" fill="#f6ecd8" stroke="#d6c09a" stroke-width="2"/>${[0,90,180,270].map(a=>`<circle cx="${x+tx+Math.cos(a*Math.PI/180)*19}" cy="${y+ty+Math.sin(a*Math.PI/180)*19}" r="5.5" fill="#fff" stroke="#e0d2b4"/>`).join('')}<circle cx="${x+tx}" cy="${y+ty}" r="3" fill="#ffb648"/>`).join('')}
      <g transform="translate(${x+14},${y-14})"><rect width="${open?190:(n.length*8+(from?100:44))}" height="28" rx="14" fill="${open?'#3a1414':'#f6ead2'}" stroke="${open?'#f4a6a6':cols[i]}"/><text x="14" y="19" font-size="12.5" font-weight="700" fill="${open?'#ffc4c4':'#2a1a0c'}">${open?`Section ${i+1} · no server`:`${n}${from?' · from '+from:''}`}</text></g></g>`}).join('')}
    <text x="40" y="722" font-size="13" fill="#c9a978">Saturday · 7:30 PM · 24 tables · 212 covers</text></svg>`;
  V.innerHTML=`<div class="droom fadeIn">${svg}</div>
   <div class="dside fadeIn"><h4>Tonight’s servers</h4><div style="font-size:12px;color:#c9a978;margin:2px 0 10px">5 PM to 11 PM · 4 tables per section</div>
   ${secs.map(([x,y,n,from],i)=>`<div class="srv"><i style="background:${n?cols[i]:'transparent'};border:1px ${n?'solid':'dashed #f4a6a6'}"></i><b>${n||'Open'}</b><small>${n?(from?'from '+from:'regular'):'Section '+(i+1)}</small></div>`).join('')}
   <div style="display:flex;gap:10px;margin-top:16px">${[['Covers','212'],['Servers',fixed?'6 / 6':'4 / 6'],['Per server',fixed?'35':'53']].map(([a,b])=>`<div style="flex:1;border:1px solid rgba(214,173,96,.25);border-radius:12px;padding:10px"><div style="font-size:10.5px;color:#c9a978;letter-spacing:.8px;text-transform:uppercase">${a}</div><div style="font-family:'Cormorant Garamond';font-size:26px;font-weight:700">${b}</div></div>`).join('')}</div></div>
   ${aiCard(['steak'],{doneT:'Every section has a server',doneP:'Jane Doe and Sam Patel confirmed for 5 to 11 PM.'})}`;
}
function dBook(V){
  const fixed=!missionFor(['steak']);
  const res=[['5:00','Doe',4],['5:15','Smith',2],['5:30','Chen',6],['5:45','Patel',2],['6:00','Brooks',8],['6:15','Blake',4],['6:30','Hart',2],['6:45','Hale',5],['7:00','Singh',4],['7:00','Price',2],['7:15','Reyes',6],['7:30','Nguyen',4],['7:45','Kim',2],['8:00','Fox',6],['8:15','Lowe',4]];
  const slots=['5:00','5:30','6:00','6:30','7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30'],cov=[18,26,34,40,46,44,38,30,22,16,10,6];const cap=fixed?40:28;
  const W=460,Hh=330,bx=i=>20+i*(W-30)/12,bw=(W-30)/12-8,y=v=>Hh-v/50*(Hh-30);
  V.innerHTML=`<div class="book fadeIn" style="left:30px;transform:none;width:1030px">
   <div class="page l"><h3>Saturday, November 21</h3><div style="font-size:12px;letter-spacing:2px;color:#8a5a20;margin:2px 0 8px">RESERVATIONS · FIGHT NIGHT</div>
     ${res.map(([t,n,p])=>`<div class="hand" style="display:flex;justify-content:space-between"><span>${t} · ${n}</span><span>party of ${p}</span></div>`).join('')}</div>
   <div class="page r"><h3>Covers vs. servers</h3><div style="font-size:12px;letter-spacing:2px;color:#8a5a20;margin:2px 0 10px">EVERY 30 MINUTES</div>
     <svg viewBox="0 0 ${W} ${Hh+26}" width="100%">${slots.map((s,i)=>`<rect x="${bx(i)}" y="${y(cov[i])}" width="${bw}" height="${Hh-y(cov[i])}" rx="3" fill="${cov[i]>cap?'#b3261e':'#5a3c22'}" opacity="${cov[i]>cap?.75:.6}"/>${i%2?'':`<text x="${bx(i)+bw/2}" y="${Hh+18}" text-anchor="middle" font-family="Caveat" font-size="18" fill="#1d3a6b">${s}</text>`}`).join('')}
       <path d="M10 ${y(cap)} Q120 ${y(cap)-3} 230 ${y(cap)+2} T${W-6} ${y(cap)}" fill="none" stroke="#1d3a6b" stroke-width="3" stroke-linecap="round"/>
       <text x="${W-10}" y="${y(cap)-8}" text-anchor="end" font-family="Caveat" font-size="20" fill="#1d3a6b">${fixed?'6':'4'} servers can handle ${cap}</text>
       ${fixed?'':`<ellipse cx="${bx(5)}" cy="${y(46)-6}" rx="120" ry="40" fill="none" stroke="#b3261e" stroke-width="3" transform="rotate(-4 ${bx(5)} ${y(46)})"/>`}</svg>
     <div class="hand ${fixed?'':'red'}" style="font-size:26px;margin-top:4px">${fixed?'Covered ✓ Jane + Sam join at 5':'Short 2 servers from 6:30 to 8:30!'}</div></div></div>
   ${aiCard(['steak'],{doneT:'The book is covered',doneP:'Peak covers fit within six servers.'})}`;
}
function dPass(V){
  const m=missionFor(['steak']);const sent=!m;
  const tk=[['1042','Jane Doe','Front Desk','Food handler card · current','ACCEPTED','g'],['1043','Sam Patel','The Market','Union seniority · OK','ACCEPTED','g'],['1044','Parker Hale','Banquets','Backup if anyone declines','ON HOLD','a']];
  V.innerHTML=`<div class="droom fadeIn" style="background:linear-gradient(180deg,#2a2a2e,#141418)"><div class="rail"></div>
    <div class="tickets">${tk.map(([no,n,from,note,st,c],i)=>`<div class="ticket" style="animation-delay:${i*.15}s;transform:rotate(${[-2,1.5,-1][i]}deg);${sent?'':'opacity:.55;filter:grayscale(1)'}"><div class="clip"></div>
      <div style="display:flex;justify-content:space-between"><b>OFFER #${no}</b><span>${sent?'SENT':'DRAFT'}</span></div><hr>
      <div>SERVER · SECTION ${i+5>6?'BACKUP':i+5}</div><div>SAT 5:00P – 11:00P</div><hr><div class="big">${n}</div><div>from ${from}</div><div style="margin-top:8px;opacity:.7">${note}</div><hr><div>EMBER &amp; OAK</div><div>REPLY VIA SECURE LINK</div>
      ${sent?`<div class="stamp ${c}" style="animation-delay:${.6+i*.35}s">${st}</div>`:''}</div>`).join('')}</div>
    <div style="position:absolute;left:30px;bottom:24px;font-size:13px;color:#c9a978">${sent?'Offers fired. Replies land here as each person answers.':'Nothing leaves the kitchen until you fire it.'}</div></div>
   ${aiCard(['steak'],{okLabel:'Fire the offers',doneT:'Offers are on the rail',doneP:'Jane and Sam accepted. Parker is on hold as a backup.'})}`;
}
function market(V){
  const fixed=!missionFor(['steak']);
  const st=[['Carving',4],['Sushi',3],['Pasta',3],['Grill',4],['Dessert',3],['Salads',2],['Beverage',4],['Host',2]];
  V.innerHTML=`<div class="droom fadeIn" style="padding:30px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;align-content:start">${st.map(([n,c],i)=>`<div style="border:1px solid rgba(214,173,96,.3);border-radius:18px;padding:18px;background:rgba(20,12,6,.6)"><div style="font-family:'Cormorant Garamond';font-size:26px;color:#f6e3bd">${n}</div><div style="font-size:12px;color:#c9a978">${c} attendants · covered</div><div style="display:flex;gap:6px;margin-top:12px">${[...Array(c)].map(()=>'<i style="width:26px;height:26px;border-radius:50%;background:#e8c98a;display:inline-block"></i>').join('')}</div></div>`).join('')}
    <div style="grid-column:1/-1;font-size:13px;color:#c9a978;margin-top:6px">${fixed?'Sam Patel is on loan to Ember & Oak from 5 to 11 PM. The Market stays covered without him.':'The agent wants to lend Sam Patel to Ember & Oak from 5 to 11 PM. The Market stays covered without him.'}</div></div>
   <div class="dside fadeIn"><h4>The Market</h4><div style="font-size:13px;color:#c9a978;margin-top:6px;line-height:1.6">60 staff · 1,900 guests expected Saturday · no open shifts.</div></div>
   ${aiCard(['steak'],{doneT:'The Market is covered',doneP:'Sam is back on the line Sunday.'})}`;
}

/* ============ RETAIL ============ */
const R={time:'8p'};
SCREENS.retail=(L)=>{renderRetail(L);curRefresh=()=>renderRetail(L,true)};
function renderRetail(L,keep){
  const fixed=!missionFor(['shop']);const need={'2p':2,'6p':4,'8p':4,'10p':3},base={'2p':2,'6p':3,'8p':3,'10p':3};const t=R.time;
  const sched=base[t]+((t==='6p'||t==='8p')&&fixed?1:0);const names=['Noah Bell','Ava Reed','Ivy Chen','Mia Lopez'];
  const hrs=[['12P',40,2,2],['2P',70,2,2],['4P',110,3,3],['6P',180,4,3],['7P',220,4,3],['8P',200,4,3],['9P',150,3,3],['10P',90,3,3]];
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome('Resort Shop','Gifts & sundries · Promenade level','<span class="dchip" style="background:#fff;color:#be185d;border:1px solid #fbcfe8">Fight night merch drop · 6 PM</span>')}
   <div class="awning"></div>
   <div class="window"><div class="neon">OPEN</div>
     <div style="position:absolute;left:30px;top:26px"><div style="font-family:Fredoka;font-size:26px;font-weight:700">Tonight at the registers</div><div style="font-size:13px;color:#8a4a6e;margin-top:2px">Fight night merch drop brings a 6 to 10 PM rush</div>
       <div style="display:flex;gap:6px;margin-top:10px">${Object.keys(need).map(x=>`<button data-t="${x}" style="font-size:12px;font-weight:700;padding:7px 12px;border-radius:999px;${x===t?'background:#be185d;color:#fff':'background:#fff;color:#be185d;border:1px solid #fbcfe8'}">${x.replace('p',' PM')}</button>`).join('')}</div></div>
     <div class="regs" style="top:150px">${[0,1,2,3].map(i=>{const staffed=i<sched,needed=i<need[t];const isNew=fixed&&i===3&&(t==='6p'||t==='8p');
       return `<div class="reg"><div class="pos ${staffed?'':'off'}">${staffed?'REG '+(i+1)+' · OPEN':needed?'NO CASHIER':'CLOSED'}</div>
        ${staffed?`<div class="ntag ${isNew?'new':''}"><small>${isNew?'EXTENDED +2 HRS':'ASSOCIATE'}</small><b>${names[i]}</b></div>`:needed?`<div class="ntag open"><small>NEEDS ASSOCIATE</small><b>Open</b></div>`:`<div style="margin-top:30px;font-family:Fredoka;font-size:18px;color:#c48aa8">Closed</div>`}<div class="counter"></div></div>`}).join('')}</div>
     <div class="receipt"><div style="text-align:center;font-weight:700">RESORT SHOP</div><div style="text-align:center;font-size:11px">STAFFING RECEIPT · SAT 11/21</div><div style="border-top:1px dashed #999;margin:8px 0"></div>
       ${hrs.map(([h,g,n,s])=>{const ss=s+((h==='6P'||h==='7P'||h==='8P')&&fixed?1:0);return `<div class="ln"><span>${h}</span><span class="bar">${'█'.repeat(Math.round(g/22))}</span><span>${ss}/${n} ${ss>=n?'✓':'✗'}</span></div>`}).join('')}
       <div style="border-top:1px dashed #999;margin:8px 0"></div><div class="ln"><b>GUESTS</b><b>1,060</b></div><div class="ln"><b>SHORT</b><b>${fixed?'0':'1 ASSOC 6–10P'}</b></div>
       <div style="text-align:center;margin-top:12px;font-family:Inter;font-weight:900;font-size:20px;letter-spacing:3px;color:${fixed?'#15803d':'#be185d'};border:3px solid currentColor;border-radius:6px;padding:4px;transform:rotate(-4deg)">${fixed?'COVERED':'1 SHORT'}</div>
       <div style="text-align:center;font-size:10.5px;margin-top:10px">THANK YOU · COME AGAIN</div></div>
     ${aiCard(['shop'],{doneT:'Registers are covered',doneP:'Mia Lopez stays until 10 PM. Still under 10 hrs for the day.'})}</div></div>`;
  bindBack(L);bindAi(L);$$('[data-t]',L).forEach(b=>b.onclick=()=>{R.time=b.dataset.t;renderRetail(L,true)});
}

/* ============ OPS (back of house) ============ */
const OPS=['sec','valet','slots','it','evs','grounds','mkt'];
const O={d:'sec'};
SCREENS.ops=(L,k)=>{O.d=OPS.includes(k)?k:'sec';renderOps(L);curRefresh=()=>renderOps(L,true)};
const GT0=12,GT1=28,gx=h=>(h-GT0)/(GT1-GT0)*100;
const GANTT={
 sec:[['Dana Fox','Supervisor',14,26],['Kai Lowe','Officer',16,24],['Rowan Ellis','Officer',16,24],['Noor Haddad','Officer',17,25],['Remy Vale','Officer',18,26],['Arena entry ×5','Internal OT',16,25,'open','Ellis Park +4 · OT'],['Contract ×3','Approved vendor',16,25,'open','Vendor · 3 licensed']],
 valet:[['Sky Morgan','Lead',15,23],['Lee Moss','Attendant',16,24],['Bo Grant','Attendant',16,24],['Cy Dunn','Attendant',17,25],['Valet ×4','Cross-trained',17,24,'open','Bell staff ×4 · Front Office'],['On-call ×2','On-call',18,24,'open','On-call ×2 · confirmed']],
 slots:[['Ari Stone','Slot tech',12,20],['Em Rao','Slot tech',18,26],['Drew Singh','On-call tech',15,23],['Drew Singh','Grounds setup',15,19,'conflict','Avery Kim · setup'],['Kai Brooks','Attendant',16,24]],
 it:[['Jamie Fox','On-call engineer',12,24],['Robin Lee','NOC',16,24],['Sasha Park','NOC',24,28],['Help desk ×3','Help desk',12,20]],
 evs:[['Arena crew A','8 crew',19,23],['Night crew','12 crew',23,28],['Engineers','3 crew',14,22],['Teardown ×4','Arena',24,28,'open','House porters ×4 · Housekeeping']],
 grounds:[['Avery Kim','Groundskeeper',12,15],['Pool team','4 attendants',12,19],['Event lawn setup','VIP terrace',15,19,'conflict','Avery Kim']],
 mkt:[['VIP hosts','6 hosts',15,21],['VIP hosts ×2','Check-in',15,19,'open','Casino hosts ×2'],['Promotions','4 staff',18,24]]
};
const MISSION_OF={sec:'sec',valet:'valet',slots:'slots',it:null,evs:'evs',grounds:'slots',mkt:'mkt'};
function renderOps(L,keep){
  const d=O.d,D=DEPTS[d];const mid=MISSION_OF[d];const fixed=!mid||STATE.resolved.has(mid);
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome('Back of House','Operations console · Saturday','<span class="dchip" style="background:rgba(255,61,110,.15);border:1px solid rgba(255,61,110,.4)">Fight night · doors 7 PM</span>')}
   <div class="ochips">${OPS.map(k=>{const o=openFor(k),is=issuesFor(k);return `<button class="${k===d?'on':''}" data-k="${k}"><i style="background:${DEPTS[k].c};box-shadow:0 0 8px ${DEPTS[k].c}"></i>${DEPTS[k].n}${is?`<em class="${o?'':'am'}">${o||'!'}</em>`:''}</button>`}).join('')}</div>
   <div class="oviz ogl fadeIn" id="oviz"></div>
   <div class="ogantt ogl fadeIn"><h3>${D.n} · Saturday shifts</h3><p class="s">Noon to 4 AM. Dashed bars are open, red is a conflict.</p>
     <div class="gax" style="margin-top:14px">${[12,16,20,24,28].map(h=>`<span style="left:${gx(h)}%">${h%24===0?'12a':h>24?(h-24)+'a':h>12?(h-12)+'p':'12p'}</span>`).join('')}</div>
     ${GANTT[d].map(([n,r,a,b,typ,fill])=>{const open=typ==='open'&&!fixed,conf=typ==='conflict'&&!fixed,nw=(typ==='open'||typ==='conflict')&&fixed;
       return `<div class="grow"><div class="nm">${nw?fill.split(' · ')[0]:n}<small>${nw?(fill.split(' · ')[1]||r):r}</small></div><div class="tr"><div class="br ${open?'open':''} ${nw?'new':''}" style="left:${gx(a)}%;width:${gx(b)-gx(a)}%;background:${conf?'#ff3d6e':nw?'#5effc8':D.c}">${open?'Open':conf?'Double-booked':nw?'Covered':''}</div></div></div>`}).join('')}</div>
   ${aiCard(mid?[mid==='slots'?'slots':d]:['__none'],{doneT:`${D.n} is covered`,doneP:'No open shifts or conflicts on Saturday.'})}</div>`;
  if(d==='grounds'){const a=L.querySelector('#ai');if(a&&!fixed){a.outerHTML=aiCard(['slots'])}}
  bindBack(L);bindAi(L);
  $$('.ochips button',L).forEach(b=>b.onclick=()=>{O.d=b.dataset.k;renderOps(L,true)});
  opsViz(L.querySelector('#oviz'),d,fixed);
}
function opsViz(V,d,fixed){
  const head=(t,s)=>`<h3>${t}</h3><p class="s">${s}</p>`;
  if(d==='sec'){const gates=[['A',300,70,3],['B',540,300,3],['C',300,530,2],['D',60,300,0]];let n=0;
    V.innerHTML=head('Arena & property posts','Every dot is a post at 7 PM. Red rings are uncovered.')+`<svg viewBox="0 0 936 640" width="100%" style="margin-top:6px">
      <circle cx="300" cy="300" r="210" fill="rgba(96,165,250,.06)" stroke="rgba(96,165,250,.35)"/><circle cx="300" cy="300" r="150" fill="none" stroke="rgba(96,165,250,.2)" stroke-dasharray="4 6"/><rect x="250" y="250" width="100" height="100" fill="rgba(255,61,110,.15)" stroke="#ff3d6e"/><text x="300" y="306" text-anchor="middle" font-size="13" font-weight="800" fill="#ffb3c1">RING</text>
      ${gates.map(([g,x,y,open])=>`<g><text x="${x}" y="${y-28}" text-anchor="middle" font-size="12" font-weight="800" fill="#93c5fd">GATE ${g}</text>${[...Array(6)].map((_,i)=>{const px=x-50+i*20,isOpen=i>=6-open;const c=isOpen&&!fixed;const idx=isOpen?n++:-1;const contract=fixed&&isOpen&&idx>=5;
        return `<circle class="post ${c?'open':''}" cx="${px}" cy="${y}" r="8" fill="${c?'none':contract?'#f59e0b':isOpen?'#5effc8':'#60a5fa'}" stroke="${c?'#ff3d6e':'none'}" stroke-width="2.5"/>${contract?`<text x="${px}" y="${y+3.5}" text-anchor="middle" font-size="9" font-weight="900" fill="#1a1000">C</text>`:''}`}).join('')}</g>`).join('')}
      ${[['Casino floor',24],['Hotel lobby',8],['Garage',6],['Promenade',10]].map(([z,c],i)=>`<g transform="translate(600,${40+i*148})"><rect width="320" height="128" rx="16" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.1)"/><text x="16" y="28" font-size="14" font-weight="800" fill="#e6f1ff">${z}</text><text x="304" y="28" text-anchor="end" font-size="12" fill="#5effc8">${c}/${c} posts</text>${[...Array(c)].map((_,j)=>`<circle cx="${24+(j%12)*24}" cy="${58+Math.floor(j/12)*24}" r="7" fill="#60a5fa"/>`).join('')}</g>`).join('')}
      <g transform="translate(20,600)" font-size="12" fill="#cfe3ff"><circle cx="6" cy="0" r="6" fill="#60a5fa"/><text x="18" y="4">Scheduled</text><circle cx="116" cy="0" r="6" fill="#5effc8"/><text x="128" y="4">Internal OT</text><circle cx="236" cy="0" r="6" fill="#f59e0b"/><text x="248" y="4">Contract</text><circle cx="336" cy="0" r="6" fill="none" stroke="#ff3d6e" stroke-width="2"/><text x="348" y="4">Open</text></g></svg>`;}
  else if(d==='valet'){const hrs=['4P','5P','6P','7P','8P','9P','10P','11P'],cars=[80,140,220,260,240,190,150,120],need=cars.map(c=>Math.ceil(c/8)),sch=[10,18,24,27,26,22,19,15];
    V.innerHTML=head('Valet tickets · cars per hour','Each ticket is an hour. Attendants needed vs scheduled.')+`<div style="height:120px;margin-top:14px;position:relative;border-radius:16px;background:rgba(255,255,255,.03);overflow:hidden">
      <div style="position:absolute;left:0;right:0;top:54px;height:40px;background:#0d0e1c"></div>${[...Array(9)].map((_,i)=>`<div style="position:absolute;top:60px;left:-60px;width:44px;height:26px;border-radius:8px;background:${['#e94560','#f3d77a','#e8ecf5','#22d3ee','#a78bfa'][i%5]};animation:drive 9s linear ${-i}s infinite"></div>`).join('')}
      <div style="position:absolute;left:16px;top:14px;font-size:12px;font-weight:800;color:#67e8f9">PORTE-COCHÈRE · LIVE QUEUE ${fixed?'· 6 MIN WAIT':'· 19 MIN WAIT AT PEAK'}</div></div>
      <style>@keyframes drive{to{transform:translateX(1050px)}}</style>
      <div style="display:flex;gap:12px;margin-top:26px;justify-content:space-between">${hrs.map((h,i)=>{const s=fixed?need[i]:sch[i];const short=s<need[i];return `<div class="vtk ${short?'short':''}"><div style="display:flex;justify-content:space-between;font-size:10px"><span>NO. 04${17+i}</span><span>${h}</span></div><div class="n" style="margin-top:16px">${cars[i]}</div><div style="font-size:10px">cars</div><div style="position:absolute;left:10px;right:10px;top:132px"><div style="font-size:10px;opacity:.6">ATTENDANTS</div><div style="font-family:Inter;font-weight:900;font-size:20px;color:${short?'#e11d48':'#15803d'}">${s}/${need[i]}</div></div></div>`}).join('')}</div>`;}
  else if(d==='slots'){const banks='ABCDEFGH'.split('');
    V.innerHTML=head('Slot floor · banks A to H','Yellow lights are machines waiting for a tech.')+`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:16px">${banks.map((b,bi)=>`<div style="border-radius:16px;padding:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800"><span>BANK ${b}</span><span style="color:#fbbf24">${bi%3===0?'1 service':''}</span></div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:10px">${[...Array(12)].map((_,i)=>`<div class="mach ${(bi*12+i)%17===3?'svc':''}" style="background:${['#7c5cff','#e94560','#22d3ee','#f3d77a'][(bi+i)%4]}"></div>`).join('')}</div></div>`).join('')}</div>
     <div style="margin-top:18px;border-radius:16px;padding:16px;background:${fixed?'rgba(94,255,200,.08)':'rgba(255,61,110,.1)'};border:1px solid ${fixed?'rgba(94,255,200,.35)':'rgba(255,61,110,.45)'}"><div style="font-size:12px;font-weight:800;color:${fixed?'#5effc8':'#ff8fab'}">${fixed?'CONFLICT RESOLVED':'CONFLICT · DREW SINGH'}</div><div style="font-size:14px;margin-top:4px">${fixed?'Drew stays on-call for slots. Avery Kim handles the terrace setup from 3 to 7 PM.':'Booked as on-call slot tech and for grounds event setup, both 3 to 7 PM.'}</div></div>`;}
  else if(d==='it'){const cx=250,cy=300,R=190;const arcs=[[12,24,'#34d399',0],[16,24,'#22d3ee',1],[24,32,'#a78bfa',2],[12,20,'#60a5fa',3]];
    const arc=(a,b,r)=>{const A=t=>(t%24)/24*2*Math.PI-Math.PI/2;const x1=cx+r*Math.cos(A(a)),y1=cy+r*Math.sin(A(a)),x2=cx+r*Math.cos(A(b)),y2=cy+r*Math.sin(A(b));return `M${x1},${y1} A${r},${r} 0 ${(b-a)>12?1:0} 1 ${x2},${y2}`};
    V.innerHTML=head('On-call rotation · 24 hours','Every hour has someone on call. No open incidents.')+`<svg viewBox="0 0 936 600" width="100%"><circle cx="${cx}" cy="${cy}" r="${R+30}" fill="none" stroke="rgba(255,255,255,.08)"/>${[...Array(24)].map((_,h)=>{const a=h/24*2*Math.PI-Math.PI/2;return `<text x="${cx+(R+46)*Math.cos(a)}" y="${cy+(R+46)*Math.sin(a)+4}" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.45)">${h}</text>`}).join('')}
      ${arcs.map(([a,b,c,i])=>`<path d="${arc(a,b,R-i*26)}" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round" opacity=".85"/>`).join('')}
      <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="40" font-weight="900" fill="#5effc8">0</text><text x="${cx}" y="${cy+20}" text-anchor="middle" font-size="12" fill="#cfe3ff">open incidents</text>
      ${[['Jamie Fox','On-call engineer','#34d399'],['Robin Lee','NOC','#22d3ee'],['Sasha Park','NOC overnight','#a78bfa'],['Help desk ×3','Help desk','#60a5fa']].map(([n,r,c],i)=>`<g transform="translate(560,${150+i*80})"><rect width="340" height="62" rx="14" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.08)"/><rect x="14" y="21" width="20" height="20" rx="6" fill="${c}"/><text x="48" y="28" font-size="14" font-weight="800" fill="#e6f1ff">${n}</text><text x="48" y="46" font-size="11.5" fill="rgba(230,241,255,.6)">${r}</text></g>`).join('')}</svg>`;}
  else if(d==='evs'){V.innerHTML=head('Arena teardown · sections 101 to 124','Each tile is a seating section. Teal is assigned, red has no crew yet.')+`<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;margin-top:18px">${[...Array(24)].map((_,i)=>{const open=i>=20&&!fixed,hp=i>=20&&fixed;return `<div class="${open?'post open':''}" style="height:92px;border-radius:14px;padding:10px;background:${open?'rgba(255,61,110,.12)':hp?'rgba(94,255,200,.14)':'rgba(45,212,191,.1)'};border:1.5px ${open?'dashed #ff6b8b':'solid '+(hp?'#5effc8':'rgba(45,212,191,.35)')}"><div style="font-weight:900;font-size:18px">${101+i}</div><div style="font-size:11px;opacity:.7;margin-top:6px">${open?'No crew':hp?'House porters':i<12?'Crew A':'Night crew'}</div></div>`}).join('')}</div>
     <div style="margin-top:18px;font-size:13px;opacity:.75">Teardown starts at midnight. Sections ${fixed?'121 to 124 are covered by 4 house porters on loan from Housekeeping.':'121 to 124 need 4 more crew.'}</div>`;}
  else if(d==='grounds'){V.innerHTML=head('Grounds & pool zones','Saturday afternoon. The terrace setup is tied to the Drew Singh conflict.')+`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px">${[['Pool deck','4 attendants','ok'],['Cabanas','2 attendants','ok'],['Main lawn','Avery Kim until 3 PM','ok'],['VIP terrace setup',fixed?'Avery Kim · 3 to 7 PM':'Drew Singh · double-booked',fixed?'ok':'bad']].map(([z,s,st])=>`<div style="height:180px;border-radius:18px;padding:18px;background:${st==='ok'?'rgba(74,222,128,.08)':'rgba(255,61,110,.1)'};border:1.5px ${st==='ok'?'solid rgba(74,222,128,.35)':'dashed #ff6b8b'}" class="${st==='ok'?'':'post open'}"><div style="font-size:18px;font-weight:800">${z}</div><div style="font-size:13px;opacity:.75;margin-top:6px">${s}</div></div>`).join('')}</div>`;}
  else if(d==='mkt'){const hrs=[13,14,15,16,17,18,19,20],arr=[20,60,180,260,240,160,80,30];const cap=fixed?240:160;
    V.innerHTML=head('VIP check-in · arrivals per hour','Hosts greet every VIP. The line is host capacity.')+`<svg viewBox="0 0 936 520" width="100%" style="margin-top:14px">${hrs.map((h,i)=>`<rect x="${40+i*108}" y="${480-arr[i]*1.6}" width="80" height="${arr[i]*1.6}" rx="10" fill="${arr[i]>cap&&h<19?'#ff3d6e':'#e879f9'}" opacity=".8"/><text x="${80+i*108}" y="505" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.6)">${h-12} PM</text>`).join('')}
      <line x1="20" x2="900" y1="${480-cap*1.6}" y2="${480-cap*1.6}" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/><text x="900" y="${470-cap*1.6}" text-anchor="end" font-size="12" fill="#fff">${fixed?'8 hosts':'6 hosts'}</text></svg>`;}
}
