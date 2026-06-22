const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HOME_FILE = path.join(__dirname, '..', 'ColorFiind_V14_SEO_Backend_Home.html');
const SITE_URL = process.env.SITE_URL || 'https://your-vercel-domain.vercel.app';

/* Preview-only memory likes. For real hosting use database/KV. */
const globalMemory = globalThis.__COLORFIIND_PREVIEW__ || { likes:{}, likedBy:{} };
globalThis.__COLORFIIND_PREVIEW__ = globalMemory;

function esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function jsonEsc(v){return JSON.stringify(v).replace(/</g,'\\u003c')}
function readHome(){return fs.readFileSync(HOME_FILE,'utf8')}

let cached;
function loadPalettes(){
  if(cached) return cached;
  const html = readHome();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const start = script.indexOf('/* ==========================================\nCOLORFIIND V12');
  const end = script.indexOf('/* APP STATE */');
  const engine = script.slice(start,end) + '\n;globalThis.__palettes=palettes;globalThis.__categories=categories;';
  const sandbox = { console:{log(){},warn(){}} };
  vm.createContext(sandbox);
  vm.runInContext(engine,sandbox,{timeout:12000});
  cached = { palettes:sandbox.__palettes || [], categories:sandbox.__categories || [] };
  return cached;
}

function send(res,status,body,type='text/html; charset=utf-8'){
  res.statusCode = status;
  res.setHeader('Content-Type',type);
  res.end(body);
}
function sendJson(res,status,data){send(res,status,JSON.stringify(data),'application/json; charset=utf-8')}
function getBody(req){return new Promise(resolve=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{try{resolve(JSON.parse(body||'{}'))}catch(e){resolve({})}})})}
function paletteUrl(slug){return `${SITE_URL.replace(/\/$/,'')}/palette/${encodeURIComponent(slug)}`}

function css(){return `
:root{--bg:#fff;--card:#fff;--text:#111;--muted:#777;--border:#ececec;--hover:#f7f7f7;--active:#efefef}[data-theme="dark"]{--bg:#111;--card:#1b1b1b;--text:#fff;--muted:#a1a1a1;--border:#2b2b2b;--hover:#222;--active:#2c2c2c}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden}a{text-decoration:none;color:inherit}.sidebar{position:fixed;left:0;top:0;width:250px;height:100vh;background:var(--card);border-right:1px solid var(--border);padding:24px;overflow:auto}.logo{font-size:30px;font-weight:800;margin-bottom:16px;display:block}.theme-toggle{display:flex;justify-content:center;padding:12px;background:var(--hover);border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;margin-bottom:22px}.nav{display:flex;flex-direction:column;gap:6px}.nav-item{padding:14px 16px;border-radius:14px;color:var(--muted)}.nav-item:hover,.nav-item.active{background:var(--active);color:var(--text)}.divider{height:1px;background:var(--border);margin:20px 0}.category{display:block;padding:10px 0;font-size:14px;color:var(--muted)}.category.active,.category:hover{color:var(--text);font-weight:600}.main{margin-left:250px;padding:24px;max-width:1450px}.breadcrumb{font-size:14px;color:var(--muted);margin-bottom:18px}.detail-layout{display:grid;grid-template-columns:minmax(320px,1.1fr) minmax(300px,.9fr);gap:36px}.large-palette{height:520px;border-radius:24px;overflow:hidden;display:grid;grid-template-columns:repeat(4,1fr)}.color{display:flex;align-items:center;justify-content:center}.color span{opacity:0;color:#fff;mix-blend-mode:difference;font-weight:800}.color:hover span{opacity:1}h1{font-size:44px;line-height:1.05;margin-bottom:12px;letter-spacing:-1.5px}.subtitle{font-size:16px;color:var(--muted);line-height:1.7;margin-bottom:22px}.actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:26px}.action{border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:999px;padding:12px 14px;cursor:pointer;font-weight:700}.active svg{fill:currentColor}.icon{width:18px;height:18px;stroke:currentColor;stroke-width:2;fill:none}.colors-list{display:grid;gap:12px}.color-row{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);border-radius:16px;padding:12px}.swatch{display:flex;align-items:center;gap:12px;font-weight:800}.dot{width:38px;height:38px;border-radius:12px}.copy-small{cursor:pointer;color:var(--muted);font-weight:700}.section-title{font-size:22px;margin:28px 0 16px}.ad-slot{grid-column:1/-1;min-height:92px;border:1px dashed var(--border);border-radius:18px;background:linear-gradient(135deg,var(--hover),var(--card));color:var(--muted);display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;font-weight:700;margin:24px 0}.copy-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#111;color:#fff;padding:12px 16px;border-radius:999px;font-size:14px;font-weight:700;box-shadow:0 12px 40px rgba(0,0,0,.22);z-index:2000;opacity:0;pointer-events:none;transition:.25s}.copy-toast.show{opacity:1;transform:translate(-50%,0)}.related-grid,.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.related-palette,.cat-palette{height:190px;border-radius:18px;overflow:hidden;display:grid;grid-template-columns:repeat(4,1fr)}.related-name,.cat-name{font-size:14px;font-weight:700;margin-top:10px}.mobile-toggle{display:none}@media(max-width:1000px){.sidebar{display:none}.main{margin-left:0}.detail-layout{grid-template-columns:1fr}.related-grid,.category-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){h1{font-size:34px}.large-palette{height:330px}.related-grid,.category-grid{grid-template-columns:1fr}}
`}

