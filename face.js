/* Coverage agent face: eyes + mouth. Blinks, follows the cursor, talks, smiles. */
(function(){
  var css='.face{position:absolute;inset:0;width:100%;height:100%;z-index:3;overflow:visible;pointer-events:none}'+
  '.face .eo ellipse{fill:#fff}.face .eo{transform-box:fill-box;transform-origin:center;animation:fBlink 5s infinite}'+
  '.face .eo ellipse.pu{fill:#1a0b4a}'+
  '.face .eh path,.face .ms{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round}'+
  '.face .eh{opacity:0;transition:opacity .2s}.face .eo{transition:opacity .2s}'+
  '.face .mt{fill:#1a0b4a;stroke:#fff;stroke-width:4;opacity:0;transform-box:fill-box;transform-origin:center}'+
  '.face .ms{transition:opacity .15s}.face .ck{fill:#ff8fc8;opacity:0;transition:opacity .3s}'+
  '.talk .face .ms{opacity:0}.talk .face .mt{opacity:1;animation:fTalk .18s ease-in-out infinite alternate}'+
  '.happy .face .eo{opacity:0}.happy .face .eh{opacity:1}.happy .face .ck{opacity:.55}'+
  '.happy .face .ms{d:path("M30 60 Q50 82 70 60")}'+
  '.face .eyes{transition:transform .25s ease-out}'+
  '@keyframes fBlink{0%,93%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}'+
  '@keyframes fTalk{from{transform:scaleY(.35)}to{transform:scaleY(1.1)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  window.agentFace=function(){return '<svg class="face" viewBox="0 0 100 100" aria-hidden="true">'+
    '<ellipse class="ck" cx="26" cy="60" rx="7" ry="4"/><ellipse class="ck" cx="74" cy="60" rx="7" ry="4"/>'+
    '<g class="eyes"><g class="eo"><ellipse cx="36" cy="42" rx="7.5" ry="10"/><ellipse cx="64" cy="42" rx="7.5" ry="10"/><ellipse class="pu" cx="37.5" cy="44" rx="3.2" ry="4"/><ellipse class="pu" cx="65.5" cy="44" rx="3.2" ry="4"/></g>'+
    '<g class="eh"><path d="M28 45 Q36 34 44 45"/><path d="M56 45 Q64 34 72 45"/></g></g>'+
    '<path class="ms" d="M36 62 Q50 74 64 62"/><ellipse class="mt" cx="50" cy="66" rx="8" ry="6.5"/></svg>'};
  function host(el){return el&&(el.closest('.faceHost')||el)}
  window.faceTalk=function(el,ms){el=host(el);if(!el)return;el.classList.add('talk');clearTimeout(el._ft);el._ft=setTimeout(function(){el.classList.remove('talk')},ms||1500)};
  window.faceHappy=function(el,ms){el=host(el);if(!el)return;el.classList.add('happy');clearTimeout(el._fh);el._fh=setTimeout(function(){el.classList.remove('happy')},ms||2200)};
  document.addEventListener('mousemove',function(e){
    document.querySelectorAll('.face .eyes').forEach(function(g){var r=g.ownerSVGElement.getBoundingClientRect();if(!r.width)return;
      var dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/300)*5;
      g.style.transform='translate('+(dx/d*k).toFixed(2)+'px,'+(dy/d*k*.7).toFixed(2)+'px)'})});
})();
