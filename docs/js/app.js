(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ic=n=>`<svg class="ic"><use href="#i-${n}"/></svg>`;
const L={
en:{new:"New chat",search:"Search chats",settings:"Settings",ph:"Ask about Islam, in any language…",note:"Hikma AI can make mistakes. For rulings, consult your marja.",hello:"Ask anything. Hikma answers from the Ahlul Bayt tradition.",untitled:"New chat",copy:"Copy",retry:"Try again",stop:"Stop",err:"Hikma AI is unavailable right now. Check that the server and Ollama are running, then try again.",empty:"No chats yet",theme:"Theme",size:"Text size",ui:"Language",marja:"My marja",style:"Answer style",data:"Your chats",export:"Export",wipe:"Delete all",sure:"Delete all chats from this browser?"},
ar:{new:"محادثة جديدة",search:"ابحث في المحادثات",settings:"الإعدادات",ph:"اسأل عن الإسلام بأي لغة…",note:"قد يخطئ حكمة AI. للأحكام الشرعية، راجع مرجعك.",hello:"اسأل ما شئت. يجيب حكمة من تراث أهل البيت (ع).",untitled:"محادثة جديدة",copy:"نسخ",retry:"أعد المحاولة",stop:"إيقاف",err:"حكمة AI غير متاح الآن. تأكد من تشغيل الخادم وOllama ثم أعد المحاولة.",empty:"لا توجد محادثات",theme:"المظهر",size:"حجم الخط",ui:"اللغة",marja:"مرجعي",style:"أسلوب الإجابة",data:"محادثاتك",export:"تصدير",wipe:"حذف الكل",sure:"حذف كل المحادثات من هذا المتصفح؟"}};
const SCH=[
["theme",[["system","Auto"],["light","Light"],["dark","Dark"]]],
["size",[["s","S"],["m","M"],["l","L"]]],
["ui",[["en","English"],["ar","العربية"]]],
["marja",[["","—"],["Sistani","Sistani"],["Khamenei","Khamenei"],["Makarem Shirazi","Makarem Shirazi"]]],
["temp",[["0.2","Precise"],["0.4","Balanced"],["0.7","Creative"]],"style"]];
const IDEAS=["Explain the significance of Ashura and how Shia Muslims observe it","ما هي واجبات الصلاة؟ مع الأدلة","Summarize Imam Ali's letter to Malik al-Ashtar on governance","Translate the opening of Dua Kumayl into Urdu and explain it"];

let S=null;try{S=JSON.parse(localStorage.getItem("hikma")||"null")}catch{}
S=S||{c:[],cur:null,s:{theme:"system",size:"m",ui:"en",marja:"",temp:"0.4"}};
const save=()=>{try{localStorage.setItem("hikma",JSON.stringify(S))}catch{}};
const t=k=>(L[S.s.ui]||L.en)[k]||L.en[k]||k;
let busy=false,ctl=null;
const cur=()=>S.c.find(c=>c.id===S.cur);

const inl=s=>s.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/(^|\W)\*([^*\n]+)\*/g,"$1<em>$2</em>").replace(/[\u0600-\u06FF][\u0600-\u06FF\u064B-\u065F\s]*[\u0600-\u06FF]|[\u0600-\u06FF]/g,m=>`<span class="ar">${m}</span>`);
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const li=/^\s*([-*•]|\d+[.)]) /;
function md(x){return x.split(/\n{2,}/).map(b=>{b=esc(b.trim());if(!b)return"";
 const ls=b.split("\n");
 if(ls.every(l=>li.test(l))){const o=/^\s*\d/.test(b)?"ol":"ul";return`<${o}>`+ls.map(l=>`<li>${inl(l.replace(li,""))}</li>`).join("")+`</${o}>`}
 const h=b.match(/^#{1,4} (.*)/);if(h)return`<h4>${inl(h[1])}</h4>`;
 return`<p>${inl(b).replace(/\n/g,"<br>")}</p>`}).join("")}
function paint(el,x){el.innerHTML=md(x);el.querySelectorAll("p,li,h4").forEach(n=>n.dir="auto")}

function apply(){const d=document.documentElement,s=S.s;
 d.lang=s.ui;d.dir=s.ui==="ar"?"rtl":"ltr";d.dataset.size=s.size;
 d.dataset.theme=s.theme==="system"?(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"):s.theme;
 $$("[data-t]").forEach(e=>e.textContent=t(e.dataset.t));
 $$("[data-p]").forEach(e=>e.placeholder=t(e.dataset.p));
 $("#ideas").innerHTML=IDEAS.map(i=>`<button type="button">${ic("chat")}<span dir="auto">${i}</span></button>`).join("");
 $$("#ideas button").forEach((b,i)=>b.onclick=()=>send(IDEAS[i]));
 renderList();renderMsgs();}

function renderList(){const q=$("#q").value.trim().toLowerCase();
 const cs=S.c.filter(c=>c.title.toLowerCase().includes(q)).sort((a,b)=>b.u-a.u);
 $("#list").innerHTML=cs.length?"":`<div class="empty">${t("empty")}</div>`;
 cs.forEach(c=>{const r=document.createElement("div");r.className="it"+(c.id===S.cur?" on":"");
  r.innerHTML=`<button class="t" dir="auto"></button><button class="del ib" aria-label="Delete">${ic("trash")}</button>`;
  r.querySelector(".t").textContent=c.title;
  r.querySelector(".t").onclick=()=>{if(busy)return;S.cur=c.id;save();renderList();renderMsgs();closeSide()};
  r.querySelector(".del").onclick=()=>{if(busy)return;S.c=S.c.filter(x=>x!==c);if(S.cur===c.id)S.cur=null;save();renderList();renderMsgs()};
  $("#list").append(r)})}

function renderMsgs(){const c=cur(),box=$("#msgs");box.innerHTML="";
 $("#welcome").hidden=!!(c&&c.m.length);$("#title").textContent=c?c.title:"";
 if(!c)return;
 c.m.forEach((m,i)=>{const e=document.createElement("div");
  if(m.r==="user"){e.className="m u";const b=document.createElement("div");b.className="b";b.dir="auto";b.textContent=m.t;e.append(b)}
  else{e.className="m a";e.innerHTML=`<img class="logo av" src="emblem.svg" alt=""><div><div class="body"></div><div class="acts"></div></div>`;
   paint(e.querySelector(".body"),m.t);
   if(!(busy&&i===c.m.length-1)){const a=e.querySelector(".acts");
    a.innerHTML=`<button class="ib cp" title="${t("copy")}" aria-label="${t("copy")}">${ic("copy")}</button>`+(i===c.m.length-1?`<button class="ib rt" title="${t("retry")}" aria-label="${t("retry")}">${ic("retry")}</button>`:"");
    a.querySelector(".cp").onclick=async ev=>{const b=ev.currentTarget;try{await navigator.clipboard.writeText(m.t);b.innerHTML=ic("check");setTimeout(()=>b.innerHTML=ic("copy"),1200)}catch{}};
    const rt=a.querySelector(".rt");if(rt)rt.onclick=()=>{c.m.pop();save();renderMsgs();run(c)}}}
  box.append(e)});
 down()}
const down=()=>{const s=$("#scroll");s.scrollTop=s.scrollHeight};

async function send(text){text=(text||"").trim();if(busy||!text)return;
 let c=cur();if(!c){c={id:Date.now().toString(36),title:text.slice(0,48),m:[],u:Date.now()};S.c.unshift(c);S.cur=c.id}
 c.m.push({r:"user",t:text});c.u=Date.now();save();renderList();run(c)}

async function run(c){const bot={r:"assistant",t:""};c.m.push(bot);busy=true;ctl=new AbortController();mode();renderMsgs();
 const body=$$("#msgs .body").at(-1);body.classList.add("live");
 try{const r=await fetch((window.HIKMA_API||"")+"/chat",{method:"POST",headers:{"Content-Type":"application/json"},signal:ctl.signal,
   body:JSON.stringify({messages:c.m.filter(m=>m!==bot&&!m.e).map(m=>({role:m.r,content:m.t})),settings:{marja:S.s.marja,temperature:+S.s.temp}})});
  if(!r.ok||!r.body)throw new Error(r.status===429?"429":"x");
  const rd=r.body.getReader(),dc=new TextDecoder();
  for(;;){const{done,value}=await rd.read();if(done)break;bot.t+=dc.decode(value,{stream:true});paint(body,bot.t);down()}
 }catch(e){if(e.name!=="AbortError"){bot.e=1;bot.t=(bot.t?bot.t+"\n\n":"")+t("err")}}
 if(!bot.t.trim()){c.m.pop()}
 busy=false;ctl=null;save();mode();renderMsgs()}

function mode(){const b=$("#send");b.innerHTML=ic(busy?"stop":"send");b.setAttribute("aria-label",busy?t("stop"):"Send");b.disabled=!busy&&!$("#in").value.trim()}

const inp=$("#in");
inp.addEventListener("input",()=>{inp.style.height="auto";inp.style.height=Math.min(inp.scrollHeight,200)+"px";mode()});
inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();$("#form").requestSubmit()}});
$("#form").addEventListener("submit",e=>{e.preventDefault();if(busy){ctl&&ctl.abort();return}
 const v=inp.value;inp.value="";inp.style.height="auto";send(v)});
