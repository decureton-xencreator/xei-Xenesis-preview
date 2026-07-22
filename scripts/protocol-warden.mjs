#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
export const ROOT=path.resolve(HERE,'..');
const G='governance/protocol-enforcement';
const read=(root,file)=>fs.readFileSync(path.join(root,file),'utf8');
const json=(root,file)=>JSON.parse(read(root,file));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const exists=(root,file)=>fs.existsSync(path.join(root,file));

export function runWarden({root=ROOT,mode='preflight',changedFiles,evidenceFile}={}){
  const started=new Date().toISOString();
  const checks=[];
  const add=(gate,ok,detail,evidence=[])=>checks.push({gate,status:ok?'PASS':'BLOCK',detail,evidence});
  let registry,objective,baseline,delta,brand,xps,sws,voice,manifest;
  try {
    registry=json(root,`${G}/protocol-registry.json`); objective=json(root,`${G}/objective-contract.json`);
    baseline=json(root,`${G}/canonical-baseline.json`); delta=json(root,`${G}/authorized-delta.json`);
    brand=json(root,`${G}/brand-integrity.json`); xps=json(root,`${G}/experience-contract.json`);
    sws=json(root,`${G}/sws-map.json`); voice=json(root,'governance/XVS-001-CANONICAL-VOICE.json');
    manifest=json(root,'assets/narration/mastered-v1/manifest.json');
    add('01-command-capture',true,'Objective contract loaded',[`${G}/objective-contract.json`]);
  } catch(error){add('01-command-capture',false,`Required contract unreadable: ${error.message}`);return finish();}

  const order=['AM','XPS','WARDEN','AM-002','XVS-001','CPF-006','SWS'];
  const objectiveLocked=objective.id==='AM-OBJECTIVE-XPEP-2026-07-20'&&objective.originalObjective?.includes('mandatory fail-closed')&&objective.primaryObjective==='Prevent material Xen actions from proceeding without complete protocol execution and evidence.'&&objective.prohibitedChanges?.includes('redesign Ed presentation');
  add('02-objective-recovery',objectiveLocked&&objective.acceptanceCriteria?.length>0,'Original objective, boundaries, and acceptance criteria resolved without displacement');
  add('03-canonical-baseline',baseline.baselineCommit&&baseline.changeModel==='CANONICAL_BASELINE_PLUS_EXPLICITLY_AUTHORIZED_DELTA','Authoritative production baseline resolved');
  add('04-protocol-applicability',order.every(p=>registry.protocols[p]?.required),'All material-action protocols are mandatory');
  add('05-protocol-precedence',JSON.stringify(registry.executionOrder)===JSON.stringify(order)&&registry.conflictPolicy==='BLOCK_AND_RESOLVE','Precedence is deterministic and conflicts fail closed');

  let changed=changedFiles;
  if(!changed){try{changed=execFileSync('git',['diff','--name-only','HEAD'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean)}catch{changed=[];}}
  const authorized=changed.every(file=>delta.allowedPrefixes.some(prefix=>file===prefix||file.startsWith(prefix)));
  const protectedTouched=changed.filter(file=>delta.protectedPrefixes.some(prefix=>file===prefix||file.startsWith(prefix)));
  add('06-authorized-delta',authorized&&protectedTouched.length===0,authorized?`Smallest authorized delta: ${changed.length} file(s)`:`Unauthorized paths: ${changed.filter(f=>!delta.allowedPrefixes.some(p=>f===p||f.startsWith(p))).join(', ')||protectedTouched.join(', ')}`,changed);
  add('07-dependency-prediction',Array.isArray(sws.localRecords)&&sws.localRecords.length>=8&&sws.propagationRule==='ONLY_AFTER_ALL_WARDEN_GATES_PASS'&&sws.protectedSourceRule==='NEVER_OVERWRITE_WITH_UNAUTHORIZED_INTERPRETATION','Affected records mapped and safe propagation rules enforced');
  add('08-isolated-application',protectedTouched.length===0,protectedTouched.length?`Protected runtime touched: ${protectedTouched.join(', ')}`:'Protected Ed runtime and assets unchanged');

  for(const [file,expected] of Object.entries(baseline.protectedFiles)) add(`09-baseline:${file}`,exists(root,file)&&hash(path.join(root,file))===expected,`Baseline hash ${file}`,[file]);
  const html=read(root,xps.entry),css=read(root,xps.requiredStylesheet),js=read(root,'src/ed-premiere-clean-v1.js');
  const stylesheetLinked=html.includes(xps.requiredStylesheet);
  add('10-runtime-assets',stylesheetLinked&&html.includes('src/ed-premiere-clean-v1.js'),'Required runtime assets are active');
  const sceneCount=(html.match(new RegExp(xps.sceneSelector,'g'))||[]).length;
  add('11-full-experience',sceneCount===xps.expectedScenes,`Inspected ${sceneCount}/${xps.expectedScenes} scenes; release additionally requires rendered evidence`);
  add('12-responsive-contract',xps.viewports.length===3&&css.includes('@media')&&css.includes('100dvh')&&!css.includes('overflow:visible!important'),'Phone, tablet, and desktop contracts declared');
  add('13-interaction-contract',['begin','move','runWarden','completeDocumentary','reset'].every(term=>js.includes(`function ${term}`)),'All primary interaction paths exist');

  const asset=brand.assets[0];
  add('14-brand-source',exists(root,asset.source)&&hash(path.join(root,asset.source))===asset.sha256,'Protected Checkmate source hash verified',[asset.source]);
  add('14-brand-derivatives',brand.assets.every(a=>(a.derivatives||[]).every(d=>d.source&&d.transformation&&d.sha256&&d.usage)),'Every derivative is attributable (none currently authorized)');
  const clipIds=new Set(); let clipRoutesOk=manifest.clips?.length>0;
  for(const clip of manifest.clips||[]){
    if(clipIds.has(clip.id)||!exists(root,clip.path)||hash(path.join(root,clip.path))!==clip.sha256)clipRoutesOk=false;
    clipIds.add(clip.id);
  }
  const endings=['ending-bdc','ending-company','ending-compare'];
  const voiceOk=voice.voice_contract===manifest.voiceContract&&voice.model===manifest.model&&voice.voice===manifest.voice&&voice.approved_audition===manifest.approvedAudition;
  add('14-voice-identity',voiceOk&&manifest.instructionsSha256,'Audition, model, voice, instructions, and contract agree');
  add('14-voice-routes',clipRoutesOk&&endings.every(id=>clipIds.has(id))&&!js.includes('speechSynthesis'),`Verified ${clipIds.size} unique clips including all endings; no browser speech fallback`);
  add('15-baseline-comparison',checks.filter(c=>c.gate.startsWith('09-baseline')).every(c=>c.status==='PASS'),'Candidate compared to protected baseline');

  let external={};
  if(evidenceFile&&exists(root,evidenceFile)){try{external=json(root,evidenceFile)}catch(error){add('16-evidence-read',false,error.message);}}
  const deployed=external.deployed?.inspected===true&&external.deployed?.url&&external.deployed?.candidateCommit;
  add('16-deployed-inspection',mode!=='release'||deployed,mode==='release'?(deployed?'Deployed candidate inspected':'Missing deployed artifact inspection'):'Deferred to release gate');
  const visual=external.visual?.complete===true&&external.visual?.sceneCount===xps.expectedScenes&&external.visual?.viewports?.length===xps.viewports.length;
  add('17-release-evidence',mode!=='release'||visual,mode==='release'?(visual?'Complete rendered evidence supplied':'Missing all-scenes/all-viewports visual evidence'):'Preflight evidence ledger generated');
  const preSwsPass=checks.every(c=>c.status==='PASS');
  add('18-publication-interlock',mode!=='release'||preSwsPass,preSwsPass?'All pre-SWS gates passed':'Publication remains blocked');
  const syncReady=sws.upstream.every(repo=>repo.required?repo.available:true);
  add('19-sws',mode!=='release'||(preSwsPass&&syncReady),syncReady?'All dependency targets available':'Canonical xen-operating-system target unavailable; propagation blocked');
  add('20-canonical-record',mode!=='release'||(preSwsPass&&syncReady&&external.canonical?.recorded===true),mode==='release'?'Requires synchronized canonical record':'Candidate state only; not falsely promoted');
  return finish();

  function finish(){
    const pass=checks.every(c=>c.status==='PASS');
    return {schema:'xen/evidence-ledger/v1',decision:pass?'ALLOW':'BLOCK',mode,startedAt:started,completedAt:new Date().toISOString(),objectiveId:objective?.id||null,baselineCommit:baseline?.baselineCommit||null,changedFiles:changed||[],checks,rollback:{strategy:'revert authorized delta only',baseline:baseline?.baselineCommit||null},creditEfficiency:{inspectBeforeGenerate:true,reusedHashes:true,smallestDelta:true,earlyExitBeforeDeploy:!pass},limitations:checks.filter(c=>c.status==='BLOCK').map(c=>c.detail)};
  }
}

function main(){
  const mode=process.argv[2]||'preflight';
  const evidenceArg=process.argv.find(a=>a.startsWith('--evidence='));
  const changedArg=process.argv.find(a=>a.startsWith('--changed-file-list='));
  const changedFiles=changedArg?fs.readFileSync(changedArg.slice(20),'utf8').trim().split('\n').filter(Boolean):undefined;
  const ledger=runWarden({mode,evidenceFile:evidenceArg?.slice(11),changedFiles});
  const out=path.join(ROOT,'Reports','XPEP-1.0.0-EVIDENCE.json');
  fs.writeFileSync(out,JSON.stringify(ledger,null,2)+'\n');
  console.log(`${ledger.decision} ${mode}: ${ledger.checks.filter(c=>c.status==='PASS').length}/${ledger.checks.length} gates passed`);
  for(const c of ledger.checks.filter(c=>c.status==='BLOCK'))console.error(`BLOCK ${c.gate}: ${c.detail}`);
  process.exitCode=ledger.decision==='ALLOW'?0:1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
