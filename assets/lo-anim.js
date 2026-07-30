/* lo-anim.js — first-principles mechanism animators for the Locomotion / Whole-Body explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-loanim="name". Self-contained boot. */
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
  const saw=(t,p)=>((t%p)/p);
  // a simple quadruped body at (x,y) with leg phase ph
  function quad(ctx,x,y,col,ph){ctx.strokeStyle=col;ctx.lineWidth=2.4;ctx.strokeRect(x-22,y-9,44,16);
    [-16,-6,6,16].forEach((dx,i)=>{const sw=Math.sin(ph+i*1.7)*6;ctx.beginPath();ctx.moveTo(x+dx,y+7);ctx.lineTo(x+dx+sw,y+24);ctx.stroke();});}
  const A={};

  /* 01 — THE PROBLEM: many joints, contact is a cliff, balance under a shove. */
  A.lo_problem=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Walking is hard for three reasons at once: many joints, contact, and balance',14,16,C.dim);
    // (a) many joints — a leg with several segments swinging (smooth)
    const lx=w*0.16,ly=h*0.34;ctx.strokeStyle=C.cyan;ctx.lineWidth=2.4;
    let px=lx,py=ly;const angs=[0.5+0.3*Math.sin(t),-0.6+0.3*Math.sin(t+1),0.8];
    let a=0;angs.forEach(da=>{a+=da;const nx=px+Math.cos(a)*22,ny=py+Math.sin(a)*22;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,px,py,3,C.amber);px=nx;py=ny;});
    lab(ctx,'many joints (smooth in the air)',lx-30,ly+80,C.mut,9.5);
    // (b) contact = a cliff in the force plot
    const fx=w*0.44,fy=h*0.5;lab(ctx,'foot touches down = a cliff',fx,fy-56,C.coral,9.5);
    ctx.strokeStyle=C.coral;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=40;i++){const u=i/40,x=fx+u*w*0.18,y=fy+18-(u<0.5?2:40);ctx.lineTo(x,y);}ctx.stroke();
    lab(ctx,'force jumps on/off — non-smooth physics',fx,fy+34,C.mut,9.5);
    // (c) balance under a push
    const bx=w*0.84,by=h*0.4;ctx.strokeStyle=C.violet;ctx.lineWidth=2.4;const lean=Math.sin(t*1.5)*0.2;
    ctx.save();ctx.translate(bx,by+40);ctx.rotate(lean);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-40);ctx.stroke();dot(ctx,0,-40,4,C.violet);ctx.restore();
    arrow(ctx,bx-34,by,bx-10,by,C.coral,1.8);lab(ctx,'a shove',bx-40,by-12,C.coral,9.5);lab(ctx,'stay up',bx-10,by+56,C.violet,9.5);
    lab(ctx,'gradient-based control chokes on the contact cliff — which is why learning took over',14,h-12,C.mut);
  };

  /* 02 — RL LEARNS GAITS: reward shapes emergent, energy-optimal gaits, no hand-design. */
  A.lo_rl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'No hand-designed gait: a reward, millions of tries, and the gait emerges',14,16,C.dim);
    box(ctx,w*0.06,h*0.44,w*0.14,28,'reward',C.amber);
    lab(ctx,'go fast · stay up · save energy',w*0.06,h*0.44+40,C.mut,9);
    arrow(ctx,w*0.21,h*0.5,w*0.34,h*0.5,C.ink,1.4);box(ctx,w*0.35,h*0.42,w*0.12,h*0.16,'RL policy',C.violet);
    arrow(ctx,w*0.48,h*0.5,w*0.56,h*0.5,C.green,1.6);
    // emergent gaits: walking quadruped + gait labels cycling
    const gx=w*0.72,gy=h*0.5;quad(ctx,gx,gy,C.green,t*5);
    const gaits=['walk','trot','gallop'];const gi=Math.floor(saw(t,3)*3)%3;
    lab(ctx,'emergent gait: '+gaits[gi],gx-40,gy-34,C.green,10);
    lab(ctx,'energy-optimal transitions appear on their own',gx-70,gy+40,C.mut,9.5);
    lab(ctx,'RL discovers gaits, transitions, and recoveries a human never scripted',14,h-12,C.mut);
  };

  /* 03 — TEACHER-STUDENT: a privileged teacher trains an onboard-only student. */
  A.lo_teacher=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Learn with cheats, deploy without: a privileged teacher trains an onboard student',14,16,C.dim);
    // teacher (has privileged info)
    box(ctx,w*0.06,h*0.3,w*0.28,h*0.24,'',C.amber,hexA(C.amber,0.05));lab(ctx,'TEACHER (in sim)',w*0.08,h*0.27,C.amber,10);
    ['knows terrain height','knows friction & mass','sees the future push'].forEach((s,i)=>lab(ctx,'• '+s,w*0.09,h*0.4+i*15,C.ink,9.5));
    // distill arrow
    arrow(ctx,w*0.35,h*0.42,w*0.5,h*0.5,C.violet,1.8);lab(ctx,'distill',w*0.37,h*0.4,C.violet,9.5);
    // student (onboard only)
    box(ctx,w*0.52,h*0.4,w*0.28,h*0.22,'',C.green,hexA(C.green,0.05));lab(ctx,'STUDENT (on the robot)',w*0.54,h*0.37,C.green,10);
    ['only joint sensors','only onboard camera'].forEach((s,i)=>lab(ctx,'• '+s,w*0.55,h*0.49+i*15,C.ink,9.5));
    arrow(ctx,w*0.81,h*0.5,w*0.88,h*0.5,C.green,1.6);lab(ctx,'deploys',w*0.83,h*0.42,C.green,9.5);
    lab(ctx,'the teacher uses privileged simulator info the real robot can’t sense; the student mimics it blind',14,h-12,C.mut);
  };

  /* 04 — BALANCE & RECOVERY: predict where to step to not fall after a shove. */
  A.lo_recover=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Balance is stepping: after a shove, put a foot where it stops the fall',14,16,C.dim);
    const gy=h*0.72;ctx.strokeStyle=hexA(C.mut,0.4);ctx.beginPath();ctx.moveTo(w*0.06,gy);ctx.lineTo(w*0.94,gy);ctx.stroke();
    // biped leaning after push
    const p=saw(t,3);const bx=w*0.4;const lean=Math.min(0.5,p*0.7);
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.6;ctx.save();ctx.translate(bx,gy);ctx.rotate(lean);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-48);ctx.stroke();dot(ctx,0,-52,5,C.violet);ctx.restore();
    lab(ctx,'CoM',bx+Math.sin(lean)*52-16,gy-56,C.violet,9);
    arrow(ctx,bx-40,gy-40,bx-14,gy-40,C.coral,1.8);lab(ctx,'push',bx-46,gy-52,C.coral,9.5);
    // capture-point step target
    const cpx=bx+Math.sin(lean)*90;dot(ctx,cpx,gy,6,C.green);lab(ctx,'step here (capture point)',cpx-30,gy+18,C.green,9.5);
    if(p>0.6){arrow(ctx,bx+8,gy-6,cpx-6,gy-4,C.green,1.6);lab(ctx,'recovered ✓',cpx-10,gy-24,C.green,9.5);}
    lab(ctx,'the controller predicts the foothold that brings the center of mass back over support',14,h-12,C.mut);
  };

  /* 05 — WHOLE-BODY: legs keep balance (CoM over support) while arms do the task. */
  A.lo_wholebody=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Whole-body control: legs hold balance while the arms do the job',14,16,C.dim);
    const cx=w*0.42,gy=h*0.8;
    // support polygon
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.beginPath();ctx.moveTo(cx-40,gy);ctx.lineTo(cx+40,gy);ctx.lineTo(cx+30,gy+10);ctx.lineTo(cx-30,gy+10);ctx.closePath();ctx.fill();
    lab(ctx,'support polygon',cx-40,gy+24,C.cyan,9);
    // humanoid
    const hy=gy-100;ctx.strokeStyle=C.violet;ctx.lineWidth=2.6;
    ctx.beginPath();ctx.arc(cx,hy-8,6,0,TAU);ctx.moveTo(cx,hy-2);ctx.lineTo(cx,hy+40);// torso
    ctx.moveTo(cx,hy+40);ctx.lineTo(cx-16,gy);ctx.moveTo(cx,hy+40);ctx.lineTo(cx+16,gy);// legs
    ctx.stroke();
    // reaching arm (task)
    const reach=0.6+0.5*Math.sin(t*1.2);ctx.strokeStyle=C.amber;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(cx,hy+8);ctx.lineTo(cx+30*reach+10,hy+2-reach*8);ctx.stroke();
    dot(ctx,cx+30*reach+10,hy+2-reach*8,4,C.amber);lab(ctx,'arm: reach the goal',cx+40,hy-8,C.amber,9.5);
    // CoM line stays over polygon
    ctx.strokeStyle=hexA(C.green,0.7);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(cx+4,hy+20);ctx.lineTo(cx+4,gy);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,cx+4,hy+20,4,C.green);lab(ctx,'legs keep CoM over support',cx-30,hy+64,C.green,9.5);
    lab(ctx,'reaching shifts the center of mass — the legs must counter it, or the robot tips (loco-manipulation)',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.loanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-loanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
