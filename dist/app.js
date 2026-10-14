'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const STYLES = [
  {
    "name": "Surrealismo pictórico",
    "short": "Realismo mágico · Textura y volumen",
    "refs": [
      0
    ],
    "tags": [
      "Metáfora narrativa",
      "Claroscuro",
      "Técnica pictórica"
    ],
    "sampleTitle": "Acceso a la vivienda · Muestra pictórica",
    "description": "Una imagen imposible, pintada como si fuera real. Volúmenes suaves, textura de acrílico o pastel, luz dramática y una metáfora editorial con segunda lectura.",
    "rules": "Ilustración editorial contemporánea de realismo mágico y surrealismo poético. Construye una única metáfora narrativa que fusione de manera inesperada un personaje o elemento reconocible con el tema de la noticia. La asociación debe aportar una segunda lectura, no limitarse a representar literalmente el titular. Acabado pictórico tradicional: acrílico, pastel y matices de grabado; pincelada visible, textura táctil, volúmenes suaves, figuras rotundas y modelado cuidado. Claroscuro marcado, sombras profundas y luz dirigida que aporte misterio. Paleta controlada con pocos colores intensos —por ejemplo azul, rojo y ocre— equilibrados con zonas neutras. Composición refinada, cálida y psicológica. Referencia visual 1: modelado de la figura, textura, luz y fusión simbólica de dos mundos. Crea una idea original para la noticia; no repitas su personaje ni su escena. Evita vector plano, clipart, collage de recortes, fotomontaje y acabado plástico 3D."
  },
  {
    "name": "Poesía visual",
    "short": "Objeto real · Dibujo mínimo",
    "refs": [
      1,
      2,
      3
    ],
    "tags": [
      "Objeto fotografiado",
      "Tinta mínima",
      "Asociación ingeniosa"
    ],
    "sampleTitle": "Acceso a la vivienda · Objeto y dibujo",
    "description": "Un objeto cotidiano real cambia de significado al unirse a unas pocas líneas. Material, sombra y dibujo construyen juntos una greguería visual.",
    "rules": "Ilustración conceptual de poesía visual u objeto encontrado. Escoge un único objeto cotidiano real cuya forma, textura o función permita expresar la idea central de la noticia. Integra una fotografía convincente de ese objeto —material reconocible, volumen, detalles y sombra natural— con un dibujo mínimo bidimensional a tinta o acuarela sencilla. El dibujo completa o reinterpreta físicamente el objeto: ambos se convierten en una sola escena ingeniosa con doble sentido, no en elementos independientes. Fondo blanco o papel limpio, amplio espacio vacío y trazos humanos, simples y ligeramente irregulares. Prima la asociación de ideas, la pareidolia y el humor sutil. Referencias 2, 3 y 4: tierra real que parece salir de un vaso dibujado; manzana real que funciona como cabeza; virutas reales que forman un cerebro. Usa ese mecanismo de transformación para una idea nueva relacionada con el titular, sin repetir esos objetos automáticamente. Evita dibujar el objeto como vector, convertir todo en fotografía, añadir muchos recortes o adornos, fondos recargados y estética de infografía."
  },
  {
    "name": "Minimalismo conceptual",
    "short": "Doble lectura · Espacio negativo",
    "refs": [
      4,
      5
    ],
    "tags": [
      "2–3 colores planos",
      "Síntesis",
      "Vacío activo"
    ],
    "sampleTitle": "Acceso a la vivienda · Metáfora mínima",
    "description": "Una idea con doble lectura resuelta con el mínimo de formas. Colores planos, figuras esenciales y espacio negativo que participa en el significado.",
    "rules": "Ilustración editorial de minimalismo conceptual y surrealismo gráfico. Encuentra una única metáfora visual sorprendente que conecte el conflicto de la noticia con una transformación de formas o un doble significado. Reduce personajes y objetos a siluetas esenciales o líneas sintéticas expresivas. Usa dos o tres colores planos, contrastantes y saturados sobre un fondo uniforme. Sin degradados, volumen, textura, sombras realistas ni modelado 3D. El espacio negativo debe intervenir en la lectura y aislar el punto focal; deja mucho vacío y evita formas decorativas sin significado. Referencias 5 y 6: la escritura convierte pensamiento caótico en orden; la forma de un objeto se reinterpreta como otro espacio. Construye una solución original para el titular, sin copiar esas escenas. La prioridad es la idea antes que el ornamento. Evita ilustración corporativa genérica, iconos aislados sin metáfora y fondos con manchas abstractas."
  },
  {
    "name": "Infografía de pictogramas",
    "short": "Matriz de iconos · Contraste",
    "refs": [
      6
    ],
    "tags": [
      "Retícula precisa",
      "Aislamiento visual",
      "Fondo fotográfico"
    ],
    "sampleTitle": "Aislamiento visual · Ejemplo sin valor estadístico",
    "description": "Figuras humanas estandarizadas en una retícula regular. El color distingue la excepción sobre un fondo fotográfico suave, como el cielo con nubes.",
    "rules": "Gráfico editorial de pictogramas o infografía conceptual. Organiza figuras humanas genéricas y estandarizadas, tipo señalética pública, en una cuadrícula de filas y columnas simétricas, con tamaños y separaciones idénticos. Usa una mayoría de iconos en un color uniforme —por ejemplo azul— y aísla la excepción o grupo relevante con otro contrastante —por ejemplo rojo—. Añade una característica sencilla solo si ayuda a explicar la noticia. Superpone iconos planos nítidos sobre un fondo fotográfico real suave, preferiblemente cielo con nubes, manteniendo contraste y legibilidad. Referencia 7: estandarización de personas, alineación, codificación del color y combinación de iconos planos y fotografía. No conviertas los pictogramas en personajes ilustrados. Si el brief aporta una proporción verificable, represéntala fielmente e indica en la especificación la unidad que simboliza cada icono; nunca redondees de forma engañosa. Si no aporta datos, usa una agrupación conceptual sin asignarle valor estadístico. No inventes una tasa ni tomes la cantidad de iconos de la referencia como dato de la noticia."
  }
];
  function buildPrompt(){const [w,h]=formatSize();return `Crea una imagen editorial que interprete visualmente esta noticia: «${$('headline').value.trim()}».${$('description').value.trim()?'\n\nContexto de la noticia:\n'+$('description').value.trim():''}\n\nDirección de arte — ${STYLES[state.style].name}:\n${STYLES[state.style].rules}\n\nFormato de salida: ${w} × ${h} píxeles (${ $('format').selectedOptions[0].textContent.split('(')[1].replace(')','') }). Compón la imagen para esta relación de aspecto, con márgenes de seguridad y un punto focal claro.\n\nIdentifica la tensión central del titular y resuélvela con una sola metáfora visual, una segunda lectura y el mínimo de elementos necesarios. Usa las referencias como guía de lenguaje visual; crea una composición original para la noticia. No añadas texto, titulares, logotipos ni marcas de agua dentro de la imagen. No inventes cifras ni hechos. La imagen debe leerse como una ilustración, sin presentarse como fotografía documental de un suceso real.`;}
  function setupStyles(){
    STYLES.forEach((style,index)=>{
      const button=document.createElement('button');button.type='button';button.className='style-button';button.setAttribute('aria-pressed',String(index===0));button.setAttribute('aria-label',`Estilo ${index+1}: ${style.name}`);
      const strip=document.createElement('span');strip.className='style-reference-strip';
      style.refs.forEach(ref=>{const img=document.createElement('img');img.src=window.MESA_ASSETS.references[ref];img.alt=`Referencia ${ref+1}`;strip.append(img);});
      const title=document.createElement('span');title.className='style-title';title.textContent=`${index+1}. ${style.name}`;
      const subtitle=document.createElement('span');subtitle.className='style-subtitle';subtitle.textContent=style.short;
      const check=document.createElement('span');check.className='selected-check';check.textContent='✓';check.setAttribute('aria-hidden','true');
      button.append(strip,title,subtitle,check);button.addEventListener('click',()=>changeStyle(index));$('styles').append(button);
    });
    $('styleDescription').textContent=STYLES[0].description;updateStyleDetails();
  }

  function updateStyleDetails(){
    const style=STYLES[state.style];
    $('referenceSummary').textContent=style.refs.length===1?`Tu imagen ${style.refs[0]+1}`:`Tus imágenes ${style.refs.map(i=>i+1).join(', ')}`;
    $('styleTags').replaceChildren(...style.tags.map(text=>{const el=document.createElement('span');el.textContent=text;return el;}));
  }
  function showReferences(){
    const style=STYLES[state.style];$('referenceTitle').textContent=style.name;$('referenceDescription').textContent=style.description;
    const grid=$('referenceImages');grid.replaceChildren();
    style.refs.forEach(ref=>{const figure=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');img.src=window.MESA_ASSETS.references[ref];img.alt=`Imagen ${ref+1}, referencia para ${style.name}`;cap.textContent=`Imagen ${ref+1} · Tu referencia`;figure.append(img,cap);grid.append(figure);});
    $('referenceRules').textContent=style.rules;$('referencesDialog').showModal();
  }

  const state = {style:0, results:[], selected:null, sequence:0, busy:false, promptBrief:null, lastGenerated:null, connected:false, server:false, csrf:null};
  let toastTimer;
  let sampleImages = [];
  const selected = () => state.results.find(r=>r.id===state.selected);
  const brief = () => JSON.stringify([$('headline').value,$('description').value,state.style,$('format').value]);
  const formatSize = () => $('format').value.split('x').map(Number);
  const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
  function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
  function error(message){$('generationError').textContent=message;$('generationError').hidden=!message;}
  function validateHeadline(){const ok=!!$('headline').value.trim();$('headlineError').hidden=ok;$('headline').setAttribute('aria-invalid',String(!ok));if(!ok)$('headline').focus();return ok;}
  function promptStatus(){const value=$('prompt').value;$('promptCount').textContent=`${value.length.toLocaleString('es-ES')} caracteres`;$('copyBtn').disabled=!value.trim()||state.busy;$('promptState').textContent=!value.trim()?'POR CREAR':state.promptBrief!==null&&state.promptBrief!==brief()?'NOTICIA MODIFICADA':'EDITABLE · TU DIRECCIÓN';}
  function generatePrompt(silent=false){if(!validateHeadline())return false;$('prompt').value=buildPrompt();state.lastGenerated=$('prompt').value;state.promptBrief=brief();$('promptError').hidden=true;error('');promptStatus();if(!silent)toast('Prompt listo. Puedes editarlo antes de lanzar.');return true;}
  function prepareCurrentPrompt(){
    if(!validateHeadline())return false;
    const value=$('prompt').value;
    if(!value.trim()||value===state.lastGenerated)generatePrompt(true);
    else if(state.promptBrief!==null&&state.promptBrief!==brief()){
      error('Has cambiado la noticia, el estilo o el formato después de editar el prompt. Pulsa «Generar Prompt» para actualizarlo antes de lanzar. Tus cambios siguen en el cuadro.');
      $('prompt').focus();return false;
    }
    if($('prompt').value.length>31000){error('El contexto admite texto largo, pero el generador acepta hasta 31.000 caracteres en el prompt. Resúmelo en el cuadro; no se enviará recortado.');return false;}
    return true;
  }
  function changeStyle(index){
    if(state.busy)return;state.style=index;state.selected=null;
    document.querySelectorAll('.style-button').forEach((button,i)=>button.setAttribute('aria-pressed',String(index===i)));
    document.querySelectorAll('.gallery-item').forEach(button=>button.setAttribute('aria-pressed','false'));
    $('styleDescription').textContent=STYLES[index].description;updateStyleDetails();
    if($('prompt').value&&$('prompt').value===state.lastGenerated&&$('headline').value.trim())generatePrompt(true);
    promptStatus();showExample();syncActions();
  }
  function setBusy(value,label){state.busy=value;$('processing').hidden=!value;if(label)$('processingLabel').textContent=label;$('stage').setAttribute('aria-busy',String(value));['headline','description','format','prompt','versions','variation','generateBtn','launchBtn','exampleBtn','connectionBtn'].forEach(id=>$(id).disabled=value);document.querySelectorAll('.style-button,.gallery-item').forEach(b=>b.disabled=value);syncActions();promptStatus();}
  function syncActions(){const item=selected();['downloadBtn','versionBtn','moreBtn'].forEach(id=>$(id).disabled=state.busy||!item);$('upscaleBtn').disabled=state.busy||!item||item.upscaled;$('upscaleBtn').title='Duplica la resolución por interpolación; no añade detalle con IA.';}
  function renderArtwork(canvas,item){
    const ctx=canvas.getContext('2d'),img=item.example?sampleImages[item.style]:item.image;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!img)return;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    if(!item.example){ctx.drawImage(img,0,0,canvas.width,canvas.height);return;}
    ctx.fillStyle=['#e9dfc9','#fff','#0759c4','#b6d4e6'][item.style];ctx.fillRect(0,0,canvas.width,canvas.height);
    const scale=Math.min(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    ctx.drawImage(img,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
  }
  function paintPreview(item){const canvas=$('previewCanvas'),scale=Math.min(1,1500/Math.max(item.width,item.height));canvas.width=Math.round(item.width*scale);canvas.height=Math.round(item.height*scale);renderArtwork(canvas,item);$('stage').classList.toggle('portrait',item.height>item.width);$('stage').classList.toggle('square',item.height===item.width);$('dimensions').textContent=`${item.width} × ${item.height} px`;canvas.setAttribute('aria-label',`${item.example?'Ejemplo del estilo':item.headline}. ${STYLES[item.style].name}. ${item.width} por ${item.height} píxeles.`);}
  function showExample(){const [width,height]=formatSize();paintPreview({style:state.style,width,height,example:true});$('previewMode').textContent='EJEMPLO DEL ESTILO';$('artName').textContent=STYLES[state.style].sampleTitle;$('artSubtitle').textContent=STYLES[state.style].name+' · Seleccionado';$('sampleExplanation').textContent='Ejemplo de lenguaje visual. Al lanzar tu prompt, aquí aparecerá una imagen nueva creada para tu noticia.';$('resultHint').textContent='Escribe tu noticia y lanza una nueva ilustración.';}
  function showResult(item){
    state.selected=item.id;paintPreview(item);$('previewMode').textContent='GENERADA CON IA';$('artName').textContent=item.headline;
    $('artSubtitle').textContent=`Propuesta ${String(item.sequence).padStart(2,'0')} · ${STYLES[item.style].name}${item.kind==='variation'?' · Variación '+item.variation+'%':''}${item.upscaled?' · Upscale 2×':''}`;
    $('sampleExplanation').textContent='Imagen creada a partir de su prompt. Cada lanzamiento solicita una nueva generación.';
    $('resultHint').textContent='PNG listo en el formato elegido.';$('iterationNote').textContent=item.upscaled?'Resolución duplicada por interpolación; no añade detalle nuevo con IA.':'Versionar parte de esta imagen. Más opciones crea nuevas ilustraciones con el mismo prompt.';
    syncActions();document.querySelectorAll('.gallery-item').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.id===item.id)));
  }
  function renderGallery(){const gallery=$('gallery');if(!state.results.length)return;gallery.replaceChildren();[...state.results].reverse().forEach(item=>{
    const button=document.createElement('button');button.type='button';button.className='gallery-item';button.dataset.id=item.id;button.disabled=state.busy;button.setAttribute('aria-pressed',String(item.id===state.selected));button.setAttribute('aria-label',`Seleccionar propuesta ${item.sequence}: ${item.headline}, ${STYLES[item.style].name}`);
    const image=document.createElement('img');image.src=item.url;image.alt='';
    const label=document.createElement('span');label.className='thumb-label';const number=document.createElement('b');number.textContent=String(item.sequence).padStart(2,'0');const kind=document.createElement('span');kind.className='thumb-type';kind.textContent=item.upscaled?'UPSCALE 2×':item.kind==='variation'?'VAR. '+item.variation+'%':'NUEVA';
    label.append(number,kind);button.append(image,label);button.addEventListener('click',()=>showResult(item));gallery.append(button);
  });$('galleryCount').textContent=state.results.length;$('galleryLabel').textContent=state.sequence>40?'ÚLTIMAS 40 · '+state.sequence+' CREADAS':'SELECCIONA PARA EXPLORAR';}
  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('La imagen se generó, pero no se pudo cargar. Recarga el dashboard para recuperarla.'));img.src=src;});}
  async function addResults(items){let newest=null;for(const item of items){if(state.results.some(r=>r.id===item.id))continue;const image=await loadImage(item.url);newest={...item,image,serverId:item.id,sequence:++state.sequence};state.results.push(newest);}state.results=state.results.slice(-40);if(newest){state.selected=newest.id;renderGallery();showResult(newest);}return newest;}
  async function api(path,data){
    let response;
    try{response=await fetch(path,{method:data===undefined?'GET':'POST',cache:'no-store',headers:data===undefined?{}:{'Content-Type':'application/json','X-Mesa-Token':state.csrf||''},body:data===undefined?undefined:JSON.stringify(data)});}catch{throw new Error('No se puede conectar con Mesa Visual. Mantén abierto el servidor local y recarga la página.');}
    let result;try{result=await response.json();}catch{throw new Error('Esta vista necesita el servidor de Mesa Visual para generar imágenes. Abre el dashboard en http://127.0.0.1:8765.');}
    if(!response.ok)throw new Error(result.error||'No se ha podido completar la petición.');return result;
  }
  function updateConnection(){
    $('connectionLabel').textContent=state.connected?'OpenAI conectado':'Conectar OpenAI';$('connectionBtn').classList.toggle('connected',state.connected);
    $('connectionStatus').textContent=state.connected?'Generación lista · Cada imagen utiliza saldo de tu API.':state.server?'Conecta OpenAI para crear imágenes nuevas con cada prompt.':'Inicia el servidor de Mesa Visual para activar la generación.';
    $('disconnectBtn').hidden=!state.connected;$('connectBtn').textContent=state.connected?'Actualizar conexión':'Conectar';
  }
  async function checkConnection(){try{const status=await api('/api/status');if(status.service!=='mesa-visual')throw new Error('Servidor no válido');state.server=true;state.connected=status.configured;state.csrf=status.csrf;}catch{state.server=false;state.connected=false;}updateConnection();return state.server&&state.connected;}
  function openConnection(){
    $('connectionError').hidden=true;$('apiKey').value='';$('connectBtn').disabled=!state.server;
    $('connectionHelp').textContent=state.server?'La clave se guarda solo en la memoria del servidor local durante esta sesión. Nunca se incorpora al archivo ni a las imágenes.':'Abre la carpeta Mesa Visual y ejecuta server.py. Después entra en http://127.0.0.1:8765 para conectar la generación.';
    $('connectionDialog').showModal();
  }
  async function connect(event){event.preventDefault();let key=$('apiKey').value.trim();$('apiKey').value='';$('connectBtn').disabled=true;$('disconnectBtn').disabled=true;$('connectionError').hidden=true;$('connectBtn').textContent='Comprobando…';try{await api('/api/connect',{key});state.connected=true;updateConnection();$('connectionDialog').close();error('');toast('OpenAI conectado. Ya puedes lanzar tu prompt.');}catch(err){$('connectionError').textContent=err.message;$('connectionError').hidden=false;}finally{key='';$('connectBtn').disabled=false;$('disconnectBtn').disabled=false;updateConnection();}}
  async function monitorJob(jobId){
    let lastJob=null;
    while(true){
      try{lastJob=await api('/api/jobs/'+encodeURIComponent(jobId));}catch(err){throw new Error(err.message+' La generación puede seguir en curso; recarga para recuperar su estado antes de volver a lanzar.');}
      await addResults(lastJob.images);
      $('processingLabel').textContent=`Generando ${Math.min(lastJob.completed+1,lastJob.count)} de ${lastJob.count}…`;
      if(lastJob.status==='failed')throw new Error(lastJob.error||'El generador no pudo completar la imagen.');
      if(lastJob.status==='completed')return lastJob;
      await pause(1500);
    }
  }
  async function produce(mode){
    if(state.busy)return;error('');const source=selected();
    if(mode==='launch'){if(!prepareCurrentPrompt())return;}else if(!source)return;
    setBusy(true,'Conectando con el generador…');
    try{
      if(!await checkConnection()){openConnection();return;}
      const [width,height]=mode==='launch'?formatSize():[source.baseWidth,source.baseHeight];
      const payload={request_id:crypto.randomUUID(),mode,headline:mode==='launch'?$('headline').value.trim():source.headline,prompt:mode==='launch'?$('prompt').value.trim():source.prompt,style:mode==='launch'?state.style:source.style,width,height,count:Number($('versions').value),variation:Number($('variation').value),source_id:mode==='variation'?source.serverId:undefined};
      const result=await api('/api/generate',payload);
      const job=await monitorJob(result.job_id);
      toast(`${job.completed} ${job.completed===1?'ilustración nueva creada':'ilustraciones nuevas creadas'}.`);
      if(innerWidth<800)$('previewHeading').scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){error(err.message);toast('No se ha completado la generación. Revisa el aviso junto al prompt.');}finally{setBusy(false);}
  }
  async function upscale(){const source=selected();if(!source||state.busy||source.upscaled)return;const item={...source,id:crypto.randomUUID(),sequence:++state.sequence,width:source.baseWidth*2,height:source.baseHeight*2,upscaled:true};state.results.push(item);state.results=state.results.slice(-40);state.selected=item.id;renderGallery();showResult(item);toast('Resolución duplicada por interpolación.');}
  async function download(){const item=selected();if(!item||state.busy)return;setBusy(true,'Preparando tu PNG…');let canvas;try{canvas=document.createElement('canvas');canvas.width=item.width;canvas.height=item.height;renderArtwork(canvas,item);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG vacío')),'image/png'));const url=URL.createObjectURL(blob),a=document.createElement('a');const slug=item.headline.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'editorial';a.href=url;a.download=`mesa-visual-${slug}-${item.sequence}-${item.width}x${item.height}.png`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('PNG preparado. La descarga se ha iniciado.');}catch{error('No se pudo preparar el PNG. Recarga para recuperar la imagen y vuelve a intentarlo.');}finally{if(canvas){canvas.width=1;canvas.height=1;}setBusy(false);}}
  $('generateBtn').addEventListener('click',()=>generatePrompt());$('launchBtn').addEventListener('click',()=>produce('launch'));$('versionBtn').addEventListener('click',()=>produce('variation'));$('moreBtn').addEventListener('click',()=>produce('more'));$('upscaleBtn').addEventListener('click',upscale);$('downloadBtn').addEventListener('click',download);
  $('variation').addEventListener('input',()=>{$('variationValue').textContent=$('variation').value+'%';});
  ['headline','description'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='headline'&&$('headline').value.trim()){$('headlineError').hidden=true;$('headline').setAttribute('aria-invalid','false');}promptStatus();}));
  $('format').addEventListener('change',()=>{const [w,h]=formatSize();$('ratioIcon').style.width=w===h?'13px':w<h?'10px':'17px';$('ratioIcon').style.height=w===h?'13px':w<h?'17px':'11px';promptStatus();if(!selected())showExample();});
  $('prompt').addEventListener('input',()=>{if(state.promptBrief===null)state.promptBrief=brief();$('promptError').hidden=true;promptStatus();});
  $('exampleBtn').addEventListener('click',()=>{$('headline').value='La vivienda se aleja de los jóvenes';$('description').value='El aumento de los alquileres y la falta de oferta dificultan el acceso de los jóvenes a su primera vivienda.';$('headlineError').hidden=true;$('headline').setAttribute('aria-invalid','false');promptStatus();toast('Ejemplo cargado. El prompt se actualizará al lanzar.');});
  $('copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('prompt').value);toast('Prompt copiado.');}catch{$('prompt').focus();$('prompt').select();toast('Texto seleccionado. Usa Ctrl+C o ⌘C para copiar.');}});
  $('helpBtn').addEventListener('click',()=>$('helpDialog').showModal());['closeHelpBtn','startBtn'].forEach(id=>$(id).addEventListener('click',()=>$('helpDialog').close()));
  $('referencesBtn').addEventListener('click',showReferences);$('closeReferencesBtn').addEventListener('click',()=>$('referencesDialog').close());
  $('connectionBtn').addEventListener('click',async()=>{await checkConnection();openConnection();});$('closeConnectionBtn').addEventListener('click',()=>$('connectionDialog').close());$('connectionDialog').addEventListener('close',()=>$('apiKey').value='');$('connectionForm').addEventListener('submit',connect);
  $('disconnectBtn').addEventListener('click',async()=>{try{await api('/api/disconnect',{});state.connected=false;updateConnection();$('connectionDialog').close();toast('Clave eliminada de la sesión.');}catch(err){$('connectionError').textContent=err.message;$('connectionError').hidden=false;}});
  async function init(){
    setupStyles();setBusy(true,'Cargando tus estilos…');
    try{sampleImages=await Promise.all(window.MESA_ASSETS.samples.map(loadImage));showExample();}catch{error('No se pudieron cargar los ejemplos de estilo. La generación sigue disponible.');}
    await checkConnection();
    if(state.server){try{const data=await api('/api/results');await addResults(data.images);if(data.active_job){await monitorJob(data.active_job);}}catch(err){error(err.message);}}
    setBusy(false);
  }
  init();
})();
