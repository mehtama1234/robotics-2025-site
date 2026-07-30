/* gr-anim.js — first-principles mechanism animators for the Manipulation & Grasping explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-granim="name". Self-contained boot. */
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

  /* 01 — WHY: manipulation is controlling the world through contact — and contact is where it's hard. */
  A.gr_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'To move an object you must touch it — and control only exists while you are touching',14,16,C.dim);
    const p=saw(t,4);
    // hand (gripper) descends, grabs a block, lifts it
    const bx=w*0.5,floor=h*0.74;const grab=p<0.4?0:(p<0.7?1:1);
    const lift=p<0.4?0:(p<0.7?(p-0.4)/0.3:1);
    const by=floor-14-lift*60;
    // block
    rrect(ctx,bx-22,by-16,44,30,4,hexA(C.amber,0.9),hexA(C.amber,0.18));
    // gripper fingers
    const open=p<0.35?18:8;const gy=by-16;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(bx,gy-34-((p<0.35)?(0.35-p)*120:0));ctx.lineTo(bx,gy-14);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-open,gy-14);ctx.lineTo(bx-open,gy+8);ctx.moveTo(bx+open,gy-14);ctx.lineTo(bx+open,gy+8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-open,gy-14);ctx.lineTo(bx+open,gy-14);ctx.stroke();
    // floor
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.beginPath();ctx.moveTo(w*0.2,floor+14);ctx.lineTo(w*0.8,floor+14);ctx.stroke();
    // contact stars when grabbing
    if(p>=0.35&&p<0.75){dot(ctx,bx-8,by-2,3,C.coral);dot(ctx,bx+8,by-2,3,C.coral);lab(ctx,'contact = the only handle you have',bx+30,by,C.coral,9);}
    lab(ctx,'no contact → no control · wrong contact → it slips or breaks',14,h-12,C.mut);
  };

  /* 02 — GRASP = FORCE CLOSURE: place contacts whose friction cones can resist any push. */
  A.gr_grasp=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A grasp holds if the finger friction cones can resist a push from any direction',14,16,C.dim);
    const cx=w*0.42,cy=h*0.54,r=48;
    ring(ctx,cx,cy,r,hexA(C.amber,0.9));lab(ctx,'object',cx,cy,C.amber,9,'center');
    // three contact points with friction cones pointing inward
    const angs=[-0.4,2.3,3.8];
    angs.forEach(a=>{const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;dot(ctx,px,py,4,C.cyan);
      // friction cone: two lines from contact toward center +/- spread
      const inx=cx-px,iny=cy-py,il=Math.hypot(inx,iny),ux=inx/il,uy=iny/il;const sp=0.5;
      [sp,-sp].forEach(s=>{const rx=ux*Math.cos(s)-uy*Math.sin(s),ry=ux*Math.sin(s)+uy*Math.cos(s);
        ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+rx*34,py+ry*34);ctx.stroke();});
    });
    lab(ctx,'friction\ncones',cx+r+14,cy-r*0.4,C.green,9);
    // a test push arrow that gets resisted
    const p=saw(t,3);const pa=p*TAU;const ex=cx+Math.cos(pa)*(r+40),ey=cy+Math.sin(pa)*(r+40);
    arrow(ctx,ex,ey,cx+Math.cos(pa)*r,cy+Math.sin(pa)*r,C.coral,1.6);lab(ctx,'any push',ex+6,ey,C.coral,8.5);
    lab(ctx,'force closure: the cones together can cancel any wrench — the object cannot escape',14,h-12,C.mut);
  };

  /* 03 — CONTACT-RICH: physics flips between stick/slip/separate — non-smooth, no gradient through contact. */
  A.gr_contact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Peg-in-hole: the physics jumps between distinct contact modes',14,16,C.dim);
    const p=saw(t,5);
    // hole block on right
    const hx=w*0.62,hy=h*0.5,hw=90,hh=90;
    ctx.fillStyle=hexA(C.mut,0.25);ctx.fillRect(hx,hy-hh/2,hw,hh);
    const slotW=26;ctx.clearRect(hx,hy-hh/2,hw,(hh-slotW)/2);ctx.fillStyle=hexA(C.mut,0.25);ctx.fillRect(hx,hy-hh/2,hw,(hh-slotW)/2);
    ctx.fillStyle='#0C1218';ctx.fillRect(hx-1,hy-slotW/2,hw+2,slotW);
    // peg: approach, touch edge (stick), slide, insert
    const stages=['free','one-point contact','two-point / jammed','sliding in','seated'];
    const si=Math.min(4,Math.floor(p*5));
    const pegX=hx-90+si*22, pegY=hy+ (si===1?-8: si===2?4:0);
    rrect(ctx,pegX-40,pegY-11,44,22,3,C.cyan,hexA(C.cyan,0.15));
    // contact markers
    if(si===1)dot(ctx,hx-1,pegY-11,3.5,C.coral);
    if(si===2){dot(ctx,hx-1,pegY-11,3.5,C.coral);dot(ctx,hx-1,pegY+11,3.5,C.coral);}
    lab(ctx,'mode: '+stages[si],w*0.06,h*0.30,C.amber,10);
    lab(ctx,'each mode has different, non-smooth dynamics — you can\'t just follow a gradient through contact',14,h-12,C.mut);
  };

  /* 04 — DEXTEROUS: reorient in-hand with many joints — finger gaiting / regrasp without dropping. */
  A.gr_dexterous=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'In-hand reorientation: turn the object without ever dropping it',14,16,C.dim);
    const cx=w*0.5,cy=h*0.52,r=34;const p=saw(t,6);
    // rotating object (square)
    ctx.save();ctx.translate(cx,cy);ctx.rotate(p*TAU);
    rrect(ctx,-r*0.7,-r*0.7,r*1.4,r*1.4,5,C.amber,hexA(C.amber,0.15));
    // a marked corner to show rotation
    dot(ctx,r*0.5,r*0.5,4,C.coral);ctx.restore();
    // fingers around it, gaiting: 4 fingers, one lifts and repositions in turn
    for(let i=0;i<4;i++){const a=i*TAU/4 + Math.PI/4;
      const lifted=(Math.floor(p*4)%4===i);
      const rr=r+ (lifted? 26 + Math.sin(p*TAU*4)*4 : 12);
      const fx=cx+Math.cos(a)*rr,fy=cy+Math.sin(a)*rr;
      ctx.strokeStyle=lifted?hexA(C.mut,0.6):C.cyan;ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+40),cy+Math.sin(a)*(r+40));ctx.lineTo(fx,fy);ctx.stroke();
      dot(ctx,fx,fy,4,lifted?hexA(C.mut,0.7):C.green);}
    lab(ctx,'one finger lifts &\nre-places while the\nothers keep the grip',w*0.02,h*0.34,C.mut,8.5);
    lab(ctx,'finger gaiting: many joints + making/breaking contact re-orient the object step by step',14,h-12,C.mut);
  };

  /* 05 — LEARN: many valid grasps; copy a few demos → a policy that commits to one. */
  A.gr_learn=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A mug has many good grasps — a policy learns the distribution, then commits to one',14,16,C.dim);
    // object left with several candidate grasp arrows
    const ox=w*0.24,oy=h*0.52;ring(ctx,ox,oy,26,hexA(C.amber,0.9));lab(ctx,'mug',ox,oy,C.amber,9,'center');
    const cand=[-1.9,-1.1,-0.2,0.6,1.5];
    cand.forEach((a,i)=>{const px=ox+Math.cos(a)*26,py=oy+Math.sin(a)*26;
      ctx.strokeStyle=hexA(C.cyan,0.4);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px+Math.cos(a)*24,py+Math.sin(a)*24);ctx.lineTo(px,py);ctx.stroke();});
    lab(ctx,'many valid grasps',ox-34,oy+40,C.mut,9);
    // demos -> policy box -> chosen grasp
    box(ctx,w*0.44,oy-14,w*0.16,28,'policy\n(from demos)',C.violet,hexA(C.violet,0.08));
    arrow(ctx,ox+52,oy,w*0.44,oy,C.cyan,1.4);
    const p=saw(t,3);const pick=cand[Math.floor(p*cand.length)];
    const gx=w*0.82,gy=oy;ring(ctx,gx,gy,26,hexA(C.amber,0.6));
    const px=gx+Math.cos(pick)*26,py=gy+Math.sin(pick)*26;
    ctx.strokeStyle=C.green;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(px+Math.cos(pick)*22,py+Math.sin(pick)*22);ctx.lineTo(px,py);ctx.stroke();dot(ctx,px,py,4,C.green);
    arrow(ctx,w*0.6,oy,gx-30,gy,C.violet,1.4);lab(ctx,'commit to one',w*0.63,oy-14,C.green,9);
    lab(ctx,'imitation learning copies a handful of human tries; the hard part is not averaging good grasps into a bad one',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.granim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-granim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
