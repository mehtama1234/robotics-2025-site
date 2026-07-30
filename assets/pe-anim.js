/* pe-anim.js — first-principles mechanism animators for the 3D-Perception explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-peanim="name". Self-contained boot. */
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
  function cam(ctx,x,y,ang,col){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(9,0);ctx.lineTo(-8,6);ctx.closePath();ctx.fill();ctx.restore();}
  const saw=(t,p)=>((t%p)/p);function jit(i){const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s);}
  const A={};

  /* 01 — THE DEPTH PROBLEM: 3D collapses to 2D along a ray; many points → one pixel. */
  A.pe_depth=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A camera collapses 3D to 2D — depth is thrown away; getting it back is the whole game',14,16,C.dim);
    const cx=w*0.16,cy=h*0.5;cam(ctx,cx,cy,0,C.amber);lab(ctx,'camera',cx-18,cy+22,C.mut,10);
    // image plane
    const ix=w*0.34;ctx.strokeStyle=hexA(C.cyan,0.8);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ix,cy-70);ctx.lineTo(ix,cy+70);ctx.stroke();
    lab(ctx,'image (2D)',ix-14,cy+86,C.cyan,10);
    // three scene points at different depths along the SAME ray -> one pixel
    const ray=-0.18;const py=cy+Math.tan(ray)*(ix-cx);
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(w*0.92,cy+Math.tan(ray)*(w*0.92-cx));ctx.stroke();ctx.setLineDash([]);
    [0.5,0.7,0.9].forEach((f,i)=>{const x=cx+(w*0.9-cx)*f,y=cy+Math.tan(ray)*(x-cx);dot(ctx,x,y,6,[C.green,C.violet,C.coral][i]);lab(ctx,'?',x+8,y,[C.green,C.violet,C.coral][i],11);});
    dot(ctx,ix,py,5,C.cyan);lab(ctx,'one pixel',ix+8,py-14,C.cyan,9.5);
    lab(ctx,'every point on the ray lands on the same pixel — which one is it? that lost distance is what 3D perception recovers',14,h-12,C.mut);
  };

  /* 02 — STEREO: two eyes; the same point shifts between L and R; shift (disparity) tells depth. */
  A.pe_stereo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Stereo: two eyes see the same point at a shifted spot — the shift IS the depth',14,16,C.dim);
    const lx=w*0.12,rx=w*0.12,ly=h*0.34,ry=h*0.66;cam(ctx,lx,ly,0,C.cyan);cam(ctx,rx,ry,0,C.violet);
    lab(ctx,'left cam',lx-4,ly-14,C.cyan,9.5);lab(ctx,'right cam',rx-4,ry+16,C.violet,9.5);
    // a scene point whose depth animates near<->far
    const depth=0.45+0.4*(0.5+0.5*Math.sin(t*0.8));const px=w*0.55+depth*w*0.3,py=h*0.5;dot(ctx,px,py,7,C.amber);lab(ctx,'scene point',px-24,py-16,C.amber,9.5);
    ctx.strokeStyle=hexA(C.cyan,0.5);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(px,py);ctx.stroke();
    ctx.strokeStyle=hexA(C.violet,0.5);ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(px,py);ctx.stroke();
    // two image strips showing the point at different x (disparity)
    const sx=w*0.3;const disp=(1-depth)*60; // near = big disparity
    rrect(ctx,sx,h*0.24,w*0.2,20,3,C.cyan,null);dot(ctx,sx+w*0.1-disp/2,h*0.24+10,4,C.amber);lab(ctx,'left image',sx,h*0.2,C.cyan,8.5);
    rrect(ctx,sx,h*0.72,w*0.2,20,3,C.violet,null);dot(ctx,sx+w*0.1+disp/2,h*0.72+10,4,C.amber);lab(ctx,'right image',sx,h*0.7,C.violet,8.5);
    lab(ctx,'disparity ≈ '+(disp<20?'small (far)':'big (near)'),w*0.72,h*0.5,C.green,10);
    lab(ctx,'depth = focal × baseline / disparity — match the pixel in both images, measure the shift, triangulate',14,h-12,C.mut);
  };

  /* 03 — MONOCULAR: one eye, no triangulation; a net guesses depth from learned cues (scale ambiguous). */
  A.pe_mono=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Monocular: one image, no triangulation — a network guesses depth from learned cues',14,16,C.dim);
    // single image with perspective cues
    const ix=w*0.08,iy=h*0.3,iw=w*0.32,ih=h*0.4;rrect(ctx,ix,iy,iw,ih,6,C.cyan,null);lab(ctx,'one image',ix,iy-8,C.cyan,9.5);
    // perspective converging lines
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.beginPath();ctx.moveTo(ix,iy+ih);ctx.lineTo(ix+iw*0.5,iy+ih*0.5);ctx.moveTo(ix+iw,iy+ih);ctx.lineTo(ix+iw*0.5,iy+ih*0.5);ctx.stroke();
    lab(ctx,'cues: perspective, size, texture',ix,iy+ih+14,C.dim,9);
    arrow(ctx,ix+iw+6,iy+ih*0.5,ix+iw+40,iy+ih*0.5,C.cyan,1.4);box(ctx,ix+iw+44,iy+ih*0.5-16,w*0.16,32,'depth net',C.violet);
    // depth map out (gradient near->far)
    const dx=ix+iw+44+w*0.16+20;const g=ctx.createLinearGradient(dx,0,dx+w*0.2,0);g.addColorStop(0,hexA(C.coral,0.7));g.addColorStop(1,hexA(C.violet,0.5));ctx.fillStyle=g;ctx.fillRect(dx,iy,w*0.2,ih);
    lab(ctx,'depth map',dx,iy-8,C.green,9.5);lab(ctx,'near → far',dx,iy+ih+14,C.mut,9);
    lab(ctx,'no geometry forces the answer, so scale is ambiguous — a toy car and a real car can look identical',14,h-12,C.mut);
  };

  /* 04 — OPTICAL FLOW: per-pixel motion between two frames; match every pixel across time. */
  A.pe_flow=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Optical flow: where every pixel went between two frames — a dense motion field',14,16,C.dim);
    const gx=w*0.1,gy=h*0.3,gw=w*0.5,gh=h*0.45,cols=8,rows=5;
    rrect(ctx,gx,gy,gw,gh,6,hexA(C.cyan,0.5),null);
    // a moving object (bigger flow) + global small drift
    const ph=saw(t,3);const ox=gx+gw*(0.3+0.4*ph),oy=gy+gh*0.5;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=gx+gw*(i+0.5)/cols,y=gy+gh*(j+0.5)/rows;
      const near=Math.hypot(x-ox,y-oy)<gw*0.14;const mag=near?12:3;
      arrow(ctx,x,y,x+mag,y+(near?2:0),near?C.coral:hexA(C.cyan,0.6),near?1.6:1);}
    dot(ctx,ox,oy,10,hexA(C.amber,0.5));lab(ctx,'moving object → long vectors',ox-40,oy+gh*0.4,C.coral,9.5);
    lab(ctx,'static scene → tiny vectors',gx,gy+gh+14,C.mut,9.5);
    lab(ctx,'match each pixel from frame t to t+1; the field reveals motion, and (with geometry) structure',14,h-12,C.mut);
  };

  /* 05 — SLAM: move, build a map, localize in it — and close loops to kill drift. */
  A.pe_slam=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'SLAM: build a map while you move through it, and localize in it at the same time',14,16,C.dim);
    const cx=w*0.5,cy=h*0.52,R=Math.min(w,h)*0.3;const p=saw(t,5);
    // landmarks
    for(let i=0;i<14;i++){const a=i*2.4;dot(ctx,cx+Math.cos(a)*R*(0.5+0.5*jit(i)),cy+Math.sin(a)*R*(0.5+0.5*jit(i+3))*0.8,2.5,hexA(C.violet,0.7));}
    // trajectory (a loop) traced so far, with drift then snap
    const N=Math.floor(p* 60);ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    for(let k=0;k<=N;k++){const a=(k/60)*TAU;const drift=(k/60)*12*(p<0.92?1:0);const x=cx+Math.cos(a)*R+drift,y=cy+Math.sin(a)*R*0.8+drift*0.5;k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    // camera at head
    const a=(N/60)*TAU;cam(ctx,cx+Math.cos(a)*R,cy+Math.sin(a)*R*0.8,a+Math.PI/2,C.amber);
    lab(ctx,'trajectory + map',cx-30,cy-R-8,C.cyan,10);
    // loop closure
    if(p>0.92){ctx.strokeStyle=C.green;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(cx+R,cy,10,0,TAU);ctx.stroke();ctx.setLineDash([]);lab(ctx,'loop closure → snap out the drift ✓',cx+R-40,cy+22,C.green,9.5);}
    else lab(ctx,'drift accumulates as you go…',cx+R-30,cy+22,C.coral,9.5);
    lab(ctx,'each new view refines both the map and where you are; returning to a seen place corrects the accumulated error',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.peanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-peanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
