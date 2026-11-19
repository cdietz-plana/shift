/* ============ V2 DEPARTMENT SCREENS ============ */
const SCREENS={};
let curRefresh=null;
window.onResolve=id=>{if(curRefresh)setTimeout(()=>curRefresh(id),150)};
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ini=n=>n.split(' ').map(w=>w[0]).join('').slice(0,2);
function chrome(title,sub,extra=''){return `<div class="dchrome"><button class="backBtn" id="backBtn">← Resort</button><div class="dtitle"><b>${title}</b><small>${sub}</small></div><div class="sp"></div>${extra}</div>`}
function bindBack(L){const b=L.querySelector('#backBtn');if(b)b.onclick=closeDept}
function missionFor(ids){return MISSIONS.find(m=>ids.includes(m.d)&&mlive(m))}
const asg=id=>(REQ[id]&&REQ[id].st?REQ[id].st.assigned:[]);
const asgN=id=>asg(id).map(c=>c.name);
const picked=id=>{const m=MISSIONS.find(x=>x.id===id);if(!m||!isDone(id))return false;const ch=STATE.choice&&STATE.choice[id];const o=m.opts.find(x=>x[0]===ch);return !!(o&&o[2])};
/* ===== standard rail: same place, same parts in every department ===== */
const RAILK={casino:()=>({k:['casino'],x:[]}),hotel:()=>({k:['front','hk'],x:[]}),dining:()=>({k:['steak','market'],x:['jane']}),retail:()=>({k:['shop'],x:[]}),
  ops:()=>({k:O.d==='grounds'?['grounds']:[O.d],x:O.d==='grounds'?['slots']:[]})};
const ROSTER={
 casino:[['Taylor Kim','Pit boss',16,26],['Jordan Blake','BAC-1 dealer',18,26],['Jane Roe','BJ dealer',16,24],['Sam Ito','BAC-2 dealer',18,26],['Dealers ×38','Main pit',12,28]],
 front:[['Alex Smith','Desk agent',10,20],['Jordan Blake','Desk agent',12,20],['Quinn Hart','Desk agent',14,22],['Jane Doe','Desk agent',10,18]],
 hk:[['Room attendants ×154','Sun start',9,17],['Inspectors ×8','Sun',9,17],['House porters ×6','Sun',8,16]],
 steak:[['Lena Moore','Server · S1',17,23],['Marco Vidal','Server · S2',17,23],['Priya Rao','Server · S3',17,23],['Owen Clark','Server · S4',17,23],['Kitchen ×9','Line & pass',14,24]],
 market:[['Buffet line ×36','Stations',10,22],['Hosts ×4','Front',10,22]],
 shop:[['Noah Bell','Associate',12,22],['Ava Reed','Associate',14,22],['Ivy Chen','Associate',16,22],['Mia Lopez','Associate',12,20]]};
const RT0=6,RT1=28,rx=h=>(h-RT0)/(RT1-RT0)*100;
function whenHrs(w){const t=[...w.matchAll(/(\d+):\d+ (AM|PM)/g)].map(([_,h,ap])=>{h=+h;if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=24;else if(ap==='AM'&&h<RT0)h+=24;return h});return t.length>1?t:[17,23]}
function rosterRows(k){
  if(GANTT[k]){const mid=MISSION_OF[k];const fixed=!mid||isDone(mid);
    return GANTT[k].filter(r=>!r[4]||(r[4]==='conflict')).map(([n,r,a,b,typ,fill])=>typ==='conflict'?(fixed?[fill.split(' · ')[0],fill.split(' · ')[1]||r,a,b,'new']:[n,r,a,b,'conf']):[n,r,a,b])}
  return (ROSTER[k]||[]).map(r=>{const rr=[...r];if(k==='hk'&&picked('hk')&&rr[0].startsWith('Room'))rr.splice(0,4,'Room attendants ×154','14 move to 7 AM',7,17);if(k==='front'&&rr[0]==='Jane Doe'&&picked('jane'))rr[3]=17;return rr})}
