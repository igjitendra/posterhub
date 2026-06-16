'use strict';
const CFG = window.CONFIG;
let DATA = null, current = null, POOL = [], page = 1;
const PAGE_SIZE = 12;
let SESSION = loadSession();
let payPlan = null;
let _dataLoaded = false, _landingInit = false;
const IC = { wa:'🟢', fb:'f', ig:'◎', x:'𝕏' };
const PH_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#1b1c25"/><text x="50%" y="46%" fill="#5a5f6b" font-family="Arial" font-size="26" text-anchor="middle">PosterHub Pro</text><text x="50%" y="56%" fill="#3e424d" font-family="Arial" font-size="16" text-anchor="middle">image यहाँ आएगी</text></svg>');
function imgFallback(el){ el.onerror=null; el.src=PH_IMG; }

const $ = id => document.getElementById(id);
function toast(msg, ok){ const t=$('toast'); if(!t) return; t.textContent=msg; t.className='toast show '+(ok?'ok':'err'); clearTimeout(t._t); t._t=setTimeout(()=>{t.className='toast';},3600); }

/* ===================== SESSION (permanent login) ===================== */
function loadSession(){ try{ return JSON.parse(localStorage.getItem('ph_pro')||'null'); }catch(e){ return null; } }
function saveSession(s){ SESSION=s; try{ localStorage.setItem('ph_pro', JSON.stringify(s)); }catch(e){} updateAuthUI(); }
function clearSession(){ SESSION=null; try{ localStorage.removeItem('ph_pro'); }catch(e){} updateAuthUI(); }
function loggedIn(){ return !!(SESSION && SESSION.token); }
function isActive(){ if(!SESSION||SESSION.status!=='active'||!SESSION.expiry) return false; const e=new Date(SESSION.expiry); const t=new Date(); t.setHours(0,0,0,0); return e>=t; }
function planRank(){ if(!isActive()) return 0; const p=CFG.PLANS[SESSION.plan]; return p?p.rank:0; }
function planLabel(){ if(!isActive()) return null; const p=CFG.PLANS[SESSION.plan]; return p?p.name:null; }

/* ===================== API ===================== */
async function api(action, data){
  if(!CFG.API_URL || CFG.API_URL.indexOf('PASTE')===0) throw new Error('Backend अभी जुड़ा नहीं — config.js में Apps Script URL डालें।');
  const res = await fetch(CFG.API_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(Object.assign({action}, data||{})) });
  const txt = await res.text(); let j;
  try{ j=JSON.parse(txt); }catch(e){ throw new Error('Server से गलत जवाब आया।'); }
  if(!j.ok) throw new Error(j.error||'कुछ गड़बड़ हुई।');
  return j;
}

/* ===================== ROUTER ===================== */
const ROUTES = { '':'landing', '#':'landing', '#/':'landing', '#/home':'landing', '#/pricing':'pricing', '#/login':'login', '#/signup':'signup', '#/app':'app' };
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('show'));
  const el=$('view-'+name); if(el) el.classList.add('show');
  document.body.classList.toggle('in-app', name==='app');
  window.scrollTo(0,0);
}
function router(){
  const h = location.hash; let name = (ROUTES[h]!==undefined) ? ROUTES[h] : 'landing';
  showView(name);
  if(name==='app'){ ensureData(); }
  if(name==='pricing'){ renderPricing(); }
  if(name==='login' || name==='signup'){ /* forms ready in markup */ }
  if(name==='landing'){ initLanding(); }
  updateAuthUI();
  closeAllModals();
}
function navTo(h){ if(location.hash===h){ router(); } else { location.hash=h; } }
window.addEventListener('hashchange', router);

