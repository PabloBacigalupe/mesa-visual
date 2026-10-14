const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {randomUUID} = require('node:crypto');
const root = __dirname + '/dist/';
const html = fs.readFileSync(root+'index.html','utf8');
const source = fs.readFileSync(root+'app.js','utf8').replace('  init();', '  globalThis.testApp = {state,produce,generatePrompt,upscale,prepareCurrentPrompt};');
function harness(configured=true, fail=false){
  function element(){return {value:'',hidden:false,disabled:false,style:{},dataset:{},children:[],classList:{toggle(){}},selectedOptions:[{textContent:'1920x1080px (Web/Horizontal)'}],setAttribute(){},addEventListener(){},focus(){},append(...items){this.children.push(...items)},replaceChildren(...items){this.children=items},showModal(){this.open=true},close(){this.open=false},getContext(){return {clearRect(){},drawImage(){},fillRect(){}}}};}
  const elements=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],element()]));
  Object.assign(elements.headline,{value:'Titular A'});elements.description.value='Contexto A';elements.format.value='1920x1080';elements.versions.value='1';elements.variation.value='35';
  const calls=[],jobs={};
  const context={document:{getElementById(id){assert.ok(elements[id],`DOM ID missing: ${id}`);return elements[id]},querySelectorAll(){return []},createElement:element},window:{MESA_ASSETS:{references:[],samples:[]}},crypto:{randomUUID},setTimeout(){return 1},clearTimeout(){},innerWidth:1200,Image:class {set src(v){this._src=v;queueMicrotask(()=>this.onload())}},fetch:async(path,options)=>{
    const body=options.body?JSON.parse(options.body):null;calls.push({path,body});let data;
    if(path==='/api/status')data={service:'mesa-visual',configured,csrf:'testtoken'};
    else if(path==='/api/generate'){
      const job_id=randomUUID();const id=randomUUID();jobs[job_id]={status:fail?'failed':'completed',error:fail?'Saldo insuficiente':null,count:body.count,completed:fail?0:1,images:fail?[]:[{id,url:'/generated/'+id+'.png',width:body.width,height:body.height,baseWidth:body.width,baseHeight:body.height,headline:body.headline,prompt:body.prompt,style:body.style,kind:body.mode,variation:body.variation,upscaled:false}]};data={job_id};
    }else data=jobs[path.split('/').pop()];
    return {ok:true,json:async()=>data};
  }};
  vm.createContext(context);vm.runInContext(source,context);return {app:context.testApp,elements,calls};
}
test('new headline updates generated prompt; each launch makes a new request',async()=>{
  const {app,elements:e,calls}=harness();app.generatePrompt(true);await app.produce('launch');e.headline.value='Titular B';e.description.value='Contexto B';await app.produce('launch');await app.produce('launch');
  const submissions=calls.filter(c=>c.path==='/api/generate');assert.equal(submissions.length,3);assert.equal(new Set(submissions.map(c=>c.body.request_id)).size,3);assert.match(submissions[1].body.prompt,/Titular B/);assert.match(submissions[1].body.prompt,/Contexto B/);assert.doesNotMatch(submissions[1].body.prompt,/Titular A|Contexto A/);assert.equal(app.state.results.length,3);assert.equal(new Set(app.state.results.map(i=>i.url)).size,3);
});
test('missing credential opens local connection without fake results',async()=>{
  const {app,elements:e,calls}=harness(false);await app.produce('launch');assert.equal(calls.filter(c=>c.path==='/api/generate').length,0);assert.equal(e.connectionDialog.open,true);assert.equal(app.state.results.length,0);assert.equal(app.state.busy,false);
});
test('edited prompt is preserved and stale brief is blocked',async()=>{
  const {app,elements:e,calls}=harness();app.generatePrompt(true);e.prompt.value+=' Mi edición';e.headline.value='Otra noticia';await app.produce('launch');assert.match(e.prompt.value,/Mi edición/);assert.equal(e.generationError.hidden,false);assert.equal(calls.length,0);
});
test('version and reroll use selected generation; upscale retains its source',async()=>{
  const {app,elements:e,calls}=harness();await app.produce('launch');const original=app.state.selected;await app.upscale();e.variation.value='90';await app.produce('variation');const variation=calls.filter(c=>c.path==='/api/generate').at(-1).body;assert.equal(variation.source_id,original);assert.equal(variation.variation,90);assert.equal(variation.width,1920);await app.produce('more');const more=calls.filter(c=>c.path==='/api/generate').at(-1).body;assert.equal(more.mode,'more');assert.equal(more.source_id,undefined);
});
test('provider error shows error without generated sample',async()=>{
  const {app,elements:e}=harness(true,true);await app.produce('launch');assert.equal(app.state.results.length,0);assert.equal(e.generationError.hidden,false);assert.match(e.generationError.textContent,/Saldo insuficiente/);assert.equal(app.state.busy,false);
});
