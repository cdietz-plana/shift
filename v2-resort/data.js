/* ============ V2 RESORT DATA (all names fictional) ============ */
const DEPTS={
 casino:{n:'Casino Floor',s:'Table games',hc:142,c:'#f3d77a',screen:'casino',ic:'♠'},
 slots:{n:'Slot Operations',s:'Techs & attendants',hc:38,c:'#fbbf24',screen:'ops',ic:'7'},
 front:{n:'Front Desk',s:'Hotel · check-in & concierge',hc:46,c:'#a78bfa',screen:'hotel',sub:'L',ic:'⌂'},
 hk:{n:'Housekeeping',s:'Hotel · rooms',hc:210,c:'#c4b5fd',screen:'hotel',sub:'20',ic:'✦'},
 valet:{n:'Bell & Valet',s:'Arrivals',hc:54,c:'#22d3ee',screen:'ops',ic:'P'},
 sec:{n:'Security',s:'Arena & property',hc:120,c:'#60a5fa',screen:'ops',ic:'◆'},
 steak:{n:'Ember & Oak',s:'Steakhouse',hc:34,c:'#fb923c',screen:'dining',ic:'❦'},
 market:{n:'The Market',s:'Buffet',hc:60,c:'#f97316',screen:'dining',ic:'◉'},
 shop:{n:'Resort Shop',s:'Retail',hc:18,c:'#f472b6',screen:'retail',ic:'✚'},
 it:{n:'IT',s:'Systems & on-call',hc:22,c:'#34d399',screen:'ops',ic:'⌘'},
 evs:{n:'Facilities & EVS',s:'Cleaning & engineering',hc:85,c:'#2dd4bf',screen:'ops',ic:'✧'},
 grounds:{n:'Grounds & Pool',s:'Outdoor',hc:30,c:'#4ade80',screen:'ops',ic:'❀'},
 mkt:{n:'Marketing & Events',s:'VIP & promotions',hc:16,c:'#e879f9',screen:'ops',ic:'★'}
};
/* missions = the CTAs on the dashboard. moves animate tokens across the map (from -> to). */
const MISSIONS=[
 {id:'sec',d:'sec',kind:'request',n:8,t:'Arena entry is 8 officers short',p:'5 internal officers within the 12 hr limit, plus 3 licensed officers from the approved vendor.',when:'Sat 4 PM – 1 AM'},
 {id:'valet',d:'valet',kind:'request',n:6,t:'Valet needs 6 more attendants',p:'Bell staff from the Front Office with valet clearance, plus on-call valets.',when:'Sat 5 PM – 12 AM'},
 {id:'front',d:'front',kind:'request',n:3,t:'Front desk is short for the arrival wave',p:'2 concierge agents to the desk, plus 1 Players Club rep who knows the system.',when:'Sat 2 PM – 6 PM'},
 {id:'evs',d:'evs',kind:'request',n:4,t:'Arena teardown crew is 4 short',p:'House porters from Housekeeping who are under weekly hours.',when:'Sun 12 AM – 4 AM'},
 {id:'casino',d:'casino',kind:'request',n:2,t:'High Limit Baccarat: 2 open tables tonight',p:'4 certified dealers are free. More may say yes than you need.',when:'Tonight 8 PM – 4 AM'},
 {id:'steak',d:'steak',kind:'request',n:2,t:'Ember & Oak needs 2 servers',p:'Cross-trained Front Desk staff and servers from The Market. Union seniority applies.',when:'Sat 5 PM – 11 PM'},
 {id:'mkt',d:'mkt',kind:'request',n:2,t:'VIP check-in needs 2 hosts',p:'2 casino hosts who already know the VIP list.',when:'Sat 3 PM – 7 PM'},
 {id:'shop',d:'shop',kind:'request',n:1,t:'Resort Shop is 1 associate short',p:'Extend Mia Lopez by 2 hours. Stays under 10 hrs for the day.',when:'Sat 6 PM – 10 PM'},
 {id:'jane',d:'front',kind:'conflict',n:0,t:'Jane Doe is wanted in two places',p:'Front Desk has Jane until 6 PM. Ember & Oak wants her from 5 PM for Section 6.',when:'Sat 5 PM – 6 PM',
  opts:[['Start Jane at Ember & Oak at 6 PM','Nia Brooks covers the desk from 5 to 6. Ember & Oak runs Section 6 with Lena until Jane arrives.',1],['Keep Jane on the desk','Ember & Oak offers Section 6 to the next server in seniority order.',0]]},
 {id:'slots',d:'slots',kind:'conflict',n:0,t:'Drew Singh is double-booked',p:'On-call slot tech and grounds event setup at the same time.',when:'Sat 3 PM – 7 PM',
  opts:[['Keep Drew on call, give setup to Avery Kim','Avery is free after 3 PM and set up the terrace last month.',1],['Move Drew to setup, call in Em Rao','Em would start 3 hours early and go into overtime.',0]]},
 {id:'hk',d:'hk',kind:'change',data:true,n:0,t:'Sunday checkout: 1,140 departures',p:'Start 14 room attendants at 7 AM instead of 9 AM. Same hours, rooms ready by 3 PM.',when:'Sun 7 AM',
  opts:[['Move 14 start times to 7 AM','I\u2019ll ask each attendant to confirm the earlier start. Nobody\u2019s hours change.',1],['Keep the 9 AM start','About 210 rooms will not be ready for 3 PM check-in.',0]]}
];
const STATE={resolved:new Set(),filter:'all'};
/* MAP: which themed world each department uses ('none' = not on the map). Set by Resort setup. */
const MAP={};Object.keys(DEPTS).forEach(k=>MAP[k]=DEPTS[k].screen);
const on=k=>!!MAP[k]&&MAP[k]!=='none';
const isReq=m=>m.kind==='request';
const stOf=m=>(typeof REQ!=='undefined'&&REQ[m.id]&&REQ[m.id].st)||null;
const filledOf=m=>{const st=stOf(m);return st?st.assigned.reduce((a,c)=>a+c.n,0):0};
const isDone=id=>{const m=MISSIONS.find(x=>x.id===id);if(!m)return true;if(isReq(m)){const st=stOf(m);return !!st&&(st.status==='FILLED'||st.status==='UNABLE_TO_FILL')}return STATE.resolved.has(id)};
const vis=m=>!(m.data&&window.DM&&DM.roster);
const mlive=m=>on(m.d)&&vis(m)&&!isDone(m.id);
function openFor(d){return MISSIONS.filter(m=>m.d===d&&mlive(m)).reduce((a,m)=>a+Math.max(0,m.n-filledOf(m)),0)}
function issuesFor(d){return MISSIONS.filter(m=>m.d===d&&mlive(m)).length}
function totalOpen(){return MISSIONS.filter(mlive).reduce((a,m)=>a+Math.max(0,m.n-filledOf(m)),0)}
function coverage(){return Math.round((100-totalOpen()*0.27)*10)/10}
const TOTAL_NEEDED=911;
