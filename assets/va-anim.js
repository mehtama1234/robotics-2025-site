/* va-anim.js — first-principles mechanism animators for the VLA (Vision-Language-Action) explainer.
   Same harness: A[name]=fn(ctx,w,h,t); canvases carry data-vaanim="name". Self-contained boot. */
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
  const saw=(t,p)=>((t%p)/p);

  const A={};

  /* 01 — GENERALIST vs SPECIALIST: language is the task selector; one model does many tasks. */
  A.va_generalist=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Don’t script every task — one model, commanded in language, does many',14,16,C.dim);
    const tasks=['fold','pour','open'];
    // left: specialists (one model per task, retrained)
    lab(ctx,'specialist: retrain a model per task',w*0.06,h*0.28,C.coral,10);
    tasks.forEach((tk,i)=>{const y=h*0.4+i*h*0.18;box(ctx,w*0.06,y-13,w*0.14,26,'model '+(i+1),C.mut);lab(ctx,'→ '+tk,w*0.22,y,C.mut,10);});
    // right: one generalist VLA
    const gx=w*0.66,gy=h*0.5;box(ctx,gx-w*0.1,gy-24,w*0.2,48,'one VLA',C.green,hexA(C.green,0.06));
    lab(ctx,'generalist: one model, language picks the task',gx-70,h*0.24,C.green,10);
    const hi=Math.floor(saw(t,3)*3)%3;
    tasks.forEach((tk,i)=>{const y=gy-26+i*26,on=i===hi;lab(ctx,'“'+tk+' it”',gx-w*0.24,y,on?C.amber:hexA(C.mut,0.5),10);
      arrow(ctx,gx-w*0.13,y,gx-w*0.1,gy,on?C.amber:hexA(C.mut,0.3),on?1.4:1);});
    arrow(ctx,gx+w*0.1,gy,gx+w*0.16,gy,C.green,1.6);lab(ctx,'acts',gx+w*0.16,gy-12,C.green,10);
    lab(ctx,'the instruction selects the behavior → new tasks without a new model',14,h-12,C.mut);
  };

  /* 02 — BACKBONE: adapt an internet-pretrained VLM (it already knows objects + words) into an actor. */
  A.va_backbone=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Start from a VLM that already learned the world from the web — then teach it to act',14,16,C.dim);
    // pretrained VLM box with knowledge chips
    const bx=w*0.28,by=h*0.5;box(ctx,bx-w*0.16,by-40,w*0.32,80,'',C.cyan,hexA(C.cyan,0.05));
    lab(ctx,'pretrained VLM',bx,by-30,C.cyan,11,'center');
    ['objects','words','places','common sense'].forEach((k,i)=>{lab(ctx,k,bx-w*0.13+ (i%2)*w*0.15,by-6+Math.floor(i/2)*18,hexA(C.cyan,0.9),9.5);});
    lab(ctx,'(from oceans of images + text)',bx,by+50,C.mut,9.5,'center');
    // bolt on action head
    arrow(ctx,bx+w*0.16,by,bx+w*0.26,by,C.ink,1.6);
    box(ctx,bx+w*0.27,by-16,w*0.16,32,'+ action head',C.amber,hexA(C.amber,0.06));
    arrow(ctx,bx+w*0.44,by,bx+w*0.52,by,C.green,1.8);
    box(ctx,bx+w*0.53,by-16,w*0.16,32,'acts',C.green);
    lab(ctx,'inherit web knowledge → generalize to objects & words never seen in robot data',14,h-12,C.mut);
  };

  /* 03 — GETTING ACTIONS OUT: discrete action tokens the LM predicts, vs a continuous (diffusion/flow) head. */
  A.va_action=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'How does a language model output a robot action? Two ways.',14,16,C.dim);
    box(ctx,w*0.04,h*0.44,w*0.2,30,'image + “grasp it”',C.cyan);
    arrow(ctx,w*0.25,h*0.5,w*0.31,h*0.5,C.ink,1.4);box(ctx,w*0.32,h*0.42,w*0.12,h*0.16,'VLA',C.violet);
    // branch A: discrete tokens
    arrow(ctx,w*0.45,h*0.46,w*0.54,h*0.3,C.amber,1.4);
    lab(ctx,'A · action tokens',w*0.55,h*0.24,C.amber,10);
    for(let k=0;k<6;k++){ctx.fillStyle=hexA(C.amber,0.85);ctx.fillRect(w*0.55+k*16,h*0.3-6,13,13);}
    lab(ctx,'quantize the action → the LM predicts it like words',w*0.55,h*0.4,C.mut,9.5);
    // branch B: continuous head
    arrow(ctx,w*0.45,h*0.54,w*0.54,h*0.7,C.green,1.4);
    lab(ctx,'B · continuous head',w*0.55,h*0.64,C.green,10);
    ctx.strokeStyle=C.green;ctx.lineWidth=1.8;ctx.beginPath();for(let i=0;i<=20;i++){const u=i/20,x=w*0.55+w*0.18*u,y=h*0.72+Math.sin(u*4)*8;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'a diffusion / flow head → smooth continuous action',w*0.55,h*0.8,C.mut,9.5);
    lab(ctx,'tokens are simple and reuse the LM; continuous heads are smoother and multimodal',14,h-12,C.mut);
  };

  /* 04 — CO-TRAINING: huge web data + scarce robot demos, mixed, so grounding survives. */
  A.va_cotrain=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Robot data is scarce — co-train with web data so language grounding survives',14,16,C.dim);
    // web data: big block of many dots
    const wx=w*0.1,wy=h*0.32;lab(ctx,'web image+text (billions)',wx,wy-16,C.cyan,10);
    for(let i=0;i<80;i++)dot(ctx,wx+((i*7)%140),wy+Math.floor(i/20)*9,1.8,hexA(C.cyan,0.6));
    // robot data: tiny block
    const rx=w*0.1,ry=h*0.68;lab(ctx,'robot demos (thousands)',rx,ry-16,C.amber,10);
    for(let i=0;i<10;i++)dot(ctx,rx+((i*10)%100),ry,2.4,C.amber);
    // mix -> one VLA
    arrow(ctx,w*0.4,wy,w*0.52,h*0.48,C.ink,1.3);arrow(ctx,w*0.4,ry,w*0.52,h*0.52,C.ink,1.3);
    box(ctx,w*0.53,h*0.42,w*0.2,h*0.16,'co-trained VLA',C.green,hexA(C.green,0.06));
    arrow(ctx,w*0.74,h*0.5,w*0.82,h*0.5,C.green,1.6);
    lab(ctx,'keeps',w*0.83,h*0.44,C.green,10);lab(ctx,'language',w*0.83,h*0.5,C.green,10);lab(ctx,'+ acts',w*0.83,h*0.56,C.green,10);
    lab(ctx,'without the web mix, fine-tuning on robot data alone forgets how to understand language',14,h-12,C.mut);
  };

  /* 05 — REASON THEN ACT: think in words/space (waypoints, CoT) before moving. */
  A.va_reason=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reason first, then act: think in words or space before the arm moves',14,16,C.dim);
    box(ctx,w*0.04,h*0.46,w*0.2,30,'“put mug by sink”',C.cyan);
    arrow(ctx,w*0.25,h*0.5,w*0.31,h*0.5,C.ink,1.4);
    // reasoning chain
    box(ctx,w*0.32,h*0.28,w*0.36,h*0.44,'',C.violet,hexA(C.violet,0.05));lab(ctx,'reason',w*0.34,h*0.24,C.violet,10);
    const steps=['find the mug','plan: approach → grasp → carry','waypoints in 3D'];
    const lit=Math.floor(saw(t,3)*3);
    steps.forEach((s,i)=>{const y=h*0.4+i*h*0.11,on=i<=lit;dot(ctx,w*0.35,y,4,on?C.violet:hexA(C.violet,0.35));lab(ctx,s,w*0.37,y,on?C.ink:C.dim,9.5);});
    arrow(ctx,w*0.68,h*0.5,w*0.76,h*0.5,C.green,1.6);box(ctx,w*0.77,h*0.42,w*0.16,h*0.16,'action',C.green);
    lab(ctx,'explicit intermediate reasoning grounds loose words in geometry → far more robust',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.vaanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-vaanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
