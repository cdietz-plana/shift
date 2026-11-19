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
 {id:'sec',d:'sec',kind:'proposal',n:8,t:'Arena entry is 8 officers short',p:'5 internal officers on overtime within the 12 hr limit, plus 3 contract officers from the approved vendor.',when:'Sat 4 PM – 1 AM',moves:[['sec','sec',5],['vendor','sec',3]]},
 {id:'valet',d:'valet',kind:'proposal',n:6,t:'Valet needs 6 more attendants',p:'4 bell staff from the Front Office with valet clearance, plus 2 on-call shifts.',when:'Sat 5 PM – 12 AM',moves:[['front','valet',4],['valet','valet',2]]},
 {id:'front',d:'front',kind:'proposal',n:3,t:'Front desk is short for the arrival wave',p:'Shift 2 concierge agents to the desk and borrow 1 Players Club rep who knows the system.',when:'Sat 2 PM – 6 PM',moves:[['front','front',2],['mkt','front',1]]},
 {id:'evs',d:'evs',kind:'proposal',n:4,t:'Arena teardown crew is 4 short',p:'Offer the overnight teardown to 4 house porters from Housekeeping who are under weekly hours.',when:'Sun 12 AM – 4 AM',moves:[['hk','evs',4]]},
 {id:'casino',d:'casino',kind:'proposal',n:2,t:'High Limit Baccarat: 2 open tables tonight',p:'Riley Chen and Morgan Reyes. Both certified, free, no overtime. Run it from the casino floor.',when:'Tonight 8 PM – 4 AM',moves:[['casino','casino',2]]},
 {id:'steak',d:'steak',kind:'proposal',n:2,t:'Ember & Oak needs 2 servers',p:'Jane Doe from the Front Desk (cross-trained, food handler card current) and Sam Patel from The Market.',when:'Sat 5 PM – 11 PM',moves:[['front','steak',1],['market','steak',1]]},
 {id:'mkt',d:'mkt',kind:'proposal',n:2,t:'VIP check-in needs 2 hosts',p:'2 casino hosts who already know the VIP list. Back on the floor by 7 PM.',when:'Sat 3 PM – 7 PM',moves:[['casino','mkt',2]]},
 {id:'shop',d:'shop',kind:'proposal',n:1,t:'Resort Shop is 1 associate short',p:'Extend Mia Lopez by 2 hours. Stays under 10 hrs for the day.',when:'Sat 6 PM – 10 PM',moves:[['shop','shop',1]]},
 {id:'slots',d:'slots',kind:'conflict',n:0,t:'Drew Singh is double-booked',p:'On-call slot tech and grounds event setup at the same time. Keep the on-call shift, give setup to Avery Kim.',when:'Sat 3 PM – 7 PM',moves:[['grounds','grounds',1]]},
 {id:'appr',d:'valet',kind:'approval',n:0,t:'Approve a $75 valet bonus',p:'Taylor Brooks, Bell & Valet manager, requested a shift bonus for fight night. Needs a second manager.',when:'Sat',moves:[]},
 {id:'hk',d:'hk',kind:'proposal',n:0,t:'Sunday checkout: 1,140 departures',p:'Start 14 room attendants at 7 AM instead of 9 AM. No extra hours, rooms ready by 3 PM check-in.',when:'Sun 7 AM',moves:[['hk','hk',3]]}
];
const STATE={resolved:new Set(),filter:'all'};
function openFor(d){return MISSIONS.filter(m=>m.d===d&&!STATE.resolved.has(m.id)).reduce((a,m)=>a+m.n,0)}
function issuesFor(d){return MISSIONS.filter(m=>m.d===d&&!STATE.resolved.has(m.id)).length}
function totalOpen(){return MISSIONS.filter(m=>!STATE.resolved.has(m.id)).reduce((a,m)=>a+m.n,0)}
function coverage(){return Math.round((100-totalOpen()*0.27)*10)/10}
const TOTAL_NEEDED=911;