function sidebar(categories,active){return `<div class="sidebar"><a href="/" class="logo">ColorFiind</a><div class="theme-toggle" onclick="toggleTheme()">🌙 Dark Mode</div><div class="nav"><a class="nav-item" href="/">✦ New</a><a class="nav-item" href="/">◉ Popular</a><a class="nav-item" href="/">◎ Random</a><a class="nav-item" href="/collection">♥ Collection</a></div><div class="divider"></div><a class="category ${!active?'active':''}" href="/">All</a>${categories.map(c=>`<a class="category ${active===c?'active':''}" href="/category/${c.toLowerCase()}">${esc(c)}</a>`).join('')}</div>`}
function pageScript(slug){return `<script>
const L='colorfiind-liked-palettes',V='colorfiind-visitor-id';function id(){let x=localStorage.getItem(V);if(!x){x='v-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);localStorage.setItem(V,x)}return x}function liked(){return JSON.parse(localStorage.getItem(L)||'[]')}function save(a){localStorage.setItem(L,JSON.stringify(a))}function mark(){const b=document.getElementById('likeBtn');if(b&&liked().includes('${slug}'))b.classList.add('active')}async function likePalette(s){let a=liked();const c=document.getElementById('likeCount');if(a.includes(s)){a=a.filter(x=>x!==s);save(a);document.getElementById('likeBtn').classList.remove('active');c.textContent=String(Math.max(0,Number(c.textContent||0)-1));try{const r=await fetch('/api/likes/'+encodeURIComponent(s),{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:id()})});const d=await r.json();if(d.count!==undefined)c.textContent=d.count}catch(e){}return;}a.push(s);save(a);mark();c.textContent=String(Number(c.textContent||0)+1);try{const r=await fetch('/api/likes/'+encodeURIComponent(s),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:id()})});const d=await r.json();if(d.count!==undefined)c.textContent=d.count}catch(e){}}
async function copyText(t,el){try{await navigator.clipboard.writeText(t)}catch(e){}let toast=document.getElementById('copyToast');if(toast){toast.textContent='Copied';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1500)}const o=el.innerHTML;el.innerHTML='✓ Copied';setTimeout(()=>el.innerHTML=o,1200)}function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme');if(cur==='dark'){document.documentElement.removeAttribute('data-theme');localStorage.setItem('theme','light')}else{document.documentElement.setAttribute('data-theme','dark');localStorage.setItem('theme','dark')}}if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark');mark();</script>`}

