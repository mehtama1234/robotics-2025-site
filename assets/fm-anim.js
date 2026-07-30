/* fm-anim.js — first-principles mechanism animators for the Foundation Models explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-fmanim="name". Self-contained boot. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              green:'#6FCf7f', ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440' };
  const TAU=Math.PI*2;
  function fit(cv){const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=parseInt(cv.getAttribute('height'))||300;
    cv.width=w*dpr;cv.height=h*dpr;const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h};}
  function clear(ctx,w,h){ctx.clearRect(0,0,w,h);}
  function lab(ctx,s,x,y,col,size,align){ctx.save();ctx.font=(size||10.5)+'px ui-monospace,Menlo,monospace';
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;String(s).split('\n').forEach(function(ln,i){ctx.fillText(ln,x,y+i*((size||10.5)+2));});ctx.restore();}
  function hexA(hex,a){const n=parseInt(hex.slice(1),16);return'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
  function rrect(ctx,x,y,w,h,r,stroke,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke();}}
  function box(ctx,x,y,w,h,text,col,fill){rrect(ctx,x,y,w,h,7,col,fill||null);lab(ctx,text,x+w/2,y+h/2,col,10.5,'center');}
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=5.5;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function ring(ctx,x,y,r,col){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
  const saw=(t,p)=>((t%p)/p);
  const A={};

  /* 01 — WHY: robot data is scarce; the web is an ocean of how the world works. */
  A.fm_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Robot data is scarce; the web already recorded how the world works',14,16,C.dim);
    // tiny robot-demo pile vs huge web ocean
    const rx=w*0.16,ry=h*0.7;lab(ctx,'robot demonstrations',rx-40,ry-58,C.amber,9);lab(ctx,'(scarce, costly)',rx-30,ry-44,C.mut,8.5);
    for(let i=0;i<8;i++)rrect(ctx,rx-24+(i%4)*12,ry-20+Math.floor(i/4)*12,10,10,2,hexA(C.amber,0.7),null);
    // web ocean
    const ox=w*0.62,oy=h*0.5;lab(ctx,'the web: trillions of words + images',ox-40,oy-70,C.cyan,9);
    for(let i=0;i<120;i++){const a=(i*2.4),r=8+((i*13)%110);dot(ctx,ox+Math.cos(a)*r*1.0,oy+Math.sin(a)*r*0.5,1.6,hexA(i%3?C.cyan:C.violet,0.5));}
    // pretrain arrow
    arrow(ctx,rx+40,ry-10,ox-70,oy,C.green,1.6);lab(ctx,'learn the world here first,\nthen adapt to the robot',w*0.3,h*0.82,C.green,9);
    lab(ctx,'a foundation model is trained once on the web, then reused as the robot brain',14,h-12,C.mut);
  };

  /* 02 — PRETRAIN: self-supervised learning on the web builds broad knowledge. */
  A.fm_pretrain=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pretraining: predict the missing piece, over and over, until it knows the world',14,16,C.dim);
    // masked prediction: a sentence / image patch with a blank being filled
    const p=saw(t,3);
    rrect(ctx,w*0.06,h*0.32,w*0.42,26,5,C.line,null);
    lab(ctx,'"the cat sat on the ___"',w*0.08,h*0.32+13,C.cyan,10);
    const guesses=['mat','floor','sofa'];
    box(ctx,w*0.54,h*0.3,w*0.16,30,'giant\nmodel',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.48,h*0.45,w*0.54,h*0.45,C.cyan,1.3);
    arrow(ctx,w*0.7,h*0.45,w*0.78,h*0.45,C.green,1.3);
    lab(ctx,'predicts: "'+guesses[Math.floor(p*3)]+'"',w*0.79,h*0.45,C.green,9.5);
    // knowledge blob growing
    lab(ctx,'billions of such predictions build broad knowledge:',w*0.06,h*0.66,C.mut,9);
    ['objects & their parts','words & meaning','everyday physics','cause & effect','common sense'].forEach((s,i)=>lab(ctx,'• '+s,w*0.08,h*0.72+i*15,C.mut,8.5));
    lab(ctx,'no labels needed — the data is its own supervision, at internet scale',14,h-12,C.mut);
  };

  /* 03 — TRANSFER: one backbone, many robot jobs. */
  A.fm_transfer=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One pretrained backbone becomes the planner, the eyes, and the instruction-reader',14,16,C.dim);
    box(ctx,w*0.06,h*0.42,w*0.2,34,'pretrained\nbackbone',C.violet,hexA(C.violet,0.1));
    const jobs=[['planner','decompose the goal',C.amber,0.28],['perception','name what it sees',C.cyan,0.5],['instructions','read plain language',C.green,0.72]];
    jobs.forEach((j,i)=>{const y=h*j[3];arrow(ctx,w*0.26,h*0.5,w*0.58,y,hexA(j[2],0.7),1.4);
      box(ctx,w*0.58,y-13,w*0.18,26,j[0],j[2],hexA(j[2],0.08));lab(ctx,j[1],w*0.78,y,C.mut,8.5);});
    const p=saw(t,3);dot(ctx,w*0.26+(w*0.32)* (jobs[Math.floor(p*3)][3]-0.5>0?1:1)*0,0,0,C.violet); // noop keep t used
    lab(ctx,'adapt it — a light fine-tune or just a prompt — instead of training each from scratch',14,h-12,C.mut);
  };

  /* 04 — PLAN: language as the planning language. */
  A.fm_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reasoning: the model turns a plain goal into an ordered plan of actions',14,16,C.dim);
    rrect(ctx,w*0.06,h*0.28,w*0.3,24,5,C.amber,hexA(C.amber,0.08));lab(ctx,'goal: "make a coffee"',w*0.08,h*0.28+12,C.amber,10);
    box(ctx,w*0.44,h*0.4,w*0.16,30,'LLM\nreasoner',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.21,h*0.4,w*0.46,h*0.4,C.amber,1.3);
    const steps=['1 find the mug','2 place under spout','3 press brew','4 wait, bring it'];
    const p=saw(t,4);const shown=Math.floor(p*4)+1;
    steps.forEach((s,i)=>{if(i<shown){rrect(ctx,w*0.66,h*0.28+i*24,w*0.28,20,4,C.green,hexA(C.green,0.06));lab(ctx,s,w*0.68,h*0.28+i*24+10,C.green,9);}});
    arrow(ctx,w*0.6,h*0.4,w*0.66,h*0.4,C.violet,1.3);
    lab(ctx,'as steps, as code, or as a behavior tree — then each step is grounded to a real skill',14,h-12,C.mut);
  };

  /* 05 — LIMITS: hallucination + no feel for precise geometry. */
  A.fm_limits=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The catch: it is confidently wrong, and it cannot feel precise geometry',14,16,C.dim);
    // hallucination: a made-up but plausible answer
    box(ctx,w*0.06,h*0.3,w*0.16,26,'model',C.violet,hexA(C.violet,0.08));
    rrect(ctx,w*0.28,h*0.28,w*0.34,22,4,C.coral,hexA(C.coral,0.06));lab(ctx,'"the knob is on the left" (it is not)',w*0.3,h*0.28+11,C.coral,8.5);
    arrow(ctx,w*0.22,h*0.4,w*0.28,h*0.4,C.violet,1.2);lab(ctx,'hallucination: fluent, plausible, wrong',w*0.28,h*0.56,C.coral,9);
    // geometry: proposes a bad grasp point
    const ox=w*0.72,oy=h*0.6;ring(ctx,ox,oy,26,hexA(C.amber,0.9));lab(ctx,'mug',ox,oy,C.amber,9,'center');
    dot(ctx,ox+Math.cos(2.2)*26,oy+Math.sin(2.2)*26,4,C.coral);lab(ctx,'grasp here?\n(misses the handle)',ox-4,oy+40,C.coral,8.5);
    lab(ctx,'so it needs grounding (precise 3D from perception) and a check before it acts',14,h-12,C.mut);
  };

  // ---- family animators ----

  /* fmf_bt_plan — LLM behavior-tree & symbolic planning */
  A.fmf_bt_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'LLM generates a behavior tree; execution failures expand it',14,16,C.dim);
    var p=saw(t,4);
    // goal box
    rrect(ctx,w*0.04,h*0.28,w*0.2,22,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"make tea"',w*0.04+6,h*0.28+11,C.amber,10);
    // LLM box
    box(ctx,w*0.32,h*0.36,w*0.16,28,'LLM\nplanner',C.violet,hexA(C.violet,0.1));
    arrow(ctx,w*0.24,h*0.39,w*0.32,h*0.39,C.amber,1.4);
    // BT nodes (appear progressively)
    var nodes=[['find\nkettle',C.cyan,0.6,0.22],['fill &\nboil',C.cyan,0.6,0.46],['pour\n& serve',C.cyan,0.6,0.7],['FAIL\nfix',C.coral,0.82,0.34]];
    var shown=Math.min(nodes.length,Math.floor(p*nodes.length)+1);
    nodes.forEach(function(nd,i){if(i>=shown)return;
      box(ctx,w*nd[2],h*nd[3]-11,w*0.16,22,nd[0],nd[1],hexA(nd[1],0.07));
      if(i<3)arrow(ctx,w*0.48,h*0.39,w*nd[2],h*nd[3],hexA(C.violet,0.6),1.2);});
    lab(ctx,'failure at runtime → LLM expands a new subtree to recover',14,h-12,C.mut);
  };

  /* fmf_scene_und — language-grounded scene understanding */
  A.fmf_scene_und=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Open-vocabulary VLM: match image patches to any text query',14,16,C.dim);
    var p=saw(t,3);
    // image patches (grid)
    var gx=w*0.06,gy=h*0.28,sz=28,gap=4;
    for(var r=0;r<3;r++)for(var c=0;c<4;c++){
      var hi=(r===1&&c===2);
      rrect(ctx,gx+c*(sz+gap),gy+r*(sz+gap),sz,sz,4,hi?C.cyan:C.line,hi?hexA(C.cyan,0.18):null);}
    lab(ctx,'image\npatches',gx,gy+3*sz+12,C.mut,8.5);
    // text query
    rrect(ctx,w*0.52,h*0.3,w*0.22,22,5,C.amber,hexA(C.amber,0.08));
    lab(ctx,'"AeroPress?"',w*0.54,h*0.3+11,C.amber,10);
    // similarity arrow
    arrow(ctx,w*0.74,h*0.39,w*0.88,h*0.39,C.green,1.3);
    var scores=['0.12','0.31','0.89'];
    lab(ctx,'sim: '+scores[Math.min(2,Math.floor(p*3))],w*0.89,h*0.39,C.green,9.5);
    // 3D depth
    lab(ctx,'top match → depth → 3D pose [0.4m, 0.1m, 1.2m]',w*0.06,h*0.75,C.cyan,9);
    lab(ctx,'no labeled training on this object — the VLM alignment generalizes',14,h-12,C.mut);
  };

  /* fmf_icl — in-context learning & prompting */
  A.fmf_icl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Demonstrations as tokens: adapt at inference, no gradient update',14,16,C.dim);
    var p=saw(t,3.5);
    // demo context tokens
    var demos=['demo 1','demo 2','demo 3'];
    demos.forEach(function(d,i){rrect(ctx,w*0.06+i*w*0.14,h*0.3,w*0.12,24,5,C.violet,hexA(C.violet,0.08));lab(ctx,d,w*0.06+i*w*0.14+6,h*0.3+12,C.violet,9);});
    // current obs
    rrect(ctx,w*0.52,h*0.3,w*0.12,24,5,C.amber,hexA(C.amber,0.08));lab(ctx,'obs now',w*0.54,h*0.3+12,C.amber,9);
    // transformer box
    box(ctx,w*0.7,h*0.38,w*0.22,30,'causal\ntransformer',C.cyan,hexA(C.cyan,0.08));
    arrow(ctx,w*0.64,h*0.42,w*0.7,h*0.42,C.amber,1.3);
    // predicted action appearing
    if(p>0.4){arrow(ctx,w*0.92,h*0.42,w*0.98,h*0.42,C.green,1.3);lab(ctx,'action\ntoken',w*0.89,h*0.55,C.green,9);}
    lab(ctx,'68% success with 3 demos vs 12% zero-shot — no weight update',14,h-12,C.mut);
  };

  /* fmf_hier_plan — hierarchical task decomposition */
  A.fmf_hier_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Hierarchical planning: LLM handles "what", skill library handles "how"',14,16,C.dim);
    var p=saw(t,4);
    // goal
    rrect(ctx,w*0.06,h*0.2,w*0.25,22,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"set table for 4"',w*0.08,h*0.2+11,C.amber,9.5);
    // LLM subgoals appearing
    var subs=['fetch plates','place plates','fetch cutlery','place cutlery','fetch glasses','place glasses'];
    var shown=Math.min(subs.length,Math.floor(p*subs.length)+1);
    lab(ctx,'LLM subgoals:',w*0.06,h*0.42,C.violet,9);
    subs.forEach(function(s,i){if(i>=shown)return;
      rrect(ctx,w*0.06+i*w*0.15,h*0.48,w*0.13,20,4,C.violet,hexA(C.violet,0.07));
      lab(ctx,s,w*0.06+i*w*0.15+4,h*0.48+10,C.violet,8);});
    // skill library
    lab(ctx,'skill library: pick / place / navigate',w*0.06,h*0.76,C.cyan,9);
    lab(ctx,'61% success (hierarchical) vs 23% (flat policy) on novel layouts',14,h-12,C.mut);
  };

  /* fmf_sem_nav — semantic navigation & object search */
  A.fmf_sem_nav=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'LLM semantic prior guides room-by-room search',14,16,C.dim);
    var p=saw(t,4);
    // rooms
    var rooms=[['office',0.82,w*0.08,h*0.35],['conf. rm',0.61,w*0.32,h*0.3],['kitchen',0.34,w*0.56,h*0.38],['bedroom',0.12,w*0.72,h*0.55]];
    rooms.forEach(function(rm,i){
      var col=i<Math.floor(p*4)+1?C.green:C.line;
      rrect(ctx,rm[2],rm[3],w*0.18,28,5,col,hexA(col,0.08));
      lab(ctx,rm[0]+'\n'+rm[1],rm[2]+4,rm[3]+8,col,8.5);});
    // robot dot moving
    var visited=Math.min(rooms.length-1,Math.floor(p*rooms.length));
    var rx=rooms[visited][2]+w*0.09,ry=rooms[visited][3]+14;
    dot(ctx,rx,ry,7,C.amber);lab(ctx,'robot',rx+10,ry,C.amber,8.5);
    lab(ctx,'2.4 steps avg (LLM-guided) vs 6.1 (random) — prior from web knowledge',14,h-12,C.mut);
  };

  /* fmf_vl_manip — vision-language manipulation */
  A.fmf_vl_manip=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'VLM aligns instruction to image → grasp pose → recovery if needed',14,16,C.dim);
    var p=saw(t,3);
    // 3 mug objects
    var mugs=[{col:C.coral,x:w*0.1},{col:C.cyan,x:w*0.22},{col:C.green,x:w*0.34}];
    mugs.forEach(function(m){ring(ctx,m.x,h*0.42,18,m.col);lab(ctx,'mug',m.x,h*0.52,m.col,8,'center');});
    // instruction box
    rrect(ctx,w*0.5,h*0.28,w*0.24,22,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"pick the blue mug"',w*0.52,h*0.28+11,C.amber,8.5);
    // attention to blue mug
    if(p>0.3){arrow(ctx,w*0.5,h*0.39,w*0.22+18,h*0.38,C.cyan,1.6);lab(ctx,'attend',w*0.36,h*0.32,C.cyan,8.5);}
    // grasp pose output
    if(p>0.6){rrect(ctx,w*0.76,h*0.38,w*0.22,22,5,C.green,hexA(C.green,0.08));lab(ctx,'6-DOF\ngrasp pose',w*0.78,h*0.38+10,C.green,8.5);}
    lab(ctx,'83% success with recovery vs 61% without — VLM supervisor corrects failures',14,h-12,C.mut);
  };

  /* fmf_code_pol — code-as-policy generation */
  A.fmf_code_pol=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'LLM writes executable code; a checker catches constraint violations',14,16,C.dim);
    var p=saw(t,3);
    // constraint input
    rrect(ctx,w*0.04,h*0.26,w*0.3,22,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"never place food on floor"',w*0.06,h*0.26+11,C.amber,8.5);
    box(ctx,w*0.42,h*0.34,w*0.16,28,'LLM\ncoder',C.violet,hexA(C.violet,0.1));
    arrow(ctx,w*0.34,h*0.4,w*0.42,h*0.4,C.amber,1.3);
    // generated code snippet
    if(p>0.25){rrect(ctx,w*0.62,h*0.28,w*0.34,40,5,C.line,hexA(C.cyan,0.06));
      lab(ctx,'def place(obj,loc):',w*0.64,h*0.28+10,C.cyan,8.5);
      lab(ctx,'  assert loc != floor',w*0.64,h*0.28+24,C.green,8.5);}
    // checker
    if(p>0.6){rrect(ctx,w*0.62,h*0.56,w*0.18,22,5,C.coral,hexA(C.coral,0.08));lab(ctx,'checker\n✓ / fix',w*0.64,h*0.56+10,C.coral,8.5);
      arrow(ctx,w*0.79,h*0.48,w*0.71,h*0.56,C.coral,1.2);}
    lab(ctx,'assertion fires → LLM sees stack trace → corrects in one round',14,h-12,C.mut);
  };

  /* fmf_rag_mem — retrieval-augmented robot memory */
  A.fmf_rag_mem=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'RAG: retrieve the relevant passage; LLM reasons over it, not its memory',14,16,C.dim);
    var p=saw(t,3.5);
    // knowledge base
    rrect(ctx,w*0.06,h*0.3,w*0.22,60,6,C.line,hexA(C.violet,0.05));
    lab(ctx,'site manual\n400 pages',w*0.08,h*0.3+18,C.g2||C.mut,8.5);
    for(var i=0;i<5;i++)rrect(ctx,w*0.09,h*0.38+i*9,w*0.16,7,2,C.line,null);
    // query
    box(ctx,w*0.38,h*0.32,w*0.24,26,'query\nvector',C.amber,hexA(C.amber,0.08));
    arrow(ctx,w*0.28,h*0.45,w*0.38,h*0.45,C.amber,1.3);
    // top-3 retrieved
    if(p>0.3){arrow(ctx,w*0.62,h*0.45,w*0.74,h*0.38,C.cyan,1.2);
      rrect(ctx,w*0.74,h*0.28,w*0.22,44,5,C.cyan,hexA(C.cyan,0.07));
      lab(ctx,'top-3\npassages',w*0.76,h*0.28+16,C.cyan,8.5);}
    // LLM with context
    if(p>0.65){box(ctx,w*0.74,h*0.64,w*0.22,26,'LLM +\ncontext',C.green,hexA(C.green,0.07));
      lab(ctx,'91% compliance',w*0.74,h*0.78,C.green,8.5);}
    lab(ctx,'91% compliance (RAG) vs 54% (LLM alone) on site-specific rules',14,h-12,C.mut);
  };

  /* fmf_vis_instruct — visual instruction tuning */
  A.fmf_vis_instruct=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Instruction tuning: supervised on (instruction, image, answer) triples',14,16,C.dim);
    var p=saw(t,3);
    // before / after
    rrect(ctx,w*0.06,h*0.28,w*0.28,30,6,C.line,hexA(C.coral,0.06));
    lab(ctx,'base VLM: captions\nbut cannot follow instructions',w*0.08,h*0.28+8,C.coral,8.5);
    arrow(ctx,w*0.36,h*0.43,w*0.56,h*0.43,C.violet,1.6);
    rrect(ctx,w*0.42,h*0.36,w*0.12,16,4,C.violet,hexA(C.violet,0.08));lab(ctx,'150K\ninstruction pairs',w*0.29,h*0.56,C.violet,8);
    rrect(ctx,w*0.58,h*0.28,w*0.34,30,6,C.line,hexA(C.green,0.06));
    lab(ctx,'tuned VLM: answers questions,\nfollows format, multi-turn',w*0.6,h*0.28+8,C.green,8.5);
    // loss diagram
    if(p>0.4){lab(ctx,'loss: next-token on answer only; image+instruction = context',w*0.06,h*0.68,C.cyan,8.5);}
    if(p>0.7){lab(ctx,'8% less forgetting with gradient guidance',w*0.06,h*0.78,C.green,8.5);}
    lab(ctx,'turns a text-completer into an assistant — by supervised fine-tuning on directives',14,h-12,C.mut);
  };

  /* fmf_halluc — hallucination mitigation & grounding */
  A.fmf_halluc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Contrastive decoding: suppress tokens whose score rises without the image',14,16,C.dim);
    var p=saw(t,3);
    // image (plate)
    ring(ctx,w*0.14,h*0.44,28,C.cyan);lab(ctx,'blue plate',w*0.14,h*0.44,C.cyan,8,'center');
    // model outputs without grounding
    rrect(ctx,w*0.32,h*0.3,w*0.18,22,5,C.coral,hexA(C.coral,0.07));lab(ctx,'"white" ✗',w*0.34,h*0.3+11,C.coral,9.5);
    lab(ctx,'no image\nanchor',w*0.33,h*0.48,C.mut,8);
    // contrastive fix
    arrow(ctx,w*0.06,h*0.5,w*0.32,h*0.5,C.cyan,1.3);
    if(p>0.35){rrect(ctx,w*0.56,h*0.3,w*0.22,22,5,C.green,hexA(C.green,0.07));lab(ctx,'"blue" ✓',w*0.58,h*0.3+11,C.green,9.5);}
    if(p>0.6){lab(ctx,'contrastive: p(token|img) - p(token|no img)',w*0.32,h*0.64,C.cyan,8.5);}
    lab(ctx,'hallucination 28%→11% — anchor each claim to a verifiable image region',14,h-12,C.mut);
  };

  /* fmf_cot — chain-of-thought multimodal reasoning */
  A.fmf_cot=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Chain-of-thought: decompose the visual question into sequential sub-queries',14,16,C.dim);
    var p=saw(t,4);
    var steps=[{s:'locate the door',col:C.amber},{s:'filter left of door',col:C.violet},{s:'check shirt colors',col:C.cyan},{s:'count → "2"',col:C.green}];
    var shown=Math.min(steps.length,Math.floor(p*steps.length)+1);
    steps.forEach(function(st,i){
      if(i>=shown)return;
      rrect(ctx,w*0.08,h*0.28+i*38,w*0.72,28,5,st.col,hexA(st.col,0.07));
      lab(ctx,'step '+(i+1)+': '+st.s,w*0.12,h*0.28+i*38+14,st.col,10);
      if(i<shown-1)arrow(ctx,w*0.44,h*0.28+i*38+28,w*0.44,h*0.28+(i+1)*38,hexA(st.col,0.6),1.2);});
    lab(ctx,'CoT prevents "5" (all red shirts) — spatial filter applied at step 2',14,h-12,C.mut);
  };

  /* fmf_lora — parameter-efficient adaptation (LoRA) */
  A.fmf_lora=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'LoRA: low-rank update ΔW=AB trains 0.1% of params, preserves the rest',14,16,C.dim);
    var p=saw(t,3);
    // frozen W matrix
    rrect(ctx,w*0.06,h*0.3,w*0.28,60,6,C.line,hexA(C.violet,0.06));
    lab(ctx,'frozen W\n(billions of params)',w*0.08,h*0.3+18,C.violet,9);
    // plus sign
    lab(ctx,'+',w*0.38,h*0.46,C.mut,18,'center');
    // low-rank A * B
    rrect(ctx,w*0.42,h*0.3,w*0.1,60,5,C.cyan,hexA(C.cyan,0.08));lab(ctx,'A\n(d×r)',w*0.44,h*0.3+20,C.cyan,8.5);
    rrect(ctx,w*0.54,h*0.3,w*0.1,60,5,C.green,hexA(C.green,0.08));lab(ctx,'B\n(r×d)',w*0.56,h*0.3+20,C.green,8.5);
    lab(ctx,'r=16 → 99.2% fewer trainable params',w*0.42,h*0.76,C.cyan,8.5);
    // result
    if(p>0.5){arrow(ctx,w*0.66,h*0.46,w*0.74,h*0.46,C.green,1.3);
      rrect(ctx,w*0.76,h*0.34,w*0.2,26,5,C.green,hexA(C.green,0.08));lab(ctx,'adapted\nmodel',w*0.78,h*0.34+12,C.green,9);}
    lab(ctx,'79% vs 81% full fine-tune — within 2% at 1% of the compute',14,h-12,C.mut);
  };

  /* fmf_merge — model merging & multi-skill generalization */
  A.fmf_merge=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Task vectors: add skill deltas to a shared base — no joint retraining',14,16,C.dim);
    var p=saw(t,3.5);
    // base model
    box(ctx,w*0.38,h*0.24,w*0.22,26,'base\nVLM',C.violet,hexA(C.violet,0.1));
    // 4 skill deltas
    var skills=[['Δ pick',C.cyan,0.06,0.52],['Δ place',C.green,0.24,0.58],['Δ push',C.amber,0.58,0.58],['Δ pour',C.coral,0.76,0.52]];
    var shown=Math.min(skills.length,Math.floor(p*skills.length)+1);
    skills.forEach(function(sk,i){if(i>=shown)return;
      rrect(ctx,w*sk[2],h*sk[3],w*0.16,24,5,sk[1],hexA(sk[1],0.08));lab(ctx,sk[0],w*sk[2]+6,h*sk[3]+12,sk[1],9);
      arrow(ctx,w*(sk[2]+0.08),h*sk[3],w*0.5,h*0.5,hexA(sk[1],0.5),1.2);});
    // merged
    if(p>0.75){box(ctx,w*0.38,h*0.68,w*0.22,26,'merged\ngeneralist',C.green,hexA(C.green,0.1));}
    lab(ctx,'1/4 the storage; within 5% of each specialist — sparsity removes interference',14,h-12,C.mut);
  };

  /* fmf_agent — agentic systems & tool use */
  A.fmf_agent=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Agentic loop: plan → call tool → observe result → call next tool',14,16,C.dim);
    var p=saw(t,4);
    var steps=[{label:'vision\ntool',col:C.cyan,x:0.08},{label:'search\ntool',col:C.amber,x:0.3},{label:'read\nresult',col:C.violet,x:0.52},{label:'final\nanswer',col:C.green,x:0.74}];
    var shown=Math.min(steps.length,Math.floor(p*steps.length)+1);
    // LLM controller at top
    box(ctx,w*0.36,h*0.22,w*0.26,26,'LLM\ncontroller',C.violet,hexA(C.violet,0.1));
    steps.forEach(function(st,i){if(i>=shown)return;
      box(ctx,w*st.x,h*0.54,w*0.18,26,st.label,st.col,hexA(st.col,0.08));
      arrow(ctx,w*0.49,h*0.35,w*(st.x+0.09),h*0.54,hexA(st.col,0.6),1.2);
      if(i<shown-1)arrow(ctx,w*(st.x+0.18),h*0.67,w*(steps[i+1].x),h*0.67,hexA(st.col,0.5),1.1);});
    lab(ctx,'each tool returns evidence; LLM maintains plan across all calls',14,h-12,C.mut);
  };

  /* fmf_domain_fm — specialized / domain foundation models */
  A.fmf_domain_fm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Domain FM: general backbone + domain fine-tune = specialized expertise',14,16,C.dim);
    var p=saw(t,3);
    // general backbone
    box(ctx,w*0.06,h*0.36,w*0.2,28,'general\nVLM',C.violet,hexA(C.violet,0.1));
    // domain data arrow
    arrow(ctx,w*0.26,h*0.42,w*0.42,h*0.42,C.violet,1.4);
    rrect(ctx,w*0.3,h*0.28,w*0.1,18,4,C.amber,hexA(C.amber,0.07));lab(ctx,'domain\ndata',w*0.31,h*0.28+9,C.amber,8.5);
    // specialized models
    var domains=[['medical\nMRI',C.coral,0.44,0.26],['geospatial\nsat.',C.cyan,0.44,0.5],['industrial\ninspect.',C.green,0.44,0.72]];
    var shown=Math.min(domains.length,Math.floor(p*domains.length)+1);
    domains.forEach(function(d,i){if(i>=shown)return;
      box(ctx,w*d[2],h*d[3],w*0.2,26,d[0],d[1],hexA(d[1],0.08));
      arrow(ctx,w*0.42,h*0.42,w*d[2],h*(d[3]+0.05),hexA(d[1],0.6),1.1);
      lab(ctx,'AUC 0.91',w*(d[2]+0.21),h*(d[3]+0.05),d[1],8.5);});
    lab(ctx,'0.73→0.91 AUC on Alzheimer diagnosis — general backbone generalizes; domain tuning specializes',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.fmanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-fmanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
