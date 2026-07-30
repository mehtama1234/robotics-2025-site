/* hw-anim.js — first-principles mechanism animators for the Hardware & Actuation explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-hwanim="name". Self-contained boot. */
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

  /* 01 — WHY: the smartest policy does nothing without a body to run it. */
  A.hw_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The smartest policy moves nothing without a body — actuators, structure, power',14,16,C.dim);
    // a "brain" box connected down to a physical limb that actually moves
    box(ctx,w*0.4,h*0.24,w*0.2,26,'policy / brain',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.5,h*0.24+26,w*0.5,h*0.4,C.mut,1.4);lab(ctx,'command',w*0.52,h*0.35,C.mut,8.5);
    // limb: shoulder joint + link + hand, actuated
    const p=saw(t,3);const ang=Math.sin(p*TAU)*0.5;
    const jx=w*0.5,jy=h*0.44;dot(ctx,jx,jy,6,C.amber);
    const ex=jx+Math.cos(ang+0.4)*80,ey=jy+Math.sin(ang+0.4)*80;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(jx,jy);ctx.lineTo(ex,ey);ctx.stroke();
    dot(ctx,ex,ey,7,C.green);
    lab(ctx,'motor + link + hand: where bits become force',w*0.14,h*0.86,C.mut,9);
    // labels of the three needs
    ['actuators (make force)','structure (carry load)','power (feed it)'].forEach((s,i)=>lab(ctx,'• '+s,w*0.66,h*0.5+i*16,C.mut,9));
    lab(ctx,'hardware is the substrate — and its design decides what any controller can even attempt',14,h-12,C.mut);
  };

  /* 02 — ACTUATOR: ways to turn energy into motion, each with a trade. */
  A.hw_actuator=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'How a robot makes force: motors, tendons, fluids, artificial muscle',14,16,C.dim);
    const p=saw(t,3);const stroke=Math.sin(p*TAU)*0.5+0.5;
    // electric motor (rotary)
    const mx=w*0.16,my=h*0.42;ring(ctx,mx,my,20,C.cyan);ctx.save();ctx.translate(mx,my);ctx.rotate(p*TAU);ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(16,0);ctx.stroke();ctx.restore();
    lab(ctx,'electric motor\nfast, precise, heavy',mx-30,my+40,C.mut,8.5);
    // tendon-driven
    const tx=w*0.42;ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx-24,my);ctx.lineTo(tx+10-stroke*10,my);ctx.stroke();dot(ctx,tx+10-stroke*10,my,5,C.amber);
    lab(ctx,'tendon / cable\nremote, light, hysteresis',tx-30,my+40,C.mut,8.5);
    // fluidic / muscle (contracts)
    const fx=w*0.68;const len=30-stroke*12;rrect(ctx,fx-8,my-len/2,16,len,6,C.violet,hexA(C.violet,0.2));
    lab(ctx,'artificial muscle\nsoft, compliant, slow',fx-30,my+40,C.mut,8.5);
    // scale of trade: torque density vs compliance
    lab(ctx,'each converts energy → motion with a different balance of force, speed, weight, and give',14,h-12,C.mut);
  };

  /* 03 — SOFT: no rigid links — the material itself bends and is safe. */
  A.hw_soft=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Soft robots have no rigid links — the body deforms to do the work',14,16,C.dim);
    // a soft finger curling under pressure vs a rigid jointed one
    const p=saw(t,3);const curl=Math.sin(p*TAU)*0.5+0.5;
    // rigid (left): discrete segments
    const rx=w*0.24,ry=h*0.34;let x=rx,y=ry,ang=0.2;
    ctx.strokeStyle=hexA(C.mut,0.8);ctx.lineWidth=5;
    for(let i=0;i<3;i++){const nx=x+Math.cos(ang)*28,ny=y+Math.sin(ang)*28;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,x,y,4,C.amber);x=nx;y=ny;ang+=0.4;}
    lab(ctx,'rigid: joints + links',rx-20,ry-14,C.mut,9);
    // soft (right): smooth curve that curls with pressure
    const sx=w*0.62,sy=h*0.34;ctx.strokeStyle=C.violet;ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);
    for(let i=1;i<=20;i++){const a=curl*i*0.09;ctx.lineTo(sx+Math.cos(a)*i*4.5,sy+Math.sin(a)*i*4.5);}ctx.stroke();ctx.lineCap='butt';
    lab(ctx,'soft: continuous bend',sx-16,sy-14,C.violet,9);
    lab(ctx,'compliance is built into the material — safe on contact, but nonlinear and hard to model precisely',14,h-12,C.mut);
  };

  /* 04 — MORPH: the body's shape does part of the computation. */
  A.hw_morph=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The shape of the body does part of the work — morphology is computation',14,16,C.dim);
    // a passive springy leg bouncing (elastic storage) vs stiff leg
    const gy=h*0.72;ctx.strokeStyle=hexA(C.mut,0.6);ctx.beginPath();ctx.moveTo(w*0.05,gy);ctx.lineTo(w*0.95,gy);ctx.stroke();
    const p=saw(t,2);const bounce=Math.abs(Math.sin(p*Math.PI));const hipY=gy-40-bounce*40;
    // spring leg
    const hx=w*0.36;dot(ctx,hx,hipY,8,C.amber);
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();const segs=8;for(let i=0;i<=segs;i++){const yy=hipY+(gy-hipY)*i/segs;const xx=hx+((i%2)?6:-6)*(1-bounce*0.5);ctx.lineTo(xx,yy);}ctx.stroke();
    lab(ctx,'elastic leg: stores &\nreturns energy for free',hx-30,hipY-20,C.green,8.5);
    // series-elastic idea: spring between motor and load
    const mx=w*0.72,my=h*0.42;box(ctx,mx-26,my-12,34,24,'motor',C.cyan);
    // spring
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=16;i++){ctx.lineTo(mx+12+i*4,my+((i%2)?6:-6));}ctx.stroke();
    dot(ctx,mx+12+16*4,my,6,C.amber);lab(ctx,'spring in the joint = soft, safe force',mx-30,my+34,C.mut,8.5);
    lab(ctx,'good mechanics make behaviors cheap — a springy body bounces with almost no control effort',14,h-12,C.mut);
  };

  /* 05 — SENSE: a body needs to feel itself — proprioception + skin + limits. */
  A.hw_sense=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A body must feel itself: joint angles, contact, and its own limits',14,16,C.dim);
    // an arm with encoder at joint, skin patch, and a limit indicator
    const jx=w*0.28,jy=h*0.5;const p=saw(t,4);const ang=Math.sin(p*TAU)*0.6;
    dot(ctx,jx,jy,7,C.amber);ring(ctx,jx,jy,14,hexA(C.cyan,0.6));lab(ctx,'encoder\n(joint angle)',jx-24,jy+30,C.cyan,8.5);
    const ex=jx+Math.cos(ang)*100,ey=jy+Math.sin(ang)*100;
    ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(jx,jy);ctx.lineTo(ex,ey);ctx.stroke();
    // skin patch on the link
    for(let i=0;i<4;i++){const fx=jx+Math.cos(ang)*(40+i*12),fy=jy+Math.sin(ang)*(40+i*12);dot(ctx,fx,fy,3,hexA(C.green,0.7));}
    lab(ctx,'skin (contact)',w*0.5,h*0.3,C.green,8.5);
    // limit arc
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.lineWidth=2;ctx.beginPath();ctx.arc(jx,jy,110,-0.6,0.6);ctx.stroke();lab(ctx,'joint limit',jx+118,jy,C.coral,8.5);
    lab(ctx,'sensing built into the body closes the loop — and the best designs co-tune body, sensor, and controller',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.hwanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-hwanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
