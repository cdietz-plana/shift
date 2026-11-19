/* ============ V2 RESORT HUB: isometric map, pins, mission board ============ */
const TW=28,TH=14,OX=640,OY=200;
const P=(x,y,z=0)=>[OX+(x-y)*TW,OY+(x+y)*TH-z*TH];
const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
const poly=(a,f,x='')=>`<polygon points="${pts(a)}" fill="${f}" ${x}/>`;
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
function box(x0,y0,z0,w,d,h,c){const x1=x0+w,y1=y0+d,z1=z0+h;
  return poly([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)],c.r,c.rx||'')+poly([P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)],c.l,c.lx||'')+(c.t?poly([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],c.t,c.tx||''):'')}
function winL(x0,x1,y1,z0,z1,cols,rows,lit=.55){let s='';for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const u0=x0+(i+.2)/cols*(x1-x0),u1=x0+(i+.8)/cols*(x1-x0),v0=z0+(j+.22)/rows*(z1-z0),v1=z0+(j+.78)/rows*(z1-z0);const r=rnd();
  const f=r<lit*.7?'#ffd98a':r<lit?'#a9dcff':'#1b2150';s+=`<polygon class="win ${r<lit&&rnd()<.25?'tw':''}" style="animation-delay:${-rnd()*7}s" points="${pts([P(u0,y1,v0),P(u1,y1,v0),P(u1,y1,v1),P(u0,y1,v1)])}" fill="${f}"/>`}return s}
function winR(x1,y0,y1,z0,z1,cols,rows,lit=.45){let s='';for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const u0=y0+(i+.2)/cols*(y1-y0),u1=y0+(i+.8)/cols*(y1-y0),v0=z0+(j+.22)/rows*(z1-z0),v1=z0+(j+.78)/rows*(z1-z0);const r=rnd();
  const f=r<lit*.7?'#e8b860':r<lit?'#7fb8e0':'#121638';s+=`<polygon class="win ${r<lit&&rnd()<.25?'tw':''}" style="animation-delay:${-rnd()*7}s" points="${pts([P(x1,u0,v0),P(x1,u1,v0),P(x1,u1,v1),P(x1,u0,v1)])}" fill="${f}"/>`}return s}
const tL=(x,y,z,txt,sz,fill,extra='')=>{const [X,Y]=P(x,y,z);return `<text transform="matrix(.894,.447,0,1,${X.toFixed(1)},${Y.toFixed(1)})" font-size="${sz}" fill="${fill}" font-weight="900" ${extra}>${txt}</text>`};
const tR=(x,y,z,txt,sz,fill,extra='')=>{const [X,Y]=P(x,y,z);return `<text transform="matrix(.894,-.447,0,1,${X.toFixed(1)},${Y.toFixed(1)})" font-size="${sz}" fill="${fill}" font-weight="900" ${extra}>${txt}</text>`};
function palm(x,y){const [X,Y]=P(x,y,0);return `<g><line x1="${X}" y1="${Y}" x2="${X+3}" y2="${Y-34}" stroke="#6b4a2a" stroke-width="3"/>${[0,60,120,180,240,300].map(a=>`<ellipse cx="${X+3+Math.cos(a*Math.PI/180)*9}" cy="${Y-35+Math.sin(a*Math.PI/180)*4}" rx="11" ry="3.4" fill="#1f7a4c" transform="rotate(${a/3-30} ${X+3} ${Y-35})"/>`).join('')}</g>`}

const ANCH={casino:P(8.3,10.2,3.2),slots:P(13.2,8.4,3.2),front:P(8.75,7.5,5.5),hk:P(11.75,4,15.3),valet:P(2.5,11.2,4.4),sec:[0,0],steak:P(15.1,10.7,2.6),market:P(17.2,10.7,2.6),shop:P(19,10.7,2.6),
 it:P(8.6,17,0),evs:P(11.6,17,0),mkt:P(14.6,17,0),grounds:P(2.6,4.9,0.6),vendor:P(22.5,7,0)};
{const [ax,ay]=P(17,3.3,0);ANCH.sec=[ax,ay-42-60]}

