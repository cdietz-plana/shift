/* ============ RESORT SETUP: connect org chart -> map to worlds -> shape map -> rules ============ */
const WORLDS=[
 {k:'casino',n:'Casino Floor',d:'Felt table, chips & cards',bg:'radial-gradient(circle at 50% 120%,#1f7a4c,#0c3a23)',ic:'♠'},
 {k:'hotel',n:'The Hotel',d:'Elevator, lobby, key cards',bg:'linear-gradient(135deg,#f3e3c0,#b08d57)',ic:'🛎'},
 {k:'dining',n:'Dining',d:'Floor plan, book, the pass',bg:'radial-gradient(circle at 30% 30%,#7a4a24,#1d120a)',ic:'❦'},
 {k:'retail',n:'Retail',d:'Storefront & registers',bg:'repeating-linear-gradient(90deg,#ec4899 0 14px,#fff 14px 28px)',ic:'✚'},
 {k:'ops',n:'Back of House',d:'Ops console',bg:'linear-gradient(135deg,#0f2540,#22d3ee55)',ic:'⌘'},
 {k:'none',n:'Not scheduled',d:'Stays off the map',bg:'repeating-linear-gradient(45deg,#1a1a28 0 8px,#22223a 8px 16px)',ic:'∅'}];
const CORP={fin:{n:'Finance',hc:24,c:'#94a3b8'},hr:{n:'People & HR',hc:18,c:'#94a3b8'},exec:{n:'Executive Office',hc:9,c:'#94a3b8'}};
const DIVS=[['Gaming',['casino','slots']],['Hotel',['front','hk','valet']],['Food & Beverage',['steak','market']],['Retail',['shop']],['Operations',['sec','it','evs','grounds']],['Sales & Marketing',['mkt']],['Corporate',['fin','hr','exec']]];
const SUGG={};Object.keys(DEPTS).forEach(k=>SUGG[k]=DEPTS[k].screen);
const CONF={casino:98,slots:71,front:97,hk:95,valet:64,sec:93,steak:96,market:88,shop:94,it:99,evs:90,grounds:86,mkt:77};
const SU={step:0,connected:false,syncing:false,mapped:false,draft:{}};
const dn=k=>DEPTS[k]?DEPTS[k].n:CORP[k].n, dhc=k=>DEPTS[k]?DEPTS[k].hc:CORP[k].hc, dc=k=>DEPTS[k]?DEPTS[k].c:CORP[k].c;
const allowed=k=>CORP[k]?['none']:[SUGG[k],'ops','none'];
function openSetup(){SU.step=0;SU.connected=false;SU.syncing=false;SU.mapped=false;SU.draft={};SU.look={...LOOK};SU.photo=null;SU.read=null;
  Object.keys(DEPTS).concat(Object.keys(CORP)).forEach(k=>SU.draft[k]=null);
  const el=document.getElementById('setup');el.classList.add('show');suRender()}
