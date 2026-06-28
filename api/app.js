const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HOME_FILE = path.join(__dirname, '..', 'ColorFiind_V14_SEO_Backend_Home.html');
const SITE_URL = process.env.SITE_URL || 'https://your-vercel-domain.vercel.app';
const FAVICON_HREF = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ff4d6d%22/%3E%3Cstop%20offset%3D%220.25%22%20stop-color%3D%22%23ffd166%22/%3E%3Cstop%20offset%3D%220.5%22%20stop-color%3D%22%2306d6a0%22/%3E%3Cstop%20offset%3D%220.75%22%20stop-color%3D%22%23118ab2%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%239b5de5%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2218%22%20fill%3D%22%23ffffff%22/%3E%3Cpath%20d%3D%22M46.5%2043.4C42.8%2047.2%2037.8%2049%2032.2%2049%2021.6%2049%2014%2041.7%2014%2032.1S21.7%2015%2032.4%2015c5.8%200%2010.7%202%2014.1%205.6l-5.1%205.4c-2.4-2.6-5.3-3.8-8.6-3.8-6.1%200-10.3%204.1-10.3%209.9s4.2%209.9%2010.3%209.9c3.3%200%206.2-1.2%208.6-3.9l5.1%205.3z%22%20fill%3D%22url%28%23g%29%22/%3E%3C/svg%3E';

/* Preview-only memory likes. For real hosting use database/KV. */
const globalMemory = globalThis.__COLORFIIND_PREVIEW__ || { likes:{}, likedBy:{} };
globalThis.__COLORFIIND_PREVIEW__ = globalMemory;


const seasonStructure = {
  autumn: {
    title:'Autumn Color Palettes',
    keyword:'autumn color palette',
    intro:'Explore autumn color palettes with warm, earthy HEX colors inspired by rust, olive, camel, terracotta, deep brown, hazel, and golden beige.',
    sub:['soft-autumn-color-palette','warm-autumn-color-palette','deep-autumn-color-palette','dark-autumn-color-palette','true-autumn-color-palette'],
    people:['brown-color-palette','sunset-color-palette','70s-color-palette','christmas-color-palette','vintage']
  },
  summer: {
    title:'Summer Color Palettes',
    keyword:'summer color palette',
    intro:'Explore summer color palettes with cool, soft, fresh HEX colors inspired by misty blue, soft rose, lavender, seafoam, and powder grey.',
    sub:['soft-summer-color-palette','light-summer-color-palette','true-summer-color-palette','cool-summer-color-palette'],
    people:['pastel','light','soft-autumn-color-palette','spring-color-palette']
  },
  winter: {
    title:'Winter Color Palettes',
    keyword:'winter color palette',
    intro:'Explore winter color palettes with cool, crisp, high-contrast HEX colors inspired by black, icy white, ruby, emerald, sapphire, and deep plum.',
    sub:['deep-winter-color-palette','dark-winter-color-palette','bright-winter-color-palette','cool-winter-color-palette','true-winter-color-palette'],
    people:['dark','neon','luxury','christmas-color-palette']
  },
  spring: {
    title:'Spring Color Palettes',
    keyword:'spring color palette',
    intro:'Explore spring color palettes with warm, clear, bright HEX colors inspired by coral, peach, sunny yellow, leaf green, aqua, and fresh flowers.',
    sub:['light-spring-color-palette','warm-spring-color-palette','bright-spring-color-palette','true-spring-color-palette'],
    people:['pastel','light','summer-color-palette','soft-summer-color-palette']
  }
};