function drawMap(){
  seed=7;let s=`<defs>
   <linearGradient id="gGround" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1f3d"/><stop offset="1" stop-color="#14162c"/></linearGradient>
   <linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d2a"/><stop offset="1" stop-color="#120c14"/></linearGradient>
   <linearGradient id="gPool" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#2563eb"/></linearGradient>
   <linearGradient id="gBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgba(200,220,255,.45)"/><stop offset="1" stop-color="rgba(200,220,255,0)"/></linearGradient>
   <radialGradient id="gGlow"><stop offset="0" stop-color="rgba(255,214,140,.55)"/><stop offset="1" stop-color="rgba(255,214,140,0)"/></radialGradient>
   <linearGradient id="gDome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5bd6"/><stop offset="1" stop-color="#1e2466"/></linearGradient>
  </defs>`;
  /* searchlights (behind everything) */
  {const [ax,ay]=P(17,3.3,0);const sx=ax,sy=ay-90;
   s+=`<g style="transform-origin:${sx-30}px ${sy}px" class="beam"><polygon points="${sx-34},${sy} ${sx-26},${sy} ${sx-160},${sy-600} ${sx-300},${sy-600}" fill="url(#gBeam)"/></g>
       <g style="transform-origin:${sx+30}px ${sy}px;animation-delay:-3.5s" class="beam"><polygon points="${sx+26},${sy} ${sx+34},${sy} ${sx+300},${sy-600} ${sx+160},${sy-600}" fill="url(#gBeam)"/></g>`}
  /* ground slab */
  s+=box(0,0,-3.2,22,17,3.2,{t:'url(#gGround)',l:'url(#gSoil)',r:'#160f18'});
  /* grid lines on ground */
  for(let i=1;i<22;i++)s+=`<line x1="${P(i,0)[0]}" y1="${P(i,0)[1]}" x2="${P(i,17)[0]}" y2="${P(i,17)[1]}" stroke="rgba(255,255,255,.025)"/>`;
  for(let j=1;j<17;j++)s+=`<line x1="${P(0,j)[0]}" y1="${P(0,j)[1]}" x2="${P(22,j)[0]}" y2="${P(22,j)[1]}" stroke="rgba(255,255,255,.025)"/>`;
  /* roads */
  s+=poly([P(0,15.3),P(22,15.3),P(22,16.6),P(0,16.6)],'#0d0e1c')+poly([P(20.2,0),P(21.5,0),P(21.5,15.3),P(20.2,15.3)],'#0d0e1c');
  for(let x=.5;x<21.5;x+=1.2)s+=`<line x1="${P(x,15.95)[0]}" y1="${P(x,15.95)[1]}" x2="${P(x+.6,15.95)[0]}" y2="${P(x+.6,15.95)[1]}" stroke="#f3d77a" stroke-width="1.4" opacity=".55"/>`;
  for(let y=.5;y<15;y+=1.2)s+=`<line x1="${P(20.85,y)[0]}" y1="${P(20.85,y)[1]}" x2="${P(20.85,y+.6)[0]}" y2="${P(20.85,y+.6)[1]}" stroke="#f3d77a" stroke-width="1.4" opacity=".55"/>`;
  s+=`<g id="cars"></g>`;
  /* pool & grounds */
  s+=`<g class="bld" data-d="grounds">`+poly([P(.4,1.8),P(4.8,1.8),P(4.8,8.6),P(.4,8.6)],'#173624')+poly([P(1,2.6),P(4.2,2.6),P(4.2,7.2),P(1,7.2)],'#2b2a4a')+poly([P(1.3,2.9),P(3.9,2.9),P(3.9,6.9),P(1.3,6.9)],'url(#gPool)','class="poolw"')+
    [2.2,3.3,4.4,5.5].map(y=>box(.55,y,0,.5,.7,.35,{t:'#f3f4ff',l:'#c9cbe8',r:'#a3a6cc'})).join('')+palm(.7,2)+palm(4.5,2.1)+palm(.6,8.2)+palm(4.5,8.1)+palm(4.6,5)+`</g>`;
  /* arena */
  {const [cx,cy]=P(17,3.3,0);const rx=95,ry=47.5,wh=42;
   s+=`<g class="bld" data-d="sec"><ellipse cx="${cx}" cy="${cy}" rx="${rx+18}" ry="${ry+9}" fill="#191b38"/>
    <path d="M${cx-rx},${cy} L${cx-rx},${cy-wh} A${rx},${ry} 0 0 0 ${cx+rx},${cy-wh} L${cx+rx},${cy} A${rx},${ry} 0 0 1 ${cx-rx},${cy} Z" fill="#20235a"/>
    <path d="M${cx-rx},${cy-wh+10} A${rx},${ry} 0 0 0 ${cx+rx},${cy-wh+10}" fill="none" stroke="#ff3d6e" stroke-width="7" class="marq" opacity=".9"/>
    <path d="M${cx-rx},${cy-wh} A${rx},62 0 0 1 ${cx+rx},${cy-wh} A${rx},${ry} 0 0 1 ${cx-rx},${cy-wh} Z" fill="url(#gDome)"/>
    ${[...Array(7)].map((_,i)=>`<path d="M${cx-rx+i*rx/3.5+10},${cy-wh+ry*.25} Q${cx-rx/2+i*rx/3.5},${cy-wh-44} ${cx},${cy-wh-60}" fill="none" stroke="rgba(255,255,255,.12)"/>`).join('')}
    <text x="${cx}" y="${cy-8}" text-anchor="middle" font-size="12" font-weight="900" fill="#ffd6e7" letter-spacing="3">FIGHT NIGHT · SAT</text>
    <text x="${cx}" y="${cy-wh-12}" text-anchor="middle" font-size="11" font-weight="800" fill="rgba(255,255,255,.75)" letter-spacing="4">ARENA</text></g>`}
  /* tower 2 */
  s+=`<g class="bld" data-d="hk">`+box(10.5,2.5,0,2.5,3,15,{t:'#34408a',l:'#1c2254',r:'#11153a'})+winL(10.5,13,5.5,0,15,5,15)+winR(13,2.5,5.5,0,15,6,15)+`</g>`;
  /* tower 1 */
  s+=`<g class="bld" data-d="hk">`+box(7,3.5,0,3.5,4,23,{t:'#3a4799',l:'#20265e',r:'#141844'})+winL(7,10.5,7.5,4,22,7,20)+winR(10.5,3.5,7.5,4,22,8,20)+
     box(7.2,3.7,23,3.1,3.6,.7,{t:'#f3d77a',l:'#b88a1e',r:'#8a6510'})+tL(7.35,7.5,22.25,'EXAMPLE',15,'#f3d77a','letter-spacing="3" style="filter:drop-shadow(0 0 6px #f3d77a)"')+`</g>`;
  /* tower lobby hotspot (front desk) */
  s+=`<g class="bld" data-d="front">`+box(7,7.1,0,3.5,.4,4,{t:'#3b2a70',l:'#2b2160',r:'#1d1646'})+poly([P(7.6,7.5,.3),P(9.9,7.5,.3),P(9.9,7.5,3.4),P(7.6,7.5,3.4)],'#ffe6b0','opacity=".9"')+tL(7.75,7.5,3.9,'HOTEL LOBBY',8.5,'#2b1d4a')+`</g>`;
  /* garage */
  s+=`<g class="bld" data-d="valet">`+box(.5,9,0,4,4.5,4.4,{t:'#2b2e4a',l:'#1f2138',r:'#16182b'});
  for(let lv=0;lv<3;lv++){const z=.4+lv*1.35;s+=poly([P(.5,13.5,z),P(4.5,13.5,z),P(4.5,13.5,z+.75),P(.5,13.5,z+.75)],'#0c0d18')+poly([P(4.5,9,z),P(4.5,13.5,z),P(4.5,13.5,z+.75),P(4.5,9,z+.75)],'#090a14');
    for(let c=0;c<6;c++){if(rnd()<.75){const xx=.8+c*.62;s+=poly([P(xx,13.5,z+.08),P(xx+.4,13.5,z+.08),P(xx+.4,13.5,z+.5),P(xx,13.5,z+.5)],['#e94560','#f3d77a','#e8ecf5','#22d3ee','#7c5cff'][c%5])}}}
  s+=tL(1,13.5,4.35,'VALET',13,'#22d3ee','letter-spacing="2" style="filter:drop-shadow(0 0 5px #22d3ee)"')+`</g>`;
  /* podium / casino */
  s+=`<g class="bld" data-d="casino">`+box(5,7.5,0,9,5.5,3.2,{t:'#2c1856',l:'#3d1f66',r:'#25133f'});
  for(let i=0;i<4;i++)s+=box(6+i*1.9,8.3,3.2,1.2,1,.3,{t:'#7c5cff',l:'#4c2fb0',r:'#3a2290'});
  s+=poly([P(7.6,13,0),P(11.2,13,0),P(11.2,13,2.2),P(7.6,13,2.2)],'#ffcf6e','opacity=".9"')+poly([P(7.9,13,0),P(10.9,13,0),P(10.9,13,1.8),P(7.9,13,1.8)],'#ffe9b8');
  s+=tL(7.85,13,2.85,'CASINO',17,'#f3d77a','letter-spacing="4" style="filter:drop-shadow(0 0 8px #f3d77a)"');
  for(let i=0;i<30;i++){const [X,Y]=P(5.15+i*.3,13,3.05);s+=`<circle cx="${X}" cy="${Y}" r="1.8" fill="#ffe08a" class="marq" style="animation-delay:${(i%2)*.6}s"/>`}
  s+=`</g><g class="bld" data-d="slots">`+tR(14,9,2.4,'SLOTS',11,'#fbbf24','letter-spacing="2" style="filter:drop-shadow(0 0 5px #fbbf24)"')+poly([P(14,7.6,.4),P(14,8.9,.4),P(14,8.9,2),P(14,7.6,2)],'rgba(251,191,36,.25)')+`</g>`;
  /* porte-cochere */
  {const [gx,gy]=P(6.2,14.1,0);s+=`<ellipse cx="${gx}" cy="${gy}" rx="70" ry="30" fill="url(#gGlow)"/>`}
  s+=`<g class="bld" data-d="valet">`+box(4.9,13.1,2,2.6,1.9,.28,{t:'#f3d77a',l:'#a07a1a',r:'#7a5a10'})+[[5,14.9],[7.4,14.9]].map(([x,y])=>poly([P(x,y,0),P(x+.1,y,0),P(x+.1,y,2),P(x,y,2)],'#c9a24a')).join('')+`</g>`;
  /* promenade */
  const ven=[['steak',14.1,2.1,'#3a1e16','#2a140f','#7a1d22','EMBER & OAK','#ffcf9e'],['market',16.3,2,'#3a2514','#2a1a0e','#c2410c','THE MARKET','#fed7aa'],['shop',18.4,1.5,'#3a1b30','#2a1222','#db2777','SHOP','#fbcfe8']];
  ven.forEach(([k,x,w,cl,cr,aw,nm,tc])=>{s+=`<g class="bld" data-d="${k}">`+box(x,9,0,w,3.5,2.6,{t:'#2a2440',l:cl,r:cr})+
    poly([P(x+.15,12.5,.15),P(x+w-.15,12.5,.15),P(x+w-.15,12.5,1.5),P(x+.15,12.5,1.5)],'#ffcf8a','opacity=".85"')+
    poly([P(x,12.5,1.9),P(x+w,12.5,1.9),P(x+w,13.2,1.45),P(x,13.2,1.45)],aw)+
    (k==='shop'?[...Array(5)].map((_,i)=>poly([P(x+i*w/5,12.5,1.9),P(x+(i+.5)*w/5,12.5,1.9),P(x+(i+.5)*w/5,13.2,1.45),P(x+i*w/5,13.2,1.45)],'#fff','opacity=".8"')).join(''):'')+
    tL(x+.2,12.5,2.42,nm,k==='shop'?10:8.5,tc,'letter-spacing="1"')+`</g>`});
  /* back of house rooms in the soil face */
  const rooms=[['sec',2.6,'SECURITY OPS','#60a5fa'],['it',5.8,'IT · NOC','#34d399'],['evs',9,'FACILITIES & EVS','#2dd4bf'],['mkt',12.2,'MARKETING','#e879f9'],['slots',15.4,'SLOT SHOP','#fbbf24']];
  rooms.forEach(([k,x,nm,c])=>{const w=2.9;s+=`<g class="bld" data-d="${k}">`+poly([P(x,17,-2.95),P(x+w,17,-2.95),P(x+w,17,-.25),P(x,17,-.25)],'#0b0a14','stroke="'+c+'" stroke-opacity=".5"')+
    poly([P(x+.1,17,-2.85),P(x+w-.1,17,-2.85),P(x+w-.1,17,-.35),P(x+.1,17,-.35)],c,'opacity=".16"')+
    [...Array(3)].map((_,i)=>poly([P(x+.4+i*.85,17,-2.85),P(x+.9+i*.85,17,-2.85),P(x+.9+i*.85,17,-2.2),P(x+.4+i*.85,17,-2.2)],'#1a1830')+`<circle cx="${P(x+.65+i*.85,17,-1.6)[0]}" cy="${P(x+.65+i*.85,17,-1.6)[1]}" r="3" fill="${c}" opacity=".85"/>`).join('')+
    poly([P(x+.3,17,-1.2),P(x+w-.3,17,-1.2),P(x+w-.3,17,-.6),P(x+.3,17,-.6)],c,'opacity=".35"')+
    tL(x+.2,17,-.55,nm,7.5,c,'letter-spacing=".8"')+`</g>`});
  s+=tL(.4,17,-2.7,'BACK OF HOUSE',8,'rgba(255,255,255,.35)','letter-spacing="2"');
  document.getElementById('map').innerHTML=s;
  document.querySelectorAll('.bld').forEach(b=>{b.onclick=()=>openDept(b.dataset.d);b.onmouseenter=()=>hover(b.dataset.d,true);b.onmouseleave=()=>hover(b.dataset.d,false)});
}
/* cars */
const CARS=[...Array(12)].map((_,i)=>({t:i/12,sp:.018+rnd()*.012,c:['#e94560','#f3d77a','#e8ecf5','#22d3ee','#a78bfa'][i%5]}));
function roadPos(t){/* loop: front road left->right then right road bottom->top, then back */const L1=22,L2=15.3,T=(L1+L2)*2;let d=t*T;
  if(d<L1)return [d,15.65,0];d-=L1;if(d<L2)return [20.55,15.3-d,1];d-=L2;if(d<L2)return [21.15,d,2];d-=L2;return [22-d,16.25,3]}