function renderPalette(palette,categories,palettes){
  const likeCount = Number(globalMemory.likes[palette.slug] || 0);
  const title = `${palette.name} Color Palette - ColorFiind`;
  const desc = `${palette.name} color palette with HEX codes ${palette.colors.join(', ')}. Copy and share this ${palette.category.toLowerCase()} palette.`;
  const related = palettes.filter(p=>p.category===palette.category && p.slug!==palette.slug).slice(0,8);
  const jsonLd = {'@context':'https://schema.org','@type':'CreativeWork',name:title,description:desc,url:paletteUrl(palette.slug),keywords:['color palette',palette.category,...palette.colors].join(', ')};
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(paletteUrl(palette.slug))}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(palette.colors.join(' · '))}"><script type="application/ld+json">${jsonEsc(jsonLd)}</script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${css()}</style></head><body>${sidebar(categories,palette.category)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › <a href="/category/${palette.category.toLowerCase()}">${esc(palette.category)}</a> › ${esc(palette.name)}</nav><div class="detail-layout"><section><div class="large-palette">${palette.colors.map(c=>`<div class="color" style="background:${c}"><span>${c}</span></div>`).join('')}</div></section><section><h1>${esc(palette.name)}</h1><p class="subtitle">${esc(desc)}</p><div class="actions"><button class="action" id="likeBtn" onclick="likePalette('${palette.slug}')">♥ <span id="likeCount">${likeCount}</span></button><button class="action" onclick="copyText(location.href,this)">Share</button><button class="action" onclick="copyText('${palette.colors.join('\\n')}',this)">Copy Palette</button></div><div class="colors-list">${palette.colors.map(c=>`<div class="color-row"><div class="swatch"><span class="dot" style="background:${c}"></span>${c}</div><span class="copy-small" onclick="copyText('${c}',this)">Copy</span></div>`).join('')}</div></section></div><div class="ad-slot">Advertisement Space — palette detail page banner</div><h2 class="section-title">Related ${esc(palette.category)} Palettes</h2><div class="related-grid">${related.map(p=>`<a href="/palette/${p.slug}"><div class="related-palette">${p.colors.map(c=>`<div style="background:${c}"></div>`).join('')}</div><div class="related-name">${esc(p.name)}</div></a>`).join('')}</div></main><div class="copy-toast" id="copyToast">Copied</div>${pageScript(palette.slug)}</body></html>`;
}

function renderCategory(category,categories,palettes){
  const items = palettes.filter(p=>p.category===category).slice(0,120);
  const desc = `Explore ${category.toLowerCase()} color palettes with HEX codes for websites, UI design, branding, and creative inspiration.`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(category)} Color Palettes - ColorFiind</title><meta name="description" content="${esc(desc)}"><style>${css()}</style></head><body>${sidebar(categories,category)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › ${esc(category)}</nav><h1>${esc(category)} Color Palettes</h1><p class="subtitle">${esc(desc)}</p><div class="ad-slot">Advertisement Space — category page banner</div><div class="category-grid">${items.map(p=>`<a href="/palette/${p.slug}"><div class="cat-palette">${p.colors.map(c=>`<div style="background:${c}"></div>`).join('')}</div><div class="cat-name">${esc(p.name)}</div></a>`).join('')}</div></main>${pageScript('')}</body></html>`;
}


function renderCollection(categories){
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Color Palette Collection - ColorFiind</title><meta name="description" content="View your liked color palettes and saved ColorFiind collection."><style>${css()}</style></head><body>${sidebar(categories,null)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › Collection</nav><h1>Your Collection</h1><p class="subtitle">Palettes you liked are saved in this browser. Global like counts still come from the API.</p><div class="ad-slot">Advertisement Space — collection page banner</div><div class="category-grid" id="collectionGrid"></div></main><script>
const L='colorfiind-liked-palettes';
const liked=JSON.parse(localStorage.getItem(L)||'[]');
const grid=document.getElementById('collectionGrid');
function card(p){return '<a href="/palette/'+p.slug+'"><div class="cat-palette">'+p.colors.map(c=>'<div style="background:'+c+'"></div>').join('')+'</div><div class="cat-name">'+p.name+'</div></a>'}
fetch('/api/palettes').then(r=>r.json()).then(data=>{const items=data.filter(p=>liked.includes(p.slug));grid.innerHTML=items.length?items.map(card).join(''):'<p class="subtitle">No liked palettes yet. Go back to the homepage and click the heart icon to build your collection.</p>'});
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme');if(cur==='dark'){document.documentElement.removeAttribute('data-theme');localStorage.setItem('theme','light')}else{document.documentElement.setAttribute('data-theme','dark');localStorage.setItem('theme','dark')}}if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark');
</script></body></html>`;
}

