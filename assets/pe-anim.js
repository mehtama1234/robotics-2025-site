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
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;String(s).split('\n').forEach(function(ln,i){ctx.fillText(ln,x,y+i*((size||10.5)+2));});ctx.restore();}
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
    if(p>0.92){ctx.strokeStyle=C.green;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(cx+R,cy,10,0,TAU);ctx.stroke();ctx.setLineDash([]);lab(ctx,'loop closure → snap out the drift',cx+R-40,cy+22,C.green,9.5);}
    else lab(ctx,'drift accumulates as you go…',cx+R-30,cy+22,C.coral,9.5);
    lab(ctx,'each new view refines both the map and where you are; returning to a seen place corrects the accumulated error',14,h-12,C.mut);
  };

  /* ---- per-family animators (pef_*) ---- */

  /* pef_stereo — cost volume: for each pixel, sweep candidate disparities, pick the best match */
  A.pef_stereo=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'STEREO MATCHING: sweep disparity candidates; the best match gives depth',w*0.04,16,C.dim,10.5);
    // left and right image strips
    const lx=w*0.04,rx=w*0.55,iy=h*0.24,iw=w*0.38,ih=h*0.28;
    rrect(ctx,lx,iy,iw,ih,5,C.cyan,null); lab(ctx,'left image',lx+2,iy-10,C.cyan,9.5);
    rrect(ctx,rx,iy,iw,ih,5,C.violet,null); lab(ctx,'right image',rx+2,iy-10,C.violet,9.5);
    // animated candidate pixel in left image
    const ph=saw(t,4);
    const qx=lx+iw*0.55, qy=iy+ih*0.5;
    dot(ctx,qx,qy,5,C.amber); lab(ctx,'query pixel',qx+8,qy-10,C.amber,9.5);
    // sweep candidates in right image: highlight the winning one
    const nCand=6; const spacing=iw/nCand;
    for(let k=0;k<nCand;k++){
      const cx2=rx+spacing*(k+0.5), cy2=iy+ih*0.5;
      const isWin=(k===2); // disparity candidate k=2 is the match
      const scanning=Math.floor(ph*nCand)===k;
      dot(ctx,cx2,cy2,scanning?6:3.5,scanning?C.amber:(isWin?C.green:hexA(C.violet,0.4)));
      if(isWin){
        ctx.strokeStyle=hexA(C.green,0.7);ctx.setLineDash([3,3]);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(qx,qy);ctx.lineTo(cx2,cy2);ctx.stroke();ctx.setLineDash([]);
      }
    }
    lab(ctx,'← candidate positions in right image (d=0..5) →',rx,iy+ih+12,C.mut,9);
    // cost curve below
    const bx=lx, by=h*0.66, bw=w*0.9, bh=h*0.2;
    const costs=[0.8,0.6,0.15,0.55,0.72,0.85];
    lab(ctx,'matching cost (lower = better match):',bx,by-10,C.dim,9.5);
    ctx.strokeStyle=hexA(C.ink,0.2);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.stroke();
    const barW=bw/costs.length-4;
    costs.forEach((c,k)=>{
      const bkx=bx+k*(bw/costs.length)+2;
      const bky=by+bh-bh*c;
      const isWin=k===2;
      ctx.fillStyle=isWin?C.green:hexA(C.cyan,0.5);
      ctx.fillRect(bkx,bky,barW,bh*c);
      lab(ctx,'d='+k,bkx+barW/2,by+bh+12,isWin?C.green:C.dim,9,'center');
    });
    lab(ctx,'pick d=2 → depth = f·B / 2',bx+bw*0.6,by+bh*0.35,C.green,10);
    lab(ctx,'depth = focal × baseline / disparity — wrong match = wrong depth',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_mono — scale ambiguity: relative depth map from one image, scale from anchor */
  A.pef_mono=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'MONOCULAR DEPTH: relative map from one image; scale needs an anchor',w*0.04,16,C.dim,10.5);
    // image on left
    const ix=w*0.04,iy=h*0.2,iw=w*0.28,ih=h*0.45;
    rrect(ctx,ix,iy,iw,ih,6,C.cyan,null); lab(ctx,'one RGB image',ix,iy-10,C.cyan,9.5);
    // perspective lines inside
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(ix+4,iy+ih-4);ctx.lineTo(ix+iw/2,iy+ih*0.35);
    ctx.moveTo(ix+iw-4,iy+ih-4);ctx.lineTo(ix+iw/2,iy+ih*0.35);ctx.stroke();
    // network box
    arrow(ctx,ix+iw+8,iy+ih*0.5,ix+iw+36,iy+ih*0.5,C.cyan,1.4);
    box(ctx,ix+iw+38,iy+ih*0.5-16,w*0.14,32,'ViT-L\ndepth',C.violet);
    // depth map gradient
    const dx=ix+iw+38+w*0.14+12, dy=iy, dw=w*0.22, dh=ih;
    const g=ctx.createLinearGradient(dx,dy+dh,dx,dy);
    g.addColorStop(0,hexA(C.coral,0.9));g.addColorStop(1,hexA(C.violet,0.4));
    ctx.fillStyle=g;ctx.fillRect(dx,dy,dw,dh);
    ctx.strokeStyle=hexA(C.cyan,0.4);ctx.lineWidth=1;ctx.strokeRect(dx,dy,dw,dh);
    lab(ctx,'relative depth',dx,dy-10,C.green,9.5);
    lab(ctx,'near (bright)',dx,dy+dh-8,C.coral,9);
    lab(ctx,'far (dim)',dx,dy+8,C.violet,9);
    // scale anchor
    const ax=dx+2,ay=dy+dh+16,aval=0.48;
    dot(ctx,dx+dw*0.5,dy+dh*aval,5,C.amber);
    ctx.strokeStyle=hexA(C.amber,0.6);ctx.setLineDash([3,3]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(dx+dw*0.5,dy+dh*aval);ctx.lineTo(dx+dw*0.5,ay-4);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'anchor: z=2.4m here',dx+dw*0.5+4,ay,C.amber,9.5);
    // scale animation
    const s=2.4/(aval+0.01);
    lab(ctx,'scale=2.4/0.48='+s.toFixed(1)+'m/unit',dx,ay+16,C.green,9.5);
    // bottom note
    const ph=saw(t,4);
    const note=ph<0.5?'relative only — works anywhere':'×scale → metric depth (needs anchor)';
    lab(ctx,note,w*0.04,h-8,ph<0.5?C.mut:C.green,9.5);
  };

  /* pef_flow — aperture problem: only perpendicular motion visible through a small window */
  A.pef_flow=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'OPTICAL FLOW: the aperture problem — a small window sees only perpendicular motion',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    // moving edge
    const ex=w*(0.1+ph*0.5), ey1=h*0.25, ey2=h*0.72;
    const angle=0.5; // tilted edge
    ctx.strokeStyle=hexA(C.amber,0.8);ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.moveTo(ex-30*Math.cos(angle),ey1-30*Math.sin(angle));
    ctx.lineTo(ex+30*Math.cos(angle),ey2+30*Math.sin(angle));
    ctx.stroke();
    // true motion arrow (horizontal)
    const mid_y=(ey1+ey2)/2;
    arrow(ctx,ex,mid_y,ex+28,mid_y,C.green,2);
    lab(ctx,'true motion',ex+32,mid_y-8,C.green,9.5);
    // aperture (small circle window)
    const aw=w*0.16;
    ctx.save();ctx.beginPath();ctx.arc(ex,mid_y,aw*0.5,0,TAU);ctx.clip();
    // inside aperture, only perp component visible
    ctx.fillStyle=hexA(C.dim,0.3);ctx.fillRect(0,0,w,h);
    arrow(ctx,ex,mid_y,ex+28*Math.cos(angle)*Math.cos(angle),mid_y+28*Math.sin(angle)*Math.cos(angle),C.coral,2);
    ctx.restore();
    ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ex,mid_y,aw*0.5,0,TAU);ctx.stroke();
    lab(ctx,'aperture',ex-20,mid_y-aw*0.5-10,C.cyan,9.5);
    lab(ctx,'perp. only →',ex-aw*0.4,mid_y+14,C.coral,9);
    // right: full dense field from integration
    const fx=w*0.7, fy=h*0.28, fw=w*0.26, fh=h*0.46;
    rrect(ctx,fx,fy,fw,fh,5,hexA(C.cyan,0.4),null);
    lab(ctx,'full flow field',fx+2,fy-10,C.cyan,9.5);
    const nr=5,nc=4;
    for(let i=0;i<nc;i++)for(let j=0;j<nr;j++){
      const px=fx+fw*(i+0.5)/nc, py=fy+fh*(j+0.5)/nr;
      const dx=fw*0.08*(1+0.3*Math.sin(t+i*0.5+j*0.3));
      arrow(ctx,px,py,px+dx,py,hexA(C.green,0.7),1.2);
    }
    lab(ctx,'integrate across window → resolve true 2D',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_vio — VIO: feature tracking + IMU pre-integration + sliding window BA */
  A.pef_vio=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'VISUAL-INERTIAL ODOMETRY: features + IMU → metric scale + drift-resilient pose',w*0.04,16,C.dim,10.5);
    const ph=saw(t,6);
    // camera trajectory (curved path)
    const n=20;
    const cx=w*0.08,cy=h*0.55,r=w*0.35;
    const pts=[];for(let k=0;k<n;k++){const a=(k/n)*Math.PI;pts.push([cx+a*w*0.45,cy-Math.sin(a)*h*0.28]);}
    // draw trajectory so far
    const show=Math.floor(ph*n)+1;
    ctx.strokeStyle=hexA(C.cyan,0.6);ctx.lineWidth=2;ctx.beginPath();
    pts.slice(0,show).forEach((p,k)=>k===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]));ctx.stroke();
    // camera icon at current position
    if(show>0){const p=pts[show-1];cam(ctx,p[0],p[1],0.3,C.amber);}
    // features (dots above the path, some tracked)
    const feats=[[0.15,0.2],[0.35,0.15],[0.55,0.22],[0.7,0.18],[0.85,0.25]];
    feats.forEach((f,k)=>{
      if(k<show-1){
        const px=w*f[0],py=h*f[1];
        dot(ctx,px,py,4,k<show-2?hexA(C.green,0.5):C.green);
        if(show>1&&k<show-1){
          const prev=pts[Math.max(0,show-2)];
          ctx.strokeStyle=hexA(C.green,0.3);ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(prev[0],prev[1]);ctx.lineTo(px,py);ctx.stroke();
        }
      }
    });
    lab(ctx,'tracked corners',w*0.16,h*0.12,C.green,9.5);
    // IMU bar on right
    const ix=w*0.72,iy=h*0.28,iw=w*0.22,ih=h*0.36;
    rrect(ctx,ix,iy,iw,ih,6,C.violet,null);lab(ctx,'IMU',ix+iw/2,iy-10,C.violet,9.5,'center');
    const accel=0.6+0.4*Math.sin(t*2.1);
    lab(ctx,'a: '+accel.toFixed(2)+'g',ix+8,iy+ih*0.3,C.ink,9.5);
    lab(ctx,'ω: '+(0.3*Math.cos(t)).toFixed(2)+' rad/s',ix+8,iy+ih*0.55,C.ink,9.5);
    lab(ctx,'→ metric scale',ix+8,iy+ih*0.8,C.amber,9.5);
    // sliding window label
    const wx=w*0.04,wy=h*0.82;
    lab(ctx,'sliding-window BA: jointly optimise last 10 keyframe poses + 3D points',wx,wy,C.dim,9.5);
    lab(ctx,'IMU pre-integration holds pose during 0.2 s of texture-less wall — feature tracking resumes after',wx,h-8,C.mut,9.5);
  };

  /* pef_slam_rt — loop closure: drift then snap */
  A.pef_slam_rt=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'SLAM LOOP CLOSURE: drift builds; recognising a revisited place snaps it out',w*0.04,16,C.dim,10.5);
    const ph=saw(t,6);
    const cx=w*0.5,cy=h*0.52,Rx=w*0.32,Ry=h*0.32;
    // correct loop (ellipse)
    ctx.strokeStyle=hexA(C.green,0.25);ctx.setLineDash([4,4]);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(cx,cy,Rx,Ry,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'true loop',cx-22,cy-Ry-10,hexA(C.green,0.5),9.5);
    // drifted trajectory
    const N=80;const showN=Math.min(Math.floor(ph*N),N);
    const closed=ph>0.88;
    ctx.strokeStyle=closed?C.cyan:C.coral;ctx.lineWidth=2;ctx.beginPath();
    for(let k=0;k<=showN;k++){
      const frac=k/N;
      const a=frac*TAU;
      const drift=closed?0:frac*frac*30;
      const x=cx+Math.cos(a)*(Rx+drift),y=cy+Math.sin(a)*(Ry+drift*0.6);
      k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }ctx.stroke();
    // camera icon at head
    {const frac=showN/N;const a=frac*TAU;const drift=closed?0:frac*frac*30;
     cam(ctx,cx+Math.cos(a)*(Rx+drift),cy+Math.sin(a)*(Ry+drift*0.6),a+Math.PI/2,C.amber);}
    // drift label
    if(!closed){
      const driftPx=(showN/N)*(showN/N)*30;
      lab(ctx,'drift: ~'+driftPx.toFixed(0)+' px',cx+Rx+8,cy,C.coral,9.5);
    }
    // loop closure marker
    if(closed){
      dot(ctx,cx+Rx,cy,8,C.green);
      lab(ctx,'loop closed → error redistributed',cx+Rx+10,cy-10,C.green,9.5);
      lab(ctx,'drift: 0 px ✓',cx+Rx+10,cy+10,C.green,9.5);
    }
    // pose graph nodes
    const nNodes=7;
    for(let k=0;k<nNodes;k++){
      const a=(k/nNodes)*TAU;
      dot(ctx,cx+Math.cos(a)*Rx*0.55,cy+Math.sin(a)*Ry*0.55,3,hexA(C.violet,0.6));
    }
    lab(ctx,'pose-graph nodes',cx-30,cy+4,hexA(C.violet,0.5),9);
    lab(ctx,'recognise a previous keyframe → add an edge → g2o redistributes accumulated error globally',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_feedfwd — feed-forward 3D: one transformer pass, pointmap out, no per-scene opt */
  A.pef_feedfwd=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'FEED-FORWARD 3D: one transformer pass predicts geometry + pose — no per-scene fitting',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    // two unposed images on left
    const iw=w*0.17, ih=h*0.24;
    [[w*0.04,h*0.22],[w*0.04,h*0.5]].forEach((pos,k)=>{
      rrect(ctx,pos[0],pos[1],iw,ih,5,k===0?C.cyan:C.violet,null);
      lab(ctx,'image '+(k+1),pos[0]+2,pos[1]-10,k===0?C.cyan:C.violet,9);
      lab(ctx,'no pose',pos[0]+2,pos[1]+ih-12,C.dim,8.5);
    });
    // arrow into transformer
    const midY=h*0.48;
    arrow(ctx,w*0.04+iw+4,midY,w*0.28,midY,C.cyan,1.4);
    // transformer box
    const tbx=w*0.28,tby=h*0.33,tbw=w*0.22,tbh=h*0.32;
    rrect(ctx,tbx,tby,tbw,tbh,8,C.amber,hexA(C.amber,0.06));
    lab(ctx,'ViT encoder',tbx+tbw/2,tby+tbh*0.3,C.amber,9.5,'center');
    lab(ctx,'+ decoder',tbx+tbw/2,tby+tbh*0.6,C.amber,9.5,'center');
    lab(ctx,'(DUSt3R)',tbx+tbw/2,tby+tbh*0.82,hexA(C.amber,0.6),8.5,'center');
    // output: pointmap
    arrow(ctx,tbx+tbw+4,tby+tbh*0.5,w*0.6,tby+tbh*0.5,C.green,1.4);
    const pmx=w*0.61,pmy=h*0.24,pmw=w*0.15,pmh=h*0.45;
    // pointmap dots
    for(let k=0;k<30;k++){
      const px2=pmx+jit(k)*pmw,py2=pmy+jit(k+10)*pmh;
      const d=jit(k+5);
      dot(ctx,px2,py2,2.5,d<0.4?C.cyan:d<0.7?C.violet:C.coral);
    }
    lab(ctx,'pointmap (HxWx3)',pmx,pmy-10,C.green,9.5);
    // pose readout
    const px2=w*0.78,py2=h*0.35,pw=w*0.18,pyh=h*0.2;
    rrect(ctx,px2,py2,pw,pyh,5,C.cyan,null);
    lab(ctx,'pose R,t',px2+pw/2,py2+pyh*0.35,C.cyan,9.5,'center');
    lab(ctx,'inferred',px2+pw/2,py2+pyh*0.7,hexA(C.cyan,0.6),8.5,'center');
    ctx.strokeStyle=hexA(C.green,0.5);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(pmx+pmw,pmy+pmh*0.35);ctx.lineTo(px2,py2+pyh*0.5);ctx.stroke();
    // time label
    const elapsed=ph*13;
    lab(ctx,'time: '+elapsed.toFixed(1)+'s   (vs ~8 min for COLMAP)',w*0.04,h-8,C.green,9.5);
  };

  /* pef_lidar — ICP: two point clouds, nearest-neighbour pairs, IRLS robust align */
  A.pef_lidar=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'LIDAR ICP: align two scans via iterated nearest-neighbour + robust weighting',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    const iter=Math.floor(ph*6); // 0..5
    // two point clouds (ring shape, one slightly offset + rotated)
    const cx=w*0.38,cy=h*0.52,R=h*0.26;
    // source cloud
    for(let k=0;k<20;k++){
      const a=(k/20)*TAU;
      dot(ctx,cx+Math.cos(a)*R,cy+Math.sin(a)*R*0.7,3,hexA(C.cyan,0.7));
    }
    // target cloud (offset by (drift, drift) decreasing with iter)
    const driftX=20*(1-iter/5), driftY=12*(1-iter/5);
    for(let k=0;k<20;k++){
      const a=(k/20)*TAU+0.25*(1-iter/5);
      const tx=cx+Math.cos(a)*R+driftX, ty=cy+Math.sin(a)*R*0.7+driftY;
      dot(ctx,tx,ty,3,hexA(C.coral,0.7));
    }
    lab(ctx,'source (cyan)',w*0.04,h*0.22,C.cyan,9.5);
    lab(ctx,'target (red)',w*0.04,h*0.28,C.coral,9.5);
    // draw a few correspondence lines
    for(let k=0;k<5;k++){
      const a=(k*4/20)*TAU;
      const sx2=cx+Math.cos(a)*R, sy2=cy+Math.sin(a)*R*0.7;
      const tx2=cx+Math.cos(a+0.25*(1-iter/5))*R+driftX, ty2=cy+Math.sin(a+0.25*(1-iter/5))*R*0.7+driftY;
      ctx.strokeStyle=hexA(C.amber,0.35);ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(sx2,sy2);ctx.lineTo(tx2,ty2);ctx.stroke();
    }
    // IRLS weight bars
    const bx=w*0.62,by=h*0.3,bw=w*0.3,bh=h*0.35;
    lab(ctx,'IRLS pair weights:',bx,by-10,C.dim,9.5);
    const weights=[0.9,0.85,0.1,0.88,0.05]; // two outliers
    weights.forEach((wt,k)=>{
      const barH=bh/weights.length-3;
      const bky=by+k*(bh/weights.length)+2;
      const wAdj=Math.max(wt,iter<2?wt:wt>0.5?0.9:0.04);
      ctx.fillStyle=wAdj<0.3?hexA(C.coral,0.4):hexA(C.green,0.55);
      ctx.fillRect(bx,bky,bw*wAdj,barH);
      ctx.strokeStyle=hexA(C.ink,0.15);ctx.lineWidth=1;ctx.strokeRect(bx,bky,bw,barH);
      lab(ctx,wAdj<0.3?'outlier':'inlier',bx+bw+4,bky+barH/2,wAdj<0.3?C.coral:C.green,8.5);
    });
    // iteration counter
    lab(ctx,'iter '+iter+'/5  —  rot error: '+(8*(1-iter/5)).toFixed(1)+'°',bx,by+bh+16,C.amber,9.5);
    lab(ctx,'nearest-neighbour pairs + robust kernel → converge to correct alignment in ~15 ms',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_loopclosure — descriptor similarity + geometric verification */
  A.pef_loopclosure=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'PLACE RECOGNITION: encode → nearest-neighbour search → geometric verify → loop edge',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    // query frame
    const qx=w*0.04,qy=h*0.22,qw=w*0.16,qh=h*0.25;
    rrect(ctx,qx,qy,qw,qh,5,C.amber,null);
    lab(ctx,'query\nframe 1204',qx+qw/2,qy+qh*0.45,C.amber,9,'center');
    // descriptor vector
    const descW=w*0.18,descH=10;
    const descX=qx+qw+10,descY=qy+qh*0.5-descH/2;
    const descVals=[0.8,0.4,0.6,0.3,0.7,0.5,0.9,0.2];
    descVals.forEach((v,k)=>{
      const bx2=descX+k*(descW/descVals.length);
      ctx.fillStyle=hexA(C.amber,0.7);
      ctx.fillRect(bx2,descY-descH*v*0.5,descW/descVals.length-1,descH*v);
    });
    lab(ctx,'4096-D descriptor',descX,descY-descH*0.5-10,C.dim,8.5);
    arrow(ctx,descX+descW+4,qy+qh*0.5,w*0.52,qy+qh*0.5,C.cyan,1.2);
    // database frames
    lab(ctx,'database (1203 frames):',w*0.53,qy-10,C.dim,9);
    const dbx=w*0.53,dby=qy+4,dbw=w*0.15,dbh=h*0.18;
    const sims=[0.42,0.55,0.91,0.38];
    sims.forEach((s,k)=>{
      const fx=dbx+k*(dbw+5),isMatch=k===2;
      rrect(ctx,fx,dby,dbw,dbh,4,isMatch?C.green:hexA(C.violet,0.5),null);
      lab(ctx,isMatch?'frame 47':'f '+k,fx+dbw/2,dby+dbh*0.45,isMatch?C.green:hexA(C.violet,0.6),8.5,'center');
      lab(ctx,'sim='+s.toFixed(2),fx+dbw/2,dby+dbh*0.75,isMatch?C.amber:C.dim,8,'center');
    });
    // geometric verify arrow
    if(ph>0.4){
      arrow(ctx,dbx+2*(dbw+5)+dbw*0.5,dby+dbh+4,dbx+2*(dbw+5)+dbw*0.5,h*0.55,C.green,1.2);
      lab(ctx,'RANSAC verify: 128 inliers',dbx+2*(dbw+5)-10,h*0.58,C.green,9.5);
    }
    // loop edge
    if(ph>0.7){
      const lx1=w*0.25,ly1=h*0.78,lx2=w*0.55,ly2=h*0.78;
      dot(ctx,lx1,ly1,5,C.cyan);dot(ctx,lx2,ly2,5,C.cyan);
      ctx.strokeStyle=C.green;ctx.lineWidth=1.8;ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.moveTo(lx1,ly1);ctx.lineTo(lx2,ly2);ctx.stroke();ctx.setLineDash([]);
      lab(ctx,'frame 1',lx1-10,ly1+14,C.cyan,9);lab(ctx,'frame 1204',lx2-20,ly2+14,C.cyan,9);
      lab(ctx,'loop edge added → pose-graph optimization → 3.2m gap → 0.08m',w*0.04,h-8,C.green,9.5);
    } else {
      lab(ctx,'find the most similar descriptor → verify geometry → add loop constraint',w*0.04,h-8,C.mut,9.5);
    }
  };

  /* pef_dense — TSDF fusion: depth votes into voxels, marching-cubes surface */
  A.pef_dense=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'DENSE RECONSTRUCTION: per-voxel TSDF votes from depth frames → mesh',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    const frames=Math.floor(ph*60)+1;
    // voxel grid
    const gx=w*0.08,gy=h*0.22,gw=w*0.35,gh=h*0.5,cols=8,rows=7;
    const cellW=gw/cols, cellH=gh/rows;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
      const cx2=gx+i*cellW, cy2=gy+j*cellH;
      // TSDF: positive (empty), negative (inside object), near-zero (surface)
      const dist=Math.abs(j-rows*0.5)/rows+Math.abs(i-cols*0.5)/cols;
      const filled=frames>8&&dist<0.28+frames*0.003;
      const surface=filled&&dist>0.18+frames*0.003;
      ctx.fillStyle=surface?hexA(C.cyan,0.7):filled?hexA(C.dim,0.3):hexA(C.line,0.2);
      ctx.fillRect(cx2+1,cy2+1,cellW-2,cellH-2);
      ctx.strokeStyle=hexA(C.line,0.3);ctx.lineWidth=0.5;ctx.strokeRect(cx2,cy2,cellW,cellH);
    }
    lab(ctx,'voxel grid (TSDF)',gx,gy-10,C.dim,9.5);
    lab(ctx,'frame '+frames+'/60',gx,gy+gh+12,C.cyan,9.5);
    // camera
    cam(ctx,gx-20,gy+gh*0.45,0,C.amber);
    arrow(ctx,gx-10,gy+gh*0.45,gx+2,gy+gh*0.45,C.amber,1.2);
    // surface mesh (marching cubes result)
    const mx=w*0.52, my=h*0.3, mr=h*0.2;
    lab(ctx,'extracted mesh',mx,my-10,C.green,9.5);
    ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.4;
    ctx.beginPath();
    for(let k=0;k<12;k++){const a=(k/12)*TAU;const r2=mr*(0.8+0.2*Math.sin(k*1.7));
      const px2=mx+Math.cos(a)*r2,py2=my+Math.sin(a)*r2*0.6;k===0?ctx.moveTo(px2,py2):ctx.lineTo(px2,py2);}
    ctx.closePath();ctx.stroke();
    // splat upgrade note
    if(ph>0.6){
      lab(ctx,'+ Gaussian splats',mx+mr+8,my,C.violet,9.5);
      for(let k=0;k<6;k++){const a=k*1.0;
        dot(ctx,mx+Math.cos(a)*mr*0.6,my+Math.sin(a)*mr*0.4,3.5,hexA(C.violet,0.6));}
    }
    // dynamic removal
    const dyn=w*0.72,dyy=h*0.45;
    rrect(ctx,dyn,dyy-14,w*0.22,28,5,C.coral,null);
    lab(ctx,'moving hand → exclude',dyn+4,dyy,C.coral,9,'center');
    lab(ctx,'DGS-SLAM flags dynamic objects via flow; static mesh stays clean',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_event — event camera: asynchronous per-pixel brightness-change stream */
  A.pef_event=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'EVENT CAMERA: each pixel fires when brightness changes — microsecond latency',w*0.04,16,C.dim,10.5);
    const ph=saw(t,3);
    // pixel grid showing events firing
    const gx=w*0.04, gy=h*0.22, cols=10, rows=6;
    const cw=w*0.38/cols, ch=h*0.42/rows;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
      const cx2=gx+i*cw, cy2=gy+j*ch;
      const phase=(i+j*2)/15;
      const active=((t*3+phase)%1)<0.12;
      const polarity=Math.sin(i*2.1+j*1.3)>0;
      ctx.fillStyle=active?(polarity?hexA(C.cyan,0.9):hexA(C.coral,0.9)):hexA(C.line,0.2);
      ctx.fillRect(cx2+1,cy2+1,cw-2,ch-2);
    }
    lab(ctx,'pixel array — cyan=ON, red=OFF',gx,gy-10,C.dim,9.5);
    // spinning propeller outline (fast motion)
    const ox=w*0.3,oy=gy+h*0.42*0.5,oR=h*0.15;
    const ang=t*4.0;
    ctx.strokeStyle=hexA(C.amber,0.6);ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(ox-Math.cos(ang)*oR,oy-Math.sin(ang)*oR);ctx.lineTo(ox+Math.cos(ang)*oR,oy+Math.sin(ang)*oR);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ox-Math.cos(ang+Math.PI/2)*oR*0.7,oy-Math.sin(ang+Math.PI/2)*oR*0.7);ctx.lineTo(ox+Math.cos(ang+Math.PI/2)*oR*0.7,oy+Math.sin(ang+Math.PI/2)*oR*0.7);ctx.stroke();
    lab(ctx,'180 rad/s\npropeller',ox-18,oy+oR+14,C.amber,9);
    // right: event stream timeline
    const sx=w*0.52,sy=h*0.24,sw=w*0.42,sh=h*0.42;
    rrect(ctx,sx,sy,sw,sh,5,hexA(C.dim,0.3),null);
    lab(ctx,'event stream (1 ms window):',sx+2,sy-10,C.dim,9.5);
    for(let k=0;k<40;k++){
      const ex2=sx+jit(k)*sw, ey2=sy+jit(k+5)*sh;
      const pol=jit(k+10)>0.5;
      dot(ctx,ex2,ey2,2,pol?C.cyan:C.coral);
    }
    // comparison: standard frame = blur
    const bx=sx,by=sy+sh+14;
    lab(ctx,'standard frame at 30Hz: blurred',bx,by,hexA(C.coral,0.7),9.5);
    lab(ctx,'events at 1ms: sharp edges',bx,by+16,C.cyan,9.5);
    lab(ctx,'140 dB dynamic range  •  10 mW power  •  no shutter smear',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_icp — ICP iteration: correspondences and residual convergence */
  A.pef_icp=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'POINT-CLOUD REGISTRATION (ICP): alternate nearest-neighbour + transform until aligned',w*0.04,16,C.dim,10.5);
    const ph=saw(t,6);
    const iters=Math.floor(ph*12);
    // two L-shaped clouds: source and target offset by decreasing amount
    const cx2=w*0.38,cy2=h*0.5;
    const off=18*(1-iters/12), rotOff=0.5*(1-iters/12);
    const srcPts=[];const tgtPts=[];
    for(let k=0;k<16;k++){
      const a=(k/16)*TAU;
      const r=h*0.22*(0.7+0.3*Math.abs(Math.cos(a*2)));
      srcPts.push([cx2+Math.cos(a)*r,cy2+Math.sin(a)*r]);
      tgtPts.push([cx2+Math.cos(a+rotOff)*r+off,cy2+Math.sin(a+rotOff)*r+off*0.6]);
    }
    // draw target
    ctx.beginPath();tgtPts.forEach((p,k)=>k===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]));
    ctx.closePath();ctx.strokeStyle=hexA(C.coral,0.7);ctx.lineWidth=1.5;ctx.stroke();
    // draw source
    ctx.beginPath();srcPts.forEach((p,k)=>k===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]));
    ctx.closePath();ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=1.5;ctx.stroke();
    // correspondences (5 pairs)
    for(let k=0;k<5;k++){
      const si=Math.floor(k*16/5);
      const sp=srcPts[si],tp=tgtPts[si];
      const dist2=Math.hypot(sp[0]-tp[0],sp[1]-tp[1]);
      const isOut=dist2>22;
      ctx.strokeStyle=hexA(isOut?C.coral:C.amber,0.4);ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(sp[0],sp[1]);ctx.lineTo(tp[0],tp[1]);ctx.stroke();
    }
    lab(ctx,'source',cx2-h*0.22-24,cy2,C.cyan,9.5);
    lab(ctx,'target',cx2+h*0.22+off+8,cy2,C.coral,9.5);
    // convergence curve on right
    const cvx=w*0.65,cvy=h*0.24,cvw=w*0.28,cvh=h*0.42;
    lab(ctx,'residual error:',cvx,cvy-10,C.dim,9.5);
    ctx.strokeStyle=hexA(C.ink,0.15);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(cvx,cvy);ctx.lineTo(cvx,cvy+cvh);ctx.lineTo(cvx+cvw,cvy+cvh);ctx.stroke();
    ctx.strokeStyle=C.green;ctx.lineWidth=1.8;ctx.beginPath();
    for(let k=0;k<=12;k++){
      const ex2=cvx+k*cvw/12;
      const ey2=cvy+cvh*(1-Math.exp(-k*0.4));
      k===0?ctx.moveTo(ex2,ey2):ctx.lineTo(ex2,ey2);
    }ctx.stroke();
    const curX=cvx+iters*cvw/12,curE=cvh*(1-Math.exp(-iters*0.4));
    dot(ctx,curX,cvy+curE,4,C.amber);
    lab(ctx,'iter '+iters,curX-10,cvy+curE-12,C.amber,8.5);
    lab(ctx,'IRLS weights suppress outlier pairs; Lie-algebra SVD avoids gimbal lock',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_depthcomp — sparse LiDAR hits + RGB → dense depth map */
  A.pef_depthcomp=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'DEPTH COMPLETION: 1.8% sparse LiDAR + full RGB → dense per-pixel depth',w*0.04,16,C.dim,10.5);
    const ph=saw(t,4);
    const iw=w*0.26,ih=h*0.38;
    // sparse LiDAR
    const lx=w*0.04,ly=h*0.23;
    rrect(ctx,lx,ly,iw,ih,5,C.line,hexA(C.line,0.15));
    lab(ctx,'sparse LiDAR (1.8%)',lx,ly-10,C.dim,9.5);
    for(let k=0;k<22;k++){
      const px2=lx+jit(k)*iw, py2=ly+jit(k+5)*ih;
      const z=jit(k+10);
      dot(ctx,px2,py2,2.5,z<0.4?C.coral:z<0.7?C.amber:C.cyan);
    }
    // RGB image
    const rx=w*0.04,ry=h*0.65;
    rrect(ctx,rx,ry,iw,h*0.24,5,C.violet,null);
    lab(ctx,'RGB image',rx,ry-10,C.violet,9.5);
    ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(rx+4,ry+h*0.24-4);ctx.lineTo(rx+iw/2,ry+6);
    ctx.moveTo(rx+iw-4,ry+h*0.24-4);ctx.lineTo(rx+iw/2,ry+6);ctx.stroke();
    // fusion network
    const nx=w*0.38,ny=h*0.42,nw=w*0.18,nh=h*0.2;
    arrow(ctx,lx+iw+4,ly+ih*0.5,nx,ny+nh*0.35,C.cyan,1.2);
    arrow(ctx,rx+iw+4,ry+h*0.12,nx,ny+nh*0.65,C.violet,1.2);
    rrect(ctx,nx,ny,nw,nh,6,C.amber,hexA(C.amber,0.06));
    lab(ctx,'DA-Fusion',nx+nw/2,ny+nh*0.35,C.amber,9.5,'center');
    lab(ctx,'(def. attn)',nx+nw/2,ny+nh*0.7,hexA(C.amber,0.6),8.5,'center');
    // dense depth map output
    const dx2=nx+nw+12,dy2=h*0.23,dw2=w*0.35,dh2=h*0.6;
    const grad=ctx.createLinearGradient(dx2,dy2+dh2,dx2,dy2);
    grad.addColorStop(0,hexA(C.coral,0.85));grad.addColorStop(0.5,hexA(C.amber,0.6));grad.addColorStop(1,hexA(C.violet,0.4));
    ctx.fillStyle=grad;ctx.fillRect(dx2,dy2,dw2,dh2);
    ctx.strokeStyle=hexA(C.ink,0.2);ctx.lineWidth=1;ctx.strokeRect(dx2,dy2,dw2,dh2);
    lab(ctx,'dense depth',dx2,dy2-10,C.green,9.5);
    // glass door annotation
    if(ph>0.5){
      const gdx=dx2+dw2*0.6,gdy=dy2+dh2*0.3;
      dot(ctx,gdx,gdy,4,C.coral);
      lab(ctx,'glass door: 0 LiDAR hits',gdx+4,gdy-10,C.coral,9);
      lab(ctx,'→ filled from RGB (±4cm)',gdx+4,gdy+8,C.green,9);
    }
    lab(ctx,'RMSE 0.74m vs 1.6m bilinear — deformable attention aligns the 3px cam-LiDAR offset',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_pose6d — 2D keypoints → 3D CAD correspondences → PnP → 6-DoF pose */
  A.pef_pose6d=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'6D POSE ESTIMATION: 2D keypoints + 3D CAD model → PnP → full 6-DoF pose',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    // object in image (bottle silhouette)
    const ox=w*0.16,oy=h*0.35,ow=w*0.12,oh=h*0.42;
    rrect(ctx,ox,oy,ow,oh,8,C.violet,null);
    lab(ctx,'RGB image',ox,oy-10,C.violet,9.5);
    // 2D keypoints
    const kp2d=[[0.3,0.2],[0.5,0.15],[0.7,0.4],[0.4,0.7],[0.8,0.75]];
    kp2d.forEach((k,i)=>{
      dot(ctx,ox+ow*k[0],oy+oh*k[1],4,C.amber);
    });
    lab(ctx,'2D keypoints',ox-2,oy+oh+12,C.amber,9);
    // CAD model on right
    const mx=w*0.38,my=h*0.28,mR=h*0.22;
    lab(ctx,'CAD model',mx,my-10,C.cyan,9.5);
    for(let k=0;k<16;k++){const a=(k/16)*TAU;dot(ctx,mx+Math.cos(a)*mR*0.8,my+Math.sin(a)*mR,2.5,hexA(C.cyan,0.6));}
    for(let k=0;k<16;k++){const a=(k/16)*TAU;dot(ctx,mx+Math.cos(a)*mR*0.4,my+Math.sin(a)*mR*0.5+mR*0.2,2,hexA(C.cyan,0.4));}
    // 3D keypoints on CAD
    const kp3d=[[0.0,-0.9],[0.5,-0.7],[-0.4,0.1],[0.0,0.6],[0.6,0.5]];
    kp3d.forEach((k,i)=>{
      dot(ctx,mx+k[0]*mR*0.7,my+k[1]*mR*0.85,4.5,C.amber);
    });
    // correspondence lines
    if(ph>0.3){
      kp2d.forEach((k2,i)=>{
        const k3=kp3d[i];
        ctx.strokeStyle=hexA(C.amber,0.3);ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(ox+ow*k2[0],oy+oh*k2[1]);ctx.lineTo(mx+k3[0]*mR*0.7,my+k3[1]*mR*0.85);
        ctx.stroke();
      });
    }
    // PnP box
    const pbx=w*0.62,pby=h*0.38,pbw=w*0.14,pbh=h*0.18;
    arrow(ctx,mx+mR+4,my,pbx,pby+pbh*0.5,C.cyan,1.2);
    rrect(ctx,pbx,pby,pbw,pbh,6,C.green,null);
    lab(ctx,'PnP\nRANSAC',pbx+pbw/2,pby+pbh*0.45,C.green,9.5,'center');
    // pose readout
    if(ph>0.55){
      const rrx=pbx+pbw+8,rry=pby;
      lab(ctx,'R: 0.6° err',rrx,rry+pbh*0.15,C.green,9.5);
      lab(ctx,'t: 4mm err',rrx,rry+pbh*0.45,C.green,9.5);
      lab(ctx,'→ 94% grasp',rrx,rry+pbh*0.75,C.amber,9.5);
    }
    lab(ctx,'14 keypoint correspondences + PnP in 3ms → 0.6° rotation, 4mm translation error',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_fourd — static vs moving: 3D shape + per-pixel motion vectors from one pass */
  A.pef_fourd=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'4D RECONSTRUCTION: geometry AND motion together — one feed-forward pass',w*0.04,16,C.dim,10.5);
    const ph=saw(t,6);
    const frame=Math.floor(ph*48);
    // static background (wall) — near-zero vectors
    const gy=h*0.24,gx=w*0.04,gw=w*0.4,gh=h*0.5;
    rrect(ctx,gx,gy,gw,gh,4,hexA(C.line,0.4),hexA(C.line,0.08));
    lab(ctx,'static background',gx+4,gy+8,C.dim,9);
    for(let i=0;i<6;i++)for(let j=0;j<4;j++){
      const px2=gx+gw*(i+0.5)/6, py2=gy+gh*(j+0.5)/4;
      arrow(ctx,px2,py2,px2+1.5,py2,hexA(C.mut,0.4),1);
    }
    // moving arm (animated arc)
    const armAngle=-0.6+frame*0.028;
    const sx=gx+gw*0.55,sy=gy+gh*0.3,ar=gh*0.38;
    ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+Math.cos(armAngle)*ar,sy+Math.sin(armAngle)*ar);ctx.stroke();
    dot(ctx,sx+Math.cos(armAngle)*ar,sy+Math.sin(armAngle)*ar,7,C.amber);
    // motion vectors on arm
    const nx=Math.cos(armAngle+Math.PI/2)*12, ny=Math.sin(armAngle+Math.PI/2)*12;
    for(let k=1;k<=4;k++){
      const f=k/5;
      const px2=sx+Math.cos(armAngle)*ar*f, py2=sy+Math.sin(armAngle)*ar*f;
      arrow(ctx,px2,py2,px2+nx,py2+ny,C.cyan,1.4);
    }
    // right panel: wrist trajectory
    const tx=w*0.52,ty=h*0.24,tw=w*0.42,th=h*0.5;
    rrect(ctx,tx,ty,tw,th,5,hexA(C.line,0.2),null);
    lab(ctx,'wrist 3D path (0.62m over 48 frames):',tx+4,ty-10,C.dim,9);
    const trajN=Math.min(frame+1,48);
    ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=1.5;ctx.beginPath();
    for(let k=0;k<trajN;k++){
      const f=k/47;const px2=tx+tw*(0.15+f*0.7),py2=ty+th*(0.65-f*0.4);
      k===0?ctx.moveTo(px2,py2):ctx.lineTo(px2,py2);
    }ctx.stroke();
    if(trajN>0){const f=(trajN-1)/47;dot(ctx,tx+tw*(0.15+f*0.7),ty+th*(0.65-f*0.4),4,C.amber);}
    lab(ctx,'frame '+frame+'/48',tx+4,ty+th+12,C.cyan,9);
    lab(ctx,'arm travels 0.62m — matched to motion-capture within 1.8cm; wall shows 0.3mm RMS motion',w*0.04,h-8,C.mut,9.5);
  };

  /* pef_diffprior — diffusion denoising: depth as conditional generation */
  A.pef_diffprior=function(ctx,w,h,t){
    clear(ctx,w,h);
    lab(ctx,'DIFFUSION DEPTH PRIOR: depth = conditional generation — the prior knows what 3D looks like',w*0.04,16,C.dim,10.5);
    const ph=saw(t,5);
    const steps=20;
    const curStep=Math.floor(ph*steps);
    // left: noisy → clean depth
    const dx=w*0.04,dy=h*0.24,dw=w*0.24,dh=h*0.45;
    const noise=Math.max(0,1-curStep/steps);
    // draw depth-as-gradient with noise overlay
    const g=ctx.createLinearGradient(dx,dy+dh,dx,dy);
    g.addColorStop(0,hexA(C.coral,0.9));g.addColorStop(1,hexA(C.violet,0.5));
    ctx.fillStyle=g;ctx.fillRect(dx,dy,dw,dh);
    // noise overlay
    for(let k=0;k<60;k++){
      const nx2=dx+jit(k)*dw,ny2=dy+jit(k+5)*dh;
      ctx.fillStyle=hexA(C.ink,noise*0.6);ctx.fillRect(nx2,ny2,3,3);
    }
    ctx.strokeStyle=hexA(C.cyan,0.4);ctx.lineWidth=1;ctx.strokeRect(dx,dy,dw,dh);
    lab(ctx,'step '+curStep+'/'+steps,dx,dy-10,C.dim,9.5);
    // denoising arrow
    const arX=dx+dw+10,arY=dy+dh*0.5;
    arrow(ctx,arX,arY,arX+w*0.12,arY,C.cyan,1.4);
    lab(ctx,'denoise\n(20 steps)',arX+4,arY-14,C.dim,8.5);
    // diffusion U-Net box
    const ux=arX+w*0.14,uy=dy,uw=w*0.17,uh=dh;
    rrect(ctx,ux,uy,uw,uh,7,C.violet,hexA(C.violet,0.05));
    lab(ctx,'diffusion',ux+uw/2,uy+uh*0.3,C.violet,9.5,'center');
    lab(ctx,'U-Net',ux+uw/2,uy+uh*0.55,C.violet,9.5,'center');
    lab(ctx,'cond. on image',ux+uw/2,uy+uh*0.8,hexA(C.violet,0.6),8,'center');
    // output depth
    arrow(ctx,ux+uw+4,uy+uh*0.5,w*0.73,uy+uh*0.5,C.green,1.4);
    const ox2=w*0.74,oy2=dy,ow2=w*0.22,oh2=dh;
    const g2=ctx.createLinearGradient(ox2,oy2+oh2,ox2,oy2);
    g2.addColorStop(0,hexA(C.coral,noise<0.3?0.95:0.4));g2.addColorStop(1,hexA(C.violet,noise<0.3?0.6:0.2));
    ctx.fillStyle=g2;ctx.fillRect(ox2,oy2,ow2,oh2);
    ctx.strokeStyle=hexA(C.green,0.5);ctx.lineWidth=1;ctx.strokeRect(ox2,oy2,ow2,oh2);
    lab(ctx,'clean depth',ox2,oy2-10,C.green,9.5);
    // accuracy readout
    const acc=0.74+0.17*(curStep/steps);
    lab(ctx,'d1 accuracy: '+acc.toFixed(2),ox2,oy2+oh2+14,curStep>15?C.green:C.mut,9.5);
    // foggy scene note
    lab(ctx,'foggy forest: out-of-distribution for regression; diffusion prior generalises (d1=0.91 vs 0.74)',w*0.04,h-8,C.mut,9.5);
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