function drawCars(dt){const g=document.getElementById('cars');if(!g)return;let s='';
  CARS.forEach(c=>{c.t=(c.t+c.sp*dt)%1;const [x,y,dir]=roadPos(c.t);const horiz=dir===0||dir===3;const w=horiz?.7:.32,d=horiz?.32:.7;
    s+=box(x-w/2,y-d/2,0,w,d,.28,{t:c.c,l:'#0007',r:'#000a'});const [hx,hy]=P(dir===0?x+.4:dir===3?x-.4:x,dir===1?y-.4:dir===2?y+.4:y,.15);s+=`<circle cx="${hx}" cy="${hy}" r="2.2" fill="#fff8d0" opacity=".9"/>`});
  g.innerHTML=s}
/* pins */
function drawPins(){
  const el=document.getElementById('pins');
  el.innerHTML=Object.keys(DEPTS).map(k=>{const d=DEPTS[k],[x,y]=ANCH[k],o=openFor(k),is=issuesFor(k);const conflict=MISSIONS.some(m=>m.d===k&&m.kind!=='proposal'&&!STATE.resolved.has(m.id));
    return `<div class="pin ${is?'':'ok'}" data-d="${k}" style="left:${x}px;top:${y-6}px;--c:${d.c}"><div class="dia"><b>${d.ic}</b></div>${is?`<span class="bd ${o?'':'am'}">${o?o:'!'}</span>`:''}<div class="stem"></div><div class="lb">${d.n}</div></div>`}).join('');
  el.querySelectorAll('.pin').forEach(p=>{p.onclick=()=>openDept(p.dataset.d);p.onmouseenter=()=>hover(p.dataset.d,true);p.onmouseleave=()=>hover(p.dataset.d,false)});
}
function hover(k,on){document.querySelectorAll(`.bld[data-d="${k}"]`).forEach(b=>b.classList.toggle('hot',on));const p=document.querySelector(`.pin[data-d="${k}"]`);if(p)p.classList.toggle('hot',on);
  const hc=document.getElementById('hovercard');if(!on){hc.classList.remove('show');return}
  const d=DEPTS[k],[x,y]=ANCH[k],o=openFor(k);const m=MISSIONS.filter(m=>m.d===k&&!STATE.resolved.has(m.id));
  hc.innerHTML=`<b>${d.n}</b><span style="opacity:.6">${d.s}</span><div class="ln"><span>Staff</span><b style="font-size:12px">${d.hc}</b></div><div class="ln"><span>Open Saturday</span><b style="font-size:12px;color:${o?'#ff8fab':'#5effc8'}">${o||'None'}</b></div>${m.length?`<div style="margin-top:8px;color:#c4b5fd">${m.length} item${m.length>1?'s':''} for you · click to open</div>`:'<div style="margin-top:8px;color:#5effc8">All clear · click to open</div>'}`;
  const wt=worldT;hc.style.left=(x*wt.k+wt.x)+'px';hc.style.top=(y*wt.k+wt.y)+'px';hc.classList.add('show')}
