const INVITE_STORAGE_KEY='xen_invite_token';
const VALID_TYPES=new Set(['premiere_started','path_selected','premiere_completed','second_appointment_continued']);
const VALID_PATHS=new Set(['bdc','company','compare']);

let endpointPromise;

async function loadEndpoint(){
  if(!endpointPromise){
    endpointPromise=fetch('./xen-choice-config.json',{credentials:'omit',cache:'no-store'})
      .then(response=>response.ok?response.json():null)
      .then(config=>typeof config?.endpoint==='string'?config.endpoint.replace(/\/$/,''):null)
      .catch(()=>null);
  }
  return endpointPromise;
}

function inviteToken(){
  const query=new URLSearchParams(globalThis.location?.search||'');
  const supplied=query.get('invite');
  if(supplied){
    try{sessionStorage.setItem(INVITE_STORAGE_KEY,supplied)}catch{}
    return supplied;
  }
  try{return sessionStorage.getItem(INVITE_STORAGE_KEY)}catch{return null}
}

export async function reportChoice(type,path=null){
  if(!VALID_TYPES.has(type)||!(path===null||VALID_PATHS.has(path)))return false;
  if(type==='path_selected'&&!VALID_PATHS.has(path))return false;
  const invite=inviteToken();
  const endpoint=await loadEndpoint();
  if(!invite||!endpoint)return false;
  try{
    const response=await fetch(`${endpoint}/v1/events`,{
      method:'POST',credentials:'omit',keepalive:true,
      headers:{'content-type':'application/json'},
      body:JSON.stringify({invite,type,path,event_id:crypto.randomUUID()})
    });
    return response.ok;
  }catch{return false}
}