function suRender(){const el=document.getElementById('setup');
  const steps=['Connect org chart','Map to worlds','Shape the map','Look & feel','Rules'];
  el.innerHTML=`<div class="su-top"><h2>Resort setup<small>How the resort map gets built</small></h2>
    <div class="su-steps">${steps.map((s,i)=>`<div class="${i===SU.step?'on':i<SU.step?'done':''}"><b>${i<SU.step?'✓':i+1}</b>${s}</div>`).join('')}</div>
    <button class="su-x" id="suX" title="Close">✕</button></div>
   <div class="su-body" id="suBody"></div>
   <div class="su-foot"><div class="agent"><div class="fo faceHost" id="suFace">${agentFace()}</div><p id="suSay"></p></div>
    ${SU.step?'<button class="su-btn" id="suBack">Back</button>':''}<button class="su-btn pri" id="suNext">${SU.step===4?'Build my resort':'Next'}</button></div>`;
  document.getElementById('suX').onclick=()=>el.classList.remove('show');
  const bk=document.getElementById('suBack');if(bk)bk.onclick=()=>{SU.step--;suRender()};
  document.getElementById('suNext').onclick=suNext;
  [suConnect,suMap,suShape,suLook,suRules][SU.step]();
}
function say(t){const p=document.getElementById('suSay');if(p)p.innerHTML=t;faceTalk(document.getElementById('suFace'),Math.min(2600,400+t.replace(/<[^>]+>/g,'').length*26))}
function nextOk(v){const n=document.getElementById('suNext');if(n)n.disabled=!v}
function suNext(){if(SU.step<4){SU.step++;suRender();return}
  if(SU.look)LOOK=SU.look;
  /* apply */
  Object.keys(DEPTS).forEach(k=>{MAP[k]=SU.draft[k]||'none';if(MAP[k]!=='none')DEPTS[k].screen=MAP[k]});
  document.getElementById('setup').classList.remove('show');
  camera(0,0,1);const w=document.getElementById('world');w.classList.remove('intro');void w.offsetWidth;w.classList.add('intro');
  drawMap();drawPins();hudTop();board();
  const n=Object.keys(DEPTS).filter(on).length;
  npcSay(`Your resort is built from the org chart: <b>${n} departments</b> on the map${n<13?', the rest left off':''}. Every building comes from a real team.`,[['Open setup again',openSetup]]);
  faceHappy(document.getElementById('npcOrb'),2600)}

/* ---- step 1: connect ---- */
function suConnect(){const B=document.getElementById('suBody');
  const srcs=[['Workday','HRIS · departments, roles, certifications','#f59e0b','W'],['UKG Pro','Workforce · schedules & time','#22d3ee','U'],['ADP Workforce Now','HR & payroll · roles only','#ef4444','A'],['Upload a file','CSV or Excel export','#a78bfa','↑']];
  B.innerHTML=`<div class="srcs glassP"><h3>Where does your org chart live?</h3><p class="s">Read-only. We import departments, roles, certifications and hours. Never pay data.</p>
    ${srcs.map(([n,s,c,l],i)=>`<div class="src ${SU.connected?(i===0?'live':'dim'):''}" data-i="${i}"><div class="lg" style="background:${c}">${l}</div><div><b>${n}</b><small>${s}</small></div><button>${SU.connected&&i===0?'Connected':'Connect'}</button></div>`).join('')}
    <div class="sync ${SU.connected?'show':''}" id="sync"><div style="display:flex;justify-content:space-between"><span id="syncT">${SU.connected?'Synced':'Syncing…'}</span><b id="syncN">${SU.connected?'926 people':'0'}</b></div><div class="bar"><u id="syncB" style="width:${SU.connected?100:0}%"></u></div></div></div>
   <div class="orgP glassP"><h3>Org chart · Example Resort &amp; Casino</h3><p style="font-size:12.5px;opacity:.6;margin-top:3px" id="orgSub">${SU.connected?'16 departments · 926 people · 9 certification types':'Nothing imported yet'}</p>
    <svg id="orgSvg" viewBox="0 0 1020 600" width="100%" style="margin-top:6px"></svg>${SU.connected?'':'<div class="empty">Connect a source to import your org chart</div>'}</div>`;
  if(SU.connected)drawOrg(false);
  B.querySelectorAll('.src').forEach(s=>s.querySelector('button').onclick=()=>connect(+s.dataset.i));
  nextOk(SU.connected);
  say(SU.connected?'Got it. 16 departments and 926 people. Next, I’ll match each department to a world.':'First, connect where your org chart lives. I only need departments, roles, certifications and hours.');
}
async function connect(i){if(SU.syncing||SU.connected)return;SU.syncing=true;
  const cards=[...document.querySelectorAll('.src')];cards.forEach((c,j)=>c.classList.toggle('dim',j!==i));cards[i].querySelector('button').textContent='Connecting…';
  await sleep(700);cards[i].classList.add('live');cards[i].classList.remove('dim');cards[i].querySelector('button').textContent='Connected';
  document.getElementById('sync').classList.add('show');const e=document.querySelector('.orgP .empty');if(e)e.remove();
  say('Reading your org chart…');drawOrg(true);
  for(let p=0;p<=100;p+=4){document.getElementById('syncB').style.width=p+'%';document.getElementById('syncN').textContent=Math.round(926*p/100).toLocaleString();await sleep(55)}
  document.getElementById('syncT').textContent='Synced';document.getElementById('syncN').textContent='926 people';
  document.getElementById('orgSub').textContent='16 departments · 926 people · 9 certification types';
  SU.connected=true;SU.syncing=false;nextOk(true);
  say('Got it. <b>16 departments</b> and <b>926 people</b>, including gaming licenses, guard cards and food handler cards. Next, I’ll match each department to a world.');faceHappy(document.getElementById('suFace'),2000)}