/* HUD */
function hudTop(){const c=coverage();
  document.getElementById('hpv').textContent=c+'%';document.getElementById('hpb').style.width=c+'%';
  document.getElementById('hpb').style.backgroundPosition=`-${(100-c)*4}px 0`;
  document.getElementById('hpo').textContent=totalOpen()?totalOpen()+' open shifts':'All shifts covered';
}
const KIND={proposal:'Proposal',conflict:'Conflict',approval:'Approval'};
function board(){
  const L=document.getElementById('mlist');const live=MISSIONS.filter(m=>!STATE.resolved.has(m.id));
  const props=MISSIONS.filter(m=>m.kind==='proposal'&&m.n>0);const done=props.filter(m=>STATE.resolved.has(m.id)).reduce((a,m)=>a+m.n,0),all=props.reduce((a,m)=>a+m.n,0);
  document.getElementById('bcount').textContent=live.length;
  const f=STATE.filter;
  L.innerHTML=`<div class="quest"><div class="k">Main event · Sat Nov 21</div><h4>${totalOpen()?`Fight night: ${totalOpen()} open shifts across ${new Set(MISSIONS.filter(m=>m.n&&!STATE.resolved.has(m.id)).map(m=>m.d)).size} departments`:'Fight night is fully covered'}</h4>
     <p>${totalOpen()?'I can cover every shift. 14 people move between departments and 3 contract officers come from your approved vendor. Nothing is sent until you approve.':'Every department is staffed. Offers are out and I’m tracking replies.'}</p>
     <div class="qbar"><u style="width:${done/all*100}%"></u></div><div style="position:relative;display:flex;justify-content:space-between;font-size:11px;margin-top:5px;opacity:.85"><span>${done} of ${all} shifts covered</span><span>${Math.round(done/all*100)}%</span></div>
     ${totalOpen()?`<div class="acts"><button class="btn w" id="planAll">Approve the whole plan</button><button class="btn g" id="showMap">Show me on the map</button></div>`:''}</div>`+
   live.filter(m=>f==='all'||m.kind===f).map(m=>{const d=DEPTS[m.d];return `<div class="mc" data-id="${m.id}"><div class="top"><i style="background:${d.c};box-shadow:0 0 8px ${d.c}"></i><span style="color:${d.c}">${d.n}</span><em class="k-${m.kind}">${KIND[m.kind]}</em></div>
     <h5>${m.t}</h5><p>${m.p}</p><div class="acts"><button class="btn w" data-a="ok">${m.kind==='conflict'?'Resolve':m.kind==='approval'?'Approve bonus':'Approve'}</button><button class="btn g" data-a="open">Open</button><span class="rw">${m.n?'+'+m.n+' covered':m.when}</span></div></div>`}).join('')+
   (live.length?'':`<div style="text-align:center;padding:30px 10px;opacity:.7;font-size:13px">Nothing needs you right now.</div>`);
  L.querySelectorAll('.mc').forEach(c=>{const m=MISSIONS.find(x=>x.id===c.dataset.id);
    c.onmouseenter=()=>hover(m.d,true);c.onmouseleave=()=>hover(m.d,false);
    c.querySelector('[data-a=ok]').onclick=e=>{e.stopPropagation();resolve(m.id)};
    c.querySelector('[data-a=open]').onclick=e=>{e.stopPropagation();hover(m.d,false);openDept(m.d)};
    c.onclick=()=>npcSay(`<b>${DEPTS[m.d].n}.</b> ${m.p}`,[['Approve',()=>resolve(m.id)],['Open department',()=>openDept(m.d)]])});
  const pa=document.getElementById('planAll');if(pa)pa.onclick=approvePlan;
  const sm=document.getElementById('showMap');if(sm)sm.onclick=showMap;
}
function npcSay(html,acts=[]){const s=document.getElementById('say');s.innerHTML=`<b class="nm">Coverage agent</b>${html}${acts.length?`<div class="acts">${acts.map((a,i)=>`<button class="btn ${i?'g':'w'}" data-i="${i}">${a[0]}</button>`).join('')}</div>`:''}`;
  s.querySelectorAll('[data-i]').forEach(b=>b.onclick=acts[+b.dataset.i][1]);s.animate([{transform:'scale(.97)',opacity:.6},{transform:'none',opacity:1}],{duration:250})}
