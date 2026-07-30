/* dr-anim.js — first-principles mechanism animators for the Autonomous-Driving explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-dranim="name". Self-contained boot. */
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
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=6;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function car(ctx,x,y,col,s){s=s||1;ctx.fillStyle=col;rrect(ctx,x-9*s,y-6*s,18*s,12*s,3,null,col);}
  const saw=(t,p)=>((t%p)/p);
  const A={};

  /* 01 — THE STACK: sense -> perceive -> predict -> plan -> act, on a tight onboard clock. */
  A.dr_stack=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The self-driving loop: five stages, on a small onboard computer, many times a second',14,16,C.dim);
    const stages=[['sense','cameras · LiDAR · radar',C.cyan],['perceive','what & where (BEV)',C.violet],
      ['predict','where things go next',C.amber],['plan','a safe trajectory',C.green],['act','steer · brake',C.ink]];
    const n=stages.length,bw=w*0.155,y=h*0.46,gap=(w-0.04*w-n*bw)/(n-1);
    const lit=Math.floor(saw(t,4)*n)%n;
    stages.forEach((s,i)=>{const x=w*0.02+i*(bw+gap),on=i<=lit;
      rrect(ctx,x,y-22,bw,44,7,on?s[2]:C.line,on?hexA(s[2],0.08):null);
      lab(ctx,s[0],x+bw/2,y-6,on?s[2]:C.mut,11,'center');lab(ctx,s[1],x+bw/2,y+11,on?C.mut:C.dim,8.5,'center');
      if(i<n-1)arrow(ctx,x+bw+2,y,x+bw+gap-2,y,on&&i<lit?s[2]:hexA(C.mut,0.4),1.4);});
    // loop back
    arrow(ctx,w*0.9,y+30,w*0.1,y+30,hexA(C.mut,0.4),1.2);lab(ctx,'…then look again',w*0.44,y+42,C.dim,9.5);
    lab(ctx,'every stage must fit a real-time budget — accuracy that misses the deadline is useless',14,h-12,C.mut);
  };

  /* 02 — BEV: lift multi-camera 2D features into one top-down bird's-eye grid. */
  A.dr_bev=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bird’s-eye view: fuse many cameras into one top-down map the planner can use',14,16,C.dim);
    // ego with surrounding camera frustums (left)
    const ex=w*0.24,ey=h*0.52;car(ctx,ex,ey,C.cyan,1.4);
    for(let k=0;k<4;k++){const a=k*TAU/4+Math.PI/4;ctx.fillStyle=hexA(C.amber,0.12);
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+Math.cos(a-0.4)*70,ey+Math.sin(a-0.4)*50);ctx.lineTo(ex+Math.cos(a+0.4)*70,ey+Math.sin(a+0.4)*50);ctx.closePath();ctx.fill();}
    lab(ctx,'surround cameras',ex-34,ey+70,C.mut,9.5);
    arrow(ctx,w*0.4,ey,w*0.5,ey,C.ink,1.6);lab(ctx,'lift → BEV',w*0.4,ey-12,C.dim,9.5);
    // BEV grid (right, top-down)
    const gx=w*0.55,gy=h*0.28,cs=Math.min(20,(h*0.44)/6);
    ctx.strokeStyle=hexA(C.mut,0.3);for(let i=0;i<=6;i++){ctx.beginPath();ctx.moveTo(gx+i*cs,gy);ctx.lineTo(gx+i*cs,gy+6*cs);ctx.stroke();ctx.beginPath();ctx.moveTo(gx,gy+i*cs);ctx.lineTo(gx+6*cs,gy+i*cs);ctx.stroke();}
    car(ctx,gx+3*cs,gy+5*cs,C.cyan,1);// ego
    // other agents
    const oy=gy+ (2- (saw(t,4)*1.5))*cs;car(ctx,gx+3*cs,oy,C.coral,1);dot(ctx,gx+1.5*cs,gy+3*cs,4,C.amber);
    lab(ctx,'top-down grid: ego + others + free space',gx-2,gy+6*cs+14,C.green,9.5);
    lab(ctx,'a single common frame where detection, prediction and planning all live',14,h-12,C.mut);
  };

  /* 03 — SENSOR FUSION: each sensor is blind in a different way; fuse to see completely. */
  A.dr_fusion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Every sensor is blind in a different way — fuse them to see the whole picture',14,16,C.dim);
    const rows=[['CAMERA','rich color & semantics · no true depth',C.cyan],
                ['LiDAR','precise 3D depth · no color, sparse far away',C.violet],
                ['RADAR','velocity, sees through rain/fog · low resolution',C.amber]];
    rows.forEach((r,i)=>{const y=h*0.3+i*h*0.16;box(ctx,w*0.05,y-13,w*0.14,26,r[0],r[2]);
      lab(ctx,r[1],w*0.21,y,C.mut,9.5);arrow(ctx,w*0.62,y,w*0.7,h*0.46,hexA(r[2],0.7),1.3);});
    box(ctx,w*0.71,h*0.38,w*0.16,h*0.16,'fuse',C.green,hexA(C.green,0.06));
    arrow(ctx,w*0.87,h*0.46,w*0.93,h*0.46,C.green,1.6);
    lab(ctx,'complete scene',w*0.8,h*0.6,C.green,9.5);
    lab(ctx,'color from the camera, depth from LiDAR, motion-through-weather from radar → one robust view',14,h-12,C.mut);
  };

  /* 04 — MODULAR vs END-TO-END: a cascade that compounds error vs one net (and the VLA middle path). */
  A.dr_modular=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Two ways to wire it: a modular cascade, or one end-to-end net',14,16,C.dim);
    // top: modular chain, error growing
    const ty=h*0.36,stg=['detect','track','predict','plan'];const bw=w*0.15,gap=(w*0.82-4*bw)/3;
    lab(ctx,'modular: each stage feeds the next',14,ty-26,C.violet,10);
    stg.forEach((s,i)=>{const x=w*0.06+i*(bw+gap);box(ctx,x,ty-13,bw,26,s,C.violet);
      if(i<3){arrow(ctx,x+bw+2,ty,x+bw+gap-2,ty,hexA(C.violet,0.7),1.3);
        // growing error blip
        ctx.fillStyle=hexA(C.coral,0.4+i*0.18);ctx.beginPath();ctx.arc(x+bw+gap/2,ty-18,2+i*1.5,0,TAU);ctx.fill();}});
    lab(ctx,'interpretable, but small errors compound down the chain ✗',w*0.06,ty+24,C.coral,9.5);
    // bottom: end-to-end
    const by=h*0.74;lab(ctx,'end-to-end (+ VLA reasoning):',14,by-26,C.green,10);
    box(ctx,w*0.06,by-16,w*0.2,32,'sensors',C.cyan);arrow(ctx,w*0.27,by,w*0.37,by,C.green,1.8);
    box(ctx,w*0.38,by-18,w*0.26,36,'one network → plan',C.green,hexA(C.green,0.06));
    arrow(ctx,w*0.65,by,w*0.72,by,C.green,1.6);box(ctx,w*0.73,by-14,w*0.2,28,'trajectory',C.ink);
    lab(ctx,'higher performance, but a black box — VLAs add readable reasoning back in',w*0.06,by+26,C.mut,9.5);
  };

  /* 05 — THE LONG TAIL: common cases are easy; rare events dominate risk; open-loop metrics lie. */
  A.dr_longtail=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The long tail: 99% of driving is easy — the last 1% is where crashes live',14,16,C.dim);
    const ax=w*0.08,base=h*0.62,aw=w*0.84;
    // distribution: fat head, long thin tail
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=80;i++){const u=i/80,x=ax+aw*u;const y=base-(Math.exp(-Math.pow(u/0.12,2))*h*0.38 + Math.exp(-u*2.5)*4);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'common (highway, empty road)',ax+10,base-h*0.34,C.cyan,9.5);
    // tail events
    ['cut-in','jaywalker','debris','kid + ball'].forEach((e,i)=>{const x=ax+aw*(0.4+i*0.14);dot(ctx,x,base-6,3,C.coral);lab(ctx,e,x-14,base-16,C.coral,8.5);});
    lab(ctx,'rare, endless, high-stakes →',ax+aw*0.45,base-h*0.3,C.coral,9.5);
    // open vs closed loop
    lab(ctx,'open-loop score: 96% ✓',w*0.1,base+26,C.mut,9.5);lab(ctx,'closed-loop, on the tail: fails ✗',w*0.5,base+26,C.coral,9.5);
    lab(ctx,'a benchmark on logged data flatters you; the real test is closed-loop, on rare events',14,h-12,C.mut);
  };

  /* F01 — BEV2: multi-camera → BEV ray projection */
  A.drf_bev2=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Multi-camera → BEV: project each image pixel to its top-down cell',14,16,C.dim);
    // car with camera frustums (left side)
    const ex=w*0.22,ey=h*0.52;
    car(ctx,ex,ey,C.cyan,1.3);
    // 4 camera boxes around car
    const cams=[[ex-38,ey-18],[ex+22,ey-18],[ex-38,ey+6],[ex+22,ey+6]];
    cams.forEach((c,i)=>{rrect(ctx,c[0],c[1],14,10,2,hexA(C.amber,0.8),hexA(C.amber,0.12));});
    lab(ctx,'cameras',ex-38,ey+30,C.amber,9,'left');
    // animated ray index
    const ri=Math.floor(saw(t,3)*4);
    // BEV grid (right)
    const gx=w*0.5,gy=h*0.22,cs=18,gc=8;
    ctx.strokeStyle=hexA(C.mut,0.28);ctx.lineWidth=1;
    for(let i=0;i<=gc;i++){ctx.beginPath();ctx.moveTo(gx+i*cs,gy);ctx.lineTo(gx+i*cs,gy+gc*cs);ctx.stroke();}
    for(let j=0;j<=gc;j++){ctx.beginPath();ctx.moveTo(gx,gy+j*cs);ctx.lineTo(gx+gc*cs,gy+j*cs);ctx.stroke();}
    // ego in BEV center
    dot(ctx,gx+4*cs,gy+6*cs,5,C.cyan);
    // highlight animated BEV cell
    const bx=gx+(1+ri)*cs,by=gy+(2+ri)*cs;
    rrect(ctx,bx,by,cs,cs,2,C.amber,hexA(C.amber,0.22));
    // draw ray from camera to BEV cell
    arrow(ctx,ex+20,ey-8,bx+cs/2,by+cs/2,hexA(C.amber,0.75),1.4);
    lab(ctx,'lift: project ray to BEV cell',gx+1,gy+gc*cs+14,C.mut,9,'left');
    lab(ctx,'the grid is not an image — it’s an invented frame where detection and planning both live',14,h-12,C.mut);
  };

  /* F02 — OCC: 3D voxel grid + time arrow */
  A.drf_occ=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Occupancy: predict which 3D cells are filled, and forecast how they move',14,16,C.dim);
    // draw a 2.5D voxel grid (top-down + slight offset for depth)
    const ox=w*0.12,oy=h*0.62,cs=22,nc=10,nr=6,dxy=6;
    // filled cells pattern
    const filled=[[2,1],[2,2],[3,2],[4,2],[4,3],[7,1],[7,2],[8,2]];
    const moving=[[4,2],[4,3]]; // highlighted as forecasted moving
    for(let r=nr-1;r>=0;r--){for(let c=0;c<nc;c++){
      const x=ox+c*cs+r*dxy,y=oy-r*dxy-c*2;
      const isFilled=filled.some(f=>f[0]===c&&f[1]===r);
      const isMoving=moving.some(m=>m[0]===c&&m[1]===r);
      const phase=saw(t,2.5);
      let fill=null,stroke=hexA(C.line,0.5);
      if(isMoving){fill=hexA(C.amber,0.35+0.3*Math.sin(t*TAU/2.5));stroke=C.amber;}
      else if(isFilled){fill=hexA(C.cyan,0.25);stroke=hexA(C.cyan,0.7);}
      rrect(ctx,x,y,cs-2,cs-2,2,stroke,fill);
    }}
    lab(ctx,'static occupied',ox,oy+18,C.cyan,9,'left');
    lab(ctx,'moving → forecast',ox+4*cs,oy+18,C.amber,9,'left');
    // time arrow
    const tx=w*0.78,ty=h*0.35;
    arrow(ctx,tx,ty+60,tx,ty,C.green,1.5);
    lab(ctx,'t+1',tx+6,ty+10,C.green,9.5,'left');
    lab(ctx,'t+2',tx+6,ty+26,hexA(C.green,0.6),9.5,'left');
    lab(ctx,'now',tx+6,ty+54,C.mut,9.5,'left');
    lab(ctx,'a dense grid captures any shape — no bounding box needed',14,h-12,C.mut);
  };

  /* F03 — TRACK: detection + ID matching across two frames */
  A.drf_track=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Track: detect each frame, match IDs across time',14,16,C.dim);
    const fy1=h*0.34,fy2=h*0.68;
    lab(ctx,'frame 1',14,fy1-14,C.mut,9,'left');
    lab(ctx,'frame 2',14,fy2-14,C.mut,9,'left');
    // frame 1 objects
    const objs1=[{x:w*0.13,col:C.cyan,id:'A'},{x:w*0.36,col:C.violet,id:'B'},{x:w*0.59,col:C.amber,id:'C'}];
    // frame 2 objects (shifted slightly + new one)
    const objs2=[{x:w*0.15,col:C.cyan,id:'A'},{x:w*0.39,col:C.violet,id:'B'},{x:w*0.61,col:C.amber,id:'C'},{x:w*0.79,col:C.green,id:'D*'}];
    const bw=w*0.1,bh=28;
    objs1.forEach(o=>{rrect(ctx,o.x,fy1-bh/2,bw,bh,5,o.col,hexA(o.col,0.12));lab(ctx,o.id,o.x+bw/2,fy1,o.col,11,'center');});
    objs2.forEach(o=>{
      const isNew=o.id==='D*';
      rrect(ctx,o.x,fy2-bh/2,bw,bh,5,isNew?C.green:o.col,isNew?hexA(C.green,0.18):hexA(o.col,0.12));
      lab(ctx,o.id,o.x+bw/2,fy2,isNew?C.green:o.col,11,'center');
    });
    // match lines
    objs1.forEach((o,i)=>{const o2=objs2[i];arrow(ctx,o.x+bw/2,fy1+bh/2+2,o2.x+bw/2,fy2-bh/2-2,hexA(o.col,0.5),1.2);});
    lab(ctx,'new ID',objs2[3].x+bw/2,fy2+bh/2+10,C.green,9,'center');
    lab(ctx,'identity continuity lets the planner know who is approaching, who is not',14,h-12,C.mut);
  };

  /* F04 — FORECAST: multimodal trajectory fan */
  A.drf_forecast=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Forecasting: each agent has a distribution over futures, not one average path',14,16,C.dim);
    const ex=w*0.18,ey=h*0.62;
    car(ctx,ex,ey,C.cyan,1.2);lab(ctx,'ego',ex-12,ey+18,C.cyan,9,'left');
    // agent 1
    const a1x=w*0.38,a1y=h*0.42;
    car(ctx,a1x,a1y,C.coral,1.1);
    // modes for agent 1: left, straight, right with probabilities
    const modes1=[{da:-0.38,p:0.30,col:C.amber},{da:0,p:0.52,col:C.ink},{da:0.30,p:0.18,col:C.violet}];
    modes1.forEach(m=>{
      const pulse=0.6+0.35*Math.sin(t*1.8+m.da*3);
      ctx.save();ctx.strokeStyle=hexA(m.col,m.p*pulse*1.8);ctx.lineWidth=2+m.p*3;ctx.beginPath();
      ctx.moveTo(a1x,a1y);
      for(let s=1;s<=6;s++){const dx=s*22*Math.cos(m.da-Math.PI/2),dy=s*22*Math.sin(m.da-Math.PI/2);ctx.lineTo(a1x+dx,a1y+dy);}
      ctx.stroke();ctx.restore();
      const lx=a1x+118*Math.cos(m.da-Math.PI/2),ly=a1y+118*Math.sin(m.da-Math.PI/2);
      lab(ctx,Math.round(m.p*100)+'%',Math.min(lx,w-40),Math.max(ly,34),hexA(m.col,0.9),9,'left');
    });
    lab(ctx,'agent A',a1x+16,a1y-4,C.coral,9,'left');
    // agent 2
    const a2x=w*0.52,a2y=h*0.70;
    car(ctx,a2x,a2y,C.violet,1.0);
    const modes2=[{da:-0.2,p:0.60,col:C.ink},{da:0.3,p:0.40,col:C.amber}];
    modes2.forEach(m=>{
      const pulse=0.6+0.35*Math.sin(t*1.8+m.da*2);
      ctx.save();ctx.strokeStyle=hexA(m.col,m.p*pulse*1.8);ctx.lineWidth=1.5+m.p*2;ctx.beginPath();
      ctx.moveTo(a2x,a2y);
      for(let s=1;s<=5;s++){const dx=s*20*Math.cos(m.da-Math.PI/2),dy=s*20*Math.sin(m.da-Math.PI/2);ctx.lineTo(a2x+dx,a2y+dy);}
      ctx.stroke();ctx.restore();
    });
    lab(ctx,'agent B',a2x+14,a2y+14,C.violet,9,'left');
    lab(ctx,'betting on one averaged path is dangerous — plan for the whole distribution',14,h-12,C.mut);
  };

  /* F05 — E2E: sensor → network → flow-matching trajectory */
  A.drf_e2e=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'End-to-end: sensors → trajectory in one network, via flow matching',14,16,C.dim);
    const my=h*0.50;
    // sensor input block
    const sx=w*0.06,sw=w*0.17,sh=56;
    rrect(ctx,sx,my-sh/2,sw,sh,7,C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'cameras',sx+sw/2,my-10,C.cyan,9.5,'center');
    lab(ctx,'+ LiDAR',sx+sw/2,my+8,C.mut,9,'center');
    // network box
    const nx=w*0.33,nw=w*0.22,nh=52;
    rrect(ctx,nx,my-nh/2,nw,nh,7,C.violet,hexA(C.violet,0.09));
    lab(ctx,'network',nx+nw/2,my-6,C.violet,10,'center');
    lab(ctx,'(BEV enc + flow)',nx+nw/2,my+10,C.mut,9,'center');
    arrow(ctx,sx+sw+4,my,nx-4,my,C.ink,1.5);
    // particles converging to trajectory (flow matching)
    const u=saw(t,3.5);
    const tgtX=w*0.78,tgtY=my;
    for(let i=0;i<10;i++){
      const seed=(i*137)%100/100;
      const px0=nx+nw+20+seed*w*0.18,py0=my-30+seed*60;
      const px=px0+(tgtX-px0)*u,py=py0+(tgtY-py0)*u;
      dot(ctx,px,py,2.5,hexA(C.amber,(1-u*0.5)));
    }
    arrow(ctx,nx+nw+4,my,tgtX-24,my,hexA(C.mut,0.3),1.2);
    // trajectory output arc
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();
    for(let s=0;s<=12;s++){const a=Math.PI+s*0.12,r=22;ctx.lineTo(tgtX+Math.cos(a)*r,tgtY+Math.sin(a)*r+(s>0?s*3:0));}
    ctx.stroke();
    lab(ctx,'trajectory',tgtX-18,my-28,C.green,9,'left');
    lab(ctx,'flow',tgtX-16,my-14,C.amber,9,'left');
    lab(ctx,'no intermediate representation is thrown away — the network keeps all signal',14,h-12,C.mut);
  };

  /* F06 — VLA: see → reason → plan */
  A.drf_vla=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'VLA: see → reason in language → plan — the ‘why’ is readable',14,16,C.dim);
    const my=h*0.50,pw=w*0.21,ph=70,gap=w*0.04;
    // panel 1: camera image (abstract)
    const p1x=w*0.04;
    rrect(ctx,p1x,my-ph/2,pw,ph,7,C.cyan,hexA(C.cyan,0.06));
    lab(ctx,'camera',p1x+pw/2,my-16,C.mut,9,'center');
    // simple road scene: road + car shape
    ctx.fillStyle=hexA(C.dim,0.35);ctx.fillRect(p1x+8,my+4,pw-16,12);
    car(ctx,p1x+pw*0.62,my,C.coral,0.9);
    lab(ctx,'scene',p1x+pw/2,my+28,C.cyan,9,'center');
    arrow(ctx,p1x+pw+4,my,p1x+pw+gap-4,my,C.ink,1.4);
    // panel 2: language reasoning
    const p2x=p1x+pw+gap;
    rrect(ctx,p2x,my-ph/2,pw,ph,7,C.amber,hexA(C.amber,0.06));
    lab(ctx,'reasoning',p2x+pw/2,my-16,C.amber,9,'center');
    const words=['cyclist','ahead','→','yield'];
    const wi=Math.floor(saw(t,3)*words.length);
    let rx=p2x+6;
    words.forEach((wd,i)=>{
      const col=i<=wi?C.ink:hexA(C.mut,0.3);
      lab(ctx,wd,rx,my+2,col,9,'left');
      rx+=wd.length*6+5;
    });
    lab(ctx,'chain-of-thought',p2x+pw/2,my+28,C.amber,9,'center');
    arrow(ctx,p2x+pw+4,my,p2x+pw+gap-4,my,C.ink,1.4);
    // panel 3: trajectory
    const p3x=p2x+pw+gap;
    rrect(ctx,p3x,my-ph/2,pw,ph,7,C.green,hexA(C.green,0.06));
    lab(ctx,'plan',p3x+pw/2,my-16,C.green,9,'center');
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();
    for(let s=0;s<=8;s++){ctx.lineTo(p3x+8+s*(pw-16)/8,my+10-s*2);}ctx.stroke();
    lab(ctx,'trajectory',p3x+pw/2,my+28,C.green,9,'center');
    lab(ctx,'chain-of-thought grounds the trajectory in a human-readable explanation',14,h-12,C.mut);
  };

  /* F07 — WM: world model rollout → planner picks best future */
  A.drf_wm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'World model: imagine what your actions will cause, then react to that',14,16,C.dim);
    const my=h*0.50;
    // ego car
    car(ctx,w*0.10,my,C.cyan,1.2);lab(ctx,'ego',w*0.06,my+18,C.cyan,9,'left');
    arrow(ctx,w*0.15,my,w*0.22,my,C.ink,1.4);
    // world model box
    const wmx=w*0.23,wmw=w*0.18,wmh=46;
    rrect(ctx,wmx,my-wmh/2,wmw,wmh,7,C.violet,hexA(C.violet,0.09));
    lab(ctx,'world',wmx+wmw/2,my-6,C.violet,10,'center');
    lab(ctx,'model',wmx+wmw/2,my+8,C.violet,10,'center');
    // 3 candidate actions → 3 future panels
    const actions=[{label:'plan A',col:C.amber,dy:-h*0.26,ok:false},{label:'plan B',col:C.green,dy:0,ok:true},{label:'plan C',col:C.coral,dy:h*0.26,ok:false}];
    const px=wmx+wmw+w*0.08,pw=w*0.2,ph=36;
    const step=Math.floor(saw(t,3.5)*3);
    actions.forEach((a,i)=>{
      const fy=my+a.dy;
      arrow(ctx,wmx+wmw,my,px-4,fy,hexA(a.col,0.5),1.2);
      const active=i===step;
      rrect(ctx,px,fy-ph/2,pw,ph,6,a.col,active?hexA(a.col,0.18):hexA(a.col,0.06));
      lab(ctx,a.label,px+pw/2,fy-6,a.col,9.5,'center');
      lab(ctx,a.ok?'safe ✓':'collision ×',px+pw/2,fy+8,a.ok?C.green:C.coral,9,'center');
    });
    // arrow to best plan
    const bestx=px+pw;
    arrow(ctx,bestx+4,my,bestx+w*0.08,my,C.green,1.6);
    lab(ctx,'execute',bestx+w*0.08+4,my,C.green,9,'left');
    lab(ctx,'the planner reacts to a mental simulation, not just the current observation',14,h-12,C.mut);
  };

  /* F08 — FUSE: camera + LiDAR + radar → one view */
  A.drf_fuse=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Fusion: camera color + LiDAR depth + radar velocity → one view',14,16,C.dim);
    const my=h*0.50,step=Math.floor(saw(t,3)*3);
    const sensors=[
      {label:'camera',sub:'color, texture',col:C.cyan,y:my-h*0.24},
      {label:'LiDAR',sub:'3D depth',col:C.violet,y:my},
      {label:'radar',sub:'velocity + weather',col:C.amber,y:my+h*0.24},
    ];
    const sw=w*0.17,sh=32,fx=w*0.56,fw=w*0.18,fh=60;
    sensors.forEach((s,i)=>{
      const active=i===step;
      rrect(ctx,w*0.06,s.y-sh/2,sw,sh,5,s.col,active?hexA(s.col,0.2):hexA(s.col,0.06));
      lab(ctx,s.label,w*0.06+sw/2,s.y-6,s.col,9.5,'center');
      lab(ctx,s.sub,w*0.06+sw/2,s.y+8,C.mut,8.5,'center');
      arrow(ctx,w*0.06+sw+4,s.y,fx-4,my,hexA(s.col,active?0.8:0.3),active?2:1.2);
    });
    // fusion box
    rrect(ctx,fx,my-fh/2,fw,fh,7,C.green,hexA(C.green,0.08));
    lab(ctx,'fuse',fx+fw/2,my-6,C.green,10,'center');
    lab(ctx,'(BEV)',fx+fw/2,my+8,C.mut,9,'center');
    arrow(ctx,fx+fw+4,my,fx+fw+w*0.09,my,C.green,1.8);
    rrect(ctx,fx+fw+w*0.1,my-24,w*0.13,48,6,C.ink,hexA(C.ink,0.06));
    lab(ctx,'complete',fx+fw+w*0.1+w*0.065,my-8,C.ink,9.5,'center');
    lab(ctx,'view',fx+fw+w*0.1+w*0.065,my+8,C.ink,9,'center');
    lab(ctx,'each sensor is blind in a different way — together their blindspots cancel',14,h-12,C.mut);
  };

  /* F09 — WEATHER: clear vs degraded, adaptation arrow */
  A.drf_weather=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Robustness: perception must not silently fail when conditions change',14,16,C.dim);
    const midx=w*0.5,cy=h*0.52,ph=88,pw=w*0.34;
    // left: clear scene
    rrect(ctx,w*0.04,cy-ph/2,pw,ph,8,C.cyan,hexA(C.cyan,0.06));
    lab(ctx,'clear',w*0.04+pw/2,cy-ph/2+12,C.cyan,9.5,'center');
    car(ctx,w*0.04+pw*0.5,cy+8,C.cyan,1.0);
    // lane markings
    ctx.strokeStyle=hexA(C.ink,0.5);ctx.lineWidth=1.5;ctx.setLineDash([6,5]);
    ctx.beginPath();ctx.moveTo(w*0.08,cy+30);ctx.lineTo(w*0.08+pw-8,cy+30);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'detection: OK',w*0.04+pw/2,cy+ph/2-8,C.green,9,'center');
    // right: degraded scene
    const rx=midx+w*0.06;
    rrect(ctx,rx,cy-ph/2,pw,ph,8,C.coral,hexA(C.coral,0.06));
    // rain overlay
    const rphase=saw(t,1.4);
    for(let i=0;i<14;i++){const rx2=rx+10+(i*23)%pw,ry=cy-ph/2+10+(i*17+rphase*ph)%(ph-10);
      ctx.strokeStyle=hexA(C.cyan,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx2,ry);ctx.lineTo(rx2-3,ry+10);ctx.stroke();}
    car(ctx,rx+pw*0.5,cy+8,hexA(C.mut,0.7),1.0);
    lab(ctx,'rain / fog',rx+pw/2,cy-ph/2+12,C.coral,9.5,'center');
    lab(ctx,'detection: degraded',rx+pw/2,cy+ph/2-8,C.amber,9,'center');
    // adaptation arrow
    arrow(ctx,midx-8,cy,rx-4,cy,hexA(C.amber,0.7),1.5);
    lab(ctx,'adapt',midx-12,cy-10,C.amber,9.5,'right');
    lab(ctx,'graceful degradation, not silent failure — the car must know what it doesn’t know',14,h-12,C.mut);
  };

  /* F10 — MAP: car drives and builds lane map on the fly */
  A.drf_map=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Online mapping: detect lanes and drivable area in real-time, no pre-built map',14,16,C.dim);
    const u=saw(t,4.5);
    // road base (faded trapezoid)
    ctx.fillStyle=hexA(C.dim,0.12);ctx.beginPath();
    ctx.moveTo(w*0.1,h*0.75);ctx.lineTo(w*0.9,h*0.75);ctx.lineTo(w*0.78,h*0.36);ctx.lineTo(w*0.22,h*0.36);ctx.closePath();ctx.fill();
    // car driving along
    const carx=w*(0.12+u*0.72),cary=h*0.64;
    car(ctx,carx,cary,C.cyan,1.1);
    // lanes being built as car moves forward
    const laneLen=u*(w*0.72);
    // left lane boundary
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.setLineDash([8,5]);
    ctx.beginPath();ctx.moveTo(w*0.22,h*0.75);ctx.lineTo(w*0.22+laneLen*0.88,h*0.75-laneLen*0.43);ctx.stroke();
    // right lane boundary
    ctx.beginPath();ctx.moveTo(w*0.38,h*0.75);ctx.lineTo(w*0.38+laneLen*0.88,h*0.75-laneLen*0.43);ctx.stroke();
    ctx.setLineDash([]);
    // center dashes
    ctx.strokeStyle=hexA(C.ink,0.45);ctx.lineWidth=1.2;ctx.setLineDash([5,6]);
    ctx.beginPath();ctx.moveTo(w*0.30,h*0.75);ctx.lineTo(w*0.30+laneLen*0.88,h*0.75-laneLen*0.43);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'built so far',w*0.22,h*0.78,C.amber,9,'left');
    lab(ctx,'no HD map',w*0.62,h*0.36,C.mut,9,'left');
    lab(ctx,'scaling beyond mapped regions requires building the map as you drive',14,h-12,C.mut);
  };

  /* F11 — MPC: trajectory tree, constraint pruning */
  A.drf_mpc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'MPC: plan a trajectory tree, prune the unsafe branches, take the best',14,16,C.dim);
    const rootx=w*0.10,rooty=h*0.52;
    car(ctx,rootx,rooty,C.cyan,1.1);
    // tree branches (5 candidate trajectories) — tighter angles to stay in-canvas
    const branches=[
      {angles:[-0.28,-0.12],col:C.coral,safe:false,label:'collision'},
      {angles:[-0.15,-0.04],col:C.amber,safe:false,label:'risk'},
      {angles:[0.00,0.00],col:C.green,safe:true,label:'best'},
      {angles:[0.13,0.06],col:C.amber,safe:false,label:'risk'},
      {angles:[0.24,0.14],col:C.coral,safe:false,label:'out of lane'},
    ];
    const step=Math.floor(saw(t,3)*5);
    const lens=[w*0.26,w*0.40];
    branches.forEach((b,bi)=>{
      let x=rootx,y=rooty;
      b.angles.forEach((a,ai)=>{
        const nx=x+lens[ai]*Math.cos(a),ny=y+lens[ai]*Math.sin(a);
        const col=b.safe?C.green:(bi===step?hexA(C.coral,0.9):hexA(C.coral,0.45));
        ctx.strokeStyle=b.safe?C.green:col;ctx.lineWidth=b.safe?2.5:1.5;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();
        if(ai===1){
          const prune=!b.safe;
          const lx2=Math.min(nx+5,w-82),ly2=Math.max(Math.min(ny,h-28),28);
          if(prune){ctx.fillStyle=hexA(C.coral,0.7);ctx.beginPath();ctx.arc(nx,ny,4,0,TAU);ctx.fill();}
          else{dot(ctx,nx,ny,5,C.green);}
          lab(ctx,b.label,lx2,ly2,b.safe?C.green:hexA(C.coral,0.8),8.5,'left');
        }
        x=nx;y=ny;
      });
    });
    // obstacle
    rrect(ctx,w*0.52,h*0.32,26,20,4,C.coral,hexA(C.coral,0.2));lab(ctx,'obs',w*0.525,h*0.32+10,C.coral,9,'left');
    // lane bounds
    ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=1;ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.moveTo(w*0.08,h*0.76);ctx.lineTo(w*0.88,h*0.30);ctx.stroke();
    ctx.beginPath();ctx.moveTo(w*0.08,h*0.32);ctx.lineTo(w*0.88,h*0.30+48);ctx.stroke();
    ctx.setLineDash([]);
    lab(ctx,'hard constraints — no collision, stay in lane — are enforced by design, not learned',14,h-12,C.mut);
  };

  /* F12 — SIM: open-loop score vs closed-loop score with error compounding */
  A.drf_sim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Closed-loop: let the policy actually drive — errors compound and expose real failures',14,16,C.dim);
    const bary=h*0.44,barh=30,barw=w*0.28,lx=w*0.08,rx=w*0.56;
    // open-loop bar (high)
    lab(ctx,'open-loop score',lx,bary-36,C.mut,9.5,'left');
    rrect(ctx,lx,bary,barw,barh,5,C.mut,hexA(C.mut,0.12));
    rrect(ctx,lx,bary,barw*0.91,barh,5,C.green,hexA(C.green,0.22));
    lab(ctx,'91%',lx+barw*0.91+4,bary+barh/2,C.green,10,'left');
    lab(ctx,'(on logged data)',lx,bary+barh+10,C.mut,9,'left');
    // closed-loop bar (lower)
    lab(ctx,'closed-loop score',rx,bary-36,C.mut,9.5,'left');
    rrect(ctx,rx,bary,barw,barh,5,C.mut,hexA(C.mut,0.12));
    rrect(ctx,rx,bary,barw*0.54,barh,5,C.amber,hexA(C.amber,0.22));
    lab(ctx,'54%',rx+barw*0.54+4,bary+barh/2,C.amber,10,'left');
    lab(ctx,'(reactive traffic)',rx,bary+barh+10,C.mut,9,'left');
    // error compounding timeline — leave 40px right margin for labels
    const tly=h*0.76,tlx=w*0.08,tlw=w*0.76;
    lab(ctx,'error growth over time:',tlx,tly-14,C.mut,9,'left');
    ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tlx,tly);ctx.lineTo(tlx+tlw,tly);ctx.stroke();
    // open-loop: flat error
    ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=50;i++){const x=tlx+i*(tlw/50),y=tly-8;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    // closed-loop: compounding
    ctx.strokeStyle=C.coral;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=50;i++){const x=tlx+i*(tlw/50),y=tly-Math.min(44,4*Math.pow(i/50,2)*50);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'OL',tlx+tlw+6,tly-8,hexA(C.green,0.7),9,'left');
    lab(ctx,'CL',tlx+tlw+6,tly-34,C.coral,9,'left');
    lab(ctx,'open-loop score on logged data flatters; closed-loop on reactive traffic tells the truth',14,h-12,C.mut);
  };

  /* F13 — OOD: distribution + rare event + monitor */
  A.drf_ood=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'OOD detection: flag situations the system has never learned from before acting',14,16,C.dim);
    // draw bell curve
    const ax=w*0.08,base=h*0.64,aw=w*0.78;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=80;i++){const u=i/80,x=ax+aw*u;
      const y=base-Math.exp(-Math.pow((u-0.35)/0.12,2))*h*0.32;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    // fill training region
    ctx.fillStyle=hexA(C.cyan,0.08);ctx.beginPath();ctx.moveTo(ax,base);
    for(let i=0;i<=80;i++){const u=i/80,x=ax+aw*u;const y=base-Math.exp(-Math.pow((u-0.35)/0.12,2))*h*0.32;ctx.lineTo(x,y);}
    ctx.lineTo(ax+aw,base);ctx.closePath();ctx.fill();
    lab(ctx,'training distribution',ax+aw*0.2,base-h*0.28,C.cyan,9,'left');
    // rare tail event
    const ex=ax+aw*0.82,ey=base-8;
    const pulse=0.6+0.4*Math.sin(t*TAU/1.8);
    dot(ctx,ex,ey,5,C.coral);
    ctx.strokeStyle=hexA(C.coral,pulse);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ex,ey,10+4*Math.sin(t*2),0,TAU);ctx.stroke();
    lab(ctx,'rare event',ex-10,ey-18,C.coral,9,'right');
    // monitor box
    const mx=ex+18,my2=ey-40,mw=80,mh=28;
    rrect(ctx,mx,my2,mw,mh,5,C.amber,hexA(C.amber,0.12));
    lab(ctx,'monitor: OOD!',mx+mw/2,my2+mh/2,C.amber,9,'center');
    arrow(ctx,ex+3,ey-4,mx,my2+mh,C.amber,1.3);
    lab(ctx,'silent failures kill — the system must know when it’s outside its training distribution',14,h-12,C.mut);
  };

  /* F14 — EFF: large model → small + latency bar vs deadline */
  A.drf_eff=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Efficient perception: accuracy that misses the real-time budget is useless',14,16,C.dim);
    const my=h*0.46;
    // large model box
    const lx=w*0.06,lw=w*0.22,lh=66;
    rrect(ctx,lx,my-lh/2,lw,lh,7,C.violet,hexA(C.violet,0.09));
    lab(ctx,'large model',lx+lw/2,my-10,C.violet,10,'center');
    lab(ctx,'69M params',lx+lw/2,my+6,C.mut,9,'center');
    lab(ctx,'210 ms/frame',lx+lw/2,my+20,C.coral,9,'center');
    // distill arrow
    arrow(ctx,lx+lw+4,my,lx+lw+w*0.12,my,C.amber,1.6);
    lab(ctx,'distil',lx+lw+w*0.02,my-13,C.amber,9,'left');
    lab(ctx,'+ compress',lx+lw+w*0.02,my+3,C.amber,9,'left');
    // small model box
    const sx=lx+lw+w*0.14,sw=w*0.18,sh=52;
    rrect(ctx,sx,my-sh/2,sw,sh,7,C.green,hexA(C.green,0.08));
    lab(ctx,'small model',sx+sw/2,my-8,C.green,10,'center');
    lab(ctx,'9M params',sx+sw/2,my+8,C.mut,9,'center');
    lab(ctx,'34 ms/frame',sx+sw/2,my+20,C.green,9,'center');
    // latency bar racing vs deadline — bar width represents 300ms max; deadline at 100ms = 33%
    const bx=w*0.06,bw2=w*0.76,bary=h*0.72,barh=18;
    lab(ctx,'latency bar vs 100 ms deadline:',bx,bary-14,C.mut,9,'left');
    rrect(ctx,bx,bary,bw2,barh,4,C.line,hexA(C.line,0.2));
    // large model bar (210ms out of 300ms max = 70%)
    rrect(ctx,bx,bary,bw2*0.70,barh,4,hexA(C.coral,0.5),hexA(C.coral,0.18));
    lab(ctx,'large 210ms',bx+4,bary+barh/2,C.coral,8.5,'left');
    // small model bar (34ms = 11%)
    const sbarw=bw2*0.115;
    rrect(ctx,bx,bary+barh+6,bw2,barh,4,C.line,hexA(C.line,0.15));
    rrect(ctx,bx,bary+barh+6,sbarw,barh,4,hexA(C.green,0.5),hexA(C.green,0.18));
    lab(ctx,'small 34ms',bx+sbarw+4,bary+barh+6+barh/2,C.green,8.5,'left');
    // deadline line at 100ms = 33% of 300ms
    const dlx=bx+bw2*0.333;
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(dlx,bary-6);ctx.lineTo(dlx,bary+barh*2+10);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'100ms deadline',dlx+3,bary-6,C.amber,8.5,'left');
    lab(ctx,'the onboard computer is small — perception must fit the clock, not just the leaderboard',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.dranim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-dranim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