function drawOrg(anim){const S=document.getElementById('orgSvg');const cw=1020/DIVS.length;let s='',dl=0;const del=()=>anim?`style="animation-delay:${(dl++)*0.07}s"`:'';
  s+=`<g class="${anim?'on-node':''}" ${del()}><rect x="380" y="6" width="260" height="46" rx="12" fill="rgba(124,92,255,.25)" stroke="#7c5cff"/><text x="510" y="27" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Example Resort &amp; Casino</text><text x="510" y="43" text-anchor="middle" font-size="10.5" fill="rgba(255,255,255,.6)">General Manager</text></g>`;
  DIVS.forEach(([dv,ks],i)=>{const cx=cw*i+cw/2;
    s+=`<path d="M510 52 V80 H${cx} V104" fill="none" stroke="rgba(255,255,255,.18)"/>`;
    s+=`<g class="${anim?'on-node':''}" ${del()}><rect x="${cx-62}" y="104" width="124" height="36" rx="10" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)"/><text x="${cx}" y="127" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${dv}</text></g>`;
    ks.forEach((k,j)=>{const y=168+j*86;s+=`<path d="M${cx} ${j?y-50:140} V${y}" fill="none" stroke="rgba(255,255,255,.14)"/>`;
      s+=`<g class="${anim?'on-node':''}" ${del()}><rect x="${cx-66}" y="${y}" width="132" height="66" rx="12" fill="rgba(255,255,255,.04)" stroke="${dc(k)}" stroke-opacity=".6"/><rect x="${cx-66}" y="${y}" width="5" height="66" rx="2" fill="${dc(k)}"/>
        <text x="${cx-54}" y="${y+24}" font-size="11.5" font-weight="800" fill="#fff">${dn(k).length>17?dn(k).slice(0,16)+'…':dn(k)}</text><text x="${cx-54}" y="${y+42}" font-size="10.5" fill="rgba(255,255,255,.6)">${dhc(k)} people</text>
        <text x="${cx-54}" y="${y+57}" font-size="9.5" fill="${CORP[k]?'#94a3b8':'#5effc8'}">${CORP[k]?'salaried · no shifts':'shift-based'}</text></g>`})});
  S.innerHTML=s}