/* ===================== INIT ===================== */
async function init(){
  SESSION = loadSession();
  updateAuthUI();
  router();
  if(loggedIn()) refreshPlan();
}
async function ensureData(){
  if(_dataLoaded) return;
  try{
    if(window.POSTERS){ DATA = window.POSTERS; }                 // posters.js (no fetch needed — file:// + हर host पर चलता है)
    else { DATA = await (await fetch('posters.json')).json(); }   // fallback
    _dataLoaded = true;
    buildCats(); go('all');
    buildShowcase();
  }catch(e){
    const c=$('content'); if(c) c.innerHTML='<div class="empty">Posters load नहीं हुए — posters.js file साइट के साथ upload हुई है या नहीं चेक करें।</div>';
  }
}
// permanent login: कभी session clear नहीं करते — सिर्फ plan info refresh करते हैं
async function refreshPlan(){
  try{
    const j = await api('checkPlan',{email:SESSION.email, token:SESSION.token});
    saveSession(Object.assign({}, SESSION, {plan:j.plan, expiry:j.expiry, status:j.status, name:j.name, whatsapp:j.whatsapp||SESSION.whatsapp}));
    if(_dataLoaded) render();
  }catch(e){ /* network/expiry — फिर भी logged-in रखते हैं */ }
}

/* ===================== DATA HELPERS ===================== */
function item(p,c,s){ return { file:p.file, title:p.title||'Poster', folder:(s?s.folder:(c?c.folder:''))||p.folder, exclusive:!!p.exclusive, personalize:!!p.personalize, cat:c?c.label:'', sub:s?s.label:'' }; }
function allItems(){ let out=[];
  (DATA.categories||[]).forEach(c=>{ if(c.posters) c.posters.forEach(p=>out.push(item(p,c))); if(c.subs) c.subs.forEach(s=>(s.posters||[]).forEach(p=>out.push(item(p,c,s)))); });
  (DATA.premium||[]).forEach(p=>out.push(item(p,{label:'Premium',folder:p.folder||'assets/premium'})));
  return out;
}
function catItems(key){
  if(key==='all') return allItems();
  if(key==='premium') return (DATA.premium||[]).map(p=>item(p,{label:'Premium',folder:p.folder||'assets/premium'}));
  const c=(DATA.categories||[]).find(x=>x.key===key); if(!c) return [];
  let out=[]; if(c.posters) c.posters.forEach(p=>out.push(item(p,c))); if(c.subs) c.subs.forEach(s=>(s.posters||[]).forEach(p=>out.push(item(p,c,s)))); return out;
}
function canAccess(p){ const r=planRank(); if(p.exclusive) return r>=2; return r>=1; }
function absSrc(p){ return p.folder+'/'+p.file; }

