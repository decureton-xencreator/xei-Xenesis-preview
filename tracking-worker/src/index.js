const EVENT_TYPES=new Set(['premiere_started','path_selected','premiere_completed','second_appointment_continued']);
const PATHS=new Set(['bdc','company','compare']);
const AUDIENCES=new Set(['ed','kim','ahmer']);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder=new TextEncoder();

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})}
function allowedOrigin(request,env){const origin=request.headers.get('origin');const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);return origin&&allowed.includes(origin)?origin:null}
function cors(origin){return origin?{'access-control-allow-origin':origin,'access-control-allow-methods':'POST,GET,OPTIONS','access-control-allow-headers':'authorization,content-type','access-control-max-age':'86400','vary':'Origin'}:{}}
async function sha256(value){const digest=await crypto.subtle.digest('SHA-256',encoder.encode(value));return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
function bearer(request){const value=request.headers.get('authorization')||'';return value.startsWith('Bearer ')?value.slice(7):''}
function safeEqual(a,b){const left=encoder.encode(a);const right=encoder.encode(b);if(left.byteLength!==right.byteLength)return false;return crypto.subtle.timingSafeEqual(left,right)}
function isAdmin(request,env){const supplied=bearer(request);return Boolean(env.ADMIN_TOKEN&&supplied&&safeEqual(supplied,env.ADMIN_TOKEN))}
async function parseSmallJson(request){const length=Number(request.headers.get('content-length')||0);if(length>2048)throw new Error('payload_too_large');const text=await request.text();if(text.length>2048)throw new Error('payload_too_large');return JSON.parse(text)}

async function recordEvent(request,env,origin){
 if(!origin)return json({error:'origin_not_allowed'},403);
 let body;try{body=await parseSmallJson(request)}catch(error){return json({error:error.message==='payload_too_large'?'payload_too_large':'invalid_json'},400,cors(origin))}
 const {invite,type,path=null,event_id:eventId}=body||{};
 if(!UUID.test(invite||'')||!UUID.test(eventId||'')||!EVENT_TYPES.has(type)||!(path===null||PATHS.has(path)))return json({error:'invalid_event'},400,cors(origin));
 if(type==='path_selected'&&!PATHS.has(path))return json({error:'path_required'},400,cors(origin));
 const inviteHash=await sha256(invite);
 const found=await env.DB.prepare('SELECT token_hash FROM invites WHERE token_hash = ? AND revoked_at IS NULL').bind(inviteHash).first();
 if(!found)return json({error:'invalid_invite'},401,cors(origin));
 await env.DB.prepare('INSERT OR IGNORE INTO events (event_id, invite_hash, event_type, selected_path) VALUES (?, ?, ?, ?)').bind(eventId,inviteHash,type,path).run();
 console.log(JSON.stringify({event:'choice_event_recorded',type,path:path||null}));
 return json({ok:true},202,cors(origin));
}

async function createInvite(request,env,origin){
 let body;try{body=await parseSmallJson(request)}catch{return json({error:'invalid_json'},400)}
 const audience=String(body?.audience||'').toLowerCase();const label=String(body?.label||'').slice(0,80)||null;
 if(!AUDIENCES.has(audience))return json({error:'invalid_audience'},400,cors(origin));
 const token=crypto.randomUUID();const tokenHash=await sha256(token);
 await env.DB.prepare('INSERT INTO invites (token_hash, audience, label) VALUES (?, ?, ?)').bind(tokenHash,audience,label).run();
 return json({audience,invite:token,premiere_url:`https://decureton-xencreator.github.io/xei-Xenesis-preview/?viewer=${audience}&invite=${token}`},201,cors(origin));
}

async function report(env,origin){
 const result=await env.DB.prepare(`SELECT i.audience, i.label, e.event_type, e.selected_path, e.created_at
   FROM events e JOIN invites i ON i.token_hash=e.invite_hash
   ORDER BY e.created_at DESC LIMIT 250`).all();
 return json({generated_at:new Date().toISOString(),events:result.results||[]},200,cors(origin));
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);const origin=allowedOrigin(request,env);
  if(request.method==='OPTIONS')return origin?new Response(null,{status:204,headers:cors(origin)}):json({error:'origin_not_allowed'},403);
  if(url.pathname==='/health'&&request.method==='GET')return json({ok:true,service:'xen-choice-reporting'});
  if(url.pathname==='/v1/events'&&request.method==='POST')return recordEvent(request,env,origin);
  if(url.pathname==='/v1/admin/invites'&&request.method==='POST')return !origin?json({error:'origin_not_allowed'},403):isAdmin(request,env)?createInvite(request,env,origin):json({error:'unauthorized'},401,cors(origin));
  if(url.pathname==='/v1/admin/report'&&request.method==='GET')return !origin?json({error:'origin_not_allowed'},403):isAdmin(request,env)?report(env,origin):json({error:'unauthorized'},401,cors(origin));
  return json({error:'not_found'},404);
 }
};

export {sha256,safeEqual};