/* ---- step 2: map to worlds ---- */
function suMap(){const B=document.getElementById('suBody');const keys=Object.keys(DEPTS).concat(Object.keys(CORP));
  const un=keys.filter(k=>!SU.draft[k]);
  const chip=(k,showConf)=>`<div class="chip2 ${CORP[k]?'lock':''}" draggable="${CORP[k]?'false':'true'}" data-k="${k}" style="animation-delay:${Math.random()*.4}s"><i style="background:${dc(k)}"></i>${dn(k)}${CORP[k]?'<em style="color:#94a3b8">🔒</em>':showConf?`<em>${SU.draft[k]===SUGG[k]?CONF[k]+'%':'you'}</em>`:''}</div>`;
  B.innerHTML=`<div class="glassP" style="padding:4px 6px"><div class="tray" id="tray">${un.length?`<span style="font-size:12px;font-weight:800;opacity:.6;margin-right:6px">IMPORTED</span>${un.map(k=>chip(k)).join('')}<button class="su-btn pri" id="auto" style="margin-left:auto;padding:9px 14px;font-size:12.5px">Map them for me</button>`:`<span style="font-size:13px;opacity:.75">All 16 departments are mapped. Drag a chip to change its world. Corporate teams stay off because they don’t work shifts.</span>`}</div></div>
   <div class="wcols">${WORLDS.map(w=>`<div class="wcol" data-w="${w.k}"><div class="sw" style="background:${w.bg}">${w.ic}</div><h4>${w.n}</h4><p>${w.d}</p>${keys.filter(k=>SU.draft[k]===w.k).map(k=>chip(k,true)).join('')}</div>`).join('')}</div>`;
  const a=document.getElementById('auto');if(a)a.onclick=autoMap;
  /* drag & drop */
  let drag=null;
  B.querySelectorAll('.chip2[draggable=true]').forEach(c=>{c.ondragstart=e=>{drag=c.dataset.k;c.classList.add('drag');e.dataTransfer.setData('text/plain',drag)};c.ondragend=()=>{c.classList.remove('drag');B.querySelectorAll('.wcol').forEach(w=>w.classList.remove('over','no'))}});
  B.querySelectorAll('.wcol').forEach(w=>{w.ondragover=e=>{if(!drag)return;const ok=allowed(drag).includes(w.dataset.w);w.classList.toggle('over',ok);w.classList.toggle('no',!ok);if(ok)e.preventDefault()};
    w.ondragleave=()=>w.classList.remove('over','no');
    w.ondrop=e=>{e.preventDefault();if(drag&&allowed(drag).includes(w.dataset.w)){SU.draft[drag]=w.dataset.w;const nm=dn(drag),wn=WORLDS.find(x=>x.k===w.dataset.w).n;drag=null;suMap();say(`Moved <b>${nm}</b> to <b>${wn}</b>.${w.dataset.w==='none'?' It won’t appear on the map.':''}`)}}});
  nextOk(!un.length);
  if(un.length)say('Each world is a themed experience. Want me to match your departments? I look at their roles and certifications.');
}
async function autoMap(){const keys=Object.keys(DEPTS).concat(Object.keys(CORP));
  say('Matching departments by their roles and certifications…');
  for(const k of keys){SU.draft[k]=CORP[k]?'none':SUGG[k];}
  suMap();
  say('Done. Dealers and pit staff go to the <b>Casino Floor</b>, front desk and housekeeping to <b>The Hotel</b>, servers to <b>Dining</b>. Low matches like Bell &amp; Valet (64%) are worth a look. Drag any chip to change it.');
  faceHappy(document.getElementById('suFace'),2000)}

/* ---- step 3: shape the map ---- */
function suShape(){const B=document.getElementById('suBody');
  B.innerHTML=`<div class="prev glassP"><div class="cap">Live preview</div><svg id="setupMap" viewBox="0 0 1600 900"></svg></div>
   <div class="blist glassP"><h3 style="font-size:16px;font-weight:800">What’s on your property</h3><p style="font-size:12px;opacity:.6;margin:3px 0 8px">No restaurant in your org chart? It won’t be on your map.</p>
    ${Object.keys(DEPTS).map(k=>{const w=SU.draft[k]||'none';return `<div class="brow"><i style="background:${DEPTS[k].c}"></i><div><b>${DEPTS[k].n}</b><small>${w==='none'?'Off the map':WORLDS.find(x=>x.k===w).n+' world'}</small></div><span class="tg ${w!=='none'?'on':''}" data-k="${k}"></span></div>`}).join('')}</div>`;
  previewMap();
  B.querySelectorAll('.tg').forEach(t=>t.onclick=()=>{const k=t.dataset.k;const wasOn=SU.draft[k]&&SU.draft[k]!=='none';SU.draft[k]=wasOn?'none':SUGG[k];
    t.classList.toggle('on',!wasOn);t.parentNode.querySelector('small').textContent=wasOn?'Off the map':WORLDS.find(x=>x.k===SUGG[k]).n+' world';previewMap();
    say(wasOn?`<b>${DEPTS[k].n}</b> is off. Its building and its open shifts leave the map.`:`<b>${DEPTS[k].n}</b> is back on the map.`)});
  nextOk(true);
  say('Here’s your resort as it will look. Turn anything off and its building disappears. Try turning off <b>Ember &amp; Oak</b>.');
}
function previewMap(){const saved={...MAP};Object.keys(DEPTS).forEach(k=>MAP[k]=SU.draft[k]||'none');drawMap('setupMap',false,SU.look||LOOK);Object.assign(MAP,saved)}

