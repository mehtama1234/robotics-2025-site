/* nv-anim.js — first-principles mechanism animators for the Navigation & Motion Planning explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-nvanim="name". Self-contained boot. */
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

  function obst(ctx,x,y,w,h){ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(x,y,w,h);ctx.strokeStyle=hexA(C.mut,0.5);ctx.strokeRect(x,y,w,h);}

  /* 01 — WHY: get from start to goal without hitting anything, in a world you only partly know. */
  A.nv_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Navigation: find a collision-free path from here to the goal',14,16,C.dim);
    const sx=w*0.1,sy=h*0.5,gx=w*0.9,gy=h*0.5;
    dot(ctx,sx,sy,7,C.cyan);lab(ctx,'start',sx-6,sy+20,C.cyan,9);
    ring(ctx,gx,gy,9,C.green);lab(ctx,'goal',gx-6,gy+22,C.green,9);
    // obstacles between
    obst(ctx,w*0.34,h*0.2,26,90);obst(ctx,w*0.55,h*0.45,30,80);obst(ctx,w*0.44,h*0.62,60,20);
    // straight line (blocked) vs a path that curves around
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(gx,gy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'straight line hits things ✗',w*0.30,h*0.4,C.coral,8.5);
    // curved free path with a moving robot
    const px=[sx,w*0.3,w*0.42,w*0.5,w*0.68,gx],py=[sy,h*0.72,h*0.8,h*0.3,h*0.28,gy];
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px[0],py[0]);for(let i=1;i<px.length;i++)ctx.lineTo(px[i],py[i]);ctx.stroke();
    const p=saw(t,4)*(px.length-1);const i=Math.floor(p),f=p-i,j=Math.min(i+1,px.length-1);
    dot(ctx,px[i]+(px[j]-px[i])*f,py[i]+(py[j]-py[i])*f,6,C.amber);
    lab(ctx,'a free path weaves around obstacles — and the map may be wrong or changing',14,h-12,C.mut);
  };

  /* 02 — PLAN: sampling grows a tree of collision-free motions; optimization smooths a guess. */
  A.nv_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Two ways to plan: sample a tree of motions, or smooth an initial guess',14,16,C.dim);
    // left: RRT tree growing
    const lx=w*0.05,ly=h*0.26,lw=w*0.42,lh=h*0.56;rrect(ctx,lx,ly,lw,lh,6,C.line,null);lab(ctx,'sampling (RRT): grow a tree',lx+4,ly-8,C.cyan,9);
    const sx=lx+16,sy=ly+lh-16;dot(ctx,sx,sy,4,C.cyan);
    const p=saw(t,5);const nodes=[[sx,sy]];const seed=[[30,-30],[60,-20],[50,-60],[90,-50],[70,-90],[120,-70],[100,-110],[150,-95]];
    const nn=Math.floor(p*seed.length)+1;
    for(let k=0;k<Math.min(nn,seed.length);k++){const nx=sx+seed[k][0],ny=sy+seed[k][1];const par=nodes[Math.max(0,k-1>=0?Math.floor(k/1.6):0)];
      ctx.strokeStyle=hexA(C.cyan,0.6);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(par[0],par[1]);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,nx,ny,2.5,C.cyan);nodes.push([nx,ny]);}
    ring(ctx,lx+lw-24,ly+18,8,C.green);
    // right: trajectory optimization smoothing
    const rx=w*0.53,ry=ly,rw=w*0.42,rh=lh;rrect(ctx,rx,ry,rw,rh,6,C.line,null);lab(ctx,'optimization: smooth a guess',rx+4,ry-8,C.violet,9);
    const a=[[rx+16,ry+rh-16],[rx+rw*0.4,ry+16],[rx+rw-16,ry+rh*0.5]];
    // jagged initial
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(a[0][0],a[0][1]);ctx.lineTo(a[1][0]+Math.sin(t*3)*8,a[1][1]);ctx.lineTo(a[2][0],a[2][1]);ctx.stroke();ctx.setLineDash([]);
    // smoothed curve
    const s=Math.min(1,saw(t,5)+0.1);ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0][0],a[0][1]);ctx.quadraticCurveTo(a[1][0],a[1][1]+ (1-s)*0,a[2][0],a[2][1]);ctx.stroke();
    lab(ctx,'both search the free space — one by trying many motions, one by bending one until it fits',14,h-12,C.mut);
  };

  /* 03 — NAV STACK: a map to plan on + a costmap to dodge; a global plan + a local reactive loop. */
  A.nv_map=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The stack: a global plan on a map, a local loop to dodge what shows up',14,16,C.dim);
    // occupancy grid
    const gx=w*0.06,gy=h*0.28,cell=16,cols=Math.floor((w*0.55)/cell),rows=6;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const occ=((i===4&&j<4)||(i===8&&j>1)||(i===11&&j<3));
      ctx.fillStyle=occ?hexA(C.mut,0.5):hexA(C.cyan,0.05);ctx.fillRect(gx+i*cell,gy+j*cell,cell-1,cell-1);}
    lab(ctx,'occupancy + cost map',gx,gy-8,C.mut,9);
    // global plan (green) through free cells
    const sx=gx+cell*0.5,sy=gy+cell*5.5,ggx=gx+cell*(cols-0.5),ggy=gy+cell*0.5;
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(gx+cell*3,gy+cell*5);ctx.lineTo(gx+cell*6,gy+cell*1.5);ctx.lineTo(gx+cell*9.5,gy+cell*1);ctx.lineTo(ggx,ggy);ctx.stroke();
    dot(ctx,sx,sy,4,C.cyan);ring(ctx,ggx,ggy,7,C.green);lab(ctx,'global plan',gx+cell*3,gy+cell*6+8,C.green,8.5);
    // local reactive: a sudden obstacle + a dodge
    const p=saw(t,3);const ox=gx+cell*6,oy=gy+cell*2.5;if(p>0.3){dot(ctx,ox,oy,5,C.coral);lab(ctx,'new obstacle',ox+8,oy-8,C.coral,8);
      ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=1.6;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(ox-20,oy+8);ctx.quadraticCurveTo(ox,oy+22,ox+20,oy+6);ctx.stroke();ctx.setLineDash([]);
      lab(ctx,'local loop dodges it',ox-24,oy+30,C.amber,8);}
    lab(ctx,'plan globally on the map you have; react locally to whatever the sensors see right now',14,h-12,C.mut);
  };

  /* 04 — SOCIAL: the world moves back — predict people and weave, or freeze forever. */
  A.nv_social=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Crowds move too: predict where people go, then weave through',14,16,C.dim);
    const p=saw(t,5);
    // robot bottom-left to top-right
    const rx=w*0.12+p*w*0.7,ry=h*0.8-p*h*0.45;dot(ctx,rx,ry,7,C.cyan);lab(ctx,'robot',rx-6,ry+18,C.cyan,8.5);
    ring(ctx,w*0.86,h*0.32,8,C.green);
    // two pedestrians with predicted cones
    const peds=[[w*0.4,h*0.3,1,0.6],[w*0.62,h*0.7,-0.6,-0.8]];
    peds.forEach((pd,k)=>{const px=pd[0]+pd[2]*p*60,py=pd[1]+pd[3]*p*40;dot(ctx,px,py,6,C.violet);
      // prediction cone
      ctx.fillStyle=hexA(C.violet,0.12);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+pd[2]*70-14,py+pd[3]*50);ctx.lineTo(px+pd[2]*70+14,py+pd[3]*50+8);ctx.closePath();ctx.fill();});
    lab(ctx,'predicted paths',w*0.36,h*0.22,C.violet,8.5);
    lab(ctx,'the freezing-robot problem: predict badly and every path looks blocked — so it just stops',14,h-12,C.mut);
  };

  /* 05 — LEARN / LANGUAGE: pixels → action, or follow an instruction with no map given. */
  A.nv_learn=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Learned navigation: "go to the kitchen" — from pixels, no map handed over',14,16,C.dim);
    // first-person view (left)
    const vx=w*0.06,vy=h*0.3,vw=w*0.34,vh=h*0.44;rrect(ctx,vx,vy,vw,vh,6,C.cyan,hexA(C.cyan,0.05));lab(ctx,'what it sees',vx+4,vy-8,C.cyan,9);
    // hallway perspective
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx+vw*0.5,vy+vh*0.4);ctx.moveTo(vx+vw,vy);ctx.lineTo(vx+vw*0.5,vy+vh*0.4);ctx.moveTo(vx,vy+vh);ctx.lineTo(vx+vw*0.5,vy+vh*0.6);ctx.moveTo(vx+vw,vy+vh);ctx.lineTo(vx+vw*0.5,vy+vh*0.6);ctx.stroke();
    // policy box
    box(ctx,w*0.46,h*0.46,w*0.16,30,'policy /\nVLM',C.violet,hexA(C.violet,0.08));
    arrow(ctx,vx+vw+4,h*0.52,w*0.46,h*0.52,C.cyan,1.4);
    // instruction
    rrect(ctx,w*0.44,h*0.24,w*0.2,20,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"find the kitchen"',w*0.54,h*0.24+10,C.amber,8.5,'center');
    arrow(ctx,w*0.54,h*0.24+20,w*0.54,h*0.46,C.amber,1.2);
    // action out
    const p=saw(t,3);const acts=['turn left','forward','forward','turn right','stop'];
    box(ctx,w*0.72,h*0.46,w*0.2,30,acts[Math.floor(p*acts.length)],C.green,hexA(C.green,0.08));
    arrow(ctx,w*0.62,h*0.52,w*0.72,h*0.52,C.violet,1.4);
    lab(ctx,'a network maps view + goal straight to the next move — generalizing to buildings it never mapped',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.nvanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-nvanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
