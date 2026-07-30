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
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
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