$("#q").addEventListener("input",renderList);

const side=$("#side"),scrim=$("#scrim");
const openSide=()=>{side.classList.add("open");scrim.classList.add("on")};
function closeSide(){side.classList.remove("open");scrim.classList.remove("on")}
$("#menu").onclick=openSide;$("#closeSide").onclick=closeSide;scrim.onclick=closeSide;
function newChat(){if(busy)return;S.cur=null;save();renderList();renderMsgs();inp.focus();closeSide()}
$("#new").onclick=newChat;
addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();newChat()}});

const dlg=$("#dlg");
function buildSettings(){const sb=$("#sb");sb.innerHTML="";
 SCH.forEach(([k,opts,lab])=>{const r=document.createElement("div");r.className="row";
  r.innerHTML=`<span>${t(lab||k)}</span><div class="seg"></div>`;const g=r.querySelector(".seg");
  opts.forEach(([v,n])=>{const b=document.createElement("button");b.type="button";b.textContent=n;if(S.s[k]===v)b.className="on";
   b.onclick=()=>{S.s[k]=v;save();apply();buildSettings()};g.append(b)});sb.append(r)});
 const d=document.createElement("div");d.className="row";
 d.innerHTML=`<span>${t("data")}</span><div class="seg" style="border:0"><button class="go" id="exp">${ic("down")}${t("export")}</button><button class="go danger" id="wipe">${ic("trash")}${t("wipe")}</button></div>`;
 sb.append(d);
 $("#exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S.c,null,2)],{type:"application/json"}));a.download="hikma-chats.json";a.click();URL.revokeObjectURL(a.href)};
 $("#wipe").onclick=()=>{if(confirm(t("sure"))){S.c=[];S.cur=null;save();renderList();renderMsgs()}}}
$("#openSet").onclick=()=>{buildSettings();dlg.showModal();closeSide()};
$("#closeSet").onclick=()=>dlg.close();
dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
matchMedia("(prefers-color-scheme:dark)").addEventListener("change",()=>S.s.theme==="system"&&apply());

apply();mode();
})();
