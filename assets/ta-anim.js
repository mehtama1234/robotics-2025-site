/* ta-anim.js — first-principles mechanism animators for the Tactile & Force Sensing explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-taanim="name". Self-contained boot. */
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

  /* 01 — WHY: at the instant of contact, the camera is blocked and force is invisible. */
  A.ta_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The moment a hand touches an object, the eye can no longer see the contact',14,16,C.dim);
    // camera top-left
    const camx=w*0.14,camy=h*0.26;box(ctx,camx-24,camy-12,48,22,'camera',C.cyan);
    // object + fingertip covering it
    const ox=w*0.6,oy=h*0.6;ring(ctx,ox,oy,30,hexA(C.amber,0.9));lab(ctx,'object',ox,oy+2,C.amber,9,'center');
    // fingertip on top of contact region (occluding)
    const fx=ox-6,fy=oy-30;rrect(ctx,fx-14,fy-20,28,26,8,C.violet,hexA(C.violet,0.25));lab(ctx,'fingertip',fx+22,fy-8,C.violet,9);
    // blocked sight line
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(camx,camy+10);ctx.lineTo(fx-12,fy-14);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'view blocked ✗',w*0.2,h*0.44,C.coral,9);
    // hidden force at contact
    const p=saw(t,2);arrow(ctx,fx,fy+8,fx,fy+8+14+Math.sin(t*3)*2,C.green,2);
    lab(ctx,'the force & tiny\nslips live here —\nonly touch feels them',ox+40,oy-6,C.green,8.5);
    lab(ctx,'touch senses exactly where and when vision goes blind — force, slip, texture, fine geometry',14,h-12,C.mut);
  };

  /* 02 — GEL SENSOR: a camera watching a soft skin deform gives a dense contact image. */
  A.ta_gel=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A vision-based tactile sensor: a camera films a soft gel skin as it deforms',14,16,C.dim);
    // cross-section: object presses into gel, camera below looks up
    const gx=w*0.30,gy=h*0.42,gw=190,gh=40;
    // gel slab
    rrect(ctx,gx,gy,gw,gh,6,hexA(C.cyan,0.8),hexA(C.cyan,0.12));lab(ctx,'soft gel skin',gx+4,gy-8,C.cyan,9);
    // object pressing in (bump)
    const press=6+Math.sin(t*1.5)*4;
    ctx.fillStyle=hexA(C.amber,0.85);ctx.beginPath();ctx.moveTo(gx+70,gy);ctx.quadraticCurveTo(gx+95,gy-30,gx+120,gy);ctx.closePath();ctx.fill();
    lab(ctx,'object',gx+80,gy-24,C.amber,9);
    // deformation dimple in gel top surface
    ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx,gy+2);ctx.lineTo(gx+70,gy+2);ctx.quadraticCurveTo(gx+95,gy+2+press,gx+120,gy+2);ctx.lineTo(gx+gw,gy+2);ctx.stroke();
    // camera below
    box(ctx,gx+gw/2-24,gy+gh+16,48,20,'camera',C.violet);
    arrow(ctx,gx+gw/2,gy+gh+16,gx+gw/2,gy+gh+2,C.violet,1.3);
    // output: contact image (force map) on right
    const mx=w*0.78,my=h*0.5;lab(ctx,'contact image',mx-30,my-40,C.green,9);
    for(let i=0;i<5;i++)for(let j=0;j<5;j++){const d=Math.hypot(i-2,j-2);const v=Math.max(0,1-d/2.4)*(0.5+0.5*Math.sin(t*1.5));
      ctx.fillStyle=hexA(C.green,0.15+v*0.7);ctx.fillRect(mx-30+i*12,my-28+j*12,10,10);}
    lab(ctx,'one squishy skin + one camera → a dense map of where and how hard it touched',14,h-12,C.mut);
  };

  /* 03 — SLIP: micro-shear signals warn the object is starting to slide — grip harder. */
  A.ta_slip=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Feel the object begin to slide before it falls, then tighten the grip',14,16,C.dim);
    const p=saw(t,4);const slipping=p>0.4&&p<0.7;
    // gripper holding object; object slips down a bit then grip tightens
    const ox=w*0.5,oy=h*0.5 + (slipping?(p-0.4)/0.3*22:(p>=0.7?0:0));
    rrect(ctx,ox-18,oy-26,36,52,4,hexA(C.amber,0.9),hexA(C.amber,0.15));
    const grip=slipping?20:14;
    ctx.strokeStyle=slipping?C.coral:C.green;ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(ox-18-6,oy-grip);ctx.lineTo(ox-18-6,oy+grip);ctx.moveTo(ox+18+6,oy-grip);ctx.lineTo(ox+18+6,oy+grip);ctx.stroke();
    // shear/vibration signal trace
    const sx=w*0.06,sy=h*0.30,sw=w*0.36;lab(ctx,'shear signal:',sx,sy-14,C.dim,9);
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.4;ctx.beginPath();
    for(let i=0;i<sw;i++){const near=(i/sw>0.4&&i/sw<0.7);const amp=near?9:1.5;ctx.lineTo(sx+i,sy+Math.sin(i*0.5+t*6)*amp);}
    ctx.stroke();
    lab(ctx,slipping?'▲ incipient slip detected → grip↑':'holding steady',w*0.55,sy,slipping?C.coral:C.green,9.5);
    lab(ctx,'a burst of micro-vibration/shear is the early warning — react in milliseconds, not after it drops',14,h-12,C.mut);
  };

  /* 04 — FUSION: eyes for the coarse reach, fingers for the fine seating. */
  A.ta_fusion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Vision gets you close; touch does the last millimetre',14,16,C.dim);
    const p=saw(t,5);
    // phase 1: vision guides gross approach (left), phase 2: touch seats (right)
    // vision panel
    const vx=w*0.06,vy=h*0.3,vw=w*0.38,vh=h*0.42;rrect(ctx,vx,vy,vw,vh,8,hexA(C.cyan,0.5),null);lab(ctx,'▸ vision: reach the hole',vx+4,vy-8,C.cyan,9.5);
    const px1=vx+20+p*(vw-60);dot(ctx,px1,vy+vh*0.5,7,C.amber);ring(ctx,vx+vw-24,vy+vh*0.5,10,hexA(C.cyan,0.8));
    lab(ctx,'coarse, fast, but\nblurs up close',vx+6,vy+vh-16,C.mut,8.5);
    // touch panel
    const tx=w*0.56,ty=vy,tw=w*0.38,th=vh;rrect(ctx,tx,ty,tw,th,8,hexA(C.green,0.5),null);lab(ctx,'▸ touch: seat it exactly',tx+4,ty-8,C.green,9.5);
    const jit=(1-p)*6;dot(ctx,tx+tw*0.5+Math.sin(t*8)*jit,ty+th*0.5,7,C.amber);ring(ctx,tx+tw*0.5,ty+th*0.5,10,hexA(C.green,0.9));
    lab(ctx,'nudges from contact\nforces close the gap',tx+6,ty+th-16,C.mut,8.5);
    lab(ctx,'the two senses are complementary — coarse-but-global sight, fine-but-local touch — so systems fuse them',14,h-12,C.mut);
  };

  /* 05 — FORCE CONTROL: command a target force, and comply to the surface, not a fixed position. */
  A.ta_force=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Wipe a curved surface: command a force into it, not a fixed height',14,16,C.dim);
    // wavy surface
    const sy=h*0.62;ctx.strokeStyle=hexA(C.mut,0.7);ctx.lineWidth=2;ctx.beginPath();
    for(let x=w*0.1;x<w*0.9;x++){ctx.lineTo(x,sy+Math.sin((x-w*0.1)*0.03)*20);}ctx.stroke();
    const p=saw(t,4);const ex=w*0.1+p*w*0.8;const surfY=sy+Math.sin((ex-w*0.1)*0.03)*20;
    // position-control ghost (fixed height) — either floats or crashes
    const fixedY=sy;ctx.globalAlpha=0.5;dot(ctx,ex,fixedY-14,6,C.coral);ctx.globalAlpha=1;
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(w*0.1,fixedY-14);ctx.lineTo(w*0.9,fixedY-14);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'fixed position → floats here, gouges there',w*0.12,sy-42,C.coral,8.5);
    // force-control tool: stays on surface with constant push
    dot(ctx,ex,surfY-8,7,C.green);arrow(ctx,ex,surfY-24,ex,surfY-10,C.green,2);
    lab(ctx,'target force',ex+8,surfY-22,C.green,8.5);
    lab(ctx,'controlling force lets the tool follow an unknown, uneven surface — the key to contact-rich tasks',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.taanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-taanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