/* ===================== CATS + DAILY ===================== */
function buildCats(){
  const cats=[{key:'all',label:'All',icon:'✨'}].concat((DATA.categories||[]).map(c=>({key:c.key,label:c.label,icon:c.icon}))).concat([{key:'premium',label:'Premium',icon:'👑'}]);
  $('cats').innerHTML=cats.map(c=>`<button class="cat" data-key="${c.key}" onclick="go('${c.key}')">${c.icon} ${c.label}</button>`).join('');
  buildDaily();
}
function buildDaily(){
  const cfg=DATA.daily, row=$('daily'); if(!cfg){ row.style.display='none'; return; }
  const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days=cfg.days||{}; let html=''; const today=new Date();
  for(let i=0;i<7;i++){
    const d=new Date(today); d.setDate(today.getDate()+i);
    const dd=('0'+d.getDate()).slice(-2), mm=('0'+(d.getMonth()+1)).slice(-2), key=dd+'-'+mm;
    const day=days[key], has=day&&day.posters&&day.posters.length, thumb=has?(cfg.base+'/'+key+'/'+day.posters[0].file):'';
    const lab=dd+' '+M[d.getMonth()];
    html+=`<div class="story ${has?'':'empty'} ${i===0?'today':''}" data-key="${key}" data-label="${lab}" onclick="openDailyDay(this)">`
      +`<div class="ring">${has?`<img src="${thumb}" alt="">`:'📷'}${has&&day.posters.length>1?`<span class="cnt">${day.posters.length}</span>`:''}</div>`
      +`<span class="dlab">${i===0?'आज':lab}</span></div>`;
  }
  row.innerHTML=html;
}
function openDailyDay(el){
  const key=el.dataset.key, label=el.dataset.label, cfg=DATA.daily, base=cfg.base||'assets/daily', day=(cfg.days||{})[key];
  document.querySelectorAll('.cat').forEach(c=>c.classList.remove('active'));
  $('subbar').style.display='none';
  const title='📅 '+label+(day&&day.label?' · '+day.label:'');
  POOL=(day&&day.posters)?day.posters.map(p=>({file:p.file,title:p.title||'Poster',folder:base+'/'+key,exclusive:false,personalize:false})):[];
  current={key:'__daily__',_dailyTitle:title}; page=1; render();
  $('content').scrollIntoView({behavior:'smooth',block:'start'});
}
function go(key, subKey){
  current={key, sub:subKey||null}; page=1;
  document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active', b.dataset.key===key));
  const cat=(DATA.categories||[]).find(c=>c.key===key), sub=$('subbar');
  if(cat&&cat.subs){ sub.style.display='flex'; sub.innerHTML=cat.subs.map(s=>`<button class="sub ${subKey===s.key?'active':''}" onclick="go('${key}','${s.key}')">${s.label}</button>`).join(''); }
  else sub.style.display='none';
  if(subKey&&cat){ const s=cat.subs.find(x=>x.key===subKey); POOL=(s&&s.posters?s.posters:[]).map(p=>item(p,cat,s)); }
  else POOL=catItems(key);
  render();
}
function onSearch(){ page=1; render(); }