/* ---- step 4: look & feel (from a photo of the property) ---- */
/* sample aerials are drawn here so the demo works offline; a real photo works the same way */
function sampleShot(kind){const c=document.createElement('canvas');c.width=360;c.height=220;const g=c.getContext('2d');let sd=kind.length*97;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
  const rect=(x,y,w,h,f)=>{g.fillStyle=f;g.fillRect(x,y,w,h)},dot=(x,y,rr,f)=>{g.fillStyle=f;g.beginPath();g.arc(x,y,rr,0,7);g.fill()};
  if(kind==='desert'){rect(0,0,360,220,'#d9c29a');rect(0,150,360,22,'#5b5b60');rect(250,0,22,220,'#5b5b60');for(let i=0;i<300;i++)rect(r()*360,r()*220,2,2,'#c9ad80');
    rect(40,40,120,70,'#f1ece2');rect(60,20,40,40,'#e9e2d2');rect(110,25,35,35,'#ddd3bf');rect(170,60,60,50,'#b8952e');rect(40,115,50,25,'#3fb6c9');rect(100,118,30,18,'#3fb6c9');for(let i=0;i<10;i++)dot(20+r()*220,10+r()*130,4,'#5f7d3a')}
  else if(kind==='beach'){rect(0,0,360,220,'#2a7f4a');rect(0,160,360,60,'#1d6fb8');rect(0,145,360,18,'#e8d7a8');for(let i=0;i<180;i++)dot(r()*360,r()*140,4+r()*5,r()<.5?'#2f9a55':'#1f6e3a');
    rect(120,40,80,50,'#f2f0ea');rect(210,50,50,40,'#d9775a');rect(60,95,90,40,'#33b8d6');rect(180,100,70,30,'#33b8d6');rect(270,30,60,40,'#e9e5dc')}
  else{rect(0,0,360,220,'#2f4a32');for(let i=0;i<260;i++)dot(r()*360,r()*220,3+r()*5,r()<.5?'#1f3a26':'#3a5a3a');for(let i=0;i<30;i++)dot(r()*360,r()*220,6,'#8a8a86');
    rect(130,70,90,50,'#6b4a2e');rect(150,50,40,30,'#7a5636');rect(240,140,80,50,'#4f7ea8');rect(60,130,50,30,'#5a4030')}
  return c.toDataURL('image/png')}
/* read the photo: a 64x64 sample is enough for colors, water, greenery and terrain */
function readPhoto(src){return new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');g.drawImage(im,0,0,64,64);
  const d=g.getImageData(0,0,64,64).data;let n=0,gr=0,bl=0,sa=0,lum=0;const bk={};
  for(let i=0;i<d.length;i+=4){const R=d[i],G=d[i+1],B=d[i+2];n++;lum+=(R+G+B)/3;const mx=Math.max(R,G,B),mn=Math.min(R,G,B),sat=mx-mn;
    if(G>R+8&&G>B+4)gr++;else if(B>R+20&&B>G-10&&B>90)bl++;else if(R>G&&G>B&&R>150&&sat<110)sa++;
    if(!(G>R+8&&G>B+4)&&!(B>R+20&&B>90)&&!(R>G&&G>B&&R>150&&sat<110&&sat>25)){const key=[R,G,B].map(v=>v>>5).join(',');bk[key]=(bk[key]||{n:0,s:sat,c:[R,G,B]});bk[key].n++}}
  const pal=Object.values(bk).sort((a,b)=>b.n-a.n).slice(0,8).map(x=>x.c);
  const vivid=[...pal].sort((a,b)=>(Math.max(...b)-Math.min(...b))-(Math.max(...a)-Math.min(...a)));
  res({green:gr/n,water:bl/n,sand:sa/n,lum:lum/n/255,pal:pal.slice(0,5).map(xh),accent:xh(vivid[0]||[243,215,122]),body:xh(pal[0]||[58,71,153])})};im.src=src})}
