/* wm-anim.js — first-principles mechanism animators for the World-Models explainer.
   Same harness contract as gs-anim.js: A[name]=fn(ctx,w,h,t); canvases carry data-wmanim="name".
   Self-contained boot so it can't disturb other animator files. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              green:'#6FCf7f', ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440' };
  const TAU=Math.PI*2;
  function fit(cv){ const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth, h=parseInt(cv.getAttribute('height'))||300;
    cv.width=w*dpr; cv.height=h*dpr; const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return {ctx,w,h}; }
  function clear(ctx,w,h){ctx.clearRect(0,0,w,h);}
  function lab(ctx,s,x,y,col,size,align){ctx.save();ctx.font=(size||10.5)+'px ui-monospace,Menlo,monospace';
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
  function hexA(hex,a){const n=parseInt(hex.slice(1),16);return'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
  function rrect(ctx,x,y,w,h,r,stroke,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath(); if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke();}}
  // labelled box centered text
  function box(ctx,x,y,w,h,text,col,fill){rrect(ctx,x,y,w,h,7,col,fill||null);lab(ctx,text,x+w/2,y+h/2,col,11,'center');}
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=6;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  // a spark travelling a segment at phase p (0..1)
  function spark(ctx,x1,y1,x2,y2,p,col){const x=x1+(x2-x1)*p,y=y1+(y2-y1)*p;dot(ctx,x,y,3,col);}
  const saw=(t,p)=>((t%p)/p), ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

  const A={};

  /* 01 — WHAT A WORLD MODEL IS: a policy maps state->action; a world model maps (state,action)->next state. */
  A.wm_core=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A world model learns to answer one question: “what happens next if I do this?”',14,16,C.dim);
    const p=saw(t,3);
    // policy row (muted)
    const py=h*0.34;
    box(ctx,w*0.06,py-16,w*0.16,32,'state',C.mut);
    arrow(ctx,w*0.23,py,w*0.36,py,hexA(C.mut,0.7));
    box(ctx,w*0.37,py-16,w*0.16,32,'action',C.mut);
    lab(ctx,'a POLICY just reacts:  state → action',w*0.56,py,C.mut,11);
    // world-model row (highlighted)
    const wy=h*0.60;
    box(ctx,w*0.06,wy-30,w*0.16,26,'state',C.cyan);
    box(ctx,w*0.06,wy+4,w*0.16,26,'action',C.amber);
    arrow(ctx,w*0.23,wy,w*0.40,wy,C.cyan,1.8); spark(ctx,w*0.23,wy,w*0.40,wy,p,C.ink);
    box(ctx,w*0.41,wy-16,w*0.30,32,'next state (predicted)',C.green,hexA(C.green,0.06));
    lab(ctx,'a WORLD MODEL predicts:  (state, action) → next state',14,wy+52,C.ink,11);
    lab(ctx,'learn this, and you can rehearse the future before taking a single real step',14,wy+70,C.dim,10.5);
  };

  /* 02 — ENCODE TO A LATENT: a big noisy observation becomes a small state you can predict in. */
  A.wm_encode=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pixels are huge and noisy — first compress the world to a small state',14,16,C.dim);
    // pixel grid
    const gx=w*0.08,gy=h*0.32,cs=Math.min(18,(w*0.24)/6);
    for(let i=0;i<6;i++)for(let j=0;j<6;j++){const hue=((i*40+j*20+ (Math.sin(t)*20))%360);
      ctx.fillStyle='hsl('+hue+',45%,55%)';ctx.fillRect(gx+i*cs,gy+j*cs,cs-1,cs-1);}
    lab(ctx,'observation (pixels)',gx,gy+6*cs+14,C.mut);
    // encoder
    arrow(ctx,gx+6*cs+6,gy+3*cs,gx+6*cs+40,gy+3*cs,C.cyan,1.6);
    box(ctx,gx+6*cs+42,gy+3*cs-16,64,32,'encoder',C.cyan);
    arrow(ctx,gx+6*cs+108,gy+3*cs,gx+6*cs+146,gy+3*cs,C.cyan,1.6);
    // latent z (a few dots + short code bars)
    const zx=gx+6*cs+150,zy=gy+3*cs;
    rrect(ctx,zx,zy-24,84,48,8,C.green,hexA(C.green,0.06));
    for(let k=0;k<5;k++){const v=0.4+0.5*Math.abs(Math.sin(t*0.8+k));ctx.fillStyle=C.green;ctx.fillRect(zx+10+k*13,zy+12-v*22,7,v*22);}
    lab(ctx,'latent state z',zx,zy+34,C.green);
    lab(ctx,'a few numbers, not a million pixels',zx-4,zy+50,C.dim,10);
    lab(ctx,'predict the FUTURE in this small space → fast, and it ignores irrelevant detail',14,h-12,C.mut);
  };

  /* 03 — ROLLOUT / IMAGINE: from z0, roll the dynamics forward under chosen actions; branch alternative futures. */
  A.wm_rollout=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Imagine: roll the dynamics forward in your head — no real steps taken',14,16,C.dim);
    const x0=w*0.08,yy=h*0.44,dx=(w*0.84)/4;
    // main branch z0..z3
    const p=saw(t,4)*4;
    for(let k=0;k<4;k++){const x=x0+dx*k;
      if(k<3){arrow(ctx,x+12,yy,x+dx-12,yy,C.cyan,1.6);lab(ctx,'a'+k,x+dx/2,yy-12,C.amber,10,'center');}
      dot(ctx,x,yy,7,k===0?C.ink:C.cyan);lab(ctx,'z'+k,x,yy+18,k===0?C.ink:C.cyan,10,'center');
      if(k<3){const seg=Math.max(0,Math.min(1,p-k));spark(ctx,x+12,yy,x+dx-12,yy,seg,C.amber);}
    }
    lab(ctx,'dynamics: zₖ, aₖ → zₖ₊₁',x0,yy-30,C.dim,10);
    // alternative branch from z1
    const bx=x0+dx, by=h*0.78;
    arrow(ctx,bx+8,yy+6,bx+dx-12,by,hexA(C.violet,0.9),1.4);lab(ctx,"a1'",bx+dx*0.5,yy+40,C.violet,10);
    dot(ctx,bx+dx,by,6,C.violet);lab(ctx,"z2'",bx+dx,by+16,C.violet,10,'center');
    arrow(ctx,bx+dx+10,by,bx+2*dx-12,by,hexA(C.violet,0.9),1.4);dot(ctx,bx+2*dx,by,6,C.violet);lab(ctx,"z3'",bx+2*dx,by+16,C.violet,10,'center');
    lab(ctx,'try a different action → a different imagined future',bx+8,by-14,C.violet,10);
  };

  /* 04 — PLAN / LEARN IN IMAGINATION: score dreamed rollouts by predicted reward; pick the best (or train on them). */
  A.wm_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Now use the dream: score imagined rollouts, keep the best plan',14,16,C.dim);
    const rows=[['+2',C.mut],['+8',C.green],['-1',C.coral]];
    const best=1; const hi=Math.floor(saw(t,4)*3)%3;
    rows.forEach((r,i)=>{const y=h*0.32+i*h*0.22, on=(i===best);
      for(let k=0;k<4;k++){const x=w*0.1+k*(w*0.5/4);
        if(k<3)arrow(ctx,x+9,y,x+w*0.5/4-9,y,on?C.green:hexA(C.mut,0.6),on?1.6:1);
        dot(ctx,x,y,5,on?C.green:C.mut);}
      lab(ctx,'reward '+r[0],w*0.64,y,on?C.green:r[1],12);
      if(on){lab(ctx,'▸ pick this action sequence',w*0.64,y+15,C.green,10);}
      if(i===hi&&!on){ctx.strokeStyle=hexA(C.amber,0.4);ctx.strokeRect(w*0.08,y-12,w*0.54,24);}
    });
    lab(ctx,'planning: choose the best imagined sequence.   or — TRAIN a policy on this dreamed experience (free data).',14,h-12,C.mut);
  };

  /* 05 — TWO SCHOOLS: predict the next FRAME (video world model) vs the next STATE (latent dynamics). */
  A.wm_schools=function(ctx,w,h,t){clear(ctx,w,h);
    const midY=h*0.5;ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(0,midY);ctx.lineTo(w,midY);ctx.stroke();
    // top: video world model — predict frames
    lab(ctx,'VIDEO world model — predict the next FRAME',14,16,C.cyan);
    const fy=h*0.30,fw=Math.min(64,w*0.14),fh=fw*0.6,p=saw(t,3)*3;
    for(let k=0;k<4;k++){const x=w*0.08+k*(w*0.2);
      // little frame
      const g=ctx.createLinearGradient(x,fy,x+fw,fy+fh);g.addColorStop(0,hexA(C.cyan,0.5));g.addColorStop(1,hexA(C.violet,0.4));
      rrect(ctx,x,fy-fh/2,fw,fh,4,C.cyan,g);
      if(k<3){arrow(ctx,x+fw+3,fy,x+w*0.2-3,fy,hexA(C.cyan,0.8),1.4);const seg=Math.max(0,Math.min(1,p-k));spark(ctx,x+fw+3,fy,x+w*0.2-3,fy,seg,C.ink);}
    }
    lab(ctx,'photoreal, heavy — you can watch the future; great for driving sims & data',14,fy+fh/2+16,C.mut);
    // bottom: latent dynamics — predict states
    lab(ctx,'LATENT dynamics — predict the next STATE',14,midY+22,C.green);
    const zy=h*0.78;
    for(let k=0;k<6;k++){const x=w*0.08+k*(w*0.14);dot(ctx,x,zy,6,C.green);
      if(k<5)arrow(ctx,x+9,zy,x+w*0.14-9,zy,hexA(C.green,0.8),1.4);}
    lab(ctx,'compact, fast — for control & planning; you cannot “watch” it, but it’s cheap to roll far ahead',14,zy+20,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){ if(running.has(cv))return; const anim=A[cv.dataset.wmanim]; if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;
    function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf)); cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-wmanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
