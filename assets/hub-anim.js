/* hub-anim.js — the capstone loop animator for the "one machine, four models" page.
   A[name]=fn(ctx,w,h,t); canvas carries data-hubanim="loop". Self-contained boot. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440',
              gs:'#4FB0CC', wm:'#A38CF0', vla:'#E0A94E', dp:'#E68AA8' };
  const TAU=Math.PI*2;
  function fit(cv){const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=parseInt(cv.getAttribute('height'))||320;
    cv.width=w*dpr;cv.height=h*dpr;const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h};}
  function lab(ctx,s,x,y,col,size,align){ctx.save();ctx.font=(size||11)+'px ui-monospace,Menlo,monospace';
    ctx.textAlign=align||'center';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
  function hexA(hex,a){const n=parseInt(hex.slice(1),16);return'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
  const A={};

  A.loop=function(ctx,w,h,t){ctx.clearRect(0,0,w,h);
    const cx=w*0.5,cy=h*0.5,r=Math.min(w*0.5,h*0.62)*0.55;
    const stages=[
      {a:-Math.PI/2, c:C.gs,  k:'PERCEIVE', s:'see the world in 3D'},
      {a:0,          c:C.wm,  k:'IMAGINE',  s:'predict what happens next'},
      {a:Math.PI/2,  c:C.vla, k:'DECIDE',   s:'turn sight + words into a plan'},
      {a:Math.PI,    c:C.dp,  k:'ACT',      s:'generate the motion'},
    ];
    // loop arcs (clockwise) between stages
    const prog=((t*0.25)%1); // token position 0..1 around the whole loop
    for(let i=0;i<4;i++){const s0=stages[i],s1=stages[(i+1)%4];
      ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy,r,s0.a+0.28,s1.a-0.28,false);ctx.stroke();
      // arrowhead near s1
      const ah=s1.a-0.30,ax=cx+Math.cos(ah)*r,ay=cy+Math.sin(ah)*r,tang=ah+Math.PI/2;
      ctx.fillStyle=hexA(C.mut,0.7);ctx.beginPath();
      ctx.moveTo(ax+Math.cos(tang)*6,ay+Math.sin(tang)*6);
      ctx.lineTo(ax+Math.cos(ah)*7,ay+Math.sin(ah)*7);
      ctx.lineTo(ax-Math.cos(tang)*6,ay-Math.sin(tang)*6);ctx.closePath();ctx.fill();
    }
    // travelling token
    const seg=Math.floor(prog*4),fp=(prog*4)%1;const s0=stages[seg],s1=stages[(seg+1)%4];
    let a0=s0.a+0.28, a1=s1.a-0.28; if(a1<a0)a1+=TAU; const ta=a0+(a1-a0)*fp;
    const tx=cx+Math.cos(ta)*r,ty=cy+Math.sin(ta)*r;
    ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(tx,ty,4,0,TAU);ctx.fill();
    // nodes
    stages.forEach((s,i)=>{const x=cx+Math.cos(s.a)*r,y=cy+Math.sin(s.a)*r;
      const near=(seg===i&&fp>0.6)||((seg+1)%4===i&&fp>0.6);
      const pulse=near?1:0.62;
      ctx.fillStyle=hexA(s.c,0.16*pulse+0.06);ctx.beginPath();ctx.arc(x,y,26,0,TAU);ctx.fill();
      ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(x,y,7,0,TAU);ctx.fill();
      lab(ctx,s.k,x,y-33,s.c,11.5);lab(ctx,s.s,x,y+33,C.mut,9.5);});
    // center
    lab(ctx,'the robot’s loop',cx,cy-8,C.dim,10.5);
    lab(ctx,'sense · think · move',cx,cy+9,hexA(C.ink,0.7),10);
  };

  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.hubanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-hubanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'320'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
