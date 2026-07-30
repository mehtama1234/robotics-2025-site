/* md-anim.js — first-principles mechanism animators for the Medical & Surgical Robotics explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-mdanim="name". Self-contained boot. */
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

  /* 01 — WHY: inside the body — no room for error, tissue moves, the view is tiny. */
  A.md_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Inside the body is the hardest workspace: tiny, moving, and unforgiving',14,16,C.dim);
    // a body outline with a narrow port; constraints listed
    const bx=w*0.5,by=h*0.55;ctx.strokeStyle=hexA(C.coral,0.6);ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(bx,by,w*0.3,h*0.3,0,0,TAU);ctx.stroke();
    // small incision port
    dot(ctx,bx-w*0.3,by,4,C.amber);lab(ctx,'one small port',bx-w*0.3-10,by-16,C.amber,8.5);
    // deforming tissue (wavy) inside
    ctx.strokeStyle=hexA(C.violet,0.6);ctx.beginPath();for(let i=-40;i<40;i++){ctx.lineTo(bx+i,by+Math.sin(i*0.15+t*2)*8);}ctx.stroke();
    lab(ctx,'tissue shifts & breathes',bx-30,by+30,C.violet,8.5);
    // constraints
    ['no room for error','deformable, wet, specular','narrow field of view','must stay sterile'].forEach((s,i)=>lab(ctx,'• '+s,w*0.04,h*0.32+i*15,C.mut,9));
    lab(ctx,'the stakes and the constraints are what make medical robotics its own discipline',14,h-12,C.mut);
  };

  /* 02 — ENDO: a camera down a tube — narrow view, deformable, specular. */
  A.md_endo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Endoscopy: see and map through a camera at the tip of a tube',14,16,C.dim);
    // tube from left with camera at tip, narrow FoV cone into a lumen
    const tx=w*0.1,ty=h*0.5;ctx.strokeStyle=hexA(C.mut,0.7);ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx-20,ty);ctx.lineTo(w*0.4,ty);ctx.stroke();
    dot(ctx,w*0.4,ty,5,C.cyan);lab(ctx,'camera + light',tx-6,ty-16,C.cyan,8.5);
    // narrow FoV cone
    ctx.fillStyle=hexA(C.amber,0.1);ctx.beginPath();ctx.moveTo(w*0.4,ty);ctx.lineTo(w*0.8,ty-h*0.2);ctx.lineTo(w*0.8,ty+h*0.2);ctx.closePath();ctx.fill();
    lab(ctx,'narrow field of view',w*0.5,ty-h*0.2-6,C.amber,8.5);
    // lumen walls (deforming) + specular highlights
    ctx.strokeStyle=hexA(C.coral,0.5);ctx.beginPath();for(let i=0;i<h*0.4;i++){const y=ty-h*0.2+i;ctx.lineTo(w*0.82+Math.sin(y*0.1+t*2)*6,y);}ctx.stroke();
    const p=saw(t,3);dot(ctx,w*0.6+p*w*0.15,ty-10+Math.sin(t*3)*6,3,C.ink);lab(ctx,'specular glare',w*0.58,ty+40,C.mut,8);
    lab(ctx,'building a stable 3D map inside a wet, shiny, deforming lumen is SLAM on hard mode',14,h-12,C.mut);
  };

  /* 03 — TELEOP: scale and steady the surgeon's motion. */
  A.md_teleop=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Teleoperation: the surgeon\'s hand, scaled down and steadied',14,16,C.dim);
    // left: surgeon's hand motion (large + tremor); right: instrument (small + smooth)
    const lx=w*0.24,ly=h*0.5,rx=w*0.74,ry=h*0.5;
    lab(ctx,'surgeon console',lx-34,h*0.3,C.cyan,9);lab(ctx,'instrument in patient',rx-40,h*0.3,C.green,9);
    const p=saw(t,4);const base=Math.sin(p*TAU)*40;const tremor=Math.sin(t*30)*6;
    dot(ctx,lx+base+tremor,ly,7,C.cyan);
    ctx.strokeStyle=hexA(C.cyan,0.3);ctx.beginPath();ctx.ellipse(lx,ly,40,10,0,0,TAU);ctx.stroke();
    // scaled + filtered motion
    dot(ctx,rx+base*0.3,ry,6,C.green);
    ctx.strokeStyle=hexA(C.green,0.3);ctx.beginPath();ctx.ellipse(rx,ry,12,4,0,0,TAU);ctx.stroke();
    arrow(ctx,lx+50,ly,rx-30,ry,hexA(C.violet,0.7),1.4);lab(ctx,'× scale down\n× filter tremor',w*0.46,ly-24,C.violet,8.5);
    lab(ctx,'motion scaling + tremor filtering turn a shaky human hand into sub-millimetre precision',14,h-12,C.mut);
  };

  /* 04 — SOFT/CONTINUUM: robots that bend to follow a path through the body. */
  A.md_soft=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Continuum & steerable robots bend to follow the body\'s own channels',14,16,C.dim);
    // a curved lumen path + a continuum robot snaking along it
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=18;ctx.beginPath();
    const path=[];for(let i=0;i<=100;i++){const fx=i/100;const x=w*0.1+fx*w*0.8;const y=h*0.5+Math.sin(fx*6)*h*0.16;path.push([x,y]);}
    ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);path.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();
    lab(ctx,'winding vessel / lumen',w*0.1,h*0.3,C.mut,9);
    // robot tip advances along path
    const p=saw(t,5);const n=Math.floor(p*path.length);
    ctx.strokeStyle=C.green;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);
    for(let i=0;i<=n;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.stroke();
    if(n<path.length)dot(ctx,path[n][0],path[n][1],5,C.amber);
    lab(ctx,'no rigid links — the body itself is the guide; steer the tip and the shaft follows',14,h-12,C.mut);
  };

  /* 05 — AUTONOMY: from assisting to acting, under image guidance and hard safety limits. */
  A.md_autonomy=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Toward autonomy: assist, then act — always inside hard safety limits',14,16,C.dim);
    // a ladder of autonomy levels
    const levels=['surgeon does all','robot steadies','robot does a subtask','robot does the task, supervised'];
    const p=saw(t,6);const active=Math.min(3,Math.floor(p*4));
    levels.forEach((s,i)=>{const y=h*0.30+i*h*0.14;const on=(i===active);
      rrect(ctx,w*0.06,y,w*0.6,h*0.1,5,on?C.green:hexA(C.mut,0.4),on?hexA(C.green,0.1):null);
      lab(ctx,'L'+i+': '+s,w*0.08,y+h*0.05,on?C.green:C.mut,9.5);});
    // a "safety envelope" gate on the right
    box(ctx,w*0.72,h*0.44,w*0.22,30,'safety envelope\n(image-guided)',C.coral,hexA(C.coral,0.06));
    lab(ctx,'every autonomous action is checked against imaging + a no-go boundary before it moves',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.mdanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-mdanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