function railHTML(){const scr=document.getElementById('dept').className.replace('show','').trim();const f=RAILK[scr];if(!f)return '';const {k,x}=f();
  const ms=MISSIONS.filter(m=>(k.includes(m.d)||x.includes(m.id))&&on(m.d)&&vis(m));const live=ms.filter(m=>!isDone(m.id));
  const card=m=>{const d=DEPTS[m.d],st=stOf(m),fl=filledOf(m),dn=isDone(m.id);
    const lab=isReq(m)?(dn?(st.status==='FILLED'?'Filled':'Unable to fill'):st?SLBL[st.status]||'Draft':'Draft'):(dn?'Decided':KIND[m.kind]);
    const cls=dn?'ok':isReq(m)?(st&&st.status==='PENDING_APPROVAL'?'wait':st&&st.status!=='DRAFT'?'live':'draft'):'warn';
    return `<div class="rc ${dn?'done':''}" data-m="${m.id}"><div class="rt"><i style="background:${d.c}"></i><span>${d.n}</span><em class="${cls}">${lab}</em></div>
      <h5>${m.t}</h5>${dn?`<p>${isReq(m)?(st.assigned.map(c=>c.name).join(', ')||'Gap flagged to the shift lead'):STATE.choice[m.id]}</p>`:`<p>${m.p}</p>`}
      ${isReq(m)?`<div class="rbar"><u style="width:${Math.min(100,fl/m.n*100)}%"></u></div><div class="rnum"><span>${fl} of ${m.n} filled</span><span>${m.when}</span></div>`:`<div class="rnum"><span>${m.when}</span></div>`}
      ${dn?'':`<button class="rbtn" data-go="${m.id}">${isReq(m)?(st&&st.status!=='DRAFT'?'Continue':'Review'):m.kind==='change'?'Review change':'Make the call'}</button>`}</div>`};
  const ax=[6,12,18,24,28].map(h=>`<span style="left:${rx(h)}%">${h===24?'12a':h>24?(h-24)+'a':h===12?'12p':h>12?(h-12)+'p':h+'a'}</span>`).join('');
  const rows=k.flatMap(kk=>{const base=rosterRows(kk).map(r=>({n:r[0],r:r[1],a:r[2],b:r[3],t:r[4]||''}));
    const R=REQ[kk];if(!R)return base;const [a,b]=whenHrs(R.when);const add=asg(kk).map(c=>({n:c.name,r:'Assigned · '+(typeof FROM!=='undefined'&&FROM[c.from]?FROM[c.from]:c.from),a,b,t:'new'}));
    const m=MISSIONS.find(m=>m.id===kk);const open=m&&on(m.d)&&!isDone(kk)?Math.max(0,m.n-filledOf(m)):0;
    return add.concat(open?[{n:`Open ×${open}`,r:R.role,a,b,t:'open'}]:[]).concat(base)});
  return `<aside class="rail2" id="rail2"><div class="rh"><span class="faceHost rf">${agentFace()}</span><div><b>Coverage agent</b><small>${live.length?`${live.length} ${live.length>1?'things need':'thing needs'} you here`:'All covered here. I’ll flag changes.'}</small></div></div>
    <div class="rsec">Needs you here</div><div class="rcards">${ms.length?ms.sort((a,b)=>isDone(a.id)-isDone(b.id)).map(card).join(''):`<div class="rc done"><h5>Nothing open</h5><p>No gaps or conflicts on Saturday.</p></div>`}</div>
    <div class="rsec">On shift · Saturday <small>6a to 4a</small></div><div class="rax">${ax}</div>
    <div class="rros">${rows.map(r=>`<div class="rr ${r.t}"><div class="nm">${r.n}<small>${r.r}</small></div><div class="tr"><u style="left:${rx(r.a)}%;width:${rx(r.b)-rx(r.a)}%"></u></div></div>`).join('')}</div></aside>`}
function mountRail(){const L=document.getElementById('dept');if(!L||!L.classList.contains('show'))return;const old=L.querySelector('#rail2');const sc=old?old.querySelector('.rcards').scrollTop:0;
  const h=railHTML();if(!h){old&&old.remove();return}const w=document.createElement('div');w.innerHTML=h;const el=w.firstChild;if(old)old.replaceWith(el);else{L.appendChild(el);el.classList.add('fadeIn')}
  el.querySelector('.rcards').scrollTop=sc;
  $$('[data-go]',el).forEach(b=>b.onclick=e=>{e.stopPropagation();act(MISSIONS.find(m=>m.id===b.dataset.go))})}
function deptRefresh(){if(curRefresh)curRefresh();mountRail()}
function aiCard(){return ''}
function bindAi(){}
function subnav(html){return `<div class="subnav">${html}</div>`}