/* ===================== RENDER ===================== */
function render(){
  if(!$('content')) return;
  const q=($('search').value||'').toLowerCase().trim();
  const items=q?POOL.filter(p=>(p.title||'').toLowerCase().includes(q)||(p.cat||'').toLowerCase().includes(q)):POOL;
  const c=$('content'); $('count').textContent=items.length+' posters';
  const head=(current&&current._dailyTitle)?`<div class="sec"><h2>${current._dailyTitle}</h2></div>`:'';
  if(!items.length){ c.innerHTML=head+'<div class="empty">😶 कोई poster नहीं मिला</div>'; $('pager').innerHTML=''; return; }
  const pages=Math.ceil(items.length/PAGE_SIZE); if(page>pages) page=pages;
  const slice=items.slice((page-1)*PAGE_SIZE,(page-1)*PAGE_SIZE+PAGE_SIZE);
  c.innerHTML=head+'<div class="gallery">'+slice.map((p,i)=>cardHTML(p,i)).join('')+'</div>';
  renderPager(pages);
}
function cardHTML(p,i){
  const src=absSrc(p), safe=src.replace(/'/g,"\\'"), jt=(p.title||'Poster').replace(/'/g,"\\'"), locked=!canAccess(p);
  const badge=p.exclusive?'<span class="tag excl">👑 Advance</span>':(p.personalize?'<span class="tag per">🎨 Personalize</span>':'');
  return `<div class="card" style="animation-delay:${(i*0.03).toFixed(2)}s">`
    +`<div class="imgwrap" onclick="openLb('${safe}','${jt}')">${badge}<img loading="lazy" src="${src}" onerror="imgFallback(this)" alt="${(p.title||'').replace(/"/g,'&quot;')}">${locked?'<div class="lock">🔒</div>':''}</div>`
    +`<div class="cbody"><h4>${p.title||'Poster'}</h4>`
    +`<button class="dl" onclick="dl('${safe}','${jt}',${p.exclusive?1:0})">⬇ Download</button>`
    +(p.personalize?`<button class="per-btn" onclick="openEditor('${safe}','${jt}')">🎨 अपनी फ़ोटो लगाएँ</button>`:'')
    +`<div class="share">`
    +`<button class="sh wa" onclick="shareTo('wa','${safe}')">${IC.wa}</button>`
    +`<button class="sh fb" onclick="shareTo('fb','${safe}')">${IC.fb}</button>`
    +`<button class="sh ig" onclick="shareTo('ig','${safe}')">${IC.ig}</button>`
    +`<button class="sh x" onclick="shareTo('x','${safe}')">${IC.x}</button>`
    +`</div></div></div>`;
}
function renderPager(pages){ if(pages<=1){ $('pager').innerHTML=''; return; } let h=''; for(let i=1;i<=pages;i++) h+=`<button class="pg ${i===page?'active':''}" onclick="gotoPage(${i})">${i}</button>`; $('pager').innerHTML=h; }
function gotoPage(p){ page=p; render(); window.scrollTo({top:$('content').offsetTop-70,behavior:'smooth'}); }

/* ===================== DOWNLOAD (top brand strip + clean poster) ===================== */
async function dl(src,title,exclusive){
  if(!loggedIn()){ toast('पहले login करें',false); navTo('#/login'); return; }
  const r=planRank();
  if(r<1){ toast('Download के लिए plan ज़रूरी है',false); navTo('#/pricing'); return; }
  if(exclusive&&r<2){ toast('यह poster सिर्फ Advance Plus में',false); navTo('#/pricing'); return; }
  try{ const img=await loadImg(src); const cv=buildPosterCanvas(img,{topText:CFG.PAYEE_NAME||CFG.BRAND}); downloadCanvas(cv,fileName(title)); toast('Download हो रहा है ✓',true); }
  catch(e){ toast('Download नहीं हुआ',false); }
}
function loadImg(src){ return new Promise((res,rej)=>{ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>res(im); im.onerror=()=>rej(new Error('img')); im.src=src; }); }
function downloadCanvas(cv,name){ cv.toBlob(b=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); },'image/jpeg',0.95); }
function fileName(t){ return ((t||'poster').replace(/[^\w\u0900-\u097F-]+/g,'_').slice(0,40)||'poster')+'.jpg'; }
function rr(ctx,x,y,w,h,r){ ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); }
function drawStrip(ctx,x,y,w,h,text,isTop){
  ctx.save(); ctx.fillStyle='#ffffff'; ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#e6e6e6'; if(isTop) ctx.fillRect(x,y+h-Math.max(h*0.04,2),w,Math.max(h*0.04,2)); else ctx.fillRect(x,y,w,Math.max(h*0.04,2));
  ctx.fillStyle=isTop?'#7b5cff':'#111'; ctx.font='bold '+Math.round(h*0.46)+'px Arial, "Noto Sans", sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text||'', x+w/2, y+h/2);
  ctx.restore();
}
function paintPhoto(ctx,p,scale,offY){
  const cx=p.x*scale, cy=p.y*scale+offY, s=p.size*scale;
  ctx.save(); ctx.beginPath();
  if(p.shape==='circle') ctx.arc(cx,cy,s/2,0,Math.PI*2); else rr(ctx,cx-s/2,cy-s/2,s,s,s*0.08);
  ctx.closePath(); ctx.clip();
  const iw=p.img.naturalWidth, ih=p.img.naturalHeight, k=Math.max(s/iw,s/ih), dw=iw*k, dh=ih*k;
  ctx.drawImage(p.img,cx-dw/2,cy-dh/2,dw,dh); ctx.restore();
  ctx.save(); ctx.lineWidth=Math.max(s*0.03,2); ctx.strokeStyle='#fff'; ctx.beginPath();
  if(p.shape==='circle') ctx.arc(cx,cy,s/2,0,Math.PI*2); else rr(ctx,cx-s/2,cy-s/2,s,s,s*0.08);
  ctx.stroke(); ctx.restore();
}
function buildPosterCanvas(img, opt){
  opt=opt||{}; const W=img.naturalWidth, H=img.naturalHeight;
  const topH=opt.topText?Math.round(W*0.085):0, botH=opt.bottomText?Math.round(W*0.085):0;
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H+topH+botH;
  const ctx=cv.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,cv.width,cv.height);
  if(topH) drawStrip(ctx,0,0,W,topH,opt.topText,true);
  ctx.drawImage(img,0,topH,W,H);
  if(opt.photo&&opt.photo.img) paintPhoto(ctx,opt.photo,1,topH);
  if(botH) drawStrip(ctx,0,topH+H,W,botH,opt.bottomText,false);
  return cv;
}