function lookFrom(rd){const L={...SU.look};
  L.setting=rd.water>.12&&rd.green>.15?'tropical':rd.sand>.3?'desert':rd.green>.35?'mountain':'urban';
  L.water=rd.water>.12?'lagoon':rd.water>.02?'pool':'none';L.green=rd.green>.3?2:rd.green>.05?1:0;
  /* night palette: keep the hue of the photo's main building color, darken for the night map */
  const b=hx(rd.body),mx=Math.max(...b)||1;L.tower=xh(b.map(v=>v/mx*105+18));L.podium=xh(b.map(v=>v/mx*62+16));
  const a=hx(rd.accent),am=Math.max(...a)||1;L.accent=xh(a.map(v=>v/am*235+10));return L}
const SETN={urban:'City',desert:'Desert',tropical:'Tropical',mountain:'Mountain'};
function suLook(){const B=document.getElementById('suBody');
  B.innerHTML=`<div class="prev glassP"><div class="cap">Live preview</div><svg id="setupMap" viewBox="0 0 1600 900"></svg></div>
   <div class="blist glassP lk"><h3 style="font-size:16px;font-weight:800">Make it look like your place</h3><p style="font-size:12px;opacity:.6;margin:3px 0 10px">Upload an aerial photo or a site map. The map stays stylized, but it takes on your setting and colors.</p>
    <label class="lkDrop" id="lkDrop">${SU.photo?`<img src="${SU.photo}"><div class="scan" id="lkScan"></div>`:'<b>Drop a photo here</b><small>or click to choose · JPG or PNG</small>'}<input type="file" accept="image/*" id="lkFile"></label>
    <div class="lkS"><span>Or try a sample</span>${[['desert','Desert strip'],['beach','Beach resort'],['mountain','Mountain lodge']].map(([k,l])=>`<button data-s="${k}"><img src="${sampleShot(k)}"><em>${l}</em></button>`).join('')}</div>
    <div id="lkRead"></div></div>`;
  previewMap();nextOk(true);
  const F=B.querySelector('#lkFile');F.onchange=()=>{const f=F.files[0];if(!f)return;const r=new FileReader();r.onload=()=>usePhoto(r.result,'your photo');r.readAsDataURL(f)};
  const D=B.querySelector('#lkDrop');D.ondragover=e=>{e.preventDefault();D.classList.add('over')};D.ondragleave=()=>D.classList.remove('over');
  D.ondrop=e=>{e.preventDefault();D.classList.remove('over');const f=e.dataTransfer.files[0];if(!f)return;const r=new FileReader();r.onload=()=>usePhoto(r.result,'your photo');r.readAsDataURL(f)};
  B.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>usePhoto(sampleShot(b.dataset.s),b.querySelector('em').textContent.toLowerCase()));
  if(SU.read)lookControls();else say('Want the map to feel like your property? Drop in an aerial photo or a site map. I’ll pick up your setting, water, greenery and colors. Or skip this and keep the default look.')}
async function usePhoto(src,label){SU.photo=src;const D=document.getElementById('lkDrop');D.innerHTML=`<img src="${src}"><div class="scan" id="lkScan"></div>`;
  D.classList.add('reading');say(`Reading ${label}…`);const rd=await readPhoto(src);await new Promise(r=>setTimeout(r,1400));D.classList.remove('reading');
  SU.read=rd;SU.look=lookFrom(rd);previewMap();lookControls(true)}
