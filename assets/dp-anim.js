/* dp-anim.js — first-principles mechanism animators for the Diffusion-Policies explainer.
   Same harness contract: A[name]=fn(ctx,w,h,t); canvases carry data-dpanim="name". Self-contained boot. */
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
  function xmark(ctx,x,y,r,col){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r,y-r);ctx.lineTo(x+r,y+r);ctx.moveTo(x+r,y-r);ctx.lineTo(x-r,y+r);ctx.stroke();}
  const saw=(t,p)=>((t%p)/p),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  // deterministic jitter
  function jit(i){const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s);}

  const A={};

  /* 01 — THE AVERAGING TRAP: two valid actions; a regressor outputs their mean, which is wrong. */
  A.dp_multimodal=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The trap: when a task has TWO right answers, averaging them gives a wrong one',14,16,C.dim);
    const cx=w*0.5,cy=h*0.56;
    // object (a mug) in the middle
    rrect(ctx,cx-26,cy-24,52,44,6,C.mut,hexA(C.mut,0.12));lab(ctx,'mug',cx,cy-2,C.mut,10,'center');
    // two valid grasps
    const lx=cx-90,rx=cx+90;
    dot(ctx,lx,cy,8,C.green);lab(ctx,'grab left ✓',lx-30,cy-18,C.green,10);
    dot(ctx,rx,cy,8,C.green);lab(ctx,'grab right ✓',rx-14,cy-18,C.green,10);
    // regressor averages -> middle (empty, above the mug)
    const my=cy-70;
    arrow(ctx,lx,cy-6,cx-2,my+6,hexA(C.coral,0.5),1.2);arrow(ctx,rx,cy-6,cx+2,my+6,hexA(C.coral,0.5),1.2);
    dot(ctx,cx,my,7,C.coral);xmark(ctx,cx,my,10,C.coral);
    lab(ctx,'a regressor outputs the AVERAGE → reaches empty space ✗',cx-150,my-16,C.coral,10);
    lab(ctx,'ordinary behavior cloning minimizes error to “the” action — but there is no single right action',14,h-12,C.mut);
  };

  /* 02 — DENOISING: start from pure noise, refine step by step into one clean action, conditioned on the obs. */
  A.dp_denoise=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The fix, borrowed from image generators: turn noise into an action, step by step',14,16,C.dim);
    const steps=5,y=h*0.55,x0=w*0.1,dx=(w*0.8)/(steps-1);
    const p=saw(t,4)*(steps-1);
    for(let s=0;s<steps;s++){const x=x0+dx*s;
      // cloud tightening toward a point as s grows
      const spread=28*(1-s/(steps-1));
      for(let k=0;k<10;k++){const a=k/10*TAU;dot(ctx,x+Math.cos(a+k)*spread*(0.4+0.6*jit(k+s)),y+Math.sin(a+k)*spread*(0.4+0.6*jit(k+s*3)),1.8,hexA(C.cyan,0.5));}
      if(s===steps-1){dot(ctx,x,y,6,C.cyan);lab(ctx,'action',x,y+22,C.cyan,10,'center');}
      lab(ctx,s===0?'pure noise':('step '+s),x,y-40,s<=p?C.ink:C.dim,9.5,'center');
      if(s<steps-1)arrow(ctx,x+spread+4,y,x+dx-spread-2,y,hexA(C.mut,0.6),1.2);
    }
    // obs conditioning
    box(ctx,w*0.42,h*0.18,w*0.16,26,'observation',C.amber);arrow(ctx,w*0.5,h*0.29,w*0.5,y-46,hexA(C.amber,0.7),1.2);
    lab(ctx,'each denoising step is nudged by what the robot sees → a clean, decisive action falls out',14,h-12,C.mut);
  };

  /* 03 — MODEL THE WHOLE DISTRIBUTION: bimodal; a sample lands on one mode, a regressor sits in the dead valley. */
  A.dp_distribution=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Model the whole distribution of good actions — then SAMPLE one, don’t average',14,16,C.dim);
    const x0=w*0.1,x1=w*0.9,base=h*0.72;
    // bimodal curve
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    const f=x=>{const u=(x-x0)/(x1-x0);return Math.exp(-Math.pow((u-0.28)/0.12,2))+Math.exp(-Math.pow((u-0.72)/0.12,2));};
    for(let i=0;i<=60;i++){const x=x0+(x1-x0)*i/60,y=base-f(x)*h*0.34;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'distribution of valid actions',x0,base-h*0.4,C.cyan,10);
    // regressor at the valley (average)
    const mx=x0+(x1-x0)*0.5;dot(ctx,mx,base,6,C.coral);xmark(ctx,mx,base-24,9,C.coral);
    lab(ctx,'regressor → the valley (average) ✗',mx-70,base+16,C.coral,10);
    // diffusion sample onto a mode, alternating
    const peak=Math.floor(saw(t,3)*2)%2; const px=x0+(x1-x0)*(peak?0.72:0.28);
    dot(ctx,px,base-f(px)*h*0.34,7,C.green);lab(ctx,'a sample → one real mode ✓',px-40,base-f(px)*h*0.34-16,C.green,10);
    lab(ctx,'left grasp OR right grasp, committed — never the impossible blend of the two',14,h-12,C.mut);
  };

  /* 04 — ACTION CHUNKING: predict a short trajectory, execute a few, replan — smooth vs single-step jitter. */
  A.dp_chunk=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Predict a CHUNK of future actions, execute a few, replan — steady, not twitchy',14,16,C.dim);
    // top: single-step jitter
    const ty=h*0.34,x0=w*0.1,x1=w*0.9;
    lab(ctx,'one action at a time:',14,ty-24,C.coral,10);
    ctx.strokeStyle=hexA(C.coral,0.8);ctx.lineWidth=1.4;ctx.beginPath();
    for(let i=0;i<=24;i++){const x=x0+(x1-x0)*i/24,y=ty+ (jit(i)*2-1)*16;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'jitter',x1+4,ty,C.coral,10);
    // bottom: chunked + receding horizon
    const by=h*0.72;lab(ctx,'chunked + receding horizon:',14,by-24,C.green,10);
    const H=w*0.26;const start=saw(t,4)*(x1-x0-H)+x0;
    // executed part (solid) then predicted chunk (dashed) ahead
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,by);ctx.lineTo(start,by+6*Math.sin(start/40));ctx.stroke();
    ctx.strokeStyle=hexA(C.cyan,0.9);ctx.setLineDash([5,4]);ctx.beginPath();
    for(let i=0;i<=20;i++){const x=start+H*i/20,y=by+6*Math.sin(x/40);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<=4;i++){const x=start+H*i/4;dot(ctx,x,by+6*Math.sin(x/40),2.5,C.cyan);}
    lab(ctx,'predicted chunk (execute first few)',start,by-14,C.cyan,10);
    lab(ctx,'predicting a short trajectory keeps motion consistent and lets the policy commit to a plan',14,h-12,C.mut);
  };

  /* 05 — SPEED: many denoise steps (slow) vs consistency/flow (1-2 steps) for a real-time control loop. */
  A.dp_speed=function(ctx,w,h,t){clear(ctx,w,h);
    const midY=h*0.5;ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(0,midY);ctx.lineTo(w,midY);ctx.stroke();
    // top: 50 steps
    lab(ctx,'plain diffusion — ~50 denoising steps per action',14,16,C.coral);
    const ty=h*0.30,x0=w*0.06,x1=w*0.7;const p=saw(t,3);
    for(let i=0;i<16;i++){const x=x0+(x1-x0)*i/15;const on=i<=p*16;dot(ctx,x,ty,on?3.2:2,on?C.coral:hexA(C.dim,0.5));
      if(i<15)ctx.strokeStyle=hexA(C.coral,0.4),ctx.beginPath(),ctx.moveTo(x,ty),ctx.lineTo(x0+(x1-x0)*(i+1)/15,ty),ctx.stroke();}
    dot(ctx,x1+16,ty,6,C.coral);lab(ctx,'action',x1+16,ty+16,C.coral,9,'center');
    lab(ctx,'accurate, but too slow for a fast control loop',x0,ty+22,C.mut);lab(ctx,'≈ few Hz',w*0.84,ty,C.coral,12);
    // bottom: consistency / flow, 1-2 steps
    lab(ctx,'consistency model / flow matching — 1–2 steps',14,midY+22,C.green);
    const gy=h*0.76;dot(ctx,x0,gy,4,hexA(C.dim,0.6));arrow(ctx,x0+10,gy,x0+w*0.5,gy,C.green,2);
    dot(ctx,x0+w*0.5+12,gy,6,C.green);lab(ctx,'action',x0+w*0.5+12,gy-16,C.green,9,'center');
    lab(ctx,'jump almost straight to the answer → fast enough to run on a real robot',x0,gy+22,C.mut);lab(ctx,'≈ 100s of Hz',w*0.84,gy,C.green,12);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.dpanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-dpanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