const seasonalPages = {
  'soft-autumn-color-palette': {keyword:'soft autumn color palette', title:'Soft Autumn Color Palettes', parent:'autumn', desc:'Warm muted soft autumn palettes inspired by hazel, olive, camel, terracotta, dusty peach, and warm beige.', base:['#D8A67D','#B78B63','#8A8F5A','#CDBB99','#F1E3C6','#A66A4C','#6F6A43','#E8C7A1'], terms:['Hazel','Olive','Camel','Terracotta','Linen','Moss','Peach','Beige']},
  'warm-autumn-color-palette': {keyword:'warm autumn color palette', title:'Warm Autumn Color Palettes', parent:'autumn', desc:'Golden warm autumn palettes with pumpkin, camel, mustard, copper, olive, and warm ivory.', base:['#C76F2D','#D99A3D','#B88746','#8A7A2D','#A65F2B','#F2D6A2','#6B4E2E','#E8B86D'], terms:['Pumpkin','Copper','Mustard','Golden','Camel','Ivory','Harvest','Amber']},
  'deep-autumn-color-palette': {keyword:'deep autumn color palette', title:'Deep Autumn Color Palettes', parent:'autumn', desc:'Rich deep autumn palettes with espresso, auburn, dark olive, mustard, rust, and deep teal.', base:['#3B2416','#7A3E22','#9B5A2E','#6F6B2F','#C18A2D','#1F4E45','#5A2D1F','#D6B26A'], terms:['Espresso','Auburn','Teal','Mahogany','Spice','Walnut','Bronze','Forest']},
  'dark-autumn-color-palette': {keyword:'dark autumn color palette', title:'Dark Autumn Color Palettes', parent:'autumn', desc:'Dark autumn palettes with chocolate, forest green, burnt orange, antique gold, and earthy depth.', base:['#2B1A12','#4B2E1F','#7C3F1D','#A65F2B','#3F4A25','#6B6A32','#C79A3B','#E1C16E'], terms:['Chocolate','Forest','Burnt','Antique','Oak','Cocoa','Shadow','Gold']},
  'true-autumn-color-palette': {keyword:'true autumn color palette', title:'True Autumn Color Palettes', parent:'autumn', desc:'Classic true autumn palettes with rust, olive, goldenrod, camel, moss, and warm earth tones.', base:['#A44A2A','#BC6C25','#DDA15E','#606C38','#7F4F24','#B08968','#F2CC8F','#4F5D2F'], terms:['Rust','Goldenrod','Moss','Earth','Maple','Clay','Harvest','Warmth']},
  'soft-summer-color-palette': {keyword:'soft summer color palette', title:'Soft Summer Color Palettes', parent:'summer', desc:'Cool muted soft summer palettes with dusty blue, mauve, lavender grey, soft rose, and cool taupe.', base:['#A9B7C9','#C7A6B8','#D8C7D8','#8FA1B3','#E6DDE3','#9B8FA3','#B7C9C7','#6F7F91'], terms:['Mauve','Dusty Rose','Lavender','Misty','Slate','Powder','Cool Taupe','Blue Haze']},
  'light-summer-color-palette': {keyword:'light summer color palette', title:'Light Summer Color Palettes', parent:'summer', desc:'Light summer palettes with airy blue, pearl pink, soft lavender, mist, and cool pastels.', base:['#EAF4FF','#CFE8F3','#F6DDE8','#DCCEF2','#E9EEF5','#BFD7EA','#F7F2F7','#AFCBFF'], terms:['Pearl','Airy','Mist','Powder','Icy Rose','Cloud','Bluebell','Soft Sky']},
  'true-summer-color-palette': {keyword:'true summer color palette', title:'True Summer Color Palettes', parent:'summer', desc:'True summer palettes with cool rose, plum, slate blue, lavender, soft navy, and muted grey.', base:['#7D8FA3','#A7B6C8','#B995A9','#8D6A8E','#D8C7D8','#5D6D7E','#C7D3DD','#6B7C93'], terms:['Slate','Plum','Rose','Cool Navy','Lavender','Grey Mist','Blue Rose','Summer Rain']},
  'cool-summer-color-palette': {keyword:'cool summer color palette', title:'Cool Summer Color Palettes', parent:'summer', desc:'Cool summer palettes with blue undertones, soft pink, rose, grey, lavender, and clean muted harmony.', base:['#8EA7C2','#B7C9D9','#C9B6D3','#D7A9B9','#F0E6EF','#7E8FA6','#A68BA5','#D6DEE8'], terms:['Cool Rose','Blue Grey','Lavender Mist','Soft Berry','Frost','Moonlit','Cool Sky','Rosewater']},
  'deep-winter-color-palette': {keyword:'deep winter color palette', title:'Deep Winter Color Palettes', parent:'winter', desc:'Deep winter palettes with black, icy white, burgundy, emerald, royal blue, and deep purple.', base:['#050505','#F5F7FA','#6D0F2B','#004D40','#0B3D91','#2A1458','#B00020','#C9D6DF'], terms:['Ruby','Emerald','Sapphire','Icy Black','Burgundy','Royal','Plum Night','Frost']},
  'dark-winter-color-palette': {keyword:'dark winter color palette', title:'Dark Winter Color Palettes', parent:'winter', desc:'Dark winter palettes with black, wine, pine, navy, icy neutrals, and cool dramatic contrast.', base:['#050505','#101820','#4A0D25','#003B46','#0B1F4D','#2E294E','#A8DADC','#F8F9FA'], terms:['Wine','Pine','Navy','Midnight','Icy','Crimson','Polar','Black Ice']},
  'bright-winter-color-palette': {keyword:'bright winter color palette', title:'Bright Winter Color Palettes', parent:'winter', desc:'Bright winter palettes with electric contrast, black, white, hot pink, cobalt, emerald, and icy blue.', base:['#000000','#FFFFFF','#F72585','#3A0CA3','#4361EE','#00B4D8','#00A878','#E0FBFC'], terms:['Electric','Cobalt','Hot Pink','Icy Blue','Emerald','Contrast','Crystal','Bright Frost']},
  'cool-winter-color-palette': {keyword:'cool winter color palette', title:'Cool Winter Color Palettes', parent:'winter', desc:'Cool winter palettes with icy blue, sapphire, fuchsia, silver, blue-red, black, and white.', base:['#000814','#FFFFFF','#003566','#0077B6','#D0006F','#C1121F','#BFC9D9','#5A189A'], terms:['Sapphire','Fuchsia','Silver','Blue Red','Icy','Polar','Cool Ruby','Winter Sky']},
  'true-winter-color-palette': {keyword:'true winter color palette', title:'True Winter Color Palettes', parent:'winter', desc:'True winter palettes with pure black, pure white, clear red, royal blue, emerald, and high contrast.', base:['#000000','#FFFFFF','#C1121F','#0033A0','#008F7A','#6A0572','#E0F2FE','#111827'], terms:['Pure Black','Pure White','Clear Red','Royal Blue','Emerald','Ice','True Contrast','Snow']},
  'light-spring-color-palette': {keyword:'light spring color palette', title:'Light Spring Color Palettes', parent:'spring', desc:'Light spring palettes with peach, fresh mint, ivory, coral, sunny yellow, and delicate warmth.', base:['#FFE5B4','#FFD6A5','#FFB5A7','#FFF3B0','#C1FBA4','#B8F2E6','#FFCAD4','#FFF8E7'], terms:['Peach','Mint','Ivory','Coral','Sunlit','Daisy','Light Apricot','Fresh Cream']},
  'warm-spring-color-palette': {keyword:'warm spring color palette', title:'Warm Spring Color Palettes', parent:'spring', desc:'Warm spring palettes with coral, peach, golden yellow, leaf green, turquoise, and warm freshness.', base:['#FF7F50','#FFB703','#FFD166','#70E000','#2EC4B6','#FFADAD','#F4A261','#FFF3B0'], terms:['Coral','Golden','Leaf','Turquoise','Peach Glow','Sunbeam','Warm Bloom','Fresh Mango']},
  'bright-spring-color-palette': {keyword:'bright spring color palette', title:'Bright Spring Color Palettes', parent:'spring', desc:'Bright spring palettes with clear coral, aqua, yellow, green, warm pink, and lively contrast.', base:['#FF006E','#FFBE0B','#3A86FF','#06D6A0','#FB5607','#80ED99','#4CC9F0','#FFD166'], terms:['Aqua','Bright Coral','Sunny','Lively Green','Clear Pink','Spring Pop','Vivid Bloom','Fresh Spark']},
  'true-spring-color-palette': {keyword:'true spring color palette', title:'True Spring Color Palettes', parent:'spring', desc:'True spring palettes with warm, clear, sunny coral, yellow, green, aqua, and peach.', base:['#FFB703','#FFD166','#FB8500','#FF6B6B','#52B788','#4ECDC4','#FFF3B0','#FFCAD4'], terms:['Sunny','Clear Coral','Peach','Fresh Green','Aqua','True Bloom','Warm Day','Spring Joy']},
  'brown-color-palette': {keyword:'brown color palette', title:'Brown Color Palettes', parent:'autumn', desc:'Brown palettes with espresso, walnut, caramel, tan, cream, and natural earth tones.', base:['#3C2F2F','#6F4E37','#8B5E34','#A67B5B','#C8A27A','#E6CCB2','#F5E6D3','#2B1D14'], terms:['Walnut','Caramel','Espresso','Cocoa','Tan','Mocha','Earth','Chestnut']},
  'christmas-color-palette': {keyword:'christmas color palette', title:'Christmas Color Palettes', parent:'winter', desc:'Christmas palettes with red, pine green, gold, cream, winter white, and festive holiday contrast.', base:['#B00020','#006400','#D4AF37','#F8F3D4','#0B3D2E','#8B0000','#FFFFFF','#C9E4CA'], terms:['Holly','Pine','Gold','Candy Cane','Winter Cream','Festive','Holiday','Noel']},
  'sunset-color-palette': {keyword:'sunset color palette', title:'Sunset Color Palettes', parent:'autumn', desc:'Sunset palettes with coral, orange, rose, purple, gold, and twilight blue.', base:['#FF7B54','#FFB26B','#FFD56B','#FF6B95','#9B5DE5','#3A0CA3','#F15BB5','#FEE440'], terms:['Twilight','Coral Sky','Golden Hour','Rose Sun','Purple Dusk','Orange Glow','Evening','Horizon']},
  '70s-color-palette': {keyword:'70s color palette', title:'70s Color Palettes', parent:'autumn', desc:'Retro 70s palettes with burnt orange, avocado, mustard, brown, cream, and teal.', base:['#D95D39','#A7A844','#E3B23C','#7A4419','#3E5641','#F2E3BC','#8C5E3C','#2A9D8F'], terms:['Avocado','Burnt Orange','Mustard','Retro Brown','Teal','Groovy','Vinyl','Vintage Sun']},
  'minecraft-color-palette': {keyword:'minecraft color palette', title:'Minecraft Color Palettes', parent:'spring', desc:'Minecraft-inspired palettes with grass green, dirt brown, stone grey, diamond blue, and lava orange.', base:['#4C9A2A','#7B4F2A','#808080','#B0B0B0','#2EC4B6','#1B9AAA','#E25822','#3B2F2F'], terms:['Grass','Dirt','Stone','Diamond','Lava','Creeper','Block','Cave']}
};

function esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
function jsonEsc(v){return JSON.stringify(v).replace(/</g,'\\u003c')}
function readHome(){return fs.readFileSync(HOME_FILE,'utf8')}

function shiftHex(hex,amount){
  const clean = hex.replace('#','');
  const r = Math.max(0,Math.min(255,parseInt(clean.slice(0,2),16)+amount));
  const g = Math.max(0,Math.min(255,parseInt(clean.slice(2,4),16)+amount));
  const b = Math.max(0,Math.min(255,parseInt(clean.slice(4,6),16)+amount));
  return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
}

function slugifyName(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

const seasonNameMiddle = ['Whisper','Glow','Love','Mood','Dream','Story','Haze','Field','Garden','Muse','Dawn','Charm','Mist','Bloom','Canvas','Drift','Aura','Waltz','Loom','Vista','Nest','Ribbon','Petal','Fable','Meadow','Horizon','Velvet','Rain','Sunday','Atelier'];
const seasonNameEnd = ['Palette','Harmony','Scene','Journal','Archive','Moment','Sketch','Collection','Spectrum','Daybreak','Nocturne','Voyage','Gallery','Fountain','Season','Light','Tone','Study','Moodboard','Colorway','Inspiration','Set','Swatch','Verse','Air'];

function createSeasonPalette(pageSlug,page,index){
  const base = page.base;
  const termA = page.terms[index % page.terms.length];
  const termB = seasonNameMiddle[Math.floor(index / page.terms.length) % seasonNameMiddle.length];
  const termC = seasonNameEnd[Math.floor(index / (page.terms.length * seasonNameMiddle.length)) % seasonNameEnd.length];
  const prefix = page.title.replace(' Color Palettes','');
  const name = `${prefix} ${termA} ${termB} ${termC}`;
  const offset = (index * 3) % base.length;
  const amount = ((index % 9) - 4) * 7;
  const colors = [base[offset],base[(offset+1+index)%base.length],base[(offset+3+index)%base.length],base[(offset+5+index)%base.length]].map((c,i)=>shiftHex(c,amount + i*4));
  return {name,category:page.parent ? page.parent.charAt(0).toUpperCase()+page.parent.slice(1) : 'Seasonal',season:page.parent,seasonPage:pageSlug,concept:`${page.keyword} ${termA.toLowerCase()} ${termB.toLowerCase()} ${termC.toLowerCase()}`,likes:0,slug:slugifyName(name),colors,source:'seasonal'};
}

function generateSeasonalPalettes(){
  const output=[];
  Object.entries(seasonalPages).forEach(([slug,page])=>{
    for(let i=0;i<1000;i++) output.push(createSeasonPalette(slug,page,i));
  });
  return output;
}

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
  const basePalettes = sandbox.__palettes || [];
  const seasonalPalettes = generateSeasonalPalettes();
  cached = { palettes:[...seasonalPalettes,...basePalettes], categories:sandbox.__categories || [] };
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
:root{--bg:#fff;--card:#fff;--text:#111;--muted:#777;--border:#ececec;--hover:#f7f7f7;--active:#efefef}[data-theme="dark"]{--bg:#111;--card:#1b1b1b;--text:#fff;--muted:#a1a1a1;--border:#2b2b2b;--hover:#222;--active:#2c2c2c}*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;transition:.25s}a{text-decoration:none;color:inherit}.sidebar{position:fixed;left:0;top:0;width:250px;height:100vh;background:var(--card);border-right:1px solid var(--border);padding:24px;overflow:auto;z-index:100}.logo{font-size:30px;font-weight:800;margin-bottom:16px;display:inline-flex;align-items:center;gap:0;letter-spacing:-1px;text-decoration:none}.logo span{display:inline-block}.brand-space{width:7px}.brand-color .lc{color:#FF4D6D}.brand-color .lo1{color:#FFB703}.brand-color .ll{color:#06D6A0}.brand-color .lo2{color:#118AB2}.brand-color .lr{color:#9B5DE5}.brand-fiind{color:#111}[data-theme="dark"] .brand-fiind{color:#fff}.theme-toggle{display:flex;justify-content:center;padding:12px;background:var(--hover);border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;margin-bottom:22px}.nav{display:flex;flex-direction:column;gap:6px}.nav-item{padding:14px 16px;border-radius:14px;color:var(--muted)}.nav-item:hover,.nav-item.active{background:var(--active);color:var(--text)}.divider{height:1px;background:var(--border);margin:20px 0}.category{display:block;padding:9px 0;font-size:14px;color:var(--muted)}.category.active,.category:hover{color:var(--text);font-weight:600}.season-parent{font-weight:800;color:var(--text);margin-top:8px}.sub-season{padding:7px 0 7px 14px;font-size:13px;color:var(--muted);display:block}.sub-season:hover{color:var(--text)}.season-menu{position:relative}.season-trigger{display:flex;align-items:center;justify-content:space-between;gap:10px}.season-trigger-preview,.mini-palette{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;border-radius:8px;flex-shrink:0}.season-trigger-preview{width:42px;height:18px}.mini-palette{width:58px;height:24px}.season-flyout{display:none;position:absolute;left:100%;top:0;width:260px;background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.16);padding:10px;z-index:500}.season-menu:hover .season-flyout{display:block}.flyout-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;color:var(--muted);font-size:13px;font-weight:700}.flyout-item:hover{background:var(--hover);color:var(--text)}.main{margin-left:250px;padding:24px}.breadcrumb{font-size:14px;color:var(--muted);margin-bottom:18px}.topbar{position:sticky;top:0;background:var(--bg);padding-bottom:18px;z-index:50}.search{width:100%;padding:15px 18px;border:1px solid var(--border);border-radius:999px;background:var(--card);color:var(--text);outline:none;font-size:14px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.card{cursor:pointer;transform:translateY(0);transition:.25s}.card:hover{transform:translateY(-4px)}.palette{height:290px;border-radius:18px;overflow:hidden;display:grid;grid-template-columns:repeat(4,1fr);background:var(--hover);transition:grid-template-columns .7s cubic-bezier(.25,.8,.25,1)}.palette:has(.c1:hover){grid-template-columns:1.6fr .8fr .8fr .8fr}.palette:has(.c2:hover){grid-template-columns:.8fr 1.6fr .8fr .8fr}.palette:has(.c3:hover){grid-template-columns:.8fr .8fr 1.6fr .8fr}.palette:has(.c4:hover){grid-template-columns:.8fr .8fr .8fr 1.6fr}.color{display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.color span{opacity:0;transform:translateY(12px);transition:.4s;font-size:13px;font-weight:700;color:#fff;mix-blend-mode:difference}.color:hover span{opacity:1;transform:translateY(0)}.info{padding-top:12px}.name{font-size:14px;font-weight:600;margin-bottom:8px}.actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.actions span{display:flex;align-items:center;gap:6px;cursor:pointer;transition:.2s;font-size:14px;color:var(--text)}.actions span:hover{transform:scale(1.08)}.favorite.active .icon{fill:currentColor}.icon{width:18px;height:18px;stroke:currentColor;stroke-width:2;fill:none}.large-palette{height:260px;border-radius:22px;overflow:hidden;display:grid;grid-template-columns:repeat(4,1fr);margin-bottom:24px}h1{font-size:44px;line-height:1.05;margin-bottom:12px;letter-spacing:-1.5px}.subtitle{font-size:16px;color:var(--muted);line-height:1.7;margin-bottom:22px;max-width:980px}.section-title{font-size:22px;margin:30px 0 16px;font-weight:800}.ad-slot{grid-column:1/-1;min-height:92px;border:1px dashed var(--border);border-radius:18px;background:linear-gradient(135deg,var(--hover),var(--card));color:var(--muted);display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;font-weight:700;margin:24px 0}.copy-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#111;color:#fff;padding:12px 16px;border-radius:999px;font-size:14px;font-weight:700;box-shadow:0 12px 40px rgba(0,0,0,.22);z-index:2000;opacity:0;pointer-events:none;transition:.25s}.copy-toast.show{opacity:1;transform:translate(-50%,0)}.pill-links{display:flex;gap:12px;flex-wrap:wrap}.related-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.related-card{display:block;cursor:pointer;transition:.25s}.related-card:hover{transform:translateY(-4px)}.related-palette{height:220px;border-radius:18px;overflow:hidden;display:grid;grid-template-columns:repeat(4,1fr);background:var(--hover)}.related-name{font-size:14px;font-weight:700;margin-top:10px}.action{border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:999px;padding:12px 14px;cursor:pointer;font-weight:700;display:inline-flex}.colors-list{display:grid;gap:12px}.color-row{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);border-radius:16px;padding:12px}.swatch{display:flex;align-items:center;gap:12px;font-weight:800}.dot{width:38px;height:38px;border-radius:12px}.mobile-toggle{display:none}@media(max-width:1400px){.grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:1000px){.sidebar{display:none}.main{margin-left:0;padding:70px 16px 24px}.grid,.related-grid{grid-template-columns:repeat(2,1fr);gap:18px}.palette{height:240px}.related-palette{height:200px}.season-flyout{position:static;width:auto;box-shadow:none;margin:6px 0 10px}}@media(max-width:700px){h1{font-size:34px}.grid,.related-grid{grid-template-columns:1fr;gap:22px}.palette{height:280px}.related-palette{height:220px}.large-palette{height:220px}.copy-toast{width:calc(100% - 32px);text-align:center}}
`}

function miniPalette(colors,className='mini-palette'){
  return `<span class="${className}">${colors.slice(0,4).map(c=>`<span style="background:${c}"></span>`).join('')}</span>`;
}

function sidebar(categories,active){
  const seasonLinks = Object.entries(seasonStructure).map(([seasonSlug,season])=>{
    const firstPage = seasonalPages[season.sub[0]];
    const flyout = season.sub.map(sub=>{
      const page = seasonalPages[sub];
      return `<a class="flyout-item" href="/season/${seasonSlug}/${sub}">${miniPalette(page.base)}<span>${esc(page.title.replace(' Color Palettes',''))}</span></a>`;
    }).join('');
    return `<div class="season-menu"><a class="category season-parent season-trigger" href="/season/${seasonSlug}"><span>${esc(season.title.replace(' Color Palettes',''))}</span>${miniPalette(firstPage.base,'season-trigger-preview')}</a><div class="season-flyout">${flyout}</div></div>`;
  }).join('');
  return `<div class="sidebar"><a href="/" class="logo" aria-label="Color Fiind home"><span class="brand-color"><span class="lc">C</span><span class="lo1">o</span><span class="ll">l</span><span class="lo2">o</span><span class="lr">r</span></span><span class="brand-space"> </span><span class="brand-fiind">Fiind</span></a><div class="theme-toggle" onclick="toggleTheme()">🌙 Dark Mode</div><div class="nav"><a class="nav-item" href="/">✦ New</a><a class="nav-item" href="/">◉ Popular</a><a class="nav-item" href="/">◎ Random</a><a class="nav-item" href="/collection">♥ Collection</a></div><div class="divider"></div><a class="category ${!active?'active':''}" href="/">All</a>${categories.map(c=>`<a class="category ${active===c?'active':''}" href="/category/${c.toLowerCase()}">${esc(c)}</a>`).join('')}<div class="divider"></div><div class="category" style="font-weight:800;color:var(--text);cursor:default">Seasons</div>${seasonLinks}</div>`;
}

function pageScript(slug){return `<script>
const L='colorfiind-liked-palettes',V='colorfiind-visitor-id';
function id(){let x=localStorage.getItem(V);if(!x){x='v-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);localStorage.setItem(V,x)}return x}
function liked(){return JSON.parse(localStorage.getItem(L)||'[]')}
function save(a){localStorage.setItem(L,JSON.stringify(a))}
function mark(){document.querySelectorAll('[data-like-slug]').forEach(el=>{if(liked().includes(el.dataset.likeSlug))el.classList.add('active')});const b=document.getElementById('likeBtn');if(b&&liked().includes('${slug}'))b.classList.add('active')}
async function likePalette(s,el){let a=liked();const already=a.includes(s);let countEl=el?el.querySelector('.like-count'):document.getElementById('likeCount');if(already){a=a.filter(x=>x!==s);save(a);if(el)el.classList.remove('active');const b=document.getElementById('likeBtn');if(b&&s==='${slug}')b.classList.remove('active');if(countEl)countEl.textContent=String(Math.max(0,Number(countEl.textContent||0)-1));try{const r=await fetch('/api/likes/'+encodeURIComponent(s),{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:id()})});const d=await r.json();if(countEl&&d.count!==undefined)countEl.textContent=d.count}catch(e){}return;}a.push(s);save(a);if(el)el.classList.add('active');mark();if(countEl)countEl.textContent=String(Number(countEl.textContent||0)+1);try{const r=await fetch('/api/likes/'+encodeURIComponent(s),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:id()})});const d=await r.json();if(countEl&&d.count!==undefined)countEl.textContent=d.count}catch(e){}}
async function copyText(t,el){try{await navigator.clipboard.writeText(t)}catch(e){}let toast=document.getElementById('copyToast');if(toast){toast.textContent='Copied';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1500)}if(el){const o=el.innerHTML;el.innerHTML='✓';setTimeout(()=>el.innerHTML=o,1200)}}
function downloadPalette(name,colors,el){const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=720;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1200,720);ctx.fillStyle='#111';ctx.font='800 54px Inter, Arial';ctx.fillText(name,60,86);const w=1080/colors.length;colors.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(60+i*w,130,w,360);ctx.fillStyle='#111';ctx.font='700 26px Inter, Arial';ctx.fillText(c,70+i*w,540)});ctx.font='800 30px Inter, Arial';ctx.fillText('Color Fiind',60,650);const a=document.createElement('a');a.download=name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-color-palette.png';a.href=canvas.toDataURL('image/png');a.click();copyText('Downloaded',el)}
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme');if(cur==='dark'){document.documentElement.removeAttribute('data-theme');localStorage.setItem('theme','light')}else{document.documentElement.setAttribute('data-theme','dark');localStorage.setItem('theme','dark')}}
document.addEventListener('click',e=>{const card=e.target.closest('.card');if(card&&!e.target.closest('.actions'))location.href='/palette/'+card.dataset.slug});
if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark');mark();
</script>`}

function renderPalette(palette,categories,palettes){
  const likeCount = Number(globalMemory.likes[palette.slug] || 0);
  const title = `${palette.name} Color Palette - ColorFiind`;
  const desc = `${palette.name} color palette with HEX codes ${palette.colors.join(', ')}. Copy and share this ${palette.category.toLowerCase()} palette.`;
  const related = palettes.filter(p=>p.category===palette.category && p.slug!==palette.slug).slice(0,8);
  const jsonLd = {'@context':'https://schema.org','@type':'CreativeWork',name:title,description:desc,url:paletteUrl(palette.slug),keywords:['color palette',palette.category,...palette.colors].join(', ')};
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><link rel="icon" href="${FAVICON_HREF}"><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(paletteUrl(palette.slug))}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(palette.colors.join(' · '))}"><script type="application/ld+json">${jsonEsc(jsonLd)}</script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>${css()}</style></head><body>${sidebar(categories,palette.category)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › <a href="/category/${palette.category.toLowerCase()}">${esc(palette.category)}</a> › ${esc(palette.name)}</nav><div class="detail-layout"><section><div class="large-palette">${palette.colors.map(c=>`<div class="color" style="background:${c}"><span>${c}</span></div>`).join('')}</div></section><section><h1>${esc(palette.name)}</h1><p class="subtitle">${esc(desc)}</p><div class="actions"><button class="action" id="likeBtn" onclick="likePalette('${palette.slug}')">♥ <span id="likeCount">${likeCount}</span></button><button class="action" onclick="copyText(location.href,this)">Share</button><button class="action" onclick="copyText('${palette.colors.join('\\n')}',this)">Copy Palette</button></div><div class="colors-list">${palette.colors.map(c=>`<div class="color-row"><div class="swatch"><span class="dot" style="background:${c}"></span>${c}</div><span class="copy-small" onclick="copyText('${c}',this)">Copy</span></div>`).join('')}</div></section></div><div class="ad-slot">Advertisement Space — palette detail page banner</div><h2 class="section-title">Related ${esc(palette.category)} Palettes</h2><div class="related-grid">${related.map(p=>`<a href="/palette/${p.slug}"><div class="related-palette">${p.colors.map(c=>`<div style="background:${c}"></div>`).join('')}</div><div class="related-name">${esc(p.name)}</div></a>`).join('')}</div></main><div class="copy-toast" id="copyToast">Copied</div>${pageScript(palette.slug)}</body></html>`;
}