function npcDefault(){const o=totalOpen();
  if(o)npcSay(`Fight night is in 3 days. <b>${o} shifts</b> are open across the resort. I have a plan that covers all of them.`,[['Approve the plan',approvePlan],['Show me',showMap]]);
  else npcSay(`Saturday is covered. I’ll ping you if anyone declines or calls out.`,[])}
async function showMap(){const ks=[...new Set(MISSIONS.filter(m=>!STATE.resolved.has(m.id)).map(m=>m.d))];
  npcSay(`Here’s where the gaps are. Hover any pin for details, or click a building to go inside.`);
  for(const k of ks){hover(k,true);await sleep(520);hover(k,false)}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* tokens */
function flyTokens(m){return new Promise(res=>{let n=0,tot=0;const W=document.getElementById('world');
  m.moves.forEach(([from,to,cnt])=>{const [tx,ty]=ANCH[to];const self=from===to;const [fx,fy]=ANCH[from];
    for(let i=0;i<Math.min(cnt,6);i++){tot++;const t=document.createElement('div');t.className='tok';t.style.setProperty('--c',DEPTS[to].c);
      const sx=self?tx+(rnd()-.5)*160:fx,sy=self?ty+40+rnd()*60:fy;t.style.left=sx+'px';t.style.top=sy+'px';W.appendChild(t);
      const mx=(sx+tx)/2,my=Math.min(sy,ty)-(self?60:120);
      t.animate([{transform:'translate(0,0) scale(.3)',opacity:0},{transform:`translate(${mx-sx}px,${my-sy}px) scale(1.2)`,opacity:1,offset:.5},{transform:`translate(${tx-sx}px,${ty-sy}px) scale(.7)`,opacity:.9}],{duration:1100,delay:i*110,easing:'cubic-bezier(.35,.6,.35,1)'})
       .onfinish=()=>{t.remove();if(++n===tot)res()}}});
  if(!tot)res()})}
function plus(k,txt){const [x,y]=ANCH[k];const p=document.createElement('div');p.className='plus';p.textContent=txt;p.style.left=x+'px';p.style.top=(y-50)+'px';document.getElementById('world').appendChild(p);setTimeout(()=>p.remove(),1700)}
async function resolve(id,quiet){if(STATE.resolved.has(id))return;const m=MISSIONS.find(x=>x.id===id);
  const card=document.querySelector(`.mc[data-id="${id}"]`);if(card)card.classList.add('gone');
  STATE.resolved.add(id);await flyTokens(m);plus(m.d,m.n?`+${m.n} covered`:m.kind==='conflict'?'Resolved':'Approved');
  drawPins();hudTop();setTimeout(board,300);
  if(!quiet){npcSay(m.kind==='conflict'?`Done. Drew keeps the on-call shift and Avery Kim has the setup.`:m.kind==='approval'?`Bonus approved. Taylor’s team will see it on the offers.`:`Approved. Offers for <b>${DEPTS[m.d].n}</b> are going out now.`,[]);setTimeout(npcDefault,3200)}
  if(!totalOpen()&&!quiet)celebrate();
  if(window.onResolve)window.onResolve(id);}
async function approvePlan(){const live=MISSIONS.filter(m=>m.kind==='proposal'&&m.n>0&&!STATE.resolved.has(m.id));
  npcSay(`Approving the plan. Watch the moves across the resort.`);
  for(const m of live){resolve(m.id,true);await sleep(420)}
  await sleep(1400);celebrate();npcDefault()}
function celebrate(){const b=document.getElementById('banner');b.classList.remove('go');void b.offsetWidth;b.classList.add('go')}
/* camera */
let worldT={x:0,y:0,k:1};
function camera(x,y,k){worldT={x,y,k};document.getElementById('world').style.transform=`translate(${x}px,${y}px) scale(${k})`}
function openDept(k){const d=DEPTS[k];const [ax,ay]=ANCH[k];hover(k,false);
  const kk=2.6;camera(560-ax*kk,470-ay*kk,kk);document.getElementById('world').classList.add('zoom');
  document.querySelectorAll('.hudEl').forEach(e=>{e.style.transition='opacity .4s';e.style.opacity=0;e.style.pointerEvents='none'});
  setTimeout(()=>{const L=document.getElementById('dept');L.innerHTML='';L.className='show '+d.screen;document.getElementById('hub').style.opacity=0;
    SCREENS[d.screen](L,k);},850);
}
function closeDept(){const L=document.getElementById('dept');L.className='';L.innerHTML='';document.getElementById('hub').style.opacity=1;
  setTimeout(()=>{camera(0,0,1);document.getElementById('world').classList.remove('zoom');document.querySelectorAll('.hudEl').forEach(e=>{e.style.opacity=1;e.style.pointerEvents=''});drawPins();board();hudTop();npcDefault()},60)}
addEventListener('message',e=>{if(e.data&&e.data.type==='sca-back')closeDept()});
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2300)}
/* boot */
function fit(){document.getElementById('app').style.setProperty('--s',Math.min(innerWidth/1600,innerHeight/900))}
addEventListener('resize',fit);fit();
let lastT=performance.now();function loop(t){const dt=Math.min(.1,(t-lastT)/1000);lastT=t;if(document.getElementById('hub').style.opacity!=='0')drawCars(dt);requestAnimationFrame(loop)}
function bootHub(){drawMap();drawPins();hudTop();board();npcDefault();requestAnimationFrame(loop);
  document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{STATE.filter=b.dataset.f;document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));board()})}
