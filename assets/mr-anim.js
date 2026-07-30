/* mr-anim.js — first-principles mechanism animators for the Multi-Robot Systems explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-mranim="name". Self-contained boot. */
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
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=5.5;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function ring(ctx,x,y,r,col){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();}
  const saw=(t,p)=>((t%p)/p);
  const A={};

  /* 01 — WHY TEAMS: one robot is slow & fragile; many cover faster and survive a failure — but must coordinate. */
  A.mr_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One robot is slow and fragile; a team covers faster and survives a failure',14,16,C.dim);
    const p=saw(t,4);
    // left: one robot, small coverage
    const lx=w*0.08,ly=h*0.3,gw=w*0.32,gh=h*0.44;rrect(ctx,lx,ly,gw,gh,6,C.line,null);lab(ctx,'one robot',lx,ly-8,C.mut,10);
    ctx.fillStyle=hexA(C.cyan,0.18);ctx.fillRect(lx,ly,gw*0.35*p,gh);
    const rx1=lx+gw*0.35*p;dot(ctx,rx1,ly+gh*0.5,5,C.cyan);lab(ctx,'slow, single point of failure',lx,ly+gh+14,C.mut,9.5);
    // right: 4 robots, big coverage, one failed
    const mx=w*0.56,my=ly;rrect(ctx,mx,my,gw,gh,6,C.line,null);lab(ctx,'a team',mx,my-8,C.green,10);
    const cols=['#6FCf7f','#38E1CF','#9C8CFF','#F5A65B'];
    for(let k=0;k<4;k++){const fy=my+gh*(k+0.5)/4;const failed=(k===2);
      ctx.fillStyle=hexA(failed?C.coral:cols[k],failed?0.06:0.18);ctx.fillRect(mx,my+gh*k/4,failed?gw*0.15:gw*(0.55+0.3*p),gh/4);
      dot(ctx,mx+(failed?gw*0.15:gw*(0.55+0.3*p)),fy,4,failed?hexA(C.coral,0.6):cols[k]);
      if(failed)lab(ctx,'✗ failed — others cover',mx+gw*0.18,fy,C.coral,8.5);}
    lab(ctx,'coverage · parallel speed · redundancy — the cost is coordination',14,h-12,C.mut);
  };

  /* 02 — MAPF: plan N collision-free paths through shared space; cost explodes with N. */
  A.mr_mapf=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Multi-agent path finding: N robots, shared space, zero collisions',14,16,C.dim);
    const cx=w*0.5,cy=h*0.54,S=Math.min(w*0.5,h*0.7)*0.58,d=S*0.13;
    // grid
    ctx.strokeStyle=hexA(C.mut,0.25);for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx+i*S/3,cy-S);ctx.lineTo(cx+i*S/3,cy+S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-S,cy+i*S/3);ctx.lineTo(cx+S,cy+i*S/3);ctx.stroke();}
    // 4 agents crossing; each lane offset off-center + staggered in time so paths never share a cell
    const ag=[[cx-S,cy-d,cx+S,cy-d,C.cyan],[cx+S,cy+d,cx-S,cy+d,C.violet],[cx-d,cy-S,cx-d,cy+S,C.amber],[cx+d,cy+S,cx+d,cy-S,C.green]];
    const p=saw(t,4);
    ag.forEach((a,i)=>{ring(ctx,a[2],a[3],7,hexA(a[4],0.6));// goal
      const ph=(p + i*0.25)%1;const x=a[0]+(a[2]-a[0])*ph,y=a[1]+(a[3]-a[1])*ph;
      ctx.strokeStyle=hexA(a[4],0.35);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[2],a[3]);ctx.stroke();
      dot(ctx,x,y,6,a[4]);});
    lab(ctx,'each ○ is a goal · each ● a robot',14,32,C.mut,9.5);
    lab(ctx,'the search space grows exponentially with the number of robots — the core hardness',14,h-12,C.mut);
  };

  /* 03 — CENTRALIZED vs DECENTRALIZED: one brain (optimal, fragile) vs local decisions + comms (scalable). */
  A.mr_central=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Who decides? One central brain, or every robot from local info',14,16,C.dim);
    // centralized (top): star from a planner
    const px=w*0.5,py=h*0.34,bw=w*0.15;box(ctx,px-bw/2,py-14,bw,28,'central planner',C.coral);
    for(let k=0;k<6;k++){const a=(k/6)*TAU - Math.PI/2;const x=px+Math.cos(a)*w*0.26,y=py+Math.sin(a)*52;arrow(ctx,px+Math.cos(a)*bw*0.5,py+Math.sin(a)*16,x,y,hexA(C.coral,0.55),1.2);dot(ctx,x,y,5,C.coral);}
    lab(ctx,'centralized: optimal, but a single point of failure & doesn’t scale',w*0.02,py+64,C.mut,9.5);
    // decentralized (bottom): peer robots with local sensing + comms links
    const dy=h*0.78;const xs=[w*0.16,w*0.34,w*0.52,w*0.7,w*0.86];
    xs.forEach((x,i)=>{ring(ctx,x,dy,18,hexA(C.green,0.3));dot(ctx,x,dy,5,C.green);if(i<xs.length-1){ctx.strokeStyle=hexA(C.cyan,0.7);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x+6,dy);ctx.lineTo(xs[i+1]-6,dy);ctx.stroke();ctx.setLineDash([]);}});
    lab(ctx,'decentralized: each robot decides from its own view + messages to neighbors',w*0.02,dy-30,C.green,9.5);
    lab(ctx,'scales to many and survives failures — at some cost in global optimality',14,h-12,C.mut);
  };

  /* 04 — COOPERATIVE PERCEPTION: B sees what A can't; sharing beats occlusion & range. */
  A.mr_coop=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Cooperative perception: share what you see to see past occlusions',14,16,C.dim);
    const ax=w*0.16,ay=h*0.5;dot(ctx,ax,ay,7,C.cyan);lab(ctx,'robot A',ax-16,ay+20,C.cyan,9.5);
    // occluder
    const ox=w*0.44;ctx.fillStyle=hexA(C.mut,0.35);ctx.fillRect(ox-10,ay-40,20,80);lab(ctx,'wall',ox-10,ay-48,C.mut,9);
    // hidden target
    const tx=w*0.62,ty=ay+18;dot(ctx,tx,ty,7,C.amber);lab(ctx,'target (hidden from A)',tx-30,ty+20,C.amber,9.5);
    // A's blocked line of sight
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ox-12,ay-6);ctx.stroke();ctx.setLineDash([]);lab(ctx,'blocked ✗',ox-70,ay-24,C.coral,9);
    // robot B sees it and shares
    const bx=w*0.7,by=h*0.24;dot(ctx,bx,by,7,C.violet);lab(ctx,'robot B',bx+8,by,C.violet,9.5);
    ctx.strokeStyle=hexA(C.violet,0.6);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();
    const p=saw(t,2);const mx=bx+(ax-bx)*p,my=by+(ay-by)*p;dot(ctx,mx,my,3,C.green);
    arrow(ctx,bx-6,by+6,ax+8,ay-8,hexA(C.green,0.7),1.4);lab(ctx,'shares what it sees →',w*0.32,by+2,C.green,9.5);
    lab(ctx,'one sensor is limited by occlusion & range; a team fuses views into one complete scene',14,h-12,C.mut);
  };

  /* 05 — SWARM: simple local rules -> emergent global flock; scales to hundreds. */
  A.mr_swarm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Swarms: simple local rules → emergent global behavior, at massive scale',14,16,C.dim);
    // a flock moving right, aligned
    const N=40;const base=w*0.15+saw(t,6)*w*0.5;
    for(let i=0;i<N;i++){const a=(i*2.399963);const r=Math.min(w,h)*0.22*Math.sqrt((i%N)/N);
      const x=base+Math.cos(a)*r,y=h*0.52+Math.sin(a)*r*0.7 + Math.sin(t*2+i)*2;
      const col=[C.cyan,C.violet,C.green,C.amber][i%4];
      // little arrow pointing right (aligned)
      ctx.save();ctx.translate(x,y);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(5,0);ctx.lineTo(-4,3);ctx.closePath();ctx.fill();ctx.restore();}
    // rule chips
    ['separation: don’t crowd','alignment: match heading','cohesion: stay together'].forEach((s,i)=>lab(ctx,'• '+s,14,h*0.32+i*16,C.mut,9.5));
    lab(ctx,'no leader, no central plan — global flocking emerges from three local rules per robot',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.mranim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-mranim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