module.exports = async function handler(req,res){
  const {palettes,categories} = loadPalettes();
  const url = new URL(req.url,'http://localhost');
  let route = url.searchParams.get('path');
  if(route === null) route = url.pathname.replace(/^\//,'');
  route = route.replace(/^\//,'').replace(/\/$/,'');

  if(req.method === 'GET' && (route === '' || route === 'index.html')) return send(res,200,readHome());
  if(req.method === 'GET' && route === 'api/likes') return sendJson(res,200,globalMemory.likes);
  if(req.method === 'GET' && route === 'api/palettes') return sendJson(res,200,palettes.map(p=>({...p,likes:Number(globalMemory.likes[p.slug] || 0)})));
  if(req.method === 'GET' && route === 'collection') return send(res,200,renderCollection(categories));
  if((req.method === 'POST' || req.method === 'DELETE') && route.startsWith('api/likes/')){
    const slug = decodeURIComponent(route.replace('api/likes/',''));
    const body = await getBody(req);
    const visitorId = String(body.visitorId || '').trim();
    globalMemory.likedBy[slug] = globalMemory.likedBy[slug] || [];

    if(req.method === 'POST'){
      if(visitorId && !globalMemory.likedBy[slug].includes(visitorId)){
        globalMemory.likedBy[slug].push(visitorId);
        globalMemory.likes[slug] = Number(globalMemory.likes[slug] || 0) + 1;
      }
    }

    if(req.method === 'DELETE'){
      if(visitorId && globalMemory.likedBy[slug].includes(visitorId)){
        globalMemory.likedBy[slug] = globalMemory.likedBy[slug].filter(id => id !== visitorId);
        globalMemory.likes[slug] = Math.max(0,Number(globalMemory.likes[slug] || 0) - 1);
      }
    }

    return sendJson(res,200,{slug,count:Number(globalMemory.likes[slug] || 0)});
  }
  if(req.method === 'GET' && route === 'sitemap.xml'){
    const urls = [`${SITE_URL}/`,...categories.map(c=>`${SITE_URL}/category/${c.toLowerCase()}`),...palettes.map(p=>paletteUrl(p.slug))];
    return send(res,200,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`,'application/xml; charset=utf-8');
  }
  if(req.method === 'GET' && route.startsWith('palette/')){
    const slug = decodeURIComponent(route.replace('palette/',''));
    const palette = palettes.find(p=>p.slug===slug);
    if(!palette) return send(res,404,'<h1>Palette not found</h1>');
    return send(res,200,renderPalette(palette,categories,palettes));
  }
  if(req.method === 'GET' && route.startsWith('category/')){
    const cat = decodeURIComponent(route.replace('category/','')).toLowerCase();
    const category = categories.find(c=>c.toLowerCase()===cat);
    if(!category) return send(res,404,'<h1>Category not found</h1>');
    return send(res,200,renderCategory(category,categories,palettes));
  }
  return sendJson(res,404,{error:'Not found',route});
}