/* ===================== PERSONALIZE EDITOR (Advance Plus) ===================== */
let ed={poster:null,photo:{img:null,x:0,y:0,size:0,shape:'circle'},scale:1,title:'',_drag:false,_wired:false};
async function openEditor(src,title){
  if(!loggedIn()){ navTo('#/login'); return; }
  if(planRank()<2){ toast('Personalize सिर्फ Advance Plus में',false); navTo('#/pricing'); return; }
  let img; try{ img=await loadImg(src); }catch(e){ toast('Image load नहीं हुई',false); return; }
  ed.poster={img,w:img.naturalWidth,h:img.naturalHeight};
  ed.photo={img:null,x:img.naturalWidth/2,y:img.naturalHeight/2,size:Math.min(img.naturalWidth,img.naturalHeight)*0.34,shape:'circle'};
  ed.title=title;
  const cv=$('edCanvas'), dispW=Math.min(360, window.innerWidth-72);
  ed.scale=dispW/ed.poster.w; cv.width=Math.round(ed.poster.w*ed.scale); cv.height=Math.round(ed.poster.h*ed.scale);
  $('edZoom').value=34; $('edFile').value=''; edShape('circle'); edWire(cv); edRender();
  $('editor').classList.add('open');
}
function edWire(cv){
  if(ed._wired) return; ed._wired=true;
  cv.addEventListener('mousedown',edStart); cv.addEventListener('touchstart',edStart,{passive:false});
  document.addEventListener('mousemove',edMove); document.addEventListener('touchmove',edMove,{passive:false});
  document.addEventListener('mouseup',edEnd); document.addEventListener('touchend',edEnd);
}
function edRender(){ const cv=$('edCanvas'), ctx=cv.getContext('2d'); ctx.clearRect(0,0,cv.width,cv.height); ctx.drawImage(ed.poster.img,0,0,cv.width,cv.height); if(ed.photo.img) paintPhoto(ctx,ed.photo,ed.scale,0); }
function edPhoto(inp){ const f=inp.files&&inp.files[0]; if(!f) return; const im=new Image(); im.onload=()=>{ ed.photo.img=im; edRender(); }; im.src=URL.createObjectURL(f); }
function edPoint(e){ const cv=$('edCanvas'), r=cv.getBoundingClientRect(), pt=e.touches?e.touches[0]:e; return {x:(pt.clientX-r.left)/ed.scale, y:(pt.clientY-r.top)/ed.scale}; }
function edStart(e){ if(!$('editor').classList.contains('open')||!ed.photo.img) return; ed._drag=true; const p=edPoint(e); ed.photo.x=p.x; ed.photo.y=p.y; edRender(); if(e.preventDefault) e.preventDefault(); }
function edMove(e){ if(!ed._drag||!ed.photo.img) return; const p=edPoint(e); ed.photo.x=p.x; ed.photo.y=p.y; edRender(); if(e.preventDefault) e.preventDefault(); }
function edEnd(){ ed._drag=false; }
function edZoom(v){ if(!ed.photo.img) return; ed.photo.size=Math.min(ed.poster.w,ed.poster.h)*(v/100); edRender(); }
function edShape(sh){ ed.photo.shape=sh; document.querySelectorAll('.shape-btn').forEach(b=>b.classList.toggle('active',b.dataset.sh===sh)); edRender(); }
function edDownload(){
  if(!ed.photo.img){ toast('पहले अपनी फ़ोटो चुनें',false); return; }
  const name=(SESSION&&SESSION.name)?SESSION.name:'PosterHub';
  const cv=buildPosterCanvas(ed.poster.img,{photo:ed.photo,topText:CFG.PAYEE_NAME||CFG.BRAND,bottomText:name});
  downloadCanvas(cv,fileName(ed.title+'-my')); toast('Personalized poster download ✓',true);
}
function closeEditor(){ $('editor').classList.remove('open'); }