function lookControls(fresh){const rd=SU.read,L=SU.look,el=document.getElementById('lkRead');if(!el)return;const pc=v=>Math.round(v*100)+'%';
  const seg=(key,opts)=>`<div class="lkSeg" data-key="${key}">${opts.map(([v,l])=>`<button class="${String(L[key])===String(v)?'on':''}" data-v="${v}">${l}</button>`).join('')}</div>`;
  el.innerHTML=`<div class="lkH">What I picked up</div>
    <div class="lkRow"><span>Setting</span>${seg('setting',[['urban','City'],['desert','Desert'],['tropical','Tropical'],['mountain','Mountain']])}<em>${pc(rd.water)} water · ${pc(rd.green)} green · ${pc(rd.sand)} sand</em></div>
    <div class="lkRow"><span>Colors</span><div class="lkSw">${rd.pal.map(c=>`<i style="background:${c}" title="${c}"></i>`).join('')}</div><em>Buildings and signs take these hues, darkened for the night map</em></div>
    <div class="lkRow"><span>Water</span>${seg('water',[['none','None'],['pool','Pool'],['lagoon','Lagoon']])}</div>
    <div class="lkRow"><span>Greenery</span>${seg('green',[[0,'Sparse'],[1,'Some'],[2,'Lush']])}</div>
    <div class="lkH" style="margin-top:12px">Confirm these. One photo can’t tell me reliably.</div>
    <div class="lkRow"><span>Hotel towers</span>${seg('towers',[[1,'1'],[2,'2'],[3,'3']])}</div>
    <div class="lkRow"><span>Height</span>${seg('height',[[.6,'Low-rise'],[.8,'Mid-rise'],[1,'High-rise']])}</div>
    <div class="lkRow"><span>Tower sign</span><input class="lkIn" id="lkSign" maxlength="12" value="${L.sign}"></div>
    <button class="lkReset" id="lkReset">Back to the default look</button>`;
  el.querySelectorAll('.lkSeg button').forEach(b=>b.onclick=()=>{const k=b.parentNode.dataset.key;const v=b.dataset.v;SU.look[k]=isNaN(+v)?v:+v;
    b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));previewMap()});
  el.querySelector('#lkSign').oninput=e=>{SU.look.sign=e.target.value.toUpperCase()||'EXAMPLE';previewMap()};
  el.querySelector('#lkReset').onclick=()=>{SU.look={...LOOK0};SU.read=null;SU.photo=null;suLook()};
  if(fresh)say(`Here’s my read: a <b>${SETN[L.setting].toLowerCase()}</b> setting, ${L.water==='lagoon'?'lots of water':L.water==='pool'?'a pool':'no water'}, and your colors. I can’t count towers or judge height from one photo, so set those and I’ll match the map.`)}

/* ---- step 5: rules ---- */
function suRules(){const B=document.getElementById('suBody');
  const R=[['🎰','Gaming licenses','212 dealers and slot techs · from the state gaming regulator feed','#f3d77a'],['🛡','Guard cards','120 security officers · expiry dates tracked','#60a5fa'],['🍽','Food handler cards','94 F&B staff · needed before any dining offer','#fb923c'],['🤝','Union agreement','Culinary & bartenders local · offers go out in seniority order','#e879f9'],
   ['⏱','Fatigue limits','12 hrs a day, 60 hrs a week, 10 hrs rest between shifts','#22d3ee'],['✔','Overtime approval','More than 4 hrs of overtime needs a manager','#34d399'],['$','Incentives','Any shift bonus needs a second manager to approve','#a78bfa'],['✉','Outreach','Nothing is sent until a manager approves','#5effc8'],['▦','Staffing template','Minimum people per role per shift · imported from the schedule, edit any time','#fbbf24'],['◎','Ops signals (optional)','Hotel PMS arrivals and room status, reservations, valet tickets, guest counts','#f472b6']];
  B.innerHTML=`<div class="rules">${R.map(([ic,t,s,c])=>`<div class="rule"><div class="ic" style="background:${c}22;color:${c}">${ic}</div><div><b>${t}</b><small>${s}</small></div><span class="tg on" style="margin-left:auto"></span></div>`).join('')}</div>`;
  B.querySelectorAll('.tg').forEach(t=>t.onclick=()=>t.classList.toggle('on'));
  {const tg=B.querySelectorAll('.tg');const ops=tg[tg.length-1];ops.classList.toggle('on',DM.full);ops.onclick=()=>{DM.set(DM.full?'roster':'full');ops.classList.toggle('on',DM.full)}}
  nextOk(true);
  say('These are the rules I found in your HR data and policies. I check every proposal against them, and I always show you why someone is or isn’t eligible.');
}
