/* se-anim.js — first-principles mechanism animators for the Sim-to-Real / Data-Engine explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-seanim="name". Self-contained boot. */
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
  function box(ctx,x,y,w,h,text,col,fill){rrect(ctx,x,y,w,h,7,col,fill||null);lab(ctx,text,x+w/2,y+h/2,col,11,'center');}
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=6;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  const saw=(t,p)=>((t%p)/p);function jit(i){const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s);}
  const A={};

  /* 01 — SCARCITY: real robot data is a trickle; a policy needs a flood. Manufacture the rest. */
  A.se_scarcity=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Real robot data is slow, costly, and risky to collect — but policies need a flood of it',14,16,C.dim);
    // tiny real pile
    const rx=w*0.14,ry=h*0.55;for(let i=0;i<8;i++)dot(ctx,rx+((i*11)%44),ry+Math.floor(i/4)*11,3,C.amber);
    lab(ctx,'real demos',rx,ry+40,C.amber,10);lab(ctx,'(thousands, expensive)',rx,ry+55,C.dim,9);
    // huge need block
    const nx=w*0.5,ny=h*0.34;for(let i=0;i<160;i++)dot(ctx,nx+((i*7)%210),ny+Math.floor(i/30)*11,2,hexA(C.cyan,0.55));
    lab(ctx,'what a robust policy needs',nx,ny-14,C.cyan,10);lab(ctx,'(millions, diverse, incl. rare cases)',nx,ny+62,C.dim,9);
    // the gap + manufacture arrow
    lab(ctx,'the gap',w*0.34,h*0.5,C.coral,10);
    lab(ctx,'the data engine: manufacture the rest — randomize, capture, generate, simulate',14,h-12,C.mut);
  };

  /* 02 — DOMAIN RANDOMIZATION: train across many randomized sims so reality is just one more variation. */
  A.se_randomize=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Domain randomization: vary the sim so wildly that reality is just one more sample',14,16,C.dim);
    const tiles=[[C.cyan,'textures'],[C.violet,'lighting'],[C.amber,'physics'],[C.green,'layout']];
    const hi=Math.floor(saw(t,4)*4)%4;
    tiles.forEach((tl,i)=>{const x=w*0.06+i*w*0.14,y=h*0.34;const on=i===hi;
      rrect(ctx,x,y,w*0.11,h*0.24,6,on?tl[0]:hexA(tl[0],0.5),hexA(tl[0],on?0.14:0.06));
      // randomized speckle
      for(let k=0;k<8;k++)dot(ctx,x+6+jit(k+i*4)*(w*0.09),y+6+jit(k+i*7)*(h*0.18),1.6,hexA(tl[0],0.8));
      lab(ctx,tl[1],x+w*0.055,y+h*0.24+12,on?tl[0]:C.mut,9,'center');});
    lab(ctx,'many randomized sims',w*0.06,h*0.3,C.dim,9.5);
    // funnel into one policy
    tiles.forEach((tl,i)=>arrow(ctx,w*0.06+i*w*0.14+w*0.055,h*0.62,w*0.66,h*0.52,hexA(C.mut,0.5),1));
    box(ctx,w*0.67,h*0.44,w*0.14,h*0.16,'one policy',C.ink);
    // real is just another sample
    arrow(ctx,w*0.82,h*0.52,w*0.9,h*0.52,C.green,1.6);dot(ctx,w*0.93,h*0.52,7,C.green);lab(ctx,'real ✓',w*0.9,h*0.42,C.green,10);
    lab(ctx,'if the policy handles every sim variant, the real world looks like just one more → it transfers',14,h-12,C.mut);
  };

  /* 03 — REAL2SIM: capture reality, reconstruct it, simulate in it — the sim inherits real looks + geometry. */
  A.se_real2sim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Real2Sim: don’t hand-build the sim — capture the real world and simulate IN it',14,16,C.dim);
    // camera capturing
    const cx=w*0.14,cy=h*0.5;ctx.fillStyle=C.amber;ctx.save();ctx.translate(cx,cy);ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(9,0);ctx.lineTo(-8,6);ctx.closePath();ctx.fill();ctx.restore();
    lab(ctx,'capture (photos / scan)',cx-16,cy+34,C.amber,10);
    arrow(ctx,w*0.24,cy,w*0.32,cy,C.ink,1.4);
    // reconstruct as blobs
    const bx=w*0.42;for(let i=0;i<10;i++){const a=i*0.9;const g=ctx.createRadialGradient(bx+Math.cos(a)*26,cy+Math.sin(a)*20,0,bx+Math.cos(a)*26,cy+Math.sin(a)*20,14);g.addColorStop(0,hexA(i%2?C.cyan:C.violet,0.6));g.addColorStop(1,hexA(i%2?C.cyan:C.violet,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx+Math.cos(a)*26,cy+Math.sin(a)*20,14,0,TAU);ctx.fill();}
    lab(ctx,'reconstruct (splat / mesh)',bx-28,cy+40,C.cyan,10);
    arrow(ctx,w*0.54,cy,w*0.62,cy,C.ink,1.4);
    // simulate: physics + robot acts
    box(ctx,w*0.63,cy-24,w*0.3,48,'',C.green,hexA(C.green,0.05));lab(ctx,'simulator (photoreal + physics)',w*0.64,cy-32,C.green,9.5);
    dot(ctx,w*0.7,cy+6,5,C.amber);arrow(ctx,w*0.72,cy+2,w*0.82,cy-6,C.green,1.4);lab(ctx,'train here',w*0.78,cy+18,C.green,9.5);
    lab(ctx,'the simulator inherits real appearance + geometry → the sim-to-real gap starts small',14,h-12,C.mut);
  };

  /* 04 — GENERATE: a diffusion/video/LLM model manufactures demonstrations & scenes at scale. */
  A.se_generate=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Generate the data: let a diffusion / video / LLM model manufacture demos & scenes',14,16,C.dim);
    box(ctx,w*0.05,h*0.44,w*0.2,30,'a few seeds + a prompt',C.cyan);
    arrow(ctx,w*0.26,h*0.5,w*0.34,h*0.5,C.ink,1.4);
    box(ctx,w*0.35,h*0.42,w*0.16,h*0.16,'generative model',C.violet);
    arrow(ctx,w*0.52,h*0.5,w*0.6,h*0.5,C.violet,1.6);
    // a fan of generated samples
    const n=Math.min(12,3+Math.floor(saw(t,3)*12));
    for(let i=0;i<12;i++){const x=w*0.62+(i%4)*w*0.09,y=h*0.34+Math.floor(i/4)*h*0.14;const on=i<n;
      rrect(ctx,x,y,w*0.07,h*0.1,3,on?C.green:hexA(C.mut,0.3),on?hexA(C.green,0.08):null);}
    lab(ctx,'endless synthetic demos / scenes',w*0.62,h*0.34+3*h*0.14-6,C.green,10);
    lab(ctx,'scale for the cost of GPU time — but watch the gap between fake data and the real world',14,h-12,C.mut);
  };

  /* 05 — THE GAP: train in sim, deploy real; the distribution gap; narrow it, and verify it transferred. */
  A.se_transfer=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The sim-to-real gap: train cheap in sim, deploy in reality — mind the distance between them',14,16,C.dim);
    // two distributions with a gap that narrows
    const base=h*0.6,ax=w*0.08,aw=w*0.84;
    const gap=(1-Math.min(1,saw(t,4)*1.3))*0.22; // narrows over time
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=50;i++){const u=i/50,x=ax+aw*u;const y=base-Math.exp(-Math.pow((u-(0.4-gap/2))/0.13,2))*h*0.34;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'sim',ax+aw*(0.4-gap/2)-8,base-h*0.38,C.violet,10);
    ctx.strokeStyle=C.green;ctx.beginPath();
    for(let i=0;i<=50;i++){const u=i/50,x=ax+aw*u;const y=base-Math.exp(-Math.pow((u-(0.6+gap/2))/0.13,2))*h*0.34;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'real',ax+aw*(0.6+gap/2)-8,base-h*0.38,C.green,10);
    // the gap marker
    ctx.strokeStyle=hexA(C.coral,0.7);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(ax+aw*(0.4-gap/2),base+6);ctx.lineTo(ax+aw*(0.6+gap/2),base+6);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'the gap ↓  (randomize · adapt · learn the sim)',w*0.36,base+20,C.coral,10);
    lab(ctx,'the real test is transfer: a policy that shines in sim but fails on the robot learned the gap, not the task',14,h-12,C.mut);
  };

  /* ---- WAVE-2: per-family first-principles animators ---- */

  /* F01 — DOMAIN RANDOMIZATION: vary the sim distribution so reality is just one more draw. */
  A.sef_domrand=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Domain randomization: make p(sim) wide enough that p(real) is inside it',14,16,C.dim);
    // axis
    const ax=w*0.06,bx=w*0.94,my=h*0.60;
    ctx.strokeStyle=hexA(C.ink,0.2);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax,my);ctx.lineTo(bx,my);ctx.stroke();
    // sim distribution — wide Gaussian, color-pulsing
    const sw=w*0.42,shA=h*0.36;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=80;i++){const u=i/80,x=ax+(bx-ax)*u;const y=my-Math.exp(-Math.pow((u-0.5)/0.18,2))*shA;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'p(sim) — broad randomized distribution',ax+4,my-shA-14,C.violet,10);
    // real — narrow spike, animating position slightly
    const rpos=0.50+0.04*Math.sin(t*0.6);
    const rx=ax+(bx-ax)*rpos,rshA=h*0.28;
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=60;i++){const u=i/60,x=ax+(bx-ax)*(rpos-0.12+u*0.24);const y=my-Math.exp(-Math.pow((u-0.5)/0.09,2))*rshA;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'p(real)',rx-14,my-rshA-14,C.green,10);
    // annotation: real sits inside sim
    ctx.strokeStyle=hexA(C.green,0.5);ctx.setLineDash([4,3]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,my-rshA+4);ctx.lineTo(rx,my+18);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'real sits inside the sim range → zero-shot transfer',ax+4,my+32,C.green,10);
    lab(ctx,'policy trained across entire p(sim) sees reality as just another draw — it stops caring which variant',14,h-12,C.mut);
  };

  /* F02 — LEARNED / NEURAL SIMULATORS: fit the dynamics from real rollouts so the sim matches this specific robot. */
  A.sef_neuralsim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Learned simulator: replace hand-written physics with a model fit to real rollouts',14,16,C.dim);
    const phase=saw(t,5);
    // left: real robot emitting rollout data
    const robx=w*0.12,roby=h*0.50;
    rrect(ctx,robx-18,roby-18,36,36,6,C.amber,hexA(C.amber,0.08));
    lab(ctx,'R',robx,roby,C.amber,13,'center');
    lab(ctx,'real robot',robx-22,roby+30,C.amber,9.5);
    // stream of observations
    const np=Math.min(8,1+Math.floor(phase*8));
    for(let i=0;i<np;i++){const x=w*0.22+i*w*0.04,y=roby+6-i*3;dot(ctx,x,y,3,hexA(C.amber,0.85-i*0.07));}
    lab(ctx,'real obs.',w*0.22,roby+28,C.amber,9);
    // center: world model being trained
    const wmx=w*0.50,wmy=h*0.50;
    rrect(ctx,wmx-34,wmy-22,68,44,8,C.cyan,hexA(C.cyan,0.06));
    lab(ctx,'world model',wmx,wmy-8,C.cyan,10,'center');
    lab(ctx,'fit to obs.',wmx,wmy+8,C.mut,9,'center');
    arrow(ctx,w*0.32,roby,wmx-36,wmy,C.amber,1.4);
    // right: policy training inside the learned sim
    const psx=w*0.78,psy=h*0.50;
    rrect(ctx,psx-26,psy-22,52,44,8,C.green,hexA(C.green,0.06));
    lab(ctx,'policy',psx,psy-8,C.green,10,'center');
    lab(ctx,'trains here',psx,psy+8,C.mut,9,'center');
    arrow(ctx,wmx+36,wmy,psx-28,psy,C.cyan,1.8);
    lab(ctx,'learned model → the sim matches this robot, not a textbook one',14,h-12,C.mut);
  };

  /* F03 — REAL2SIM: scan the scene, attach physics, train the policy inside the captured world. */
  A.sef_real2sim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Real2Sim: scan → reconstruct → simulate inside the captured world',14,16,C.dim);
    // step 1: scan
    const sy=h*0.50;
    box(ctx,w*0.04,sy-20,w*0.14,40,'scan',C.amber,hexA(C.amber,0.08));
    arrow(ctx,w*0.19,sy,w*0.26,sy,C.ink,1.3);
    // step 2: reconstruct (blobs)
    const bx=w*0.37,by=sy;
    for(let i=0;i<9;i++){const a=i*0.7+t*0.3;const grd=ctx.createRadialGradient(bx+Math.cos(a)*22,by+Math.sin(a)*16,0,bx+Math.cos(a)*22,by+Math.sin(a)*16,12);
      grd.addColorStop(0,hexA(i%2?C.cyan:C.violet,0.65));grd.addColorStop(1,hexA(i%2?C.cyan:C.violet,0));
      ctx.fillStyle=grd;ctx.beginPath();ctx.arc(bx+Math.cos(a)*22,by+Math.sin(a)*16,12,0,TAU);ctx.fill();}
    lab(ctx,'splat / mesh',bx-22,by+36,C.cyan,9.5);
    arrow(ctx,w*0.50,sy,w*0.57,sy,C.ink,1.3);
    // step 3: simulated world with physics
    rrect(ctx,w*0.58,sy-28,w*0.34,56,8,C.green,hexA(C.green,0.05));
    lab(ctx,'sim (photoreal + physics)',w*0.75,sy-16,C.green,9.5,'center');
    // robot inside sim
    dot(ctx,w*0.68,sy+8,5,C.amber);
    arrow(ctx,w*0.70,sy+4,w*0.82,sy-4,C.green,1.3);
    lab(ctx,'train here',w*0.74,sy+26,C.green,9.5,'center');
    lab(ctx,'the gap starts small: sim inherited real appearance and geometry from the capture',14,h-12,C.mut);
  };

  /* F04 — GENERATED DEMOS: a generative model manufactures demonstrations at scale from a few seeds. */
  A.sef_gendemos=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Generated demos: a VLM / diffusion / LLM turns a few seeds into millions of demonstrations',14,16,C.dim);
    // seed box
    box(ctx,w*0.03,h*0.44,w*0.15,38,'few seeds',C.amber,hexA(C.amber,0.07));
    arrow(ctx,w*0.19,h*0.52,w*0.27,h*0.52,C.ink,1.3);
    // generative model
    rrect(ctx,w*0.28,h*0.40,w*0.18,h*0.24,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'generative',w*0.37,h*0.49,C.violet,10,'center');
    lab(ctx,'model',w*0.37,h*0.56,C.violet,10,'center');
    arrow(ctx,w*0.47,h*0.52,w*0.55,h*0.52,C.violet,1.6);
    // fan of demos appearing
    const nvis=Math.min(12,2+Math.floor(saw(t,3.5)*12));
    for(let i=0;i<12;i++){
      const col=i%3===0?C.cyan:i%3===1?C.green:C.amber;
      const x=w*0.57+(i%4)*w*0.098,y=h*0.32+Math.floor(i/4)*h*0.13;
      rrect(ctx,x,y,w*0.076,h*0.09,4,i<nvis?col:hexA(C.mut,0.25),i<nvis?hexA(col,0.08):null);}
    lab(ctx,'synthesized demos',w*0.57,h*0.32-13,C.green,9.5);
    lab(ctx,'scale for GPU time — but filter what gets generated: fake data teaches fake lessons',14,h-12,C.mut);
  };

  /* F05 — CHEAP, LARGE-SCALE COLLECTION: low-cost teleop rigs and auto-labeling push real demo throughput up 10×. */
  A.sef_cheapcol=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Cheap collection: low-cost rigs and auto-labeling raise real demo throughput 10×',14,16,C.dim);
    // human with handheld gripper — wider box, more padding
    const hx=w*0.11,hy=h*0.50;
    rrect(ctx,w*0.03,hy-28,w*0.16,56,8,C.amber,hexA(C.amber,0.07));
    lab(ctx,'operator',hx,hy-14,C.amber,9.5,'center');
    lab(ctx,'(handheld)',hx,hy+2,C.amber,9,'center');
    lab(ctx,'gripper',hx,hy+18,C.amber,9,'center');
    // demo stream
    const npts=Math.min(9,1+Math.floor(saw(t,4)*9));
    for(let i=0;i<npts;i++){const x=w*0.24+i*w*0.036,y=hy+4-i*2;dot(ctx,x,y,3.5,hexA(C.green,0.9-i*0.07));}
    lab(ctx,'demo trajectory',w*0.26,hy+28,C.green,9.5);
    // auto-labeling (foundation model)
    arrow(ctx,w*0.57,hy,w*0.42,hy,hexA(C.mut,0.6),1.2);
    rrect(ctx,w*0.43,hy-22,w*0.17,44,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'foundation',w*0.515,hy-8,C.violet,9.5,'center');
    lab(ctx,'auto-label',w*0.515,hy+8,C.violet,9.5,'center');
    arrow(ctx,w*0.61,hy,w*0.69,hy,C.ink,1.3);
    // dataset
    rrect(ctx,w*0.70,hy-22,w*0.14,44,8,C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'labeled',w*0.77,hy-8,C.cyan,9,'center');
    lab(ctx,'dataset',w*0.77,hy+8,C.cyan,9,'center');
    lab(ctx,'no full robot required for collection; auto-labeling removes the human annotation bottleneck',14,h-12,C.mut);
  };

  /* F06 — CROSS-EMBODIMENT: pool data across many robot bodies; morphology-agnostic encoders share the learning. */
  A.sef_crossemb=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Cross-embodiment: pool data across many bodies — each robot learns from all the others',14,16,C.dim);
    // four robot icons spread across the left 55% of the canvas
    const robots=[{col:C.cyan,lbl:'arm'},{col:C.violet,lbl:'legged'},{col:C.amber,lbl:'mobile'},{col:C.green,lbl:'hand'}];
    const ry=h*0.45;const polx=w*0.73,poly=h*0.50;
    robots.forEach((r,i)=>{
      const rx=w*(0.08+i*0.13);
      rrect(ctx,rx-18,ry-18,36,36,6,r.col,hexA(r.col,0.09));
      lab(ctx,r.lbl,rx,ry+28,r.col,9,'center');
      arrow(ctx,rx+18,ry,polx-30,poly,hexA(r.col,0.6),1.2);
    });
    // central policy — with enough space from robot 4 (at 0.08+3*0.13=0.47)
    rrect(ctx,polx-28,poly-26,56,52,8,C.cyan,hexA(C.cyan,0.10));
    lab(ctx,'one',polx,poly-10,C.cyan,12,'center');
    lab(ctx,'policy',polx,poly+8,C.cyan,12,'center');
    // deploy back arrows (thinner, ghost)
    robots.forEach((r,i)=>{
      const rx=w*(0.08+i*0.13);
      arrow(ctx,polx-28,poly+10,rx,ry+18,hexA(r.col,0.25),1);
    });
    lab(ctx,'pooled across 20+ embodiments / 800k trajectories → every robot benefits from the others',14,h-12,C.mut);
  };

  /* F07 — RESIDUAL & HYBRID: physics gives the bulk; a small learned fix handles what physics missed. */
  A.sef_residual=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Residual policy: physics gets 90% right; a small learned correction handles the last 10%',14,16,C.dim);
    // physics base
    const bx=w*0.10,by=h*0.48;
    rrect(ctx,bx,by-22,w*0.22,44,8,C.violet,hexA(C.violet,0.08));
    lab(ctx,'physics / sim',bx+w*0.11,by-8,C.violet,9.5,'center');
    lab(ctx,'policy (frozen)',bx+w*0.11,by+8,C.violet,9,'center');
    arrow(ctx,bx+w*0.22,by,w*0.44,by,C.violet,1.5);
    // plus sign
    lab(ctx,'+',w*0.45,by,C.ink,18,'center');
    // learned residual (small box)
    const rx=w*0.48,ry=by;
    rrect(ctx,rx,ry-14,w*0.14,28,6,C.coral,hexA(C.coral,0.08));
    lab(ctx,'residual',rx+w*0.07,ry-3,C.coral,9.5,'center');
    lab(ctx,'(tiny, from real)',rx+w*0.07,ry+10,C.coral,9,'center');
    // equals
    lab(ctx,'=',w*0.64,by,C.ink,18,'center');
    // combined output
    rrect(ctx,w*0.67,by-22,w*0.16,44,8,C.green,hexA(C.green,0.08));
    lab(ctx,'precise',w*0.75,by-8,C.green,9.5,'center');
    lab(ctx,'real action',w*0.75,by+8,C.green,9,'center');
    // error pulse on residual
    const pulse=0.5+0.5*Math.sin(t*1.8);
    dot(ctx,rx+w*0.07,ry-26,4*pulse,hexA(C.coral,0.7));
    lab(ctx,'physics handles the bulk; the residual only corrects what physics consistently gets wrong',14,h-12,C.mut);
  };

  /* F08 — DIGITAL TWINS: fit the sim precisely to THIS robot (geometry + params) from images or proprioception. */
  A.sef_digitwin=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Digital twin: identify the exact parameters of this robot so sim matches reality precisely',14,16,C.dim);
    // real robot left
    const rx=w*0.14,ry=h*0.50;
    rrect(ctx,rx-22,ry-24,44,48,7,C.amber,hexA(C.amber,0.08));
    lab(ctx,'real',rx,ry-10,C.amber,10,'center');
    lab(ctx,'robot',rx,ry+8,C.amber,10,'center');
    // observation stream
    arrow(ctx,rx+24,ry,w*0.36,ry,C.amber,1.4);
    lab(ctx,'images /\nproprio',w*0.28,ry+22,C.mut,9,'center');
    // system ID block
    rrect(ctx,w*0.36,ry-22,w*0.18,44,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'sys-ID',w*0.45,ry-6,C.violet,9.5,'center');
    lab(ctx,'(differentiable)',w*0.45,ry+10,C.violet,9,'center');
    arrow(ctx,w*0.55,ry,w*0.63,ry,C.violet,1.5);
    // fitted twin
    rrect(ctx,w*0.63,ry-24,w*0.16,48,7,C.cyan,hexA(C.cyan,0.08));
    lab(ctx,'fitted',w*0.71,ry-10,C.cyan,10,'center');
    lab(ctx,'twin',w*0.71,ry+8,C.cyan,10,'center');
    arrow(ctx,w*0.80,ry,w*0.87,ry,C.cyan,1.5);
    // deploy
    rrect(ctx,w*0.87,ry-18,w*0.10,36,6,C.green,hexA(C.green,0.07));
    lab(ctx,'policy',w*0.92,ry,C.green,9,'center');
    // match indicator pulsing
    const match=0.5+0.5*Math.sin(t*1.4);
    dot(ctx,w*0.59,ry,4*match,hexA(C.green,match*0.8));
    lab(ctx,'fitting: adjust mass, friction, geometry until sim rollouts match real observations',14,h-12,C.mut);
  };

  /* F09 — GENERATIVE DATA AUGMENTATION: diffusion synthesizes the missing images, steered so labels stay valid. */
  A.sef_visaug=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Generative augmentation: diffusion paints the missing training images, labels intact',14,16,C.dim);
    // seed image (left)
    const ix=w*0.06,iy=h*0.36,iw=w*0.16,ih=h*0.32;
    rrect(ctx,ix,iy,iw,ih,6,C.amber,hexA(C.amber,0.08));
    lab(ctx,'seed image',ix+iw/2,iy-12,C.amber,9.5,'center');
    lab(ctx,'+ label',ix+iw/2,iy+ih+12,C.amber,9,'center');
    // diffusion model
    arrow(ctx,ix+iw,iy+ih/2,w*0.34,iy+ih/2,C.ink,1.3);
    rrect(ctx,w*0.34,iy,w*0.18,ih,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'diffusion',w*0.43,iy+ih*0.38,C.violet,9.5,'center');
    lab(ctx,'+ control',w*0.43,iy+ih*0.62,C.violet,9,'center');
    arrow(ctx,w*0.53,iy+ih/2,w*0.60,iy+ih/2,C.violet,1.5);
    // synthesized variants (right)
    const ncols=3,nrows=2;
    for(let r=0;r<nrows;r++){for(let c=0;c<ncols;c++){
      const vx=w*0.61+c*w*0.12,vy=iy+r*(ih/2+4),vw=w*0.10,vh=ih/2-4;
      const idx=r*ncols+c,col=idx%3===0?C.cyan:idx%3===1?C.green:C.coral;
      const phase2=saw(t+idx*0.3,2);
      rrect(ctx,vx,vy,vw,vh,4,col,hexA(col,0.08+(phase2>0.7?0.08:0)));
      lab(ctx,['dark','rain','rare','blur','flip','fog'][idx],vx+vw/2,vy+vh/2,col,9,'center');
    }}
    lab(ctx,'synthesized variants',w*0.61,iy-12,C.green,9.5);
    lab(ctx,'spatial / mask conditioning keeps labels valid while diffusion fills in the missing conditions',14,h-12,C.mut);
  };

  /* F10 — SYNTHETIC-TO-REAL DOMAIN ADAPTATION: align features across the gap without target labels. */
  A.sef_s2radapt=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Syn-to-real adaptation: align model features across the domain gap — no target labels needed',14,16,C.dim);
    const cy=h*0.52;
    // source (synthetic) distribution
    const sx=w*0.18;
    rrect(ctx,sx-44,cy-30,88,60,8,C.violet,hexA(C.violet,0.08));
    lab(ctx,'synthetic (source)',sx,cy-16,C.violet,9.5,'center');
    for(let i=0;i<6;i++)dot(ctx,sx-26+i*10,cy+6,4,hexA(C.violet,0.7));
    lab(ctx,'labeled',sx,cy+24,C.mut,9,'center');
    // gap arrow
    const gapW=0.12+0.06*Math.abs(Math.sin(t*0.7));
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([4,3]);ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(w*0.38,cy);ctx.lineTo(w*(0.38+gapW),cy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'gap',w*(0.38+gapW/2),cy-12,C.coral,9,'center');
    // feature aligner
    rrect(ctx,w*0.52,cy-22,w*0.18,44,8,C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'align',w*0.61,cy-6,C.cyan,9.5,'center');
    lab(ctx,'features',w*0.61,cy+10,C.cyan,9,'center');
    // target (real) distribution
    const tx=w*0.83;
    rrect(ctx,tx-36,cy-30,72,60,8,C.green,hexA(C.green,0.08));
    lab(ctx,'real (target)',tx,cy-16,C.green,9.5,'center');
    for(let i=0;i<6;i++)dot(ctx,tx-22+i*9,cy+6,4,hexA(C.green,0.7));
    lab(ctx,'no labels',tx,cy+24,C.mut,9,'center');
    arrow(ctx,w*0.38,cy,w*0.52,cy,C.violet,1.3);
    arrow(ctx,w*0.71,cy,tx-38,cy,C.green,1.3);
    lab(ctx,'alignment pulls the feature spaces together so a classifier trained on source works on target',14,h-12,C.mut);
  };

  /* F11 — PSEUDO-LABELING: label unlabeled real data with the model's own confident predictions, then retrain. */
  A.sef_pseudolbl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pseudo-labeling: use the model to label its own unlabeled data, filter confident ones, retrain',14,16,C.dim);
    const cy=h*0.52;
    // unlabeled real data
    box(ctx,w*0.03,cy-22,w*0.13,44,'unlabeled\nreal data',C.mut,hexA(C.mut,0.06));
    arrow(ctx,w*0.17,cy,w*0.24,cy,C.ink,1.3);
    // model
    rrect(ctx,w*0.24,cy-22,w*0.14,44,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'model',w*0.31,cy-6,C.violet,9.5,'center');
    lab(ctx,'predict',w*0.31,cy+10,C.violet,9,'center');
    arrow(ctx,w*0.39,cy,w*0.46,cy,C.violet,1.4);
    // confidence filter (two streams)
    const phase3=saw(t,3.5);
    const npts=Math.min(8,1+Math.floor(phase3*8));
    // confident (accept)
    for(let i=0;i<npts;i++){dot(ctx,w*0.48+i*w*0.04,cy-14,4,hexA(C.green,0.85));}
    lab(ctx,'confident → accept',w*0.48,cy-28,C.green,9);
    // uncertain (reject)
    for(let i=0;i<Math.max(0,8-npts);i++){dot(ctx,w*0.48+i*w*0.04,cy+14,4,hexA(C.coral,0.6));}
    lab(ctx,'uncertain → drop',w*0.48,cy+28,C.coral,9);
    arrow(ctx,w*0.83,cy-14,w*0.88,cy,C.green,1.3);
    // retrain box
    rrect(ctx,w*0.88,cy-22,w*0.10,44,7,C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'retrain',w*0.93,cy,C.cyan,9,'center');
    arrow(ctx,w*0.88,cy-22,w*0.31,cy-24,hexA(C.cyan,0.4),1);
    lab(ctx,'the verifier / confidence filter is the difference between improvement and collapse',14,h-12,C.mut);
  };

  /* F12 — DATASET DISTILLATION: compress a huge dataset into tiny synthetic super-examples optimized to match gradients. */
  A.sef_distill=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Dataset distillation: compress 1 M real samples into ~100 synthetic ones that carry the same signal',14,16,C.dim);
    const cy=h*0.52;
    // big real dataset (many dots)
    const big=w*0.16,bigy=cy;
    for(let i=0;i<60;i++)dot(ctx,w*0.03+((i*13)%big),bigy-22+Math.floor(i/12)*8,2.5,hexA(C.violet,0.55));
    lab(ctx,'1 M real samples',w*0.03,bigy+28,C.violet,9.5);
    arrow(ctx,w*0.21,bigy,w*0.32,bigy,C.ink,1.4);
    // optimization block
    rrect(ctx,w*0.33,cy-24,w*0.18,48,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'match',w*0.42,cy-8,C.violet,9.5,'center');
    lab(ctx,'gradients',w*0.42,cy+8,C.violet,9,'center');
    arrow(ctx,w*0.52,cy,w*0.60,cy,C.cyan,1.8);
    // tiny distilled set (few special dots)
    const nx=Math.min(8,1+Math.floor(saw(t,4)*8));
    for(let i=0;i<8;i++){const x=w*0.61+i*w*0.04,pulse4=0.5+0.5*Math.sin(t*1.5+i);
      dot(ctx,x,cy,i<nx?6:3,i<nx?hexA(C.cyan,0.8+pulse4*0.15):hexA(C.mut,0.2));}
    lab(ctx,'~100 distilled',w*0.61,cy+26,C.cyan,9.5);
    lab(ctx,'super-examples',w*0.61,cy+40,C.cyan,9);
    // equal sign and train
    lab(ctx,'≈ same',w*0.61,cy-26,C.green,9.5);
    lab(ctx,'training signal',w*0.61,cy-40,C.green,9);
    lab(ctx,'it is information density, not sample count, that drives learning',14,h-12,C.mut);
  };

  /* F13 — NEURAL RENDERING AS DATA SOURCE: one capture → unlimited rendered views for perception and control training. */
  A.sef_neurend=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Neural rendering as data: one capture → unlimited novel views for perception + control training',14,16,C.dim);
    // central scene representation (splat cloud)
    const scx=w*0.42,scy=h*0.52;
    for(let i=0;i<10;i++){const a=i*0.65+t*0.25;const grd=ctx.createRadialGradient(scx+Math.cos(a)*28,scy+Math.sin(a)*20,0,scx+Math.cos(a)*28,scy+Math.sin(a)*20,14);
      grd.addColorStop(0,hexA(i%2?C.cyan:C.violet,0.65));grd.addColorStop(1,hexA(i%2?C.cyan:C.violet,0));
      ctx.fillStyle=grd;ctx.beginPath();ctx.arc(scx+Math.cos(a)*28,scy+Math.sin(a)*20,14,0,TAU);ctx.fill();}
    lab(ctx,'captured scene',scx-30,scy+46,C.cyan,9.5);
    // orbiting virtual cameras producing views
    const ncams=6;for(let i=0;i<ncams;i++){
      const a=(i/ncams)*TAU+t*0.5,r=80;
      const cx5=scx+Math.cos(a)*r,cy5=scy+Math.sin(a)*r;
      const lit=(Math.floor(t*3+i)%ncams===0);
      // camera triangle
      ctx.save();ctx.translate(cx5,cy5);ctx.rotate(a+Math.PI);ctx.fillStyle=lit?C.amber:hexA(C.amber,0.45);
      ctx.beginPath();ctx.moveTo(-7,-5);ctx.lineTo(8,0);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();ctx.restore();
      if(lit){ctx.strokeStyle=hexA(C.amber,0.4);ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(cx5,cy5);ctx.lineTo(scx,scy);ctx.stroke();ctx.setLineDash([]);}}
    lab(ctx,'unlimited novel views',scx-30,scy-62,C.amber,9.5);
    // arrow to policy training
    arrow(ctx,w*0.70,scy,w*0.80,scy,C.cyan,1.6);
    rrect(ctx,w*0.80,scy-22,w*0.14,44,7,C.green,hexA(C.green,0.07));
    lab(ctx,'policy /\nperception',w*0.87,scy,C.green,9.5,'center');
    lab(ctx,'the same representation used to perceive doubles as a data factory — one capture, infinite views',14,h-12,C.mut);
  };

  /* F14 — DATA CURATION: select high-utility, low-redundancy samples so a small curated set = training on everything. */
  A.sef_curate=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Data curation: pick the high-utility, low-redundancy samples — quality beats raw quantity',14,16,C.dim);
    const cy=h*0.52;
    // large uncurated pool — use integer modulo to stay within 0..poolW
    const poolW=Math.round(w*0.22);
    for(let i=0;i<80;i++){const x=w*0.03+((i*17)%poolW),y=cy-26+Math.floor(i/13)*9;
      dot(ctx,x,y,2.5,hexA(i%7<2?C.coral:C.mut,0.45));}
    lab(ctx,'raw pool (high redundancy)',w*0.03,cy+30,C.mut,9.5);
    // selector / scorer
    arrow(ctx,w*0.29,cy,w*0.37,cy,C.ink,1.3);
    rrect(ctx,w*0.37,cy-24,w*0.18,48,8,C.violet,hexA(C.violet,0.07));
    lab(ctx,'score by',w*0.46,cy-8,C.violet,9.5,'center');
    lab(ctx,'influence',w*0.46,cy+8,C.violet,9,'center');
    arrow(ctx,w*0.56,cy,w*0.64,cy,C.cyan,1.7);
    // curated subset — integer modulo + 2-row layout
    const kept=Math.min(10,2+Math.floor(saw(t,3)*10));
    const subW=Math.round(w*0.22),colSep=Math.round(w*0.044);
    for(let i=0;i<10;i++){const x=w*0.65+((i%5)*colSep),y=cy-14+(Math.floor(i/5))*28;
      dot(ctx,x,y,5,i<kept?hexA(C.cyan,0.88):hexA(C.mut,0.18));}
    lab(ctx,'curated subset',w*0.65,cy+36,C.cyan,9.5);
    lab(ctx,'≈ full dataset',w*0.65,cy+50,C.green,9.5);
    lab(ctx,'as synthetic floods in, curation stops the signal from drowning in redundancy',14,h-12,C.mut);
  };

  /* F15 — TEST-TIME ADAPTATION: close the last of the domain gap at deployment, using only unlabeled test data. */
  A.sef_ttatime=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Test-time adaptation: close the remaining gap at deployment, online, with no labels',14,16,C.dim);
    const cy=h*0.52;
    // trained model
    rrect(ctx,w*0.04,cy-24,w*0.17,48,8,C.violet,hexA(C.violet,0.08));
    lab(ctx,'trained',w*0.125,cy-8,C.violet,9.5,'center');
    lab(ctx,'model',w*0.125,cy+8,C.violet,9,'center');
    arrow(ctx,w*0.22,cy,w*0.30,cy,C.ink,1.3);
    // test batch (real, unlabeled)
    rrect(ctx,w*0.30,cy-22,w*0.15,44,7,C.amber,hexA(C.amber,0.07));
    lab(ctx,'test batch',w*0.375,cy-6,C.amber,9,'center');
    lab(ctx,'(no labels)',w*0.375,cy+10,C.amber,9,'center');
    // adaptation block (online update)
    arrow(ctx,w*0.46,cy,w*0.54,cy,C.violet,1.4);
    rrect(ctx,w*0.54,cy-24,w*0.16,48,8,C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'adapt',w*0.62,cy-8,C.cyan,9.5,'center');
    lab(ctx,'online',w*0.62,cy+8,C.cyan,9,'center');
    // pulse: the model improving
    const pulse5=saw(t,2);
    ctx.strokeStyle=hexA(C.cyan,0.3+pulse5*0.4);ctx.lineWidth=1+pulse5*2;ctx.beginPath();
    ctx.arc(w*0.62,cy,26-pulse5*6,0,TAU);ctx.stroke();
    arrow(ctx,w*0.71,cy,w*0.79,cy,C.green,1.5);
    // adapted model
    rrect(ctx,w*0.79,cy-24,w*0.17,48,8,C.green,hexA(C.green,0.08));
    lab(ctx,'adapted',w*0.875,cy-8,C.green,9.5,'center');
    lab(ctx,'model',w*0.875,cy+8,C.green,9,'center');
    lab(ctx,'final safety net: adapt online when the deployment domain drifts from training — no retraining',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.seanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-seanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