function renderCategory(category,categories,palettes){
  const items = palettes.filter(p=>p.category===category).slice(0,120);
  const desc = `Explore ${category.toLowerCase()} color palettes with HEX codes for websites, UI design, branding, and creative inspiration.`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(category)} Color Palettes - ColorFiind</title><link rel="icon" href="${FAVICON_HREF}"><meta name="description" content="${esc(desc)}"><style>${css()}</style></head><body>${sidebar(categories,category)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › ${esc(category)}</nav><h1>${esc(category)} Color Palettes</h1><p class="subtitle">${esc(desc)}</p><div class="ad-slot">Advertisement Space — category page banner</div><div class="category-grid">${items.map(p=>`<a href="/palette/${p.slug}"><div class="cat-palette">${p.colors.map(c=>`<div style="background:${c}"></div>`).join('')}</div><div class="cat-name">${esc(p.name)}</div></a>`).join('')}</div></main>${pageScript('')}</body></html>`;
}



function iconHeart(){return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-8C.5 10 .9 5.5 5 4c2.3-.8 4.2.2 5 1.5C10.8 4.2 12.7 3.2 15 4c4.1 1.5 4.5 6 2.5 9-2.5 3.65-9.5 8-9.5 8z"/></svg>'}
function iconLink(){return '<svg class="icon" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'}
function iconCopy(){return '<svg class="icon" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'}
function paletteGridCard(p){
  const count = Number(globalMemory.likes[p.slug] || p.likes || 0);
  const colorsJson = esc(JSON.stringify(p.colors));
  return `<div class="card" data-slug="${p.slug}"><div class="palette">${p.colors.map((c,i)=>`<div class="color c${i+1}" style="background:${c}"><span>${c}</span></div>`).join('')}</div><div class="info"><div class="name">${esc(p.name)}</div><div class="actions"><span class="favorite" data-like-slug="${p.slug}" onclick="event.stopPropagation();likePalette('${p.slug}',this)">${iconHeart()} <span class="like-count">${count}</span></span><span onclick="event.stopPropagation();copyText(location.origin+'/palette/${p.slug}',this)" title="Copy link">${iconLink()}</span><span onclick="event.stopPropagation();copyText('${p.colors.join('\\n')}',this)" title="Copy colors">${iconCopy()}</span><span onclick="event.stopPropagation();downloadPalette('${esc(p.name)}',${colorsJson},this)" title="Download palette PNG">⬇</span></div></div></div>`;
}

function peopleAlsoLikeLinks(items){
  return items.map(item=>{
    if(seasonStructure[item]) return `<a class="action" href="/season/${item}">${esc(seasonStructure[item].title)}</a>`;
    if(seasonalPages[item]) return `<a class="action" href="/season/${seasonalPages[item].parent}/${item}">${esc(seasonalPages[item].title)}</a>`;
    return `<a class="action" href="/category/${item}">${esc(item.charAt(0).toUpperCase()+item.slice(1))} Color Palettes</a>`;
  }).join('');
}

function seasonSubCards(seasonSlug){
  const season = seasonStructure[seasonSlug];
  return season.sub.map(sub=>{
    const page = seasonalPages[sub];
    return `<a href="/season/${seasonSlug}/${sub}" class="related-card"><div class="related-palette">${page.base.slice(0,4).map(c=>`<div style="background:${c}"></div>`).join('')}</div><div class="related-name">${esc(page.title)}</div></a>`;
  }).join('');
}

function renderSeasonMainPage(seasonSlug,categories,palettes){
  const season = seasonStructure[seasonSlug];
  if(!season) return null;
  const bySub = season.sub.map(sub=>palettes.filter(p=>p.seasonPage===sub));
  const seasonPalettes = [];
  for(let i=0; seasonPalettes.length<1000 && i<1000; i++){
    bySub.forEach(group=>{ if(group[i] && seasonPalettes.length<1000) seasonPalettes.push(group[i]); });
  }
  const title = `${season.title} - Seasonal HEX Color Inspiration`;
  const desc = season.intro;
  const canonical = `${SITE_URL.replace(/\/$/,'')}/season/${seasonSlug}`;
  const jsonLd = {'@context':'https://schema.org','@type':'CollectionPage',name:season.title,description:desc,url:canonical};
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><script type="application/ld+json">${jsonEsc(jsonLd)}</script><style>${css()}</style></head><body>${sidebar(categories,null)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › Seasons › ${esc(season.title)}</nav><h1>${esc(season.title)}</h1><p class="subtitle">${esc(desc)} Browse mixed ${esc(seasonSlug)} palettes below, or choose a specific seasonal subtype if you want a more focused color mood.</p><div class="ad-slot">Advertisement Space — season page banner</div><h2 class="section-title">Mixed ${esc(season.title)}</h2><div class="grid">${seasonPalettes.map(paletteGridCard).join('')}</div><h2 class="section-title">People Also Like</h2><div class="actions">${peopleAlsoLikeLinks(season.people)}</div></main><div class="copy-toast" id="copyToast">Copied</div>${pageScript('')}</body></html>`;
}