/* ===================== SHARE + LIGHTBOX ===================== */
function absUrl(src){ const base=CFG.SITE_URL||(location.origin+location.pathname.replace(/[^/]*$/,'')); return base+src; }
function shareTo(net,src){
  const url=absUrl(src), text=(DATA&&DATA.site&&DATA.site.shareText)||'PosterHub Pro'; let u='';
  if(net==='wa') u='https://wa.me/?text='+encodeURIComponent(text+' '+url);
  else if(net==='fb') u='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
  else if(net==='x') u='https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(url);
  else if(net==='ig'){ if(navigator.share){ navigator.share({title:'PosterHub',text,url}).catch(()=>{}); } else { try{ navigator.clipboard.writeText(url); }catch(e){} toast('Link copy हुआ — Instagram में paste करें',true); } return; }
  window.open(u,'_blank');
}
function openLb(src,title){ $('lbImg').src=src; $('lbCap').textContent=title||''; $('lb').classList.add('open'); }
function closeLb(){ $('lb').classList.remove('open'); }

/* ===================== AUTH (pages) ===================== */
function updateAuthUI(){
  const b=$('planBadge'), a=$('authBtn');
  if(b&&a){
    if(loggedIn()){ a.textContent='Logout'; a.onclick=doLogout; b.classList.remove('hidden');
      if(isActive()){ b.textContent='👑 '+planLabel(); b.className='badge active'; } else { b.textContent='Free'; b.className='badge'; }
    } else { a.textContent='Login'; a.onclick=()=>navTo('#/login'); b.classList.add('hidden'); }
  }
  // landing nav
  const nav=$('navAuth');
  if(nav){
    if(loggedIn()){ nav.innerHTML='<button class="nav-link" onclick="navTo(\'#/app\')">🖼️ Gallery</button><button class="nav-cta" onclick="doLogout()">Logout</button>'; }
    else{ nav.innerHTML='<button class="nav-link" onclick="navTo(\'#/login\')">Login</button><button class="nav-cta" onclick="navTo(\'#/signup\')">शुरू करें</button>'; }
  }
  const hi=$('helloUser'); if(hi){ hi.textContent = loggedIn()? ('👋 '+(SESSION.name||'')) : ''; }
}
function openAuth(){ navTo('#/login'); }
async function doSignup(){
  const name=($('suName').value||'').trim();
  const wa=($('suWa').value||'').replace(/[^0-9]/g,'');
  const email=($('suEmail').value||'').trim().toLowerCase();
  const pw=$('suPw').value||'';
  if(!name){ toast('अपना नाम डालें',false); return; }
  if(wa.length<10){ toast('सही WhatsApp number डालें (10 अंक)',false); return; }
  if(!email||email.indexOf('@')<0){ toast('सही email डालें',false); return; }
  if(pw.length<4){ toast('Password कम से कम 4 अक्षर',false); return; }
  const btn=$('suBtn'); if(btn){ btn.disabled=true; btn.textContent='एक पल...'; }
  try{
    const j=await api('signup',{name,email,password:pw,whatsapp:wa});
    saveSession({email,token:j.token,name,whatsapp:wa,plan:j.plan,expiry:j.expiry,status:j.status});
    toast('Account बन गया ✓',true); navTo('#/pricing');
  }catch(e){ toast(e.message,false); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='✨ Account बनाएँ'; } }
}
async function doLogin(){
  const email=($('liEmail').value||'').trim().toLowerCase(), pw=$('liPw').value||'';
  if(!email||!pw){ toast('email और password डालें',false); return; }
  const btn=$('liBtn'); if(btn){ btn.disabled=true; btn.textContent='एक पल...'; }
  try{
    const j=await api('login',{email,password:pw});
    saveSession({email,token:j.token,name:j.name,whatsapp:j.whatsapp,plan:j.plan,expiry:j.expiry,status:j.status});
    toast('Login हो गया ✓',true); navTo('#/app');
  }catch(e){ toast(e.message,false); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Login'; } }
}
function doLogout(){ clearSession(); if(_dataLoaded) render(); toast('Logout हो गए',true); navTo('#/home'); }

/* ===================== PRICING + PAY ===================== */
function renderPricing(){
  const badge=$('curPlanNote'); if(!badge) return;
  if(loggedIn() && isActive()) badge.textContent='आपका मौजूदा plan: '+planLabel()+(SESSION.expiry?(' (तक '+SESSION.expiry+')'):'');
  else badge.textContent='';
}
function choosePlan(id){
  if(!loggedIn()){ toast('पहले account बनाएँ',true); navTo('#/signup'); return; }
  openPay(id);
}
function openPay(id){
  payPlan=CFG.PLANS[id]; if(!payPlan) return;
  const note='PosterHubPro-'+payPlan.id+'-'+(SESSION?SESSION.email:'');
  const link='upi://pay?pa='+encodeURIComponent(CFG.UPI_ID)+'&pn='+encodeURIComponent(CFG.PAYEE_NAME)+'&am='+payPlan.price+'&cu=INR&tn='+encodeURIComponent(note);
  $('payTitle').textContent=payPlan.name+' — ₹'+payPlan.price+'/month';
  $('payQR').src='https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(link);
  $('payUpi').textContent=CFG.UPI_ID; $('payLink').href=link; $('payTxn').value='';
  $('pay').classList.add('open');
}
async function submitPayment(){
  const txn=$('payTxn').value.trim();
  if(txn.length<6){ toast('सही UPI Transaction / UTR ID डालें',false); return; }
  try{ await api('submitPayment',{email:SESSION.email,token:SESSION.token,plan:payPlan.id,amount:payPlan.price,txn});
    closeModal('pay'); toast('Payment मिल गया — verify होते ही plan active होगा ✓',true);
  }catch(e){ toast(e.message,false); }
}
function closeModal(id){ const m=$(id); if(m) m.classList.remove('open'); }
function closeAllModals(){ ['pay','editor','lb'].forEach(id=>{ const m=$(id); if(m) m.classList.remove('open'); }); }

/* ===================== LANDING animations ===================== */
function initLanding(){
  if(_landingInit) return; _landingInit=true;
  // reveal on scroll
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver((es)=>{ es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); },{threshold:0.14});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
    // count up
    const cio=new IntersectionObserver((es)=>{ es.forEach(en=>{ if(en.isIntersecting){ countUp(en.target); cio.unobserve(en.target); } }); },{threshold:0.5});
    document.querySelectorAll('.statnum').forEach(el=>cio.observe(el));
  } else { document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in')); }
  ensureData(); // so showcase fills when ready
}
function countUp(el){
  const target=parseInt(el.dataset.to||'0',10), suf=el.dataset.suf||''; let n=0; const step=Math.max(1,Math.round(target/40));
  const t=setInterval(()=>{ n+=step; if(n>=target){ n=target; clearInterval(t); } el.textContent=n.toLocaleString('en-IN')+suf; },28);
}
function buildShowcase(){
  const row=$('showcase'); if(!row||!DATA) return;
  let pics=allItems(); if(!pics.length) return;
  pics=pics.concat(pics); // loop
  row.innerHTML=pics.slice(0,18).map(p=>`<div class="sc-card"><img loading="lazy" src="${absSrc(p)}" onerror="imgFallback(this)" alt=""></div>`).join('');
}

/* ===================== global ===================== */
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeAllModals(); } });
window.addEventListener('DOMContentLoaded', init);
