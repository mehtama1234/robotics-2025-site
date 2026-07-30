/* dr-anim.js — first-principles mechanism animators for the Autonomous-Driving explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-dranim="name". Self-contained boot. */
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
  function box(ctx,x,y,w,h,text,col,fill){rrect(ctx,x,y,w,h,7,col,fill||null);lab(ctx,text,x+w/2,y+h/2,col,10.5,'center');}
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=6;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function car(ctx,x,y,col,s){s=s||1;ctx.fillStyle=col;rrect(ctx,x-9*s,y-6*s,18*s,12*s,3,null,col);}
  const saw=(t,p)=>((t%p)/p);
  const A={};

  /* 01 — THE STACK: sense -> perceive -> predict -> plan -> act, on a tight onboard clock. */
  A.dr_stack=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The self-driving loop: five stages, on a small onboard computer, many times a second',14,16,C.dim);
    const stages=[['sense','cameras · LiDAR · radar',C.cyan],['perceive','what & where (BEV)',C.violet],
      ['predict','where things go next',C.amber],['plan','a safe trajectory',C.green],['act','steer · brake',C.ink]];
    const n=stages.length,bw=w*0.155,y=h*0.46,gap=(w-0.04*w-n*bw)/(n-1);
    const lit=Math.floor(saw(t,4)*n)%n;
    stages.forEach((s,i)=>{const x=w*0.02+i*(bw+gap),on=i<=lit;
      rrect(ctx,x,y-22,bw,44,7,on?s[2]:C.line,on?hexA(s[2],0.08):null);
      lab(ctx,s[0],x+bw/2,y-6,on?s[2]:C.mut,11,'center');lab(ctx,s[1],x+bw/2,y+11,on?C.mut:C.dim,8.5,'center');
      if(i<n-1)arrow(ctx,x+bw+2,y,x+bw+gap-2,y,on&&i<lit?s[2]:hexA(C.mut,0.4),1.4);});
    // loop back
    arrow(ctx,w*0.9,y+30,w*0.1,y+30,hexA(C.mut,0.4),1.2);lab(ctx,'…then look again',w*0.44,y+42,C.dim,9.5);
    lab(ctx,'every stage must fit a real-time budget — accuracy that misses the deadline is useless',14,h-12,C.mut);
  };

  /* 02 — BEV: lift multi-camera 2D features into one top-down bird's-eye grid. */
  A.dr_bev=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bird’s-eye view: fuse many cameras into one top-down map the planner can use',14,16,C.dim);
    // ego with surrounding camera frustums (left)
    const ex=w*0.24,ey=h*0.52;car(ctx,ex,ey,C.cyan,1.4);
    for(let k=0;k<4;k++){const a=k*TAU/4+Math.PI/4;ctx.fillStyle=hexA(C.amber,0.12);
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(a-0.4)*70,ey+Math.sin(a-0.4)*50);ctx.lineTo(ex+Math.cos(a+0.4)*70,ey+Math.sin(a+0.4)*50);ctx.closePath();ctx.fill();}
    lab(ctx,'surround cameras',ex-34,ey+70,C.mut,9.5);
    arrow(ctx,w*0.4,ey,w*0.5,ey,C.ink,1.6);lab(ctx,'lift → BEV',w*0.4,ey-12,C.dim,9.5);
    // BEV grid (right, top-down)
    const gx=w*0.55,gy=h*0.28,cs=Math.min(20,(h*0.44)/6);
    ctx.strokeStyle=hexA(C.mut,0.3);for(let i=0;i<=6;i++){ctx.beginPath();ctx.moveTo(gx+i*cs,gy);ctx.lineTo(gx+i*cs,gy+6*cs);ctx.stroke();ctx.beginPath();ctx.moveTo(gx,gy+i*cs);ctx.lineTo(gx+6*cs,gy+i*cs);ctx.stroke();}
    car(ctx,gx+3*cs,gy+5*cs,C.cyan,1);// ego
    // other agents
    const oy=gy+ (2- (saw(t,4)*1.5))*cs;car(ctx,gx+3*cs,oy,C.coral,1);dot(ctx,gx+1.5*cs,gy+3*cs,4,C.amber);
    lab(ctx,'top-down grid: ego + others + free space',gx-2,gy+6*cs+14,C.green,9.5);
    lab(ctx,'a single common frame where detection, prediction and planning all live',14,h-12,C.mut);
  };

  /* 03 — SENSOR FUSION: each sensor is blind in a different way; fuse to see completely. */
  A.dr_fusion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Every sensor is blind in a different way — fuse them to see the whole picture',14,16,C.dim);
    const rows=[['CAMERA','rich color & semantics · no true depth',C.cyan],
                ['LiDAR','precise 3D depth · no color, sparse far away',C.violet],
                ['RADAR','velocity, sees through rain/fog · low resolution',C.amber]];
    rows.forEach((r,i)=>{const y=h*0.3+i*h*0.16;box(ctx,w*0.05,y-13,w*0.14,26,r[0],r[2]);
      lab(ctx,r[1],w*0.21,y,C.mut,9.5);arrow(ctx,w*0.62,y,w*0.7,h*0.46,hexA(r[2],0.7),1.3);});
    box(ctx,w*0.71,h*0.38,w*0.16,h*0.16,'fuse',C.green,hexA(C.green,0.06));
    arrow(ctx,w*0.87,h*0.46,w*0.93,h*0.46,C.green,1.6);
    lab(ctx,'complete scene',w*0.8,h*0.6,C.green,9.5);
    lab(ctx,'color from the camera, depth from LiDAR, motion-through-weather from radar → one robust view',14,h-12,C.mut);
  };

  /* 04 — MODULAR vs END-TO-END: a cascade that compounds error vs one net (and the VLA middle path). */
  A.dr_modular=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Two ways to wire it: a modular cascade, or one end-to-end net',14,16,C.dim);
    // top: modular chain, error growing
    const ty=h*0.36,stg=['detect','track','predict','plan'];const bw=w*0.15,gap=(w*0.82-4*bw)/3;
    lab(ctx,'modular: each stage feeds the next',14,ty-26,C.violet,10);
    stg.forEach((s,i)=>{const x=w*0.06+i*(bw+gap);box(ctx,x,ty-13,bw,26,s,C.violet);
      if(i<3){arrow(ctx,x+bw+2,ty,x+bw+gap-2,ty,hexA(C.violet,0.7),1.3);
        // growing error blip
        ctx.fillStyle=hexA(C.coral,0.4+i*0.18);ctx.beginPath();ctx.arc(x+bw+gap/2,ty-18,2+i*1.5,0,TAU);ctx.fill();}});
    lab(ctx,'interpretable, but small errors compound down the chain ✗',w*0.06,ty+24,C.coral,9.5);
    // bottom: end-to-end
    const by=h*0.74;lab(ctx,'end-to-end (+ VLA reasoning):',14,by-26,C.green,10);
    box(ctx,w*0.06,by-16,w*0.2,32,'sensors',C.cyan);arrow(ctx,w*0.27,by,w*0.37,by,C.green,1.8);
    box(ctx,w*0.38,by-18,w*0.26,36,'one network → plan',C.green,hexA(C.green,0.06));
    arrow(ctx,w*0.65,by,w*0.72,by,C.green,1.6);box(ctx,w*0.73,by-14,w*0.2,28,'trajectory',C.ink);
    lab(ctx,'higher performance, but a black box — VLAs add readable reasoning back in',w*0.06,by+26,C.mut,9.5);
  };

  /* 05 — THE LONG TAIL: common cases are easy; rare events dominate risk; open-loop metrics lie. */
  A.dr_longtail=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The long tail: 99% of driving is easy — the last 1% is where crashes live',14,16,C.dim);
    const ax=w*0.08,base=h*0.62,aw=w*0.84;
    // distribution: fat head, long thin tail
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=80;i++){const u=i/80,x=ax+aw*u;const y=base-(Math.exp(-Math.pow(u/0.12,2))*h*0.38 + Math.exp(-u*2.5)*4);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'common (highway, empty road)',ax+10,base-h*0.34,C.cyan,9.5);
    // tail events
    ['cut-in','jaywalker','debris','kid + ball'].forEach((e,i)=>{const x=ax+aw*(0.4+i*0.14);dot(ctx,x,base-6,3,C.coral);lab(ctx,e,x-14,base-16,C.coral,8.5);});
    lab(ctx,'rare, endless, high-stakes →',ax+aw*0.45,base-h*0.3,C.coral,9.5);
    // open vs closed loop
    lab(ctx,'open-loop score: 96% ✓',w*0.1,base+26,C.mut,9.5);lab(ctx,'closed-loop, on the tail: fails ✗',w*0.5,base+26,C.coral,9.5);
    lab(ctx,'a benchmark on logged data flatters you; the real test is closed-loop, on rare events',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.dranim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-dranim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