function renderSeasonSubPage(seasonSlug,pageSlug,categories,palettes){
  const page = seasonalPages[pageSlug];
  const season = seasonStructure[seasonSlug];
  if(!page || !season || page.parent !== seasonSlug) return null;
  const pagePalettes = palettes.filter(p=>p.seasonPage === pageSlug).slice(0,1000);
  const title = `${page.title} - ${page.keyword} HEX Colors`;
  const desc = `${page.desc} Browse ${page.keyword} ideas, copy HEX codes, download palette images, and explore related seasonal color combinations.`;
  const canonical = `${SITE_URL.replace(/\/$/,'')}/season/${seasonSlug}/${pageSlug}`;
  const jsonLd = {'@context':'https://schema.org','@type':'FAQPage','mainEntity':[
    {'@type':'Question','name':`What is a ${page.keyword}?`,'acceptedAnswer':{'@type':'Answer','text':page.desc}},
    {'@type':'Question','name':`What colors work for ${page.keyword}?`,'acceptedAnswer':{'@type':'Answer','text':`Common HEX colors include ${page.base.join(', ')}.`}},
    {'@type':'Question','name':`How do I use ${page.keyword} colors?`,'acceptedAnswer':{'@type':'Answer','text':'Use them for outfit planning, branding, website color palettes, UI design, mood boards, and creative inspiration.'}}
  ]};
  const siblingLinks = season.sub.filter(s=>s!==pageSlug);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(canonical)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><script type="application/ld+json">${jsonEsc(jsonLd)}</script><style>${css()}</style></head><body>${sidebar(categories,null)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › <a href="/season/${seasonSlug}">${esc(season.title)}</a> › ${esc(page.title)}</nav><h1>${esc(page.title)}</h1><p class="subtitle">${esc(desc)}</p><div class="large-palette" style="height:260px;margin-bottom:24px">${page.base.slice(0,4).map(c=>`<div class="color" style="background:${c}"><span>${c}</span></div>`).join('')}</div><div class="actions"><button class="action" onclick="downloadPalette('${esc(page.title)}',${esc(JSON.stringify(page.base.slice(0,4)))},this)">⬇ Download Main Palette</button><button class="action" onclick="copyText('${page.base.join('\\n')}',this)">Copy HEX Codes</button></div><h2 class="section-title">${esc(page.title)} Grid</h2><div class="grid">${pagePalettes.map(paletteGridCard).join('')}</div><div class="ad-slot">Advertisement Space — ${esc(page.title)} page banner</div><h2 class="section-title">More ${esc(season.title.replace(' Color Palettes',''))} Palettes</h2><div class="actions">${siblingLinks.map(s=>`<a class="action" href="/season/${seasonSlug}/${s}">${esc(seasonalPages[s].title)}</a>`).join('')}</div><h2 class="section-title">People Also Like</h2><div class="actions">${peopleAlsoLikeLinks([seasonSlug,...season.people])}</div></main><div class="copy-toast" id="copyToast">Copied</div>${pageScript('')}</body></html>`;
}

function renderCollection(categories){
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Color Palette Collection - ColorFiind</title><link rel="icon" href="${FAVICON_HREF}"><meta name="description" content="View your liked color palettes and saved ColorFiind collection."><style>${css()}</style></head><body>${sidebar(categories,null)}<main class="main"><nav class="breadcrumb"><a href="/">Home</a> › Collection</nav><h1>Your Collection</h1><p class="subtitle">Palettes you liked are saved in this browser. Global like counts still come from the API.</p><div class="ad-slot">Advertisement Space — collection page banner</div><div class="category-grid" id="collectionGrid"></div></main><script>
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
  let route = null;
  if(req.query && typeof req.query.path !== 'undefined'){
    route = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
  }
  if(route === null) route = url.searchParams.get('path');
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
    const urls = [`${SITE_URL}/`,...categories.map(c=>`${SITE_URL}/category/${c.toLowerCase()}`),...Object.keys(seasonStructure).map(s=>`${SITE_URL}/season/${s}`),...Object.entries(seasonalPages).map(([s,p])=>`${SITE_URL}/season/${p.parent}/${s}`),...palettes.map(p=>paletteUrl(p.slug))];
    return send(res,200,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(u)}</loc></url>`).join('')}</urlset>`,'application/xml; charset=utf-8');
  }
  if(req.method === 'GET' && route.startsWith('season/')){
    const parts = route.split('/').map(decodeURIComponent);
    if(parts.length === 2){
      const page = renderSeasonMainPage(parts[1],categories,palettes);
      if(!page) return send(res,404,'<h1>Season page not found</h1>');
      return send(res,200,page);
    }
    if(parts.length >= 3){
      const page = renderSeasonSubPage(parts[1],parts.slice(2).join('/'),categories,palettes);
      if(!page) return send(res,404,'<h1>Season palette page not found</h1>');
      return send(res,200,page);
    }
  }

  if(req.method === 'GET' && route.startsWith('seasonal/')){
    const slug = decodeURIComponent(route.replace('seasonal/',''));
    const page = seasonalPages[slug] ? renderSeasonSubPage(seasonalPages[slug].parent,slug,categories,palettes) : null;
    if(!page) return send(res,404,'<h1>Seasonal page not found</h1>');
    return send(res,200,page);
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
