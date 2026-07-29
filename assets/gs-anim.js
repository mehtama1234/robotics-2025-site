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

  // ===== shared helpers for the per-family diagrams =====
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const a=Math.atan2(y2-y1,x2-x1),s=6;ctx.beginPath();ctx.moveTo(x2,y2);
    ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));
    ctx.closePath();ctx.fill();ctx.restore();}
  function rrect(ctx,x,y,w,h,r,stroke,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke();}}
  function cam(ctx,x,y,ang,col,s){s=s||9;ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=col;
    ctx.beginPath();ctx.moveTo(-s*0.8,-s*0.6);ctx.lineTo(s,0);ctx.lineTo(-s*0.8,s*0.6);ctx.closePath();ctx.fill();ctx.restore();}
  function bars(ctx,x,y,vals,col,scl){scl=scl||14;vals.forEach((v,i)=>{ctx.fillStyle=col;ctx.fillRect(x+i*4,y-v*scl,3,v*scl);});}

  // 06 SLAM — alternate TRACK (match render to find pose) and MAP (grow blobs); loop forever.
  A.slam_loop=function(ctx,w,h,t){clear(ctx,w,h);
    const ph=saw(t,6),track=ph<0.5,u=track?ph/0.5:(ph-0.5)/0.5;
    label(ctx,14,16,'SLAM: a frame arrives, its camera pose is unknown, the map is half-built',C.dim);
    // TRACK panel (left)
    const lx=w*0.06,ly=h*0.30,pw=w*0.36,phh=h*0.44;
    rrect(ctx,lx,ly,pw,phh,8,track?C.cyan:C.line,null);
    label(ctx,lx+4,ly-8,track?'▸ TRACK — find the camera':'TRACK',track?C.cyan:C.dim);
    // real frame (fixed box) vs rendered (offset shrinking)
    const off=track?(1-ease(u))*pw*0.28:0;
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=1.4;ctx.strokeRect(lx+pw*0.28,ly+phh*0.28,pw*0.42,phh*0.44);
    ctx.strokeStyle=hexA(C.cyan,0.9);ctx.strokeRect(lx+pw*0.28+off,ly+phh*0.28-off*0.3,pw*0.42,phh*0.44);
    label(ctx,lx+4,ly+phh+14,track?'slide pose until render (cyan) = photo (amber)':'',C.mut);
    // MAP panel (right)
    const rx=w*0.56,ry=ly;
    rrect(ctx,rx,ry,pw,phh,8,!track?C.cyan:C.line,null);
    label(ctx,rx+4,ry-8,!track?'▸ MAP — grow the blobs':'MAP',!track?C.cyan:C.dim);
    const N=6+ (!track?Math.round(u*6):0);
    for(let i=0;i<12;i++){const ang=i*2.4,rad=(pw*0.34)*Math.sqrt((i%8)/8);
      const bx=rx+pw*0.5+Math.cos(ang)*rad,by=ry+phh*0.5+Math.sin(ang)*rad;
      splat(ctx,bx,by,10,8,ang,i%2?C.cyan:C.violet, i<N?0.7:0.12);}
    label(ctx,rx+4,ry+phh+14,!track?'clone blobs where the frame is still blurry':'',C.mut);
    // loop arrow
    arrow(ctx,rx-6,ly+phh+30, lx+pw+6, ly+phh+30, hexA(C.ink,0.4),1.2);
    arrow(ctx,lx+pw+6,ly-2, rx-6, ly-2, hexA(C.ink,0.4),1.2);
    label(ctx,w*0.42,ly-2,'every frame',C.dim);
  };

  // 07 DRIVING — pin static world blobs to road/sky; give the moving car its own blob track + mirrored far side.
  A.drive_split=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'A street = a rigid world + things that move, seen from one side only',C.dim);
    const hy=h*0.42; // horizon
    ctx.fillStyle=hexA(C.cyan2,0.10);ctx.fillRect(0,h*0.24,w,hy-h*0.24); // sky band
    // road trapezoid
    ctx.fillStyle=hexA(C.dim,0.18);ctx.beginPath();ctx.moveTo(w*0.42,hy);ctx.lineTo(w*0.58,hy);ctx.lineTo(w*0.98,h*0.92);ctx.lineTo(w*0.02,h*0.92);ctx.closePath();ctx.fill();
    label(ctx,w*0.03,h*0.30,'world blobs — pinned to road + sky (they never move)',C.mut);
    // static blobs along buildings
    for(let i=0;i<8;i++){const x=w*(0.08+i*0.11),y=hy-6-((i*53)%22);splat(ctx,x,y,9,12,0,C.violet,0.55);}
    // moving car with its own blobs
    const cx=w*(0.15+saw(t,5)*0.7),cy=h*0.72;
    splat(ctx,cx,cy,26,13,0,C.amber,0.8);splat(ctx,cx,cy,15,9,0,C.coral,0.7);
    // mirrored far side (ghost)
    splat(ctx,cx,cy-16,20,7,0,C.amber,0.22);
    arrow(ctx,cx,cy-20,cx,cy-9,hexA(C.ink,0.4),1);
    label(ctx,cx-30,cy+22,'car blobs — own moving track',C.amber);
    label(ctx,w*0.5,cy-30,'unseen far side filled by a mirror',C.dim);
  };

  // 08 MANIPULATION — tag each blob-object with a feature (query by word), then edit the scene; particles shadow for physics.
  A.manip_feat=function(ctx,w,h,t){clear(ctx,w,h);
    const ph=saw(t,6),query=ph<0.5;
    label(ctx,14,16,'To grasp, a robot needs meaning ("the mug") and a scene it can change',C.dim);
    const objs=[['mug',w*0.24,C.cyan],['bowl',w*0.5,C.amber],['box',w*0.76,C.violet]];
    const oy=h*0.6, move=(!query)?ease((ph-0.5)/0.5):0;
    objs.forEach((o,i)=>{const dx=(i===0)?move*w*0.12:0;
      splat(ctx,o[1]+dx,oy,26,20,0,o[2], (query&&i===0)?0.95:0.6);
      // feature tag
      rrect(ctx,o[1]-14,oy-46,28,12,3,o[2],null);bars(ctx,o[1]-10,oy-36,[0.5+0.4*((i*7)%3),0.3+((i*5)%2)*0.5,0.6],o[2],10);
      // particle shadow
      ctx.fillStyle=hexA(o[2],0.4);ctx.beginPath();ctx.arc(o[1]+dx,oy+26,2,0,TAU);ctx.fill();
    });
    if(query){const q='"mug"';label(ctx,w*0.24-14,h*0.9,q+' → its blobs light up',C.cyan);
      label(ctx,14,h-10,'each blob-object carries a CLIP feature → query the scene in plain words',C.mut);}
    else{cam(ctx,w*0.24+move*w*0.12-40,oy,0,C.ink,10);label(ctx,w*0.4,h*0.9,'gripper moves it → scene updates live',C.amber);
      label(ctx,14,h-10,'edit the explicit cloud → simulate an action before taking it',C.mut);}
  };

  // 09 SIM2REAL — capture once, render unlimited virtual views, train, deploy on the real robot.
  A.sim2real=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'Policies need millions of photoreal views; real robots make them slowly',C.dim);
    // captured scene (blobs) center-left
    const sx=w*0.28,sy=h*0.5;for(let i=0;i<7;i++){const a=i*0.9;splat(ctx,sx+Math.cos(a)*30,sy+Math.sin(a)*22,12,9,a,i%2?C.cyan:C.violet,0.6);}
    label(ctx,sx-40,sy+52,'captured once → a splat',C.mut);
    // fan of virtual cameras orbiting, spawning views
    const n=8;for(let i=0;i<n;i++){const a=(i/n)*TAU+t*0.4,r=70;const lit=(Math.floor(t*4+i)%n===0);
      cam(ctx,sx+Math.cos(a)*r,sy+Math.sin(a)*r,a+Math.PI,lit?C.amber:hexA(C.amber,0.45),8);}
    label(ctx,sx-30,sy-60,'render unlimited views',C.amber);
    // arrow to real robot
    arrow(ctx,w*0.52,sy,w*0.72,sy,C.cyan,1.8);
    rrect(ctx,w*0.74,sy-22,w*0.2,44,8,C.cyan,hexA(C.cyan,0.06));
    label(ctx,w*0.76,sy-4,'real robot',C.cyan);label(ctx,w*0.76,sy+12,'zero-shot, no fine-tune',C.mut);
  };

  // 10 4D — each blob gets a position-over-time; static points filtered, movers get a lifespan.
  A.four_d=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'A static cloud can’t hold a waving hand — time becomes a blob attribute',C.dim);
    const u=saw(t,5);
    // static blob (stays)
    splat(ctx,w*0.22,h*0.5,16,14,0,C.violet,0.55);label(ctx,w*0.13,h*0.72,'static blob — filtered out',C.mut);
    // moving blob along a path
    const px=w*(0.45+0.35*u),py=h*(0.5+0.18*Math.sin(u*TAU));
    // ghost trail
    for(let k=1;k<=5;k++){const uu=u-k*0.05;if(uu<0)continue;const gx=w*(0.45+0.35*uu),gy=h*(0.5+0.18*Math.sin(uu*TAU));splat(ctx,gx,gy,12,10,0,C.cyan,0.12);}
    splat(ctx,px,py,16,13,0,C.cyan,0.85);label(ctx,px-24,py-24,'blob(t)',C.cyan);
    // timeline
    const tx=w*0.13,tw=w*0.74,tyy=h*0.9;ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(tx,tyy);ctx.lineTo(tx+tw,tyy);ctx.stroke();
    ctx.fillStyle=C.cyan;ctx.beginPath();ctx.arc(tx+tw*u,tyy,4,0,TAU);ctx.fill();
    label(ctx,tx,tyy+14,'time t →',C.dim);
    // lifespan bar
    label(ctx,w*0.62,h*0.28,'lifespan: when this blob exists',C.dim);ctx.fillStyle=C.line;ctx.fillRect(w*0.62,h*0.33,w*0.28,6);ctx.fillStyle=C.amber;ctx.fillRect(w*0.62+w*0.06,h*0.33,w*0.16,6);
  };

  // 11 AVATARS — bind blobs to a bone rig; move the skeleton, blobs follow (linear blend skinning).
  A.avatar_rig=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'You want a person you can re-pose — bind the blobs to a skeleton',C.dim);
    const sx=w*0.3,sy=h*0.4,L=Math.min(w,h)*0.34;
    const ang=0.5+0.5*Math.sin(t*0.9); // elbow angle
    const ex=sx+Math.cos(0.6)*L,ey=sy+Math.sin(0.6)*L; // elbow
    const hx=ex+Math.cos(0.6+ang)*L,hy=ey+Math.sin(0.6+ang)*L; // hand
    // bones
    ctx.strokeStyle=hexA(C.ink,0.7);ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.lineTo(hx,hy);ctx.stroke();
    [[sx,sy],[ex,ey],[hx,hy]].forEach(p=>{ctx.fillStyle=C.amber;ctx.beginPath();ctx.arc(p[0],p[1],3.5,0,TAU);ctx.fill();});
    // blobs bound along bones
    for(let k=0;k<=4;k++){const f=k/4;splat(ctx,sx+(ex-sx)*f,sy+(ey-sy)*f,13,10,0,C.cyan,0.5);}
    for(let k=1;k<=4;k++){const f=k/4;splat(ctx,ex+(hx-ex)*f,ey+(hy-ey)*f,13,10,0,C.violet,0.5);}
    label(ctx,ex+8,ey-8,'blob near joint blends two bones (weights)',C.mut);
    label(ctx,14,h-10,'move a bone → its blobs move with it, via skinning weights',C.mut);
  };

  // 12 GENERATIVE — no photos exist; a diffusion model imagines the views, blobs condense from them.
  A.gen_diff=function(ctx,w,h,t){clear(ctx,w,h);
    const ph=saw(t,7);
    label(ctx,14,16,'Generation makes a scene that doesn’t exist — most views are missing',C.dim);
    // prompt
    rrect(ctx,w*0.05,h*0.44,w*0.2,26,6,C.cyan,null);label(ctx,w*0.07,h*0.57,'“a mossy ruin”',C.cyan);
    arrow(ctx,w*0.26,h*0.57,w*0.34,h*0.57,C.dim,1.2);
    // diffusion: noise->views ring
    const cx=w*0.62,cy=h*0.55,r=Math.min(w,h)*0.3;
    const denoise=Math.min(1,ph*1.6);
    for(let i=0;i<8;i++){const a=(i/8)*TAU;const jitter=(1-denoise)*10;
      cam(ctx,cx+Math.cos(a)*r+(((i*13)%7-3))*jitter*0.2,cy+Math.sin(a)*r,a+Math.PI,denoise>0.3?C.amber:hexA(C.amber,0.4),8);}
    label(ctx,cx-52,cy-r-8,'diffusion imagines views around it',C.amber);
    // blobs condense in center as ph advances
    const solid=Math.max(0,(ph-0.55)/0.45);
    for(let i=0;i<7;i++){const a=i*0.9;splat(ctx,cx+Math.cos(a)*22,cy+Math.sin(a)*16,12,9,a,i%2?C.cyan:C.violet,0.7*solid);}
    label(ctx,cx-24,cy+r+6, solid>0.2?'→ blobs solidify the scene':'',C.mut);
  };

  // 13 SEMANTICS — each blob carries a CLIP feature; a word lights the matching blobs.
  A.sem_query=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'A map of blobs is meaningless to a planner — give each blob a feature',C.dim);
    // query word + its feature bars
    const qv=[0.8,0.3,0.6,0.4];
    rrect(ctx,w*0.06,h*0.3,w*0.2,30,6,C.cyan,null);label(ctx,w*0.08,h*0.4,'query: “handle”',C.cyan);
    bars(ctx,w*0.08,h*0.56,qv,C.cyan,16);label(ctx,w*0.08,h*0.62,'its CLIP feature',C.dim);
    // cloud of blobs each with feature bars; some match
    const cells=[[0.45,0.35,[0.8,0.3,0.55,0.42],true],[0.62,0.3,[0.2,0.7,0.3,0.6],false],
      [0.78,0.4,[0.78,0.34,0.6,0.4],true],[0.5,0.62,[0.3,0.2,0.8,0.5],false],
      [0.7,0.66,[0.82,0.28,0.58,0.44],true],[0.86,0.6,[0.25,0.6,0.35,0.7],false]];
    cells.forEach(c=>{const x=w*c[0],y=h*c[1];const match=c[3];
      const sim=1-Math.hypot(...c[2].map((v,i)=>v-qv[i]))/1.4;
      splat(ctx,x,y,18,15,0,match?C.cyan:C.violet, match?0.9:0.28);
      bars(ctx,x-8,y-20,c[2],match?C.cyan:C.dim,12);});
    label(ctx,14,h-10,'a word → nearest-feature lookup lights the matching blobs (open-vocabulary)',C.mut);
  };

  // 14 MESHES — a fat blob's normal is ambiguous; flatten to a 2D disk → one clear normal; disks tile a surface.
  A.mesh_normal=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'A surface needs to know which way it faces — a fat blob doesn’t',C.dim);
    // left: fat blob with ambiguous normals
    const lx=w*0.2,ly=h*0.45;splat(ctx,lx,ly,34,28,0.3,C.violet,0.6);
    for(let k=-2;k<=2;k++){const a=-Math.PI/2+k*0.5;arrow(ctx,lx,ly,lx+Math.cos(a)*44,ly+Math.sin(a)*44,hexA(C.coral,0.7),1.2);}
    label(ctx,lx-30,ly+50,'which way is “out”? ambiguous',C.coral);
    // flatten arrow
    arrow(ctx,w*0.36,ly,w*0.46,ly,C.ink,1.6);label(ctx,w*0.36,ly-10,'flatten',C.dim);
    // right: oriented 2D disk with one normal
    const rx=w*0.58,ry=ly;ctx.save();ctx.translate(rx,ry);ctx.rotate(0.3);ctx.scale(2.4,0.5);
    const g=ctx.createRadialGradient(0,0,0,0,0,18);g.addColorStop(0,hexA(C.cyan,0.8));g.addColorStop(1,hexA(C.cyan,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,18,0,TAU);ctx.fill();ctx.restore();
    arrow(ctx,rx,ry,rx+Math.cos(-1.0)*40,ry+Math.sin(-1.0)*40,C.cyan,1.8);
    label(ctx,rx-20,ly+50,'a 2D disk → one clear normal',C.cyan);
    // bottom: disks tiling a curved surface
    const by=h*0.86;ctx.strokeStyle=hexA(C.mut,0.4);ctx.beginPath();
    for(let i=0;i<=40;i++){const x=w*0.1+ (w*0.8)*i/40,y=by-14*Math.sin(i/40*Math.PI);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    for(let i=0;i<11;i++){const u=i/10,x=w*0.1+w*0.8*u,y=by-14*Math.sin(u*Math.PI);
      const sl=-14*Math.PI/40*Math.cos(u*Math.PI);ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan(sl/ (w*0.8/40)));
      ctx.fillStyle=hexA(C.cyan,0.6);ctx.fillRect(-8,-2,16,4);ctx.restore();}
    label(ctx,w*0.1,by+16,'oriented disks tile the real surface (2D Gaussian splatting)',C.mut);
  };

  // 15 SPARSE/FEED-FORWARD — skip per-scene optimization; a network predicts the whole cloud in one pass.
  A.feedfwd=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'Vanilla splatting wants many photos + minutes of fitting per scene',C.dim);
    // top: fast feed-forward path
    const ty=h*0.36;for(let i=0;i<3;i++)cam(ctx,w*0.1,ty-20+i*20,0,C.amber,9);
    label(ctx,w*0.05,ty+30,'3–4 views',C.mut);
    arrow(ctx,w*0.16,ty,w*0.30,ty,C.cyan,1.6);
    rrect(ctx,w*0.30,ty-18,w*0.2,36,7,C.cyan,hexA(C.cyan,0.06));label(ctx,w*0.32,ty,'network — ONE pass',C.cyan,10);
    arrow(ctx,w*0.51,ty,w*0.62,ty,C.cyan,1.6);
    const cx=w*0.75;for(let i=0;i<7;i++){const a=i*0.9;splat(ctx,cx+Math.cos(a)*24,ty+Math.sin(a)*18,11,8,a,i%2?C.cyan:C.violet,0.7);}
    label(ctx,cx-24,ty+34,'full blob cloud, instantly',C.cyan);
    // bottom: slow per-scene loop, crossed out
    const by=h*0.74;label(ctx,w*0.05,by-22,'the old way:',C.dim);
    ctx.strokeStyle=hexA(C.mut,0.6);ctx.beginPath();ctx.arc(w*0.3,by,20,0.5,TAU);ctx.stroke();
    arrow(ctx,w*0.3+18,by-8,w*0.3+20,by+2,hexA(C.mut,0.6),1.2);
    label(ctx,w*0.35,by,'optimize this scene… minutes',C.mut);
    ctx.strokeStyle=C.coral;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*0.24,by-16);ctx.lineTo(w*0.62,by+16);ctx.stroke();
  };

  // 16 MATERIALS — split a blob's look into material × illumination, so you can move the light.
  A.material_split=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'A trained blob bakes the capture lighting in — you can’t move the sun',C.dim);
    const cx=w*0.7,cy=h*0.55,R=Math.min(w,h)*0.26,ang=t*0.8;
    // the rendered sphere
    splat(ctx,cx,cy,R*1.15,R*1.15,0,C.cyan2,0.6);
    const hx=cx+Math.cos(ang)*R*0.55,hy=cy+Math.sin(ang)*R*0.55;
    splat(ctx,hx,hy,R*0.35,R*0.35,0,'#ffffff',0.75);
    // moving light
    const lx=cx+Math.cos(ang)*R*1.8,ly=cy+Math.sin(ang)*R*1.8;
    ctx.fillStyle=C.amber;ctx.beginPath();ctx.arc(lx,ly,6,0,TAU);ctx.fill();
    ctx.strokeStyle=hexA(C.amber,0.35);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(hx,hy);ctx.stroke();ctx.setLineDash([]);
    label(ctx,lx-16,ly-12,'move the light',C.amber);
    // the split: look = material × illumination
    const px=w*0.06,py=h*0.4;
    label(ctx,px,py-16,'the render splits into two factors:',C.dim);
    rrect(ctx,px,py,w*0.24,34,6,C.line,hexA(C.violet,0.12));label(ctx,px+8,py+17,'MATERIAL — albedo, roughness (fixed)',C.violet,10);
    label(ctx,px+w*0.11,py+48,'×',C.dim,16);
    rrect(ctx,px,py+58,w*0.24,34,6,C.line,hexA(C.amber,0.12));label(ctx,px+8,py+75,'ILLUMINATION — the light (editable)',C.amber,10);
    label(ctx,14,h-10,'separate the two → relight the object, or drop it into a new scene',C.mut);
  };

  // 17 SENSORS — same blobs, swap the observation model (RGB / event / thermal).
  A.sensor_swap=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'RGB dies in the dark, at speed, in smoke — swap the observation model',C.dim);
    const cx=w*0.24,cy=h*0.52;for(let i=0;i<7;i++){const a=i*0.9;splat(ctx,cx+Math.cos(a)*26,cy+Math.sin(a)*20,12,9,a,i%2?C.cyan:C.violet,0.6);}
    label(ctx,cx-24,cy+44,'one blob cloud',C.mut);
    const modes=[['RGB → pixels',C.cyan],['EVENT → brightness spikes',C.amber],['THERMAL → heat',C.coral]];
    const mi=Math.floor(saw(t,6)*3)%3;
    modes.forEach((m,i)=>{const y=h*0.3+i*h*0.2,on=i===mi;
      arrow(ctx,w*0.4,cy,w*0.52,y,on?m[1]:hexA(m[1],0.3),on?1.8:1);
      rrect(ctx,w*0.53,y-16,w*0.4,32,7,on?m[1]:C.line,on?hexA(m[1],0.08):null);
      label(ctx,w*0.55,y,m[0],on?m[1]:C.dim,11);
      // little readout glyph
      if(on&&i===0){for(let k=0;k<5;k++)for(let j=0;j<2;j++){ctx.fillStyle=hexA(C.cyan,0.5);ctx.fillRect(w*0.85+k*5,y-6+j*6,4,4);}}
      if(on&&i===1){for(let k=0;k<6;k++){ctx.fillStyle=C.amber;ctx.beginPath();ctx.arc(w*0.85+k*6,y-3+((k*7)%2)*6,1.6,0,TAU);ctx.fill();}}
      if(on&&i===2){const g=ctx.createLinearGradient(w*0.85,0,w*0.92,0);g.addColorStop(0,hexA(C.coral,0.6));g.addColorStop(1,hexA(C.amber,0.3));ctx.fillStyle=g;ctx.fillRect(w*0.85,y-6,w*0.07,12);}
    });
    label(ctx,14,h-10,'the blobs are the same; only the rule turning a blob into a measurement changes',C.mut);
  };

  // 18 COMPRESSION — merge / quantize / prune shrink the cloud; the picture stays the same.
  A.compress=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'A room is millions of blobs — too much for a drone or a phone',C.dim);
    const u=saw(t,5);
    // left dense
    const lx=w*0.22,ly=h*0.5;for(let i=0;i<40;i++){const a=i*2.4,r=(Math.min(w,h)*0.28)*Math.sqrt((i%30)/30);
      splat(ctx,lx+Math.cos(a)*r,ly+Math.sin(a)*r,7,6,a,i%2?C.cyan:C.violet,0.5);}
    label(ctx,lx-30,ly+ Math.min(w,h)*0.32,'2,000,000 blobs',C.mut);
    // ops
    const ops=['merge near-duplicates','quantize into codebooks','prune the invisible'];
    const oi=Math.floor(u*3)%3;
    arrow(ctx,w*0.42,ly,w*0.56,ly,C.ink,1.6);
    ops.forEach((o,i)=>label(ctx,w*0.43,ly-30+i*16,(i===oi?'▸ ':'   ')+o,i===oi?C.accent||C.cyan:C.dim));
    // right sparse (same look)
    const rx=w*0.78;for(let i=0;i<14;i++){const a=i*2.4,r=(Math.min(w,h)*0.26)*Math.sqrt((i%12)/12);
      splat(ctx,rx+Math.cos(a)*r,ly+Math.sin(a)*r,11,9,a,i%2?C.cyan:C.violet,0.6);}
    const shown=Math.round(2000000-(1700000)*u);
    label(ctx,rx-24,ly+Math.min(w,h)*0.32,(300000).toLocaleString()+' blobs',C.cyan);
    label(ctx,rx-24,ly+Math.min(w,h)*0.32+15,'✓ same picture',C.mut);
  };

  // 19 LOCALIZATION/SAFETY — score candidate poses by render-match; overlap with blobs = collision cost.
  A.localize=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'Given a splat map: where am I, and how do I move without hitting anything?',C.dim);
    const cx=w*0.4,cy=h*0.52;for(let i=0;i<9;i++){const a=i*0.7;splat(ctx,cx+Math.cos(a)*32,cy+Math.sin(a)*24,13,10,a,C.violet,0.5);}
    label(ctx,cx-16,cy+44,'the map',C.mut);
    // candidate cameras with match %
    const best=Math.floor(saw(t,5)*5)%5;
    for(let i=0;i<5;i++){const a=(i/5)*TAU,r=Math.min(w,h)*0.42;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
      const on=i===best;cam(ctx,x,y,a+Math.PI,on?C.cyan:hexA(C.amber,0.5),9);
      label(ctx,x-10,y-14,(on?'94%':((40+i*8)+'%')),on?C.cyan:C.dim,10);
      if(on){label(ctx,x-14,y+16,'you are here',C.cyan);}}
    label(ctx,cx-60,cy-Math.min(w,h)*0.42-2,'render each guess, keep the best match',C.dim);
    // a path with an overlapping (unsafe) segment
    const py=h*0.9;ctx.strokeStyle=C.cyan;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(w*0.12,py);ctx.lineTo(w*0.5,py);ctx.stroke();
    ctx.strokeStyle=C.coral;ctx.beginPath();ctx.moveTo(w*0.5,py);ctx.lineTo(w*0.62,py);ctx.stroke();
    label(ctx,w*0.64,py,'red = path overlaps blobs → collision cost',C.mut);
  };

  // 20 MEDICAL — endoscope light is bolted to the camera; model the glare, and the tissue deforms.
  A.endo_light=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'An endoscope: a moving camera with its light bolted on, on wet moving tissue',C.dim);
    // scope tube from left
    const sy=h*0.5;ctx.fillStyle=hexA(C.mut,0.5);rrect(ctx,0,sy-14,w*0.22,28,6,C.line,hexA(C.mut,0.25));
    cam(ctx,w*0.22,sy,0,C.ink,11);
    // light cone
    ctx.fillStyle=hexA(C.amber,0.12);ctx.beginPath();ctx.moveTo(w*0.23,sy-8);ctx.lineTo(w*0.75,sy-h*0.22);ctx.lineTo(w*0.75,sy+h*0.22);ctx.lineTo(w*0.23,sy+8);ctx.closePath();ctx.fill();
    label(ctx,w*0.02,sy+26,'light rigidly attached to the camera',C.amber);
    // tissue surface, deforming
    ctx.strokeStyle=hexA(C.coral,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=40;i++){const x=w*0.55+ (w*0.4)*i/40;const y=sy+30*Math.sin(i/40*3+t*1.2)*0.5+ h*0.12*Math.sin(i/40*Math.PI);ctx.lineTo(x,y);}ctx.stroke();
    label(ctx,w*0.72,sy+h*0.24,'tissue deforms (non-rigid)',C.coral);
    // specular glare spot that moves with breathing — modeled, not baked
    const gx=w*0.68+10*Math.sin(t),gy=sy-6+8*Math.sin(t*1.2);
    splat(ctx,gx,gy,16,10,0,'#ffffff',0.7);label(ctx,gx-20,gy-18,'glare explained, not baked in',C.dim);
    label(ctx,14,h-10,'2D-Gaussian surfaces + a physical light model → sub-2mm depth a surgeon can trust',C.mut);
  };

  // 21 CREATIVE/VFX — the pipeline: capture → align → train → render-with-DoF → composite.
  A.vfx_pipe=function(ctx,w,h,t){clear(ctx,w,h);
    label(ctx,14,16,'Film wants real places as editable, relightable assets — in minutes',C.dim);
    const stages=[['5-cam rig','3-min capture'],['align','RealityCapture'],['train','a splat'],['render','+ depth of field'],['composite','one 3D layer']];
    const y=h*0.5,bw=w*0.155,gap=(w-0.04*w)/5;const active=Math.floor(saw(t,6)*5)%5;
    stages.forEach((s,i)=>{const x=w*0.02+i*gap,on=i<=active;
      rrect(ctx,x,y-26,bw,52,8,on?C.cyan:C.line,on?hexA(C.cyan,0.07):null);
      label(ctx,x+8,y-6,s[0],on?C.cyan:C.dim,11);label(ctx,x+8,y+10,s[1],on?C.mut:C.dim,9.5);
      if(i<4)arrow(ctx,x+bw+2,y,x+gap-2,y,on&&i<active?C.cyan:hexA(C.mut,0.4),1.4);});
    // focus ring illustration on the render stage
    const rx=w*0.02+3*gap+bw*0.5;
    if(active>=3){ctx.strokeStyle=hexA(C.amber,0.7);ctx.beginPath();ctx.arc(rx,y-40,7,0,TAU);ctx.stroke();label(ctx,rx-30,y-52,'defocus simulated in-render',C.amber);}
    label(ctx,14,h-10,'the depth-of-field is not in the scan — it is added at render time, because the splat is real geometry',C.mut);
  };

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