/* ============ CASINO FLOOR (the only felt in the resort) ============ */
const CZ={view:'hl'};
SCREENS.casino=(L)=>{CZ.view=missionFor(['casino'])?'hl':'pit';renderCasino(L);curRefresh=()=>renderCasino(L,true)};
function chipSVG(x,y,r,col,txt,cls=''){return `<g class="cchip ${cls}" transform="translate(${x},${y})"><circle r="${r}" fill="${col}"/>${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;return `<rect x="-3" y="${-r}" width="6" height="${r*.32}" fill="#fff" opacity=".85" transform="rotate(${i*45})"/>`}).join('')}<circle r="${r*.68}" fill="${col}" stroke="rgba(255,255,255,.55)" stroke-width="1.5" stroke-dasharray="3 3"/><text y="4.5" text-anchor="middle" font-size="${r*.52}" font-weight="900" fill="#fff" font-family="Inter">${txt}</text></g>`}
function renderCasino(L,keep){setTimeout(mountRail,0);
  const m=missionFor(['casino']);const st=REQ.casino.st;const as=asg('casino');
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome('Casino Floor','Table games · Saturday · fight night','<span class="dchip gold">Doors 7 PM</span>')}
    ${subnav(`<div class="cnav">${[['hl','High Limit Salon',m?Math.max(0,2-as.length):0],['pit','Main Pit',0]].map(([v,l,n])=>`<button class="${CZ.view===v?'on':''}" data-v="${v}">${l}${n?`<em>${n}</em>`:''}</button>`).join('')}</div>`)}
    <div class="felt fadeIn" id="felt"></div></div>`;
  bindBack(L);$$('[data-v]',L).forEach(b=>b.onclick=()=>{CZ.view=b.dataset.v;renderCasino(L,true)});
  const F=L.querySelector('#felt');
  if(CZ.view==='hl'){
    const tbl=[['BAC-1','Jordan Blake','$500 min'],['BAC-2','Sam Ito','$500 min'],['BAC-3',as[0]?as[0].name:null,'$1,000 min'],['BAC-4',as[1]?as[1].name:null,'$1,000 min']];
    const sent=st&&['OUTREACH_IN_PROGRESS','PARTIALLY_FILLED'].includes(st.status);
    const cols=['#b3261e','#1d4ed8','#0f766e','#6d28d9'];
    F.innerHTML=`<div class="fhead"><h3>High Limit Salon</h3><p>8 PM to 4 AM · each chip is a dealer at a table</p></div>
      <svg viewBox="0 0 1100 640" width="100%" height="560" style="margin-top:6px">
      ${tbl.map(([id,n,min],i)=>{const cx=150+i*265,cy=300,open=!n;return `<g>
        <path d="M${cx-115} ${cy-60} Q${cx-115} ${cy+130} ${cx} ${cy+130} Q${cx+115} ${cy+130} ${cx+115} ${cy-60} Z" fill="rgba(0,0,0,.18)" stroke="#d4af37" stroke-width="3"/>
        <path d="M${cx-95} ${cy-50} Q${cx-95} ${cy+108} ${cx} ${cy+108} Q${cx+95} ${cy+108} ${cx+95} ${cy-50}" fill="none" stroke="rgba(244,227,170,.35)" stroke-width="1.5"/>
        <text x="${cx}" y="${cy+40}" text-anchor="middle" font-family="Playfair Display" font-size="20" font-weight="700" fill="rgba(244,227,170,.55)" letter-spacing="3">BACCARAT</text>
        <text x="${cx}" y="${cy+64}" text-anchor="middle" font-size="12" fill="rgba(244,227,170,.5)">${min}</text>
        ${[...Array(7)].map((_,s)=>{const a=Math.PI*(0.12+s*0.76/6);return `<circle cx="${cx-Math.cos(a)*100}" cy="${cy-50+Math.sin(a)*150}" r="9" fill="none" stroke="rgba(244,227,170,.35)"/>`}).join('')}
        <rect x="${cx-70}" y="${cy-92}" width="140" height="22" rx="4" fill="#2a1a0c" stroke="#8a6a36"/>
        <text x="${cx}" y="${cy-160}" text-anchor="middle" font-size="15" font-weight="900" fill="#f4e3aa" letter-spacing="2">${id}</text>
        ${open?`<g class="post open"><circle cx="${cx}" cy="${cy-118}" r="30" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="7 6"/><text x="${cx}" y="${cy-113}" text-anchor="middle" font-size="12" font-weight="900" fill="#ffc9c9">${sent?'OFFERED':'OPEN'}</text></g>`
          :chipSVG(cx,cy-118,30,cols[i],ini(n),i>1?'drop':'')}
        <text x="${cx}" y="${cy-72}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${open?'#ffc9c9':'#f4e3aa'}">${open?'No dealer':n}</text></g>`}).join('')}
      <text x="20" y="620" font-size="13" fill="rgba(244,227,170,.7)">${as.length>=2?'Both high-limit tables have a dealer tonight.':sent?'Offers are out. Chips land on the table as you assign people.':'BAC-3 and BAC-4 open at 8 PM with no dealer. Review the request on the right.'}</text></svg>`}
  else{
    const games=[['BJ',8,'Blackjack'],['CR',2,'Craps'],['RL',3,'Roulette'],['PK',3,'Poker room']];let n=0;
    F.innerHTML=`<div class="fhead"><h3>Main Pit</h3><p>Saturday 8 PM · 16 tables · 38 dealers on rotation</p></div>
      <div class="pitg">${games.map(([c,k,l])=>`<div class="pg"><h4>${l}</h4><div class="pgt">${[...Array(k)].map((_,i)=>`<div class="pt"><svg viewBox="-34 -34 68 68" width="64" height="64">${chipSVG(0,0,30,['#b3261e','#1d4ed8','#0f766e','#6d28d9','#b45309'][(n++)%5],c+(i+1))}</svg><small>${['Open','Open','Busy','Busy','Hot'][(i+k)%5]}</small></div>`).join('')}</div></div>`).join('')}</div>
      <div class="pitnote">Every main-pit table is dealt and on rotation. Breaks every 60 minutes.</div>`}
}
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
  L.querySelector('#bell').onclick=()=>{const m=MISSIONS.find(x=>['front','hk','jane'].includes(x.id)&&mlive(x));const a=document.getElementById('rail2');if(a)a.animate([{transform:'none'},{transform:'translateX(-10px)'},{transform:'none'}],{duration:420});if(m){toast('Ding! '+m.t);act(m)}else toast('Ding! Everything at the hotel is covered')};
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
  const ex=asgN('front');const fixed=ex.length>=3;const t=H.time;const sched=base[t]+((t==='2p'||t==='4p')?ex.length:0);
  const names=['Alex Smith','Jordan Blake','Quinn Hart','Logan Price','Casey Nguyen','Dana Fox','Jane Doe','Lee Moss'];const extra=ex;
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
  const hrs=[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],arr=[20,30,45,60,80,110,150,170,165,140,110,80,50,30,20],cap=h=>{const tt=h<12?'10a':h<16?'2p':h<17?'4p':h<20?'6p':'9p';const s=base[tt]+((tt==='2p'||tt==='4p')?ex.length:0);return s*16};
  const cw=560,ch=200,bx=i=>14+i*(cw-20)/hrs.length,bw=(cw-20)/hrs.length-6,y=v=>ch-v/180*(ch-30);
  const chart=`<svg viewBox="0 0 ${cw} ${ch+24}" width="100%">${hrs.map((h,i)=>{const c=cap(h),short=arr[i]>c;return `<rect x="${bx(i)}" y="${y(arr[i])}" width="${bw}" height="${ch-y(arr[i])}" rx="4" fill="${short?'#e8a0a0':'#e9d3a2'}"/>`}).join('')}
    <path d="M${hrs.map((h,i)=>`${bx(i)},${y(cap(h))} ${bx(i)+bw+6},${y(cap(h))}`).join(' L')}" fill="none" stroke="#14213d" stroke-width="2.5"/>
    ${hrs.map((h,i)=>i%2?'':`<text x="${bx(i)+bw/2}" y="${ch+18}" text-anchor="middle" font-size="10.5" fill="#7a6a4f">${h>12?h-12:h}${h>=12?'p':'a'}</text>`).join('')}</svg>`;
  const cards=extra.map(n=>({n,r:'Assigned to desk · 2–6 PM',nw:1})).concat([{n:'Alex Smith',r:'Desk agent · 10 hrs'},{n:'Jordan Blake',r:'Desk agent · 8 hrs'},{n:'Jane Doe',r:'Desk agent · to Ember & Oak 5 PM'}]).slice(0,5);
  V.innerHTML=`<div class="hview fadeIn"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h2>Lobby · Front Desk</h2><div class="sub">Saturday arrival wave for fight night · tap a time</div></div>
    <div class="tchips">${Object.keys(need).map(x=>`<button class="${x===t?'on':''}" data-t="${x}">${x.replace('a',' AM').replace('p',' PM')}</button>`).join('')}</div></div>
    <div class="desk">${desk}</div>
    <div class="hchart"><h4>Check-ins per hour vs desk capacity</h4><p>Bars are arrivals. The line is what the scheduled agents can handle.</p>${chart}</div>
    <div class="kcards">${cards.map((c,i)=>`<div class="kcard ${c.nw?'new':''}" style="left:${i*16}px;top:${i*44}px;transform:rotate(${-6+i*3}deg);z-index:${i}"><small>Example Resort · Staff key</small><b style="margin-top:6px">${c.n}</b><div class="ft">${c.r}</div></div>`).join('')}</div></div>`;
  V.parentNode.parentNode.insertAdjacentHTML('beforeend',aiCard(['front'],{doneT:'The arrival wave is covered',doneP:'Kai, Rowan and Ari are on the desk from 2 to 6 PM.'}));
  $$('.tchips button',V).forEach(b=>b.onclick=()=>{H.time=b.dataset.t;hotelView()});
}
function floors(V){
  const top=H.floor==='30'?30:+H.floor,fls=[top,top-1,top-2,top-3,top-4];const fixed=picked('hk');const d=H.day;
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
function renderDining(L,keep){setTimeout(mountRail,0);
  const ven=D.venue==='steak'?{t:'Ember & Oak',s:'STEAKHOUSE · SATURDAY DINNER · 212 COVERS'}:{t:'The Market',s:'BUFFET · SATURDAY · 1,900 GUESTS'};
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome(ven.t,ven.s,'<span class="dchip">Fight night</span>')}
   ${subnav(`<div class="venues"><button class="${D.venue==='steak'?'on':''}" data-v="steak">Ember &amp; Oak</button><button class="${D.venue==='market'?'on':''}" data-v="market">The Market</button></div>`+(D.venue==='steak'?`<div class="courses">${[['floor','I','The Floor'],['book','II','The Book'],['pass','III','The Pass']].map(([c,n,l],i)=>`${i?'<span class="sep">◆</span>':''}<button class="${D.course===c?'on':''}" data-c="${c}"><em>${n}</em>${l}</button>`).join('')}</div>`:''))}
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
  const sa=asg('steak');const fixed=sa.length>=2;
  const secs=[[70,130,'Lena Moore'],[370,130,'Marco Vidal'],[670,130,'Priya Rao'],[70,410,'Owen Clark'],[370,410,sa[0]?sa[0].name:null,sa[0]?FROM[sa[0].from]:''],[670,410,sa[1]?sa[1].name:null,sa[1]?FROM[sa[1].from]:'']];
  const cols=['#e0b872','#9fb4d8','#c9a0c4','#9cc5a1','#f4a6a6','#a6e3d7'];
  const svg=`<svg viewBox="0 0 1030 738" width="100%" height="100%"><defs><pattern id="plank" width="120" height="24" patternUnits="userSpaceOnUse"><rect width="120" height="24" fill="#3b2616"/><rect width="120" height="1.5" fill="#2a1a0e"/><rect x="60" y="0" width="1.5" height="24" fill="#2a1a0e"/><rect x="0" y="6" width="120" height="1" fill="rgba(255,220,180,.05)"/></pattern>
     <radialGradient id="cdl"><stop offset="0" stop-color="rgba(255,190,100,.55)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient><pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="10" fill="rgba(244,166,166,.25)"/></pattern></defs>
    <rect width="1030" height="738" fill="url(#plank)"/>
    <rect x="40" y="26" width="950" height="64" rx="14" fill="#140c06" stroke="#8a6a3a"/><text x="515" y="64" text-anchor="middle" font-family="Cormorant Garamond" font-style="italic" font-size="22" fill="#e8c98a">The Bar</text>
    ${[...Array(16)].map((_,i)=>`<circle cx="${80+i*58}" cy="104" r="9" fill="#5a3c22" stroke="#8a6a3a"/>`).join('')}
    ${secs.map(([x,y,n,from],i)=>{const open=!n;const w=280,h=250;return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${open?'url(#hatch)':cols[i]}" fill-opacity="${open?1:.1}" stroke="${open?'#f4a6a6':cols[i]}" stroke-opacity="${open?.9:.5}" stroke-width="2" ${open?'stroke-dasharray="8 6" class="post open"':''}/>
      ${[[70,80],[210,80],[70,185],[210,185]].map(([tx,ty])=>`<circle cx="${x+tx}" cy="${y+ty}" r="62" fill="url(#cdl)"/>${[0,90,180,270].map(a=>`<circle cx="${x+tx+Math.cos(a*Math.PI/180)*40}" cy="${y+ty+Math.sin(a*Math.PI/180)*40}" r="9" fill="#5a3c22" stroke="#2a1a0e"/>`).join('')}<circle cx="${x+tx}" cy="${y+ty}" r="30" fill="#f6ecd8" stroke="#d6c09a" stroke-width="2"/>${[0,90,180,270].map(a=>`<circle cx="${x+tx+Math.cos(a*Math.PI/180)*19}" cy="${y+ty+Math.sin(a*Math.PI/180)*19}" r="5.5" fill="#fff" stroke="#e0d2b4"/>`).join('')}<circle cx="${x+tx}" cy="${y+ty}" r="3" fill="#ffb648"/>`).join('')}
      <g transform="translate(${x+14},${y-14})"><rect width="${open?190:Math.round((n.length+(from?from.length+8:0))*7.4+30)}" height="28" rx="14" fill="${open?'#3a1414':'#f6ead2'}" stroke="${open?'#f4a6a6':cols[i]}"/><text x="14" y="19" font-size="12.5" font-weight="700" fill="${open?'#ffc4c4':'#2a1a0c'}">${open?`Section ${i+1} · no server`:`${n}${from?' · from '+from:''}`}</text></g></g>`}).join('')}
    <text x="40" y="722" font-size="13" fill="#c9a978">Saturday · 7:30 PM · 24 tables · 212 covers</text></svg>`;
  V.innerHTML=`<div class="droom fadeIn">${svg}</div>`;
}
function dBook(V){
  const fixed=asg('steak').length>=2;
  const res=[['5:00','Doe',4],['5:15','Smith',2],['5:30','Chen',6],['5:45','Patel',2],['6:00','Brooks',8],['6:15','Blake',4],['6:30','Hart',2],['6:45','Hale',5],['7:00','Singh',4],['7:00','Price',2],['7:15','Reyes',6],['7:30','Nguyen',4],['7:45','Kim',2],['8:00','Fox',6],['8:15','Lowe',4]];
  const slots=['5:00','5:30','6:00','6:30','7:00','7:30','8:00','8:30','9:00','9:30','10:00','10:30'],cov=[18,26,34,40,46,44,38,30,22,16,10,6];const cap=fixed?40:28;
  const W=460,Hh=330,bx=i=>20+i*(W-30)/12,bw=(W-30)/12-8,y=v=>Hh-v/50*(Hh-30);
  V.innerHTML=`<div class="book fadeIn" style="left:24px;transform:none;width:1156px">
   <div class="page l"><h3>Saturday, November 21</h3><div style="font-size:12px;letter-spacing:2px;color:#8a5a20;margin:2px 0 8px">RESERVATIONS · FIGHT NIGHT</div>
     ${res.map(([t,n,p])=>`<div class="hand" style="display:flex;justify-content:space-between"><span>${t} · ${n}</span><span>party of ${p}</span></div>`).join('')}</div>
   <div class="page r"><h3>Covers vs. servers</h3><div style="font-size:12px;letter-spacing:2px;color:#8a5a20;margin:2px 0 10px">EVERY 30 MINUTES</div>
     <svg viewBox="0 0 ${W} ${Hh+26}" width="100%">${slots.map((s,i)=>`<rect x="${bx(i)}" y="${y(cov[i])}" width="${bw}" height="${Hh-y(cov[i])}" rx="3" fill="${cov[i]>cap?'#b3261e':'#5a3c22'}" opacity="${cov[i]>cap?.75:.6}"/>${i%2?'':`<text x="${bx(i)+bw/2}" y="${Hh+18}" text-anchor="middle" font-family="Caveat" font-size="18" fill="#1d3a6b">${s}</text>`}`).join('')}
       <path d="M10 ${y(cap)} Q120 ${y(cap)-3} 230 ${y(cap)+2} T${W-6} ${y(cap)}" fill="none" stroke="#1d3a6b" stroke-width="3" stroke-linecap="round"/>
       <text x="${W-10}" y="${y(cap)-8}" text-anchor="end" font-family="Caveat" font-size="20" fill="#1d3a6b">${fixed?'6':'4'} servers can handle ${cap}</text>
       ${fixed?'':`<ellipse cx="${bx(5)}" cy="${y(46)-6}" rx="120" ry="40" fill="none" stroke="#b3261e" stroke-width="3" transform="rotate(-4 ${bx(5)} ${y(46)})"/>`}</svg>
     <div class="hand ${fixed?'':'red'}" style="font-size:26px;margin-top:4px">${fixed?'Covered ✓ '+asgN('steak').map(n=>n.split(' ')[0]).join(' + ')+' join at 5':'Short 2 servers from 6:30 to 8:30!'}</div></div></div>
   ${aiCard(['steak'],{doneT:'The book is covered',doneP:'Peak covers fit within six servers.'})}`;
}
function dPass(V){
  const st=REQ.steak.st;const offers=st?Object.values(st.offers):[];const sent=offers.length>0;
  const tk=REQ.steak.cands.filter(c=>c.ok).map((c,i)=>{const o=offers.find(o=>o.c===c);const a=st&&st.assigned.includes(c),rel=st&&st.released.includes(c);
    const [lab,cl]=a?['ASSIGNED','g']:rel?['NEXT IN LINE','a']:o&&o.s==='accept'?['ACCEPTED','g']:o&&o.s==='decline'?['DECLINED','n']:o?['SENT','a']:['DRAFT','n'];return [String(1042+i),c.name,FROM[c.from],c.note,lab,cl]});
  V.innerHTML=`<div class="droom fadeIn" style="background:linear-gradient(180deg,#2a2a2e,#141418)"><div class="rail"></div>
    <div class="tickets">${tk.map(([no,n,from,note,stt,c],i)=>`<div class="ticket" style="animation-delay:${i*.15}s;transform:rotate(${[-2,1.5,-1][i%3]}deg);${sent?'':'opacity:.55;filter:grayscale(1)'}"><div class="clip"></div>
      <div style="display:flex;justify-content:space-between"><b>OFFER #${no}</b><span>${sent?'SENT':'DRAFT'}</span></div><hr>
      <div>SERVER · SECTIONS 5 & 6</div><div>SAT 5:00P – 11:00P</div><hr><div class="big">${n}</div><div>from ${from}</div><div style="margin-top:8px;opacity:.7">${note}</div><hr><div>EMBER &amp; OAK</div><div>REPLY VIA SECURE LINK</div>
      ${sent?`<div class="stamp ${c}" style="animation-delay:${.3+i*.25}s">${stt}</div>`:''}</div>`).join('')}</div>
    <div style="position:absolute;left:30px;bottom:24px;font-size:13px;color:#c9a978">${st&&st.assigned.length>=2?'Both sections are covered. The person not picked got a thank-you and is first in line next time.':sent?'Every reply lands on the rail. Three said yes for two spots, so the call is yours.':'Nothing leaves the kitchen until you fire it. Review the request on the right.'}</div></div>`;
}
function market(V){
  const fixed=asgN('steak').includes('Sam Patel');
  const st=[['Carving',4],['Sushi',3],['Pasta',3],['Grill',4],['Dessert',3],['Salads',2],['Beverage',4],['Host',2]];
  V.innerHTML=`<div class="droom fadeIn" style="padding:30px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;align-content:start">${st.map(([n,c],i)=>`<div style="border:1px solid rgba(214,173,96,.3);border-radius:18px;padding:18px;background:rgba(20,12,6,.6)"><div style="font-family:'Cormorant Garamond';font-size:26px;color:#f6e3bd">${n}</div><div style="font-size:12px;color:#c9a978">${c} attendants · covered</div><div style="display:flex;gap:6px;margin-top:12px">${[...Array(c)].map(()=>'<i style="width:26px;height:26px;border-radius:50%;background:#e8c98a;display:inline-block"></i>').join('')}</div></div>`).join('')}
    <div style="grid-column:1/-1;font-size:13px;color:#c9a978;margin-top:6px">${fixed?'Sam Patel is on loan to Ember & Oak from 5 to 11 PM. The Market stays covered without him.':'Sam Patel and Lena Brooks offered to pick up shifts at Ember & Oak. The Market stays covered either way.'}</div></div>`;
}

/* ============ RETAIL ============ */
const R={time:'8p'};
SCREENS.retail=(L)=>{renderRetail(L);curRefresh=()=>renderRetail(L,true)};
function renderRetail(L,keep){setTimeout(mountRail,0);
  const ra=asgN('shop');const fixed=ra.length>=1;const need={'2p':2,'6p':4,'8p':4,'10p':3},base={'2p':2,'6p':3,'8p':3,'10p':3};const t=R.time;
  const sched=base[t]+((t==='6p'||t==='8p')&&fixed?1:0);const names=['Noah Bell','Ava Reed','Ivy Chen',ra[0]||'Mia Lopez'];
  const hrs=[['12P',40,2,2],['2P',70,2,2],['4P',110,3,3],['6P',180,4,3],['7P',220,4,3],['8P',200,4,3],['9P',150,3,3],['10P',90,3,3]];
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome('Resort Shop','Gifts & sundries · Promenade level','<span class="dchip" style="background:#fff;color:#be185d;border:1px solid #fbcfe8">Fight night merch drop · 6 PM</span>')}
   ${subnav(`<div class="tags">${Object.keys(need).map(x=>`<button data-t="${x}" class="${x===t?'on':''}">${x.replace('p',' PM')}</button>`).join('')}</div>`)}
   <div class="awning"></div>
   <div class="window"><div class="neon">OPEN</div>
     <div style="position:absolute;left:30px;top:26px"><div style="font-family:Fredoka;font-size:26px;font-weight:700">Tonight at the registers</div><div style="font-size:13px;color:#8a4a6e;margin-top:2px">Fight night merch drop brings a 6 to 10 PM rush</div></div>
     <div class="regs" style="top:150px">${[0,1,2,3].map(i=>{const staffed=i<sched,needed=i<need[t];const isNew=fixed&&i===3&&(t==='6p'||t==='8p');
       return `<div class="reg"><div class="pos ${staffed?'':'off'}">${staffed?'REG '+(i+1)+' · OPEN':needed?'NO CASHIER':'CLOSED'}</div>
        ${staffed?`<div class="ntag ${isNew?'new':''}"><small>${isNew?'EXTENDED +2 HRS':'ASSOCIATE'}</small><b>${names[i]}</b></div>`:needed?`<div class="ntag open"><small>NEEDS ASSOCIATE</small><b>Open</b></div>`:`<div style="margin-top:30px;font-family:Fredoka;font-size:18px;color:#c48aa8">Closed</div>`}<div class="counter"></div></div>`}).join('')}</div>
     <div class="receipt"><div style="text-align:center;font-weight:700">RESORT SHOP</div><div style="text-align:center;font-size:11px">STAFFING RECEIPT · SAT 11/21</div><div style="border-top:1px dashed #999;margin:8px 0"></div>
       ${hrs.map(([h,g,n,s])=>{const ss=s+((h==='6P'||h==='7P'||h==='8P')&&fixed?1:0);return `<div class="ln"><span>${h}</span><span class="bar">${'█'.repeat(Math.round(g/22))}</span><span>${ss}/${n} ${ss>=n?'✓':'✗'}</span></div>`}).join('')}
       <div style="border-top:1px dashed #999;margin:8px 0"></div><div class="ln"><b>GUESTS</b><b>1,060</b></div><div class="ln"><b>SHORT</b><b>${fixed?'0':'1 ASSOC 6–10P'}</b></div>
       <div style="text-align:center;margin-top:12px;font-family:Inter;font-weight:900;font-size:20px;letter-spacing:3px;color:${fixed?'#15803d':'#be185d'};border:3px solid currentColor;border-radius:6px;padding:4px;transform:rotate(-4deg)">${fixed?'COVERED':'1 SHORT'}</div>
       <div style="text-align:center;font-size:10.5px;margin-top:10px">THANK YOU · COME AGAIN</div></div>
</div></div>`;
  bindBack(L);bindAi(L);$$('[data-t]',L).forEach(b=>b.onclick=()=>{R.time=b.dataset.t;renderRetail(L,true)});
}

/* ============ OPS (back of house) ============ */
const OPS=['sec','valet','slots','it','evs','grounds','mkt'];
const O={d:'sec'};
const opsList=()=>OPS.filter(on).concat(Object.keys(DEPTS).filter(k=>MAP[k]==='ops'&&!OPS.includes(k)));
const genericG=d=>[['Team A','Day shift',12,20],['Team B','Swing shift',16,24],['Team C','Overnight',22,28]];
SCREENS.ops=(L,k)=>{const ol=opsList();O.d=ol.includes(k)?k:ol[0]||'sec';renderOps(L);curRefresh=()=>renderOps(L,true)};
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
const MISSION_OF={sec:'sec',valet:'valet',slots:'slots',it:null,evs:'evs',grounds:'slots',mkt:'mkt',casino:'casino',front:'front',hk:'hk',steak:'steak',market:null,shop:'shop'};
function renderOps(L,keep){setTimeout(mountRail,0);
  const d=O.d,D=DEPTS[d];const mid=MISSION_OF[d];const fixed=!mid||isDone(mid)&&(isReq(MISSIONS.find(m=>m.id===mid))?REQ[mid].st.status==='FILLED':picked(mid));
  L.innerHTML=`<div class="scr" ${keep?'style="animation:none"':''}>${chrome('Back of House','Operations console · Saturday','<span class="dchip" style="background:rgba(255,61,110,.15);border:1px solid rgba(255,61,110,.4)">Fight night · doors 7 PM</span>')}
   ${subnav(`<div class="ochips">${opsList().map(k=>{const o=openFor(k),is=issuesFor(k);return `<button class="${k===d?'on':''}" data-k="${k}"><i style="background:${DEPTS[k].c};box-shadow:0 0 8px ${DEPTS[k].c}"></i>${DEPTS[k].n}${is?`<em class="${o?'':'am'}">${o||'!'}</em>`:''}</button>`}).join('')}</div>`)}
   <div class="oviz ogl fadeIn" id="oviz"></div>
</div>`;
  bindBack(L);bindAi(L);
  $$('.ochips button',L).forEach(b=>b.onclick=()=>{O.d=b.dataset.k;renderOps(L,true);mountRail()});
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
    /*mkt*/V.innerHTML=head('VIP check-in · arrivals per hour','Hosts greet every VIP. The line is host capacity.')+`<svg viewBox="0 0 936 520" width="100%" style="margin-top:14px">${hrs.map((h,i)=>`<rect x="${40+i*108}" y="${480-arr[i]*1.6}" width="80" height="${arr[i]*1.6}" rx="10" fill="${arr[i]>cap&&h<19?'#ff3d6e':'#e879f9'}" opacity=".8"/><text x="${80+i*108}" y="505" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.6)">${h-12} PM</text>`).join('')}
      <line x1="20" x2="900" y1="${480-cap*1.6}" y2="${480-cap*1.6}" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/><text x="900" y="${470-cap*1.6}" text-anchor="end" font-size="12" fill="#fff">${fixed?'8 hosts':'6 hosts'}</text></svg>`;}
  else{V.innerHTML=head(`${DEPTS[d].n} · generic console`,'Mapped to Back of House in Resort setup. Coverage by hour, all roles.')+`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:20px">${[...Array(24)].map((_,h)=>`<div style="height:70px;border-radius:12px;padding:8px;background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.25)"><div style="font-size:11px;opacity:.6">${h}:00</div><div style="font-weight:900;font-size:18px;margin-top:6px">${fixed?'100%':'92%'}</div></div>`).join('')}</div>`}
}
