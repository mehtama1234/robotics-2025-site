/* vt-anim.js — first-principles mechanism animators for the Video & Temporal Understanding explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-vtanim="name". Self-contained boot. */
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
  function frame(ctx,x,y,w,h,col){rrect(ctx,x,y,w,h,3,col||hexA(C.mut,0.5),null);}

  /* 01 — WHY: a video is not a stack of images; order and motion carry the meaning. */
  A.vt_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A video is not a bag of frames — the order and the motion are the meaning',14,16,C.dim);
    // same frames, two orders -> different meaning (door opening vs closing)
    const fy=h*0.34,fw=w*0.13,fh=h*0.2,gap=w*0.03;
    lab(ctx,'frames in order → "door opening"',w*0.06,fy-10,C.green,9);
    for(let k=0;k<4;k++){const x=w*0.06+k*(fw+gap);frame(ctx,x,fy,fw,fh);
      ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.strokeRect(x+4,fy+4,(fw-8)*(k/3),fh-8);}
    lab(ctx,'same frames reversed → "door closing"',w*0.06,fy+fh+22,C.coral,9);
    for(let k=0;k<4;k++){const x=w*0.06+k*(fw+gap);frame(ctx,x,fy+fh+30,fw,fh);
      ctx.strokeStyle=C.coral;ctx.lineWidth=2;ctx.strokeRect(x+4,fy+fh+34,(fw-8)*(1-k/3),fh-8);}
    lab(ctx,'shuffle the frames and the event is gone — time is a dimension, not a batch',14,h-12,C.mut);
  };

  /* 02 — MOTION: action lives in how pixels move between frames. */
  A.vt_motion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'What moved, and how — motion between frames is the raw signal of action',14,16,C.dim);
    // two overlaid frames + motion vectors of a moving subject vs static background
    const cx=w*0.5,cy=h*0.5;
    // static background dots (tiny motion)
    for(let i=0;i<20;i++){const x=w*0.1+((i*53)%Math.floor(w*0.8)),y=h*0.3+((i*37)%Math.floor(h*0.4));
      arrow(ctx,x,y,x+3,y,hexA(C.mut,0.5),1);}
    // moving subject (a runner) with big motion vectors
    const p=saw(t,3);const sx=w*0.2+p*w*0.5;
    for(let i=0;i<6;i++){const y=cy-20+i*8;arrow(ctx,sx,y,sx+22,y,C.cyan,1.6);}
    dot(ctx,sx,cy,7,C.amber);
    lab(ctx,'big vectors = the runner',sx+26,cy,C.cyan,9);lab(ctx,'small vectors = still background',w*0.1,h*0.72,C.mut,9);
    lab(ctx,'separate the flow of the subject from the background and you have detected the action',14,h-12,C.mut);
  };

  /* 03 — TRACK: keep the SAME identity across frames, through occlusion. */
  A.vt_track=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tracking: keep the same identity on the same object over time',14,16,C.dim);
    const y=h*0.5,p=saw(t,5);
    // two objects crossing; an occluder in the middle; IDs must persist
    const ax=w*0.1+p*w*0.8, bx=w*0.9-p*w*0.8;
    // occluder
    ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(w*0.46,y-40,w*0.08,80);lab(ctx,'occluder',w*0.46,y-48,C.mut,8);
    const behindA=Math.abs(ax-w*0.5)<w*0.05, behindB=Math.abs(bx-w*0.5)<w*0.05;
    if(!behindA){dot(ctx,ax,y-10,7,C.cyan);lab(ctx,'ID 1',ax-8,y-24,C.cyan,8.5);}
    if(!behindB){dot(ctx,bx,y+10,7,C.amber);lab(ctx,'ID 2',bx-8,y+24,C.amber,8.5);}
    // trails
    ctx.strokeStyle=hexA(C.cyan,0.3);ctx.beginPath();ctx.moveTo(w*0.1,y-10);ctx.lineTo(ax,y-10);ctx.stroke();
    ctx.strokeStyle=hexA(C.amber,0.3);ctx.beginPath();ctx.moveTo(w*0.9,y+10);ctx.lineTo(bx,y+10);ctx.stroke();
    lab(ctx,'the hard part: re-attach the right ID after they cross or vanish behind something',14,h-12,C.mut);
  };

  /* 04 — LONG: understand a whole long video, not one clip — needs memory. */
  A.vt_long=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Understanding a long video: too much to hold at once, so compress and remember',14,16,C.dim);
    // a long strip of frames -> a few key events kept in memory
    const sy=h*0.34,fw=w*0.045,n=16;
    for(let k=0;k<n;k++){const x=w*0.05+k*(fw+2);const key=(k===2||k===7||k===12);frame(ctx,x,sy,fw,h*0.16,key?C.cyan:hexA(C.mut,0.35));}
    lab(ctx,'a long stream of frames',w*0.05,sy-8,C.mut,9);
    // memory keeps only key events
    box(ctx,w*0.3,h*0.66,w*0.4,26,'memory: keep the few key moments',C.violet,hexA(C.violet,0.06));
    [2,7,12].forEach(k=>{const x=w*0.05+k*(fw+2)+fw/2;arrow(ctx,x,sy+h*0.16,w*0.5,h*0.66,hexA(C.cyan,0.5),1);});
    // a question answered from memory
    const p=saw(t,4);lab(ctx,p>0.5?'Q: "what happened after they met?" → answered from memory':'Q: "what happened after they met?"',w*0.06,h*0.92,C.green,9);
    lab(ctx,'you can\'t attend to every frame of an hour-long video — the game is what to remember',14,h-12,C.mut);
  };

  /* 05 — PREDICT: guess the next frames — a world model in disguise. */
  A.vt_predict=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Predicting the next frames — understanding time enough to extend it',14,16,C.dim);
    const sy=h*0.4,fw=w*0.1,gap=w*0.015;
    // observed frames (solid) then predicted (dashed, uncertain)
    for(let k=0;k<3;k++){const x=w*0.05+k*(fw+gap);frame(ctx,x,sy,fw,h*0.28,C.cyan);
      const bx=x+8+((k*9)%(fw-20));dot(ctx,bx+8,sy+h*0.14,5,C.amber);}
    lab(ctx,'observed',w*0.05,sy-8,C.cyan,9);
    const p=saw(t,3);
    for(let k=3;k<6;k++){const x=w*0.05+k*(fw+gap);ctx.setLineDash([3,3]);frame(ctx,x,sy,fw,h*0.28,hexA(C.violet,0.7));ctx.setLineDash([]);
      // predicted ball continues + uncertainty spread
      const bx=x+8+((k*9)%(fw-20));dot(ctx,bx+8,sy+h*0.14,5,hexA(C.violet,0.4+0.2*Math.sin(t+k)));}
    lab(ctx,'predicted (uncertain →)',w*0.55,sy-8,C.violet,9);
    lab(ctx,'multiple futures are plausible → predictions blur unless the model commits to one',14,h-12,C.mut);
  };

  /* 06 — LONGFORM: select key moments from an overwhelming stream */
  A.vtf_longform=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Long-form: select key frames from 108K — no attention window holds them all',14,16,C.dim);
    var n=20,fw=w*0.032,fy=h*0.30,fh=h*0.20,gap=w*0.013;
    for(var k=0;k<n;k++){var x=w*0.04+k*(fw+gap);var key=(k===3||k===9||k===15);frame(ctx,x,fy,fw,fh,key?C.cyan:hexA(C.mut,0.25));}
    lab(ctx,'108K frames  ⟶  score each',w*0.04,fy-10,C.mut,8.5);
    [3,9,15].forEach(function(k){var x=w*0.04+k*(fw+gap)+fw/2;
      var my=h*0.68;arrow(ctx,x,fy+fh+2,x,my-18,hexA(C.cyan,0.5+0.3*Math.sin(t)),1.3);
      dot(ctx,x,my,6,C.cyan);});
    box(ctx,w*0.28,h*0.74,w*0.44,22,'memory bank  M ∈ ℝ^{64\xd7768}',C.violet,hexA(C.violet,0.07));
    lab(ctx,'keep top-64 by saliency score → answer any question from M',14,h-12,C.mut);
  };

  /* 07 — VOS: propagate a pixel mask across frames */
  A.vtf_vos=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Video object segmentation: same mask identity through motion and occlusion',14,16,C.dim);
    var nf=5,fw=w*0.13,fh=h*0.36,fy=h*0.26,gap=w*0.03;
    for(var k=0;k<nf;k++){var x=w*0.05+k*(fw+gap);frame(ctx,x,fy,fw,fh);
      var ox=x+fw*0.3+(k*3)%(fw*0.4),oy=fy+fh*0.35;
      ctx.fillStyle=hexA(C.cyan,(k===2)?0.12:0.35);ctx.beginPath();ctx.ellipse(ox,oy,fw*0.28,fh*0.22,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=(k===2)?hexA(C.coral,0.4):C.cyan;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(ox,oy,fw*0.28,fh*0.22,0,0,Math.PI*2);ctx.stroke();
      if(k===2){lab(ctx,'occluded',x+2,fy+fh+10,C.coral,7.5);}
      if(k===4){lab(ctx,'re-id',x+2,fy+fh+10,C.green,7.5);}}
    lab(ctx,'affinity A = softmax(e_t \xb7 e_ref / √256) → warp mask; IoU ≈ 0.87 on DAVIS-2017',14,h-12,C.mut);
  };

  /* 08 — ACTION: temporal action detection */
  A.vtf_action=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Temporal action detection: find when the action starts and ends, not just what it is',14,16,C.dim);
    var bw=w*0.76,bx=w*0.12,by=h*0.38,bh=16;
    rrect(ctx,bx,by,bw,bh,3,hexA(C.mut,0.25),hexA(C.mut,0.08));
    var as=bw*0.52,ae=bw*0.72,ay=by;
    ctx.fillStyle=hexA(C.amber,0.45+0.15*Math.sin(t));ctx.fillRect(bx+as,ay,ae-as,bh);
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.strokeRect(bx+as,ay,ae-as,bh);
    arrow(ctx,bx+as,by+bh+8,bx+as,by+bh+24,C.amber,1.3);
    arrow(ctx,bx+ae,by+bh+8,bx+ae,by+bh+24,C.amber,1.3);
    lab(ctx,'t=238',bx+as-6,by+bh+32,C.amber,8.5);lab(ctx,'t=301',bx+ae-6,by+bh+32,C.amber,8.5);
    lab(ctx,'full video timeline',bx,by-10,C.mut,8);
    var p=saw(t,4);
    box(ctx,bx+as-2,h*0.62,ae-as+4,22,p>0.5?'shot  tIoU=0.88':'anchor proposals',C.amber,hexA(C.amber,0.08));
    lab(ctx,'without temporal modeling tIoU=0.31 — detecting action without timing is half the job',14,h-12,C.mut);
  };

  /* 09 — VIDEOQA: select evidence frames, ignore distractors */
  A.vtf_videoqa=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Video QA: select the frames that contain the answer — ignore 99% that do not',14,16,C.dim);
    var n=18,fw=w*0.033,fy=h*0.28,fh=h*0.22,gap=w*0.012;
    for(var k=0;k<n;k++){var x=w*0.04+k*(fw+gap);var ev=(k===5||k===11);
      frame(ctx,x,fy,fw,fh,ev?C.cyan:hexA(C.mut,0.18));}
    lab(ctx,'18,000 frames — score = q\xb7f / ‖q‖‖f‖',w*0.04,fy-10,C.mut,8.5);
    var p=saw(t,3);
    [5,11].forEach(function(k){var x=w*0.04+k*(fw+gap)+fw/2;if(p>0.3){
      arrow(ctx,x,fy+fh+2,x,h*0.68,hexA(C.cyan,0.6),1.2);dot(ctx,x,h*0.68,5,C.cyan);}});
    box(ctx,w*0.28,h*0.72,w*0.44,22,'VLM: 2048 tokens  →  answer',C.green,hexA(C.green,0.07));
    lab(ctx,'NExT-QA: 54% unfiltered → 69% evidence-filtered; 3.5\xd7 faster inference',14,h-12,C.mut);
  };

  /* 10 — TGROUND: find the moment in continuous time */
  A.vtf_tground=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Temporal grounding: find the exact moment a query describes in continuous time',14,16,C.dim);
    var bw=w*0.76,bx=w*0.12,by=h*0.36,bh=14;
    rrect(ctx,bx,by,bw,bh,3,hexA(C.mut,0.2),hexA(C.mut,0.07));
    var pts=[];for(var k=0;k<=60;k++){pts.push({x:bx+k/60*bw,y:by+bh+8+28*Math.exp(-0.5*Math.pow((k-31)/6,2))});}
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();pts.forEach(function(pt,i){i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y);});ctx.stroke();
    var pm=pts[31];dot(ctx,pm.x,pm.y,5,C.violet);
    arrow(ctx,pm.x,pm.y+8,pm.x,by+bh+58,C.violet,1.3);
    lab(ctx,'t=87s  "chef adds salt"',pm.x-30,by+bh+70,C.violet,8.5);
    lab(ctx,'Charades-STA R@1: regression 42% → span-attention 63%',14,h-12,C.mut);
  };

  /* 11 — MOT: detect, predict, match, re-id */
  A.vtf_mot=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Multi-object tracking: detect + predict + match + re-id across occlusion',14,16,C.dim);
    var p=saw(t,4);
    var agents=[{cx:w*0.18+p*w*0.22,cy:h*0.42,col:C.cyan,id:'A'},{cx:w*0.55+p*w*0.18,cy:h*0.54,col:C.amber,id:'B'},{cx:w*0.35-p*w*0.12,cy:h*0.35,col:C.green,id:'C'}];
    ctx.fillStyle=hexA(C.mut,0.2);ctx.fillRect(w*0.50,h*0.28,w*0.07,h*0.35);lab(ctx,'occluder',w*0.50,h*0.26,C.mut,7.5);
    agents.forEach(function(a){var behind=a.cx>w*0.48&&a.cx<w*0.58;
      if(!behind){dot(ctx,a.cx,a.cy,7,a.col);lab(ctx,'ID '+a.id,a.cx+9,a.cy-3,a.col,8.5);}
      ctx.strokeStyle=hexA(a.col,0.25);ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(a.cx-p*w*0.15,a.cy);ctx.lineTo(a.cx,a.cy);ctx.stroke();ctx.setLineDash([]);});
    lab(ctx,'MOTA on MOT17: detection-only 42% → Kalman+re-ID 76%; ID switches \xf78',14,h-12,C.mut);
  };

  /* 12 — TRAJ: joint multi-agent trajectory prediction */
  A.vtf_traj=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Trajectory prediction: model intent and interaction — joint futures, not independent lines',14,16,C.dim);
    var agents=[{sx:w*0.25,sy:h*0.5,dx:w*0.38,dy:h*0.38,col:C.cyan},{sx:w*0.5,sy:h*0.38,dx:w*0.62,dy:h*0.52,col:C.amber},{sx:w*0.42,sy:h*0.6,dx:w*0.55,dy:h*0.42,col:C.green}];
    var p=saw(t,5);
    agents.forEach(function(a){
      var cx=a.sx+(a.dx-a.sx)*p,cy=a.sy+(a.dy-a.sy)*p;
      dot(ctx,cx,cy,6,a.col);
      ctx.strokeStyle=hexA(a.col,0.3);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(cx,cy);ctx.stroke();
      for(var s=0;s<4;s++){ctx.strokeStyle=hexA(a.col,0.08+0.04*s);ctx.lineWidth=1;ctx.beginPath();
        ctx.arc(a.dx,a.dy,16+s*8,0,Math.PI*2);ctx.stroke();}
      arrow(ctx,cx,cy,a.dx,a.dy,hexA(a.col,0.45),1.2);});
    lab(ctx,'Flow-match 20 samples per agent; ADE=0.36m vs regression 0.61m; FDE=0.58m',14,h-12,C.mut);
  };

  /* 13 — POLICY: infer robot actions from human video */
  A.vtf_policy=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Robot policy from video: infer actions from pixels alone — no labels, no proprioception',14,16,C.dim);
    var p=saw(t,4);
    var hx=w*0.18,hy=h*0.44,rx=w*0.70,ry=h*0.44;
    box(ctx,hx,hy-14,w*0.18,28,'human video',C.cyan,hexA(C.cyan,0.07));
    box(ctx,rx,ry-14,w*0.18,28,'robot exec',C.amber,hexA(C.amber,0.07));
    var mx=w*0.46,my=h*0.44;
    box(ctx,mx,my-14,w*0.16,28,'retarget MLP',C.violet,hexA(C.violet,0.07));
    arrow(ctx,hx+w*0.18,my,mx,my,C.cyan,1.4);
    arrow(ctx,mx+w*0.16,my,rx,my,C.amber,1.4);
    var rewY=h*0.66;
    box(ctx,mx,rewY-12,w*0.16,24,'reward r_t = sim(frames)',hexA(C.green,0.8),hexA(C.green,0.06));
    arrow(ctx,mx+w*0.08,rewY-12,mx+w*0.08,my+14,hexA(C.green,0.4+0.2*Math.sin(t)),1.2);
    lab(ctx,p>0.5?'500 RL episodes → success 12% → 71%':'visual reward: VGG perceptual distance',14,h-12,C.mut);
  };

  /* 14 — SSL: masked video pretraining */
  A.vtf_ssl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Self-supervised pretraining: predict the masked patches — learn physics for free',14,16,C.dim);
    var nf=4,fw=w*0.14,fh=h*0.32,fy=h*0.26,gap=w*0.03;
    for(var k=0;k<nf;k++){var x=w*0.06+k*(fw+gap);frame(ctx,x,fy,fw,fh);
      var gr=6,cw=fw/gr,ch=fh/gr;
      for(var r=0;r<gr;r++)for(var c=0;c<gr;c++){var masked=((r*gr+c+k)%4===0);
        if(masked){ctx.fillStyle=hexA(C.mut,0.35);ctx.fillRect(x+c*cw+1,fy+r*ch+1,cw-2,ch-2);}
        else{ctx.fillStyle=hexA(C.cyan,0.12+0.08*((r+c)%2));ctx.fillRect(x+c*cw+1,fy+r*ch+1,cw-2,ch-2);}}}
    lab(ctx,'mask 75% of patches',w*0.06,fy-10,C.mut,8.5);
    var py=h*0.72;
    box(ctx,w*0.2,py-13,w*0.6,26,'encoder reconstructs masked patches (L2)',C.violet,hexA(C.violet,0.07));
    lab(ctx,'2M clips, no labels → fine-tune 1% of Kinetics → top-1 54% → 72%; tube-mask +4pp',14,h-12,C.mut);
  };

  /* 15 — FLOW: aperture problem + RAFT iterative refinement */
  A.vtf_flow=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Optical flow: 1 brightness equation, 2 unknowns (u,v) — regularization decides the rest',14,16,C.dim);
    var p=saw(t,3);
    var fx=w*0.08,fy=h*0.28,fw=w*0.34,fh=h*0.38;
    frame(ctx,fx,fy,fw,fh);lab(ctx,'frame t',fx,fy-10,C.mut,8);
    frame(ctx,fx+fw+w*0.1,fy,fw,fh);lab(ctx,'frame t+1',fx+fw+w*0.1,fy-10,C.mut,8);
    var ex=fx+fw*0.5,ey=fy+fh*0.45;dot(ctx,ex,ey,5,C.amber);
    dot(ctx,fx+fw+w*0.1+fw*0.5+20+p*15,fy+fh*0.45+8,5,hexA(C.amber,0.3));
    arrow(ctx,ex,ey,ex+20+p*15,ey+8,C.amber,1.4);
    lab(ctx,'(u,v)=?',ex+24,ey-6,C.amber,8.5);
    box(ctx,w*0.32,h*0.80-11,w*0.36,22,'RAFT cost volume + 12 GRU steps',C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'EPE: Horn-Schunck 4.8px → RAFT 1.43px on Sintel Clean',14,h-12,C.mut);
  };

  /* 16 — EVENT: asynchronous spikes, no frames */
  A.vtf_event=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Event camera: per-pixel async spikes — no blur, microsecond latency, no frames',14,16,C.dim);
    var p=saw(t,2);
    for(var i=0;i<60;i++){
      var et=(i*0.0317+p)%1,ex2=w*0.08+((i*97)%(Math.floor(w*0.84))),ey2=h*0.28+((i*53)%(Math.floor(h*0.44)));
      var pol=((i%3)===0);var age=1-et;
      dot(ctx,ex2,ey2,2.5,hexA(pol?C.cyan:C.coral,age*0.85));}
    lab(ctx,'events: (x,y,t,\xb1p) — each pixel fires on log-lum change Δ≈0.07',w*0.08,h*0.26,C.mut,8);
    var vbx=w*0.3,vby=h*0.72;
    box(ctx,vbx,vby-13,w*0.4,26,'voxel grid  B=5 bins \xd7 H \xd7 W',C.violet,hexA(C.violet,0.07));
    lab(ctx,'120 km/h → 3px/ms — frames blur, events stay sharp; EPE 0.54px vs 1.8px in dark',14,h-12,C.mut);
  };

  /* 17 — STREAM: causal fixed-state update */
  A.vtf_stream=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Streaming: process each frame causally — compress past into a fixed memory state',14,16,C.dim);
    var slots=8,sw=w*0.06,sh=h*0.18,sx=w*0.06,sy=h*0.32,gap=w*0.014;
    for(var k=0;k<slots;k++){var full=(k<Math.floor(saw(t,6)*slots)+1);
      rrect(ctx,sx+k*(sw+gap),sy,sw,sh,4,full?C.violet:hexA(C.mut,0.2),full?hexA(C.violet,0.12):null);}
    lab(ctx,'memory M: 64 slots \xd7 256-D  (constant cost)',sx,sy-10,C.mut,8);
    var fy2=h*0.62,fwf=w*0.14,fhf=h*0.14;
    frame(ctx,w*0.72,fy2,fwf,fhf);lab(ctx,'new frame f_k',w*0.72,fy2-10,C.cyan,8);
    arrow(ctx,w*0.72,fy2+fhf/2,w*0.60,sy+sh/2,C.cyan,1.3);
    lab(ctx,'replace lowest-relevance slot; latency 8ms/frame on A100 → 30fps real-time',14,h-12,C.mut);
  };

  /* 18 — VLM: aggressive token compression */
  A.vtf_vlm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Video-language model: 4704 visual tokens → compress to 256 — keep what the query needs',14,16,C.dim);
    var tw=w*0.006,th=h*0.08,tgap=w*0.004;
    var ncols=Math.floor((w*0.42)/(tw+tgap));
    for(var k=0;k<Math.min(200,ncols*8);k++){var r=Math.floor(k/ncols),c=k%ncols;
      ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(w*0.04+c*(tw+tgap),h*0.26+r*(th+3),tw,th);}
    lab(ctx,'4704 raw tokens',w*0.04,h*0.24,C.mut,8);
    arrow(ctx,w*0.50,h*0.42,w*0.60,h*0.42,C.amber,2);
    lab(ctx,'merge\n18.4\xd7',w*0.505,h*0.37,C.amber,8.5);
    var mx=w*0.63,my=h*0.30,mw=w*0.08,mh=h*0.24;
    for(var j=0;j<16;j++){var rr=Math.floor(j/4),cc=j%4;
      ctx.fillStyle=hexA(C.cyan,0.55+0.1*Math.sin(t+j));ctx.fillRect(mx+cc*(mw/4+2),my+rr*(mh/4+2),mw/4-1,mh/4-1);}
    lab(ctx,'256 tokens',mx,my-10,C.cyan,8);
    box(ctx,w*0.63,h*0.70-13,w*0.30,26,'LLM answers',C.green,hexA(C.green,0.07));
    lab(ctx,'MVBench: no-compress 54% → smart-merge 61% vs random-drop 46%',14,h-12,C.mut);
  };

  /* 19 — ANOMALY: normality memory bank + deviation score */
  A.vtf_anomaly=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Anomaly detection: learn normality tightly enough that any violation stands out',14,16,C.dim);
    var cx=w*0.5,cy=h*0.46,nr=h*0.22;
    for(var k=0;k<12;k++){var ang=k/12*Math.PI*2;var r=nr*(0.85+0.12*Math.sin(ang*3));
      dot(ctx,cx+r*Math.cos(ang),cy+r*Math.sin(ang),4,hexA(C.cyan,0.5));}
    ring(ctx,cx,cy,nr,hexA(C.cyan,0.2));
    lab(ctx,'normal prototypes  N (1024)',cx-40,cy-nr-16,C.cyan,8);
    var p=saw(t,3);var ax=cx+nr*0.4+p*w*0.12,ay=cy-nr*0.6-p*h*0.1;
    dot(ctx,ax,ay,7,C.coral);lab(ctx,'anomaly',ax+10,ay-5,C.coral,8.5);
    arrow(ctx,cx,cy,ax,ay,hexA(C.coral,0.4),1.3);
    lab(ctx,'score = 1 − max cos(e_test, n_j)',cx-60,cy+nr+18,C.mut,8);
    lab(ctx,'UCSD Ped2: threshold 0.42 → TPR 81%, FPR 7%; MLLM zero-shot AUC=0.81',14,h-12,C.mut);
  };

  /* 20 — WORLDMODEL: sample one sharp future from the distribution */
  A.vtf_worldmodel=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Video world model: sample one sharp future — averaging blurs every plausible outcome',14,16,C.dim);
    var n=4,fwf=w*0.1,fhf=h*0.28,fy=h*0.30,gap=w*0.02;
    for(var k=0;k<n;k++){var x=w*0.04+k*(fwf+gap);frame(ctx,x,fy,fwf,fhf,C.cyan);}
    lab(ctx,'observed 8 frames',w*0.04,fy-10,C.cyan,8.5);
    var msx=w*0.06+n*(fwf+gap);
    var p=saw(t,4);
    ctx.fillStyle=hexA(C.mut,0.35);ctx.fillRect(msx,fy,fwf,fhf);
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.strokeRect(msx,fy,fwf,fhf);ctx.setLineDash([]);
    lab(ctx,'MSE blurry\nmean',msx+2,fy+fhf+10,C.mut,7.5);
    var branches=[C.cyan,C.amber,C.coral,C.violet];
    var origx=msx+fwf,origy=fy+fhf*0.5,bfw=fwf*0.7,bfh=fhf*0.45;
    var slots=[fy+2, fy+fhf*0.5-bfh*0.5, fy+fhf-bfh, fhf+fy+8];
    branches.forEach(function(col,i){
      var spread=(p>0.4?1:0.4);
      var bx=origx+w*0.11+i*2;
      var by=origy+(slots[i]+bfh*0.5-origy)*spread;
      arrow(ctx,origx,origy,bx-2,by,hexA(col,0.55),1.2);
      frame(ctx,bx,by-bfh*0.5,bfw,bfh,hexA(col,0.7));});
    lab(ctx,'diffusion → SSIM 0.84 vs MSE 0.61; FID 18.4 vs 47.2; sample 200 → pick best plan',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.vtanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-vtanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
