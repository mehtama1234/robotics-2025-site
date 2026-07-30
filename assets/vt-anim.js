/* vt-anim.js — first-principles mechanism animators for the Video & Temporal Understanding explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-vtanim="name". Self-contained boot. */
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
  function frame(ctx,x,y,w,h,col){rrect(ctx,x,y,w,h,3,col||hexA(C.mut,0.5),null);}

  /* 01 — WHY: a video is not a stack of images; order and motion carry the meaning. */
  A.vt_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A video is not a bag of frames — the order and the motion are the meaning',14,16,C.dim);
    // same frames, two orders -> different meaning (door opening vs closing)
    const fy=h*0.34,fw=w*0.13,fh=h*0.2,gap=w*0.03;
    lab(ctx,'frames in order → "door opening"',w*0.06,fy-10,C.green,9);
    for(let k=0;k<4;k++){const x=w*0.06+k*(fw+gap);frame(ctx,x,fy,fw,fh);
      ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.strokeRect(x+4,fy+4,(fw-8)*(k/3),fh-8);}
    lab(ctx,'same frames reversed → "door closing"',w*0.06,fy+fh+22,C.coral,9);
    for(let k=0;k<4;k++){const x=w*0.06+k*(fw+gap);frame(ctx,x,fy+fh+30,fw,fh);
      ctx.strokeStyle=C.coral;ctx.lineWidth=2;ctx.strokeRect(x+4,fy+fh+34,(fw-8)*(1-k/3),fh-8);}
    lab(ctx,'shuffle the frames and the event is gone — time is a dimension, not a batch',14,h-12,C.mut);
  };

  /* 02 — MOTION: action lives in how pixels move between frames. */
  A.vt_motion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'What moved, and how — motion between frames is the raw signal of action',14,16,C.dim);
    // two overlaid frames + motion vectors of a moving subject vs static background
    const cx=w*0.5,cy=h*0.5;
    // static background dots (tiny motion)
    for(let i=0;i<20;i++){const x=w*0.1+((i*53)%Math.floor(w*0.8)),y=h*0.3+((i*37)%Math.floor(h*0.4));
      arrow(ctx,x,y,x+3,y,hexA(C.mut,0.5),1);}
    // moving subject (a runner) with big motion vectors
    const p=saw(t,3);const sx=w*0.2+p*w*0.5;
    for(let i=0;i<6;i++){const y=cy-20+i*8;arrow(ctx,sx,y,sx+22,y,C.cyan,1.6);}
    dot(ctx,sx,cy,7,C.amber);
    lab(ctx,'big vectors = the runner',sx+26,cy,C.cyan,9);lab(ctx,'small vectors = still background',w*0.1,h*0.72,C.mut,9);
    lab(ctx,'separate the flow of the subject from the background and you have detected the action',14,h-12,C.mut);
  };

  /* 03 — TRACK: keep the SAME identity across frames, through occlusion. */
  A.vt_track=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tracking: keep the same identity on the same object over time',14,16,C.dim);
    const y=h*0.5,p=saw(t,5);
    // two objects crossing; an occluder in the middle; IDs must persist
    const ax=w*0.1+p*w*0.8, bx=w*0.9-p*w*0.8;
    // occluder
    ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(w*0.46,y-40,w*0.08,80);lab(ctx,'occluder',w*0.46,y-48,C.mut,8);
    const behindA=Math.abs(ax-w*0.5)<w*0.05, behindB=Math.abs(bx-w*0.5)<w*0.05;
    if(!behindA){dot(ctx,ax,y-10,7,C.cyan);lab(ctx,'ID 1',ax-8,y-24,C.cyan,8.5);}
    if(!behindB){dot(ctx,bx,y+10,7,C.amber);lab(ctx,'ID 2',bx-8,y+24,C.amber,8.5);}
    // trails
    ctx.strokeStyle=hexA(C.cyan,0.3);ctx.beginPath();ctx.moveTo(w*0.1,y-10);ctx.lineTo(ax,y-10);ctx.stroke();
    ctx.strokeStyle=hexA(C.amber,0.3);ctx.beginPath();ctx.moveTo(w*0.9,y+10);ctx.lineTo(bx,y+10);ctx.stroke();
    lab(ctx,'the hard part: re-attach the right ID after they cross or vanish behind something',14,h-12,C.mut);
  };

  /* 04 — LONG: understand a whole long video, not one clip — needs memory. */
  A.vt_long=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Understanding a long video: too much to hold at once, so compress and remember',14,16,C.dim);
    // a long strip of frames -> a few key events kept in memory
    const sy=h*0.34,fw=w*0.045,n=16;
    for(let k=0;k<n;k++){const x=w*0.05+k*(fw+2);const key=(k===2||k===7||k===12);frame(ctx,x,sy,fw,h*0.16,key?C.cyan:hexA(C.mut,0.35));}
    lab(ctx,'a long stream of frames',w*0.05,sy-8,C.mut,9);
    // memory keeps only key events
    box(ctx,w*0.3,h*0.66,w*0.4,26,'memory: keep the few key moments',C.violet,hexA(C.violet,0.06));
    [2,7,12].forEach(k=>{const x=w*0.05+k*(fw+2)+fw/2;arrow(ctx,x,sy+h*0.16,w*0.5,h*0.66,hexA(C.cyan,0.5),1);});
    // a question answered from memory
    const p=saw(t,4);lab(ctx,p>0.5?'Q: "what happened after they met?" → answered from memory':'Q: "what happened after they met?"',w*0.06,h*0.92,C.green,9);
    lab(ctx,'you can\'t attend to every frame of an hour-long video — the game is what to remember',14,h-12,C.mut);
  };

  /* 05 — PREDICT: guess the next frames — a world model in disguise. */
  A.vt_predict=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Predicting the next frames — understanding time enough to extend it',14,16,C.dim);
    const sy=h*0.4,fw=w*0.1,gap=w*0.015;
    // observed frames (solid) then predicted (dashed, uncertain)
    for(let k=0;k<3;k++){const x=w*0.05+k*(fw+gap);frame(ctx,x,sy,fw,h*0.28,C.cyan);
      const bx=x+8+((k*9)%(fw-20));dot(ctx,bx+8,sy+h*0.14,5,C.amber);}
    lab(ctx,'observed',w*0.05,sy-8,C.cyan,9);
    const p=saw(t,3);
    for(let k=3;k<6;k++){const x=w*0.05+k*(fw+gap);ctx.setLineDash([3,3]);frame(ctx,x,sy,fw,h*0.28,hexA(C.violet,0.7));ctx.setLineDash([]);
      // predicted ball continues + uncertainty spread
      const bx=x+8+((k*9)%(fw-20));dot(ctx,bx+8,sy+h*0.14,5,hexA(C.violet,0.4+0.2*Math.sin(t+k)));}
    lab(ctx,'predicted (uncertain →)',w*0.55,sy-8,C.violet,9);
    lab(ctx,'multiple futures are plausible → predictions blur unless the model commits to one',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.vtanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-vtanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
