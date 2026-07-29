/* gs-anim.js — first-principles mechanism animators for the Gaussian-Splatting explainer.
   Same harness contract as techniques.js: A[name] = fn(ctx,w,h,t); canvases carry data-gsanim="name".
   Self-contained (its own boot) so it can't disturb techniques.js / viz.js pages. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              green:'#6FCf7f', ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440', panel:'#0D131A' };
  const TAU = Math.PI*2;
  function fit(cv){
    const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth, h=parseInt(cv.getAttribute('height'))||300;
    cv.width=w*dpr; cv.height=h*dpr; const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }
  function txt(ctx,s,x,y,col,size,align,font){ctx.save();ctx.font=(size)+'px '+(font||'ui-monospace,Menlo,monospace');
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
  function clear(ctx,w,h){ctx.clearRect(0,0,w,h);}
  // an anisotropic gaussian splat: center (x,y), axis lengths (a,b), rotation rot, color, peak opacity
  function splat(ctx,x,y,a,b,rot,col,op){
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(a,b);
    const g=ctx.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,hexA(col,op)); g.addColorStop(0.55,hexA(col,op*0.5)); g.addColorStop(1,hexA(col,0));
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,1,0,TAU); ctx.fill(); ctx.restore();
  }
  function ring(ctx,x,y,a,b,rot,col,al){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(a,b);
    ctx.strokeStyle=hexA(col,al);ctx.lineWidth=1/Math.max(a,b);ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.stroke();ctx.restore();}
  function hexA(hex,al){const n=parseInt(hex.slice(1),16);const r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    return 'rgba('+r+','+g+','+b+','+Math.max(0,Math.min(1,al)).toFixed(3)+')';}
  function label(ctx,x,y,tx,col){txt(ctx,tx,x,y,col||C.mut,10.5,'left');}
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const osc=(t,p)=>0.5-0.5*Math.cos((t/p)*TAU);   // 0..1..0 loop, period p
  const saw=(t,p)=>((t%p)/p);

  const A = {};

  /* 01 — WHAT IS A 3D GAUSSIAN: one soft anisotropic blob, its 4 knobs named,
     then a handful of blobs composing a shape. */
  A.gaussblob = function(ctx,w,h,t){
    clear(ctx,w,h);
    const cx=w*0.30, cy=h*0.52, R=Math.min(w,h)*0.30;
    // the hero blob — covariance breathing (shape/orientation animate)
    const rot=Math.sin(t*0.5)*0.7, a=R*(1.1+0.35*Math.sin(t*0.7)), b=R*(0.62+0.2*Math.cos(t*0.9));
    const op=0.72;
    splat(ctx,cx,cy,a,b,rot,C.cyan,op);
    ring(ctx,cx,cy,a,b,rot,C.cyan,0.5);
    // center dot = position (mean)
    ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(cx,cy,2.4,0,TAU);ctx.fill();
    // covariance axes
    ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(-a,0);ctx.lineTo(a,0);ctx.moveTo(0,-b);ctx.lineTo(0,b);ctx.stroke();ctx.restore();
    // knob callouts
    label(ctx,14,20,'ONE 3D GAUSSIAN = 4 knobs',C.dim);
    label(ctx,14,h-64,'● position — where its center sits (x,y,z)',C.ink);
    label(ctx,14,h-46,'✕ covariance — its size + orientation (a squashed ellipsoid)',C.amber);
    label(ctx,14,h-28,'▓ opacity — how solid vs see-through',C.cyan);
    label(ctx,14,h-10,'◆ color — via spherical harmonics, so it can change with view',C.violet);
    // right: many blobs composing a shape (a little mushroom/tree)
    const ox=w*0.76, oy=h*0.52, s=Math.min(w,h)*0.5, appear=Math.min(1,t*0.5);
    const parts=[[0,-0.34,0.34,0.26,0,C.green],[ -0.22,-0.28,0.26,0.2,0.3,C.green],[0.22,-0.28,0.26,0.2,-0.3,C.green],
                 [0,-0.15,0.3,0.22,0,C.green],[0.02,0.18,0.09,0.28,0,C.amber]];
    parts.forEach((p,i)=>{ if(appear> i/parts.length){ splat(ctx,ox+p[0]*s,oy+p[1]*s,p[2]*s,p[3]*s,p[4],p[5],0.66); } });
    label(ctx,ox-s*0.34,oy+s*0.42,'stack a handful → a shape',C.mut);
    label(ctx,ox-s*0.34,oy+s*0.42+16,'a whole scene = millions of them',C.dim);
  };

  /* 02 — SPLATTING: project blobs to the image, sort by depth, composite front→back.
     A single pixel-ray marches through ordered splats; color accumulates, transmittance falls. */
  A.alphablend = function(ctx,w,h,t){
    clear(ctx,w,h);
    label(ctx,14,18,'RENDER A PIXEL = blend depth-sorted splats, front → back',C.dim);
    const bx=w*0.14, by=h*0.60, gap=(w*0.62)/5;
    const cols=[C.coral,C.amber,C.cyan,C.violet,C.green];
    const alphas=[0.55,0.4,0.7,0.3,0.6];
    // the accumulation sweep
    const k=saw(t,4)*5.2;              // moving front, 0..5
    let T=1, accR=0,accG=0,accB=0;
    for(let i=0;i<5;i++){
      const x=bx+gap*i, reached=k>i;
      const rgb=hexToRgb(cols[i]);
      splat(ctx,x,by,gap*0.5,gap*0.62,0,cols[i], reached?0.75:0.28);
      // depth label
      label(ctx,x-8,by+gap*0.85,'z'+(i+1),C.dim);
      if(reached){ const a=alphas[i]; accR+=T*a*rgb[0];accG+=T*a*rgb[1];accB+=T*a*rgb[2]; T*=(1-a); }
    }
    // marching front line
    const fx=bx+gap*Math.min(k,5.05);
    ctx.strokeStyle=hexA(C.ink,0.5);ctx.setLineDash([3,3]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(fx,by-gap);ctx.lineTo(fx,by+gap);ctx.stroke();ctx.setLineDash([]);
    // accumulated pixel swatch
    const px=w*0.86, py=by;
    ctx.fillStyle='rgb('+(accR|0)+','+(accG|0)+','+(accB|0)+')';
    ctx.fillRect(px-18,py-18,36,36); ctx.strokeStyle=C.line;ctx.strokeRect(px-18,py-18,36,36);
    label(ctx,px-20,py+30,'pixel',C.mut);
    // transmittance bar
    label(ctx,14,h-40,'transmittance T (light still getting through):',C.mut);
    ctx.fillStyle=C.line;ctx.fillRect(14,h-28,220,7);
    ctx.fillStyle=C.cyan;ctx.fillRect(14,h-28,220*T,7);
    // the equation
    label(ctx,14,h-8,'C = Σ  cᵢ · αᵢ · Πⱼ<ᵢ(1−αⱼ)      — a splat only shows through what is still transparent in front',C.dim);
  };

  /* 03 — TRAINING: render vs photo → photometric loss → adaptive density control (clone/split/prune).
     Blobs multiply into detail; error curve falls. */
  A.densify = function(ctx,w,h,t){
    clear(ctx,w,h);
    const p=saw(t,7);                    // one training arc
    const stage=p; // 0..1
    label(ctx,14,18,'TRAIN: compare render to the photo, nudge every knob, then add/kill blobs',C.dim);
    // left: the render — blobs multiplying to match a target silhouette (a circle)
    const lx=w*0.24, ly=h*0.55, s=Math.min(w,h)*0.34;
    ctx.strokeStyle=hexA(C.ink,0.35);ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(lx,ly,s,0,TAU);ctx.stroke();ctx.setLineDash([]);
    label(ctx,lx-s,ly+s+16,'render (Gaussians)',C.mut);
    const N=Math.round(2+stage*26);
    for(let i=0;i<N;i++){ const ang=i*2.399963, rad=s*Math.sqrt(i/N); // sunflower fill
      const bx=lx+Math.cos(ang)*rad, by=ly+Math.sin(ang)*rad;
      const sz=s*(0.5-0.36*stage)*(0.6+0.4*((i*37)%5)/5);
      splat(ctx,bx,by, sz,sz*0.8, ang, i%3===0?C.cyan:(i%3===1?C.cyan2:C.violet), 0.5);
    }
    // middle: the target photo
    const mx=w*0.55;
    const g=ctx.createRadialGradient(mx,ly,2,mx,ly,s); g.addColorStop(0,hexA(C.amber,0.9));g.addColorStop(1,hexA(C.coral,0.7));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(mx,ly,s,0,TAU);ctx.fill();
    label(ctx,mx-s*0.5,ly+s+16,'ground-truth photo',C.mut);
    // clone/split/prune callout, cycling
    const ops=[['CLONE','a too-small blob in a blurry area is copied',C.green],
               ['SPLIT','a too-big blob over sharp detail is cut in two',C.amber],
               ['PRUNE','a nearly-transparent blob is deleted',C.coral]];
    const oi=Math.floor(saw(t,7)*3)%3;
    label(ctx,w*0.72,h*0.34,'ADAPTIVE DENSITY CONTROL',C.dim);
    ops.forEach((o,i)=>{ const on=i===oi; label(ctx,w*0.72,h*0.34+20+i*18,(on?'▸ ':'   ')+o[0]+' — '+o[1], on?o[2]:C.dim); });
    // error curve falling
    const ex=w*0.72, ey=h*0.86, ew=w*0.24, eh=h*0.16;
    ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(ex,ey-eh);ctx.lineTo(ex,ey);ctx.lineTo(ex+ew,ey);ctx.stroke();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.6;ctx.beginPath();
    for(let i=0;i<=40;i++){ const u=i/40; const err=Math.exp(-3*Math.min(u,stage))*(u<=stage?1:1); const yy=ey-eh*Math.exp(-3*u*stage>1?1:3*u); }
    // simpler: draw decaying curve up to stage
    ctx.beginPath(); for(let i=0;i<=40;i++){ const u=i/40; const yy=ey-eh*Math.exp(-3.2*u); if(u<=Math.max(0.02,stage)){ const xx=ex+ew*u/Math.max(0.02,stage); i===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);} }
    ctx.stroke();
    label(ctx,ex,ey+12,'photometric loss ↓',C.mut);
  };

  /* 04 — VIEW-DEPENDENT COLOR: camera orbits; the splat's highlight moves.
     Spherical harmonics store color as a function of viewing direction. */
  A.shview = function(ctx,w,h,t){
    clear(ctx,w,h);
    label(ctx,14,18,'SPHERICAL HARMONICS: color that changes with where you look from',C.dim);
    const cx=w*0.32, cy=h*0.55, R=Math.min(w,h)*0.28;
    const ang=t*0.7;
    // base sphere blob
    splat(ctx,cx,cy,R*1.2,R*1.2,0,C.cyan2,0.6);
    // specular highlight orbiting = view-dependent term
    const hx=cx+Math.cos(ang)*R*0.55, hy=cy+Math.sin(ang)*R*0.55;
    splat(ctx,hx,hy,R*0.5,R*0.5,0,C.ink,0.5);
    splat(ctx,hx,hy,R*0.28,R*0.28,0,'#ffffff',0.7);
    // orbiting camera
    const camA=ang, camx=cx+Math.cos(camA)*R*1.9, camy=cy+Math.sin(camA)*R*1.9;
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(cx,cy,R*1.9,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=C.amber;ctx.save();ctx.translate(camx,camy);ctx.rotate(camA+Math.PI);
    ctx.beginPath();ctx.moveTo(-7,-5);ctx.lineTo(7,0);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();ctx.restore();
    label(ctx,camx-18,camy-14,'camera',C.amber);
    // SH bands lighting up on the right
    const bx=w*0.66, by=h*0.32;
    label(ctx,bx,by-14,'SH bands (view → color):',C.dim);
    for(let l=0;l<3;l++){ for(let m=0;m<=2*l;m++){ const x=bx+m*22, y=by+l*24;
      const lit=0.35+0.6*Math.abs(Math.sin(ang+l*1.3+m*0.6));
      ctx.fillStyle=hexA(l===0?C.cyan:(l===1?C.violet:C.amber),lit);
      ctx.beginPath();ctx.arc(x,y,8,0,TAU);ctx.fill(); } }
    label(ctx,bx,by+3*24+6,'band 0 = flat base color',C.mut);
    label(ctx,bx,by+3*24+22,'higher bands = shine, gloss, view shifts',C.mut);
    label(ctx,14,h-10,'a matte wall needs only band 0 · a glossy car needs the high bands to move its highlight',C.dim);
  };

  /* 05 — WHY REAL-TIME: NeRF marches a ray querying an MLP many times; 3DGS rasterizes explicit blobs once. */
  A.nerfvs = function(ctx,w,h,t){
    clear(ctx,w,h);
    const midY=h*0.5;
    ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(0,midY);ctx.lineTo(w,midY);ctx.stroke();
    // TOP: NeRF — ray marching, MLP queries
    label(ctx,14,16,'NeRF — implicit: ask a neural net for color+density at MANY points per ray',C.coral);
    const ry=h*0.28, rx0=w*0.06, rx1=w*0.62;
    ctx.strokeStyle=hexA(C.mut,0.7);ctx.beginPath();ctx.moveTo(rx0,ry);ctx.lineTo(rx1,ry);ctx.stroke();
    const nq=Math.floor(saw(t,3)*16)+1;
    for(let i=0;i<16;i++){ const x=rx0+(rx1-rx0)*(i/15); const on=i<nq;
      ctx.fillStyle=on?C.coral:hexA(C.dim,0.5);ctx.beginPath();ctx.arc(x,ry,on?3.4:2,0,TAU);ctx.fill(); }
    // MLP box
    ctx.strokeStyle=C.coral;ctx.strokeRect(rx1+16,ry-16,52,32);label(ctx,rx1+20,ry,'MLP',C.coral,10);
    label(ctx,rx0,ry+24,'~192 network calls for ONE ray × millions of rays → seconds/frame, slow to train',C.mut);
    // TOP right: a slow clock
    label(ctx,w*0.80,ry-30,'≈ 0.05 fps',C.coral,13);
    // BOTTOM: 3DGS — rasterize explicit blobs in one GPU pass
    label(ctx,14,midY+22,'3DGS — explicit: project the actual blobs and blend them in ONE sorted pass',C.cyan);
    const gy=h*0.76;
    const bx0=w*0.06;
    for(let i=0;i<7;i++){ const x=bx0+i*(w*0.55/7)*1.0; const app=saw(t,3)>0.1;
      splat(ctx,x,gy,16,12,i*0.5,i%2?C.cyan:C.violet,0.7); }
    // to screen — single arrow
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(w*0.63,gy);ctx.lineTo(w*0.72,gy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(w*0.72,gy);ctx.lineTo(w*0.715,gy-4);ctx.lineTo(w*0.715,gy+4);ctx.closePath();ctx.fillStyle=C.cyan;ctx.fill();
    ctx.strokeStyle=C.cyan;ctx.strokeRect(w*0.73,gy-16,34,32);label(ctx,w*0.74,gy,'GPU',C.cyan,9.5);
    label(ctx,bx0,gy+26,'no per-point network — the scene IS the primitives → 100+ fps, minutes to train',C.mut);
    label(ctx,w*0.80,gy-30,'≈ 130 fps',C.cyan,13);
    label(ctx,14,h-8,'Same photorealism, opposite cost model — that swap is why splatting took over.',C.dim);
  };

  function hexToRgb(hex){const n=parseInt(hex.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}

  // ---- boot (mirrors techniques.js) ----
  const running=new Map();
  function start(cv){ if(running.has(cv))return; const anim=A[cv.dataset.gsanim]; if(!anim)return;
    let dims=fit(cv), t0=performance.now(), raf;
    function frame(now){const t=(now-t0)/1000; anim(dims.ctx,dims.w,dims.h,t); raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);} else {raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));
    cv._refit=()=>{dims=fit(cv); if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};
  }
  function stop(cv){const s=running.get(cv); if(s){s();running.delete(cv);}}
  function init(){
    const cvs=[...document.querySelectorAll('canvas[data-gsanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));
    let rt; addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
