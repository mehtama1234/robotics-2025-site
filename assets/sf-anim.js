/* sf-anim.js — first-principles mechanism animators for the Safety & Guarantees explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-sfanim="name". Self-contained boot. */
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

  /* 01 — WHY: the more flexible & learned a system, the harder to guarantee it's safe. */
  A.sf_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The more capable and learned a robot is, the harder it is to promise it’s safe',14,16,C.dim);
    // a learned policy dot wandering near a cliff/hazard; unbounded behavior
    const gy=h*0.72;ctx.strokeStyle=hexA(C.mut,0.6);ctx.beginPath();ctx.moveTo(w*0.06,gy);ctx.lineTo(w*0.6,gy);ctx.stroke();
    // cliff
    ctx.fillStyle=hexA(C.coral,0.15);ctx.fillRect(w*0.6,gy,w*0.34,h*0.2);ctx.strokeStyle=hexA(C.coral,0.7);ctx.beginPath();ctx.moveTo(w*0.6,gy);ctx.lineTo(w*0.6,gy+h*0.2);ctx.stroke();
    lab(ctx,'unsafe',w*0.72,gy+22,C.coral,10);
    // policy path: erratic, wanders toward the edge
    const p=saw(t,5);ctx.strokeStyle=hexA(C.violet,0.7);ctx.lineWidth=2;ctx.beginPath();
    let px=w*0.1;for(let i=0;i<=p*100;i++){px=w*0.1+i/100*w*0.52;ctx.lineTo(px,gy-16-Math.sin(i*0.3)*10);}ctx.stroke();
    dot(ctx,px,gy-16-Math.sin(p*100*0.3)*10,6,C.violet);lab(ctx,'a flexible learned policy',w*0.12,gy-44,C.violet,9);
    lab(ctx,'a hand-written rule you can bound; a big learned policy has too many behaviors to check them all',14,h-12,C.mut);
  };

  /* 02 — CBF: keep the state inside a safe set — filter any unsafe command. */
  A.sf_cbf=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Safety filter: whatever the policy wants, keep the state inside the safe set',14,16,C.dim);
    // safe set region + an obstacle; desired command would exit, filtered stays in
    const cx=w*0.5,cy=h*0.52;
    ctx.fillStyle=hexA(C.green,0.08);ctx.beginPath();ctx.arc(cx,cy,90,0,TAU);ctx.fill();ring(ctx,cx,cy,90,hexA(C.green,0.6));
    lab(ctx,'safe set',cx-70,cy-70,C.green,9);
    // obstacle outside boundary
    dot(ctx,cx+120,cy-20,10,C.coral);lab(ctx,'hazard',cx+108,cy-38,C.coral,8.5);
    // robot near boundary; desired command points out, filtered points along boundary
    const rx=cx+70,ry=cy-40;dot(ctx,rx,ry,6,C.violet);
    arrow(ctx,rx,ry,rx+40,ry-20,C.coral,1.6);lab(ctx,'wanted (exits)',rx+8,ry-26,C.coral,8.5);
    arrow(ctx,rx,ry,rx+8,ry+34,C.green,1.8);lab(ctx,'filtered (stays in)',rx+12,ry+38,C.green,8.5);
    lab(ctx,'a control barrier function nudges any command the least amount needed to never leave the safe set',14,h-12,C.mut);
  };

  /* 03 — REACH: compute the set of possible futures; avoid the bad ones. */
  A.sf_reach=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reachability: compute every state the robot could reach — and keep it clear of harm',14,16,C.dim);
    const sx=w*0.12,sy=h*0.5;dot(ctx,sx,sy,6,C.cyan);lab(ctx,'now',sx-10,sy+18,C.cyan,9);
    // growing reachable cone/blob
    const p=saw(t,4);const R=p*w*0.6;
    ctx.fillStyle=hexA(C.violet,0.12);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+R,sy-R*0.5);ctx.lineTo(sx+R,sy+R*0.5);ctx.closePath();ctx.fill();
    lab(ctx,'reachable set (all possible futures)',sx+40,sy-R*0.5-8,C.violet,8.5);
    // an obstacle; if the set touches it -> unsafe
    const ox=w*0.68,oy=sy-40;dot(ctx,ox,oy,12,C.coral);lab(ctx,'hazard',ox-14,oy-20,C.coral,8.5);
    const touch=(sx+R>ox-12 && oy>sy-R*0.5);
    if(touch){lab(ctx,'⚠ set reaches the hazard → act now to shrink it',w*0.2,h*0.82,C.coral,9);}
    lab(ctx,'if the set of possible futures can touch the hazard, the state is unsafe — intervene before it does',14,h-12,C.mut);
  };

  /* 04 — UNCERTAINTY: calibrated doubt -> be cautious when unsure. */
  A.sf_uncertainty=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Know what you don’t know: act boldly when confident, cautiously when not',14,16,C.dim);
    const gx=w*0.08,gw=w*0.84,cy=h*0.5;
    // a prediction line with a widening confidence band
    ctx.strokeStyle=hexA(C.cyan,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){ctx.lineTo(gx+i,cy-Math.sin(i*0.015)*20);}ctx.stroke();
    // band widens to the right (more uncertain far ahead / OOD)
    ctx.fillStyle=hexA(C.violet,0.12);ctx.beginPath();
    for(let i=0;i<=gw;i++){const band=6+i/gw*46;ctx.lineTo(gx+i,cy-Math.sin(i*0.015)*20-band);}
    for(let i=gw;i>=0;i--){const band=6+i/gw*46;ctx.lineTo(gx+i,cy-Math.sin(i*0.015)*20+band);}ctx.closePath();ctx.fill();
    lab(ctx,'confident',gx+10,cy+40,C.green,9);lab(ctx,'uncertain (widen) → slow down',gx+gw*0.55,cy+58,C.violet,9);
    lab(ctx,'a calibrated interval (conformal prediction) turns a guess into a guarantee-with-a-probability',14,h-12,C.mut);
  };

  /* 05 — MONITOR: runtime monitor + safe fallback. */
  A.sf_monitor=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The last line: watch the policy, and fall back to a safe controller if it strays',14,16,C.dim);
    box(ctx,w*0.06,h*0.34,w*0.18,30,'learned\npolicy',C.violet,hexA(C.violet,0.08));
    box(ctx,w*0.4,h*0.3,w*0.2,26,'runtime monitor',C.amber,hexA(C.amber,0.08));
    arrow(ctx,w*0.24,h*0.42,w*0.4,h*0.4,C.violet,1.3);
    const p=saw(t,4);const ood=p>0.55;
    // normal -> pass; ood -> switch to fallback
    if(!ood){box(ctx,w*0.68,h*0.3,w*0.24,26,'✓ act on policy',C.green,hexA(C.green,0.06));arrow(ctx,w*0.6,h*0.42,w*0.68,h*0.42,C.green,1.3);}
    else{box(ctx,w*0.68,h*0.3,w*0.24,26,'✗ out of bounds',C.coral,hexA(C.coral,0.06));arrow(ctx,w*0.6,h*0.42,w*0.68,h*0.42,C.coral,1.3);
      box(ctx,w*0.4,h*0.66,w*0.28,28,'safe fallback controller',C.green,hexA(C.green,0.08));arrow(ctx,w*0.5,h*0.44,w*0.5,h*0.66,C.coral,1.4);
      lab(ctx,'switch →',w*0.3,h*0.66+14,C.coral,9);}
    lab(ctx,'a simple, trusted controller stands ready — when the monitor flags trouble, it takes over',14,h-12,C.mut);
  };

  /* --- family animators --- */

  /* sff_cbf_filter: CBF safety filter QP — policy command vs filtered command near boundary */
  A.sff_cbf_filter=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'CBF safety filter: the QP finds the closest safe command',14,16,C.dim);
    var cx=w*0.5,cy=h*0.55,R=80;
    ctx.fillStyle=hexA(C.green,0.08);ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();
    ring(ctx,cx,cy,R,hexA(C.green,0.5));
    lab(ctx,'safe set h(x)≥0',cx-36,cy-R-10,C.green,9.5);
    var p=saw(t,5),ang=-0.9+p*0.55;
    var rx=cx+R*0.75*Math.cos(ang),ry=cy+R*0.75*Math.sin(ang);
    dot(ctx,rx,ry,6,C.violet);lab(ctx,'robot',rx+8,ry-8,C.violet,9);
    var ux=rx+50*Math.cos(ang+0.9),uy=ry+50*Math.sin(ang+0.9);
    arrow(ctx,rx,ry,ux,uy,C.coral,1.8);lab(ctx,'u_nom\n(exits)',ux+4,uy-4,C.coral,8.5);
    var fx=rx+38*Math.cos(ang-0.7),fy=ry+38*Math.sin(ang-0.7);
    arrow(ctx,rx,ry,fx,fy,C.green,2);lab(ctx,'u*\n(filtered)',fx+4,fy+4,C.green,8.5);
    lab(ctx,'QP: min ||u-u_nom||² s.t. Lfh+Lgh·u ≥ -αh(x)',14,h-14,C.mut);
  };

  /* sff_reach_hj: HJ reachability — value function boundary and safe/unsafe regions */
  A.sff_reach_hj=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Hamilton-Jacobi reachability: value function marks the safety boundary',14,16,C.dim);
    var p=saw(t,6),gx=w*0.1,gw=w*0.8,gy=h*0.55;
    ctx.fillStyle=hexA(C.green,0.10);ctx.fillRect(gx,h*0.2,gw,gy-h*0.2);
    ctx.fillStyle=hexA(C.coral,0.12);ctx.fillRect(gx,gy,gw,h*0.28);
    lab(ctx,'V(x)>0  safe',gx+8,h*0.32,C.green,9.5);
    lab(ctx,'V(x)<0  inevitable failure',gx+8,gy+18,C.coral,9.5);
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=2;ctx.setLineDash([6,4]);
    ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+gw,gy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'V=0 boundary',gx+gw*0.4,gy-14,C.amber,9);
    var rx=gx+p*gw,ry=h*0.37;dot(ctx,rx,ry,6,C.violet);
    lab(ctx,'robot',rx+6,ry-14,C.violet,8.5);
    if(p>0.72){lab(ctx,'⚠ approaching V=0 — act now',rx-60,ry+22,C.coral,9);}
    lab(ctx,'if V(x,t) → 0, a dangerous future is reachable — intervene before crossing',14,h-14,C.mut);
  };

  /* sff_safe_rl: constrained MDP — reward bar and cost bar converging */
  A.sff_safe_rl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Safe RL: maximize reward while keeping cost below budget',14,16,C.dim);
    var p=saw(t,5),bx=w*0.1,bw=w*0.36,by=h*0.3,bh=h*0.28;
    var rv=0.3+p*0.62,cv=0.8-p*0.55;
    rrect(ctx,bx,by,bw,bh,6,hexA(C.green,0.4),hexA(C.green,0.06));
    ctx.fillStyle=C.green;ctx.fillRect(bx+4,by+bh-bh*rv,bw-8,bh*rv);
    lab(ctx,'reward',bx+bw/2,by-12,C.green,10,'center');
    lab(ctx,Math.round(rv*100)+'%',bx+bw/2,by+bh/2,C.ink,12,'center');
    var cx2=w*0.55,cw=w*0.36;
    rrect(ctx,cx2,by,cw,bh,6,hexA(C.coral,0.4),hexA(C.coral,0.06));
    var ch=Math.max(0.04,cv);ctx.fillStyle=ch>0.4?C.coral:C.amber;ctx.fillRect(cx2+4,by+bh-bh*ch,cw-8,bh*ch);
    lab(ctx,'cost rate',cx2+cw/2,by-12,ch>0.4?C.coral:C.amber,10,'center');
    lab(ctx,Math.round(ch*100)+'%',cx2+cw/2,by+bh/2,C.ink,12,'center');
    lab(ctx,'budget: 5%',cx2+cw+6,by+bh-bh*0.05,C.amber,8.5);
    ctx.strokeStyle=hexA(C.amber,0.8);ctx.lineWidth=1.4;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(cx2,by+bh-bh*0.05);ctx.lineTo(cx2+cw,by+bh-bh*0.05);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'Lagrangian: L = -V_π + λ(J_C(π) - budget)  — λ auto-adjusts',14,h-14,C.mut);
  };

  /* sff_runtime_mon: monitor pipeline — normal vs OOD state, fallback switch */
  A.sff_runtime_mon=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Runtime monitor: watch for anomalies, hand off to safe fallback',14,16,C.dim);
    var p=saw(t,4),ood=p>0.5;
    box(ctx,w*0.04,h*0.38,w*0.2,28,'policy',C.violet,hexA(C.violet,0.07));
    box(ctx,w*0.34,h*0.34,w*0.22,28,'monitor\nδ(x) vs τ',C.amber,hexA(C.amber,0.07));
    arrow(ctx,w*0.24,h*0.52,w*0.34,h*0.48,C.violet,1.4);
    if(!ood){
      box(ctx,w*0.66,h*0.36,w*0.28,28,'✓ act',C.green,hexA(C.green,0.07));
      arrow(ctx,w*0.56,h*0.48,w*0.66,h*0.48,C.green,1.4);
      lab(ctx,'δ(x)='+Math.round(p*14+6)+' < τ=14  ✓',w*0.36,h*0.72,C.green,9);
    }else{
      box(ctx,w*0.66,h*0.36,w*0.28,28,'✗ OOD',C.coral,hexA(C.coral,0.07));
      arrow(ctx,w*0.56,h*0.48,w*0.66,h*0.48,C.coral,1.4);
      box(ctx,w*0.36,h*0.70,w*0.26,26,'safe fallback',C.green,hexA(C.green,0.08));
      arrow(ctx,w*0.45,h*0.62,w*0.45,h*0.70,C.coral,1.5);
      lab(ctx,'δ(x)='+Math.round(p*8+14)+' > τ=14  → switch',w*0.36,h*0.92,C.coral,9);
    }
    lab(ctx,'the fallback only needs to be safe, not optimal — a freeze or return-to-home suffices',14,h-14,C.mut);
  };

  /* sff_uq: uncertainty quantification — epistemic band widens in novel regions */
  A.sff_uq=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Uncertainty quantification: act with caution proportional to model ignorance',14,16,C.dim);
    var gx=w*0.08,gw=w*0.84,my=h*0.52;
    ctx.strokeStyle=hexA(C.cyan,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(var i=0;i<=gw;i++){var x=gx+i,y=my-Math.sin(i*0.013)*18;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    ctx.fillStyle=hexA(C.violet,0.14);ctx.beginPath();
    for(var i=0;i<=gw;i++){var band=5+Math.pow(i/gw,1.6)*52;ctx.lineTo(gx+i,my-Math.sin(i*0.013)*18-band);}
    for(var i=gw;i>=0;i--){var band=5+Math.pow(i/gw,1.6)*52;ctx.lineTo(gx+i,my-Math.sin(i*0.013)*18+band);}
    ctx.closePath();ctx.fill();
    lab(ctx,'confident (familiar)',gx+10,my+46,C.green,9);
    lab(ctx,'uncertain → widen margin',gx+gw*0.55,my+64,C.violet,9);
    var p=saw(t,5),px=gx+p*gw;
    dot(ctx,px,my-Math.sin(p*gw*0.013)*18,5,C.amber);
    lab(ctx,'current state',px+6,my-Math.sin(p*gw*0.013)*18-14,C.amber,8.5);
    lab(ctx,'P(y ∈ C(x)) ≥ 1−α — conformal coverage holds regardless of model',14,h-14,C.mut);
  };

  /* sff_ood: OOD detection — in-dist cluster vs out-of-dist point, energy score */
  A.sff_ood=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'OOD detection: flag inputs far from the training distribution',14,16,C.dim);
    var p=saw(t,5),cx=w*0.35,cy=h*0.52,r=52;
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();
    ring(ctx,cx,cy,r,hexA(C.cyan,0.5));
    lab(ctx,'in-distribution',cx-36,cy,C.cyan,9);
    var pts=[[cx-20,cy-18],[cx+15,cy-8],[cx-10,cy+20],[cx+22,cy+12],[cx-28,cy+5]];
    pts.forEach(function(q){dot(ctx,q[0],q[1],4,C.cyan);});
    var ox=w*0.72,oy=h*0.42;
    dot(ctx,ox,oy,7,C.coral);lab(ctx,'OOD input',ox+8,oy-10,C.coral,9);
    var dist=Math.sqrt(Math.pow(ox-cx,2)+Math.pow(oy-cy,2));
    var score=(dist-r)/r;
    lab(ctx,'energy score: '+score.toFixed(2)+' > τ → flag',ox-20,oy+22,C.coral,9);
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.lineWidth=1.2;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ox,oy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'distance: '+Math.round(dist)+'px',cx+(ox-cx)*0.4,cy+(oy-cy)*0.4-12,C.mut,8.5);
    lab(ctx,'model stays confident on unseen inputs — OOD score is the correction',14,h-14,C.mut);
  };

  /* sff_formal: formal verification — STL formula checked by solver, pass/fail */
  A.sff_formal=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Formal verification: prove a property holds for ALL scenarios, not just tested ones',14,16,C.dim);
    var p=saw(t,5);
    box(ctx,w*0.04,h*0.32,w*0.26,34,'plan / policy',C.violet,hexA(C.violet,0.07));
    box(ctx,w*0.38,h*0.30,w*0.24,34,'STL / SMT\nsolver',C.amber,hexA(C.amber,0.07));
    arrow(ctx,w*0.30,h*0.49,w*0.38,h*0.47,C.violet,1.4);
    var pass=p<0.72;
    if(pass){
      box(ctx,w*0.70,h*0.32,w*0.24,34,'✓ proved\nsafe',C.green,hexA(C.green,0.07));
      arrow(ctx,w*0.62,h*0.47,w*0.70,h*0.47,C.green,1.5);
    }else{
      box(ctx,w*0.70,h*0.32,w*0.24,34,'✗ counter-\nexample',C.coral,hexA(C.coral,0.07));
      arrow(ctx,w*0.62,h*0.47,w*0.70,h*0.47,C.coral,1.5);
      lab(ctx,'revise →',w*0.36,h*0.68,C.coral,9);
      arrow(ctx,w*0.72,h*0.66,w*0.17,h*0.56,C.coral,1.2);
    }
    lab(ctx,'φ: □(clearance ≥ d_min)  checked exhaustively by solver',14,h-14,C.mut);
  };

  /* sff_safe_il: safe imitation learning — demo distribution vs augmented near-constraint */
  A.sff_safe_il=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Safe imitation: augment demos near the safety boundary — where clones fail',14,16,C.dim);
    var p=saw(t,5);
    var bx=w*0.08,by=h*0.25,bw=w*0.84,bh=h*0.50;
    rrect(ctx,bx,by,bw,bh,8,hexA(C.line,0.6),hexA(C.mut,0.04));
    ctx.fillStyle=hexA(C.coral,0.25);ctx.fillRect(bx+bw*0.78,by,bw*0.22,bh);
    lab(ctx,'constraint boundary',bx+bw*0.78+4,by+10,C.coral,8.5);
    var noms=[[bx+bw*0.15,by+bh*0.45],[bx+bw*0.28,by+bh*0.38],[bx+bw*0.20,by+bh*0.58],
              [bx+bw*0.38,by+bh*0.50],[bx+bw*0.10,by+bh*0.30]];
    noms.forEach(function(q){dot(ctx,q[0],q[1],5,C.cyan);});
    lab(ctx,'nominal demos',bx+bw*0.08,by+bh+14,C.cyan,9);
    if(p>0.35){
      var augs=[[bx+bw*0.72,by+bh*0.32],[bx+bw*0.68,by+bh*0.55],[bx+bw*0.74,by+bh*0.65]];
      augs.forEach(function(q){dot(ctx,q[0],q[1],5,C.amber);ring(ctx,q[0],q[1],10,hexA(C.amber,0.5));});
      lab(ctx,'augmented near-boundary',bx+bw*0.54,by+bh+14,C.amber,9);
    }
    lab(ctx,'counterfactual perturbations and potential-field conditioning fill the dangerous gap',14,h-14,C.mut);
  };

  /* sff_coll_avoid: collision avoidance — robot body swept volume vs obstacle */
  A.sff_coll_avoid=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Collision avoidance: every part of the body must stay clear at all times',14,16,C.dim);
    var p=saw(t,5);
    var rx=w*0.18+p*w*0.50,ry=h*0.50,rb=22;
    ctx.fillStyle=hexA(C.violet,0.18);ctx.beginPath();ctx.arc(rx,ry,rb,0,TAU);ctx.fill();
    ring(ctx,rx,ry,rb,C.violet);lab(ctx,'robot\nbody',rx-14,ry-6,C.violet,8.5);
    var ox=w*0.75,oy=h*0.44,ob=28;
    dot(ctx,ox,oy,ob,hexA(C.coral,0.22));ring(ctx,ox,oy,ob,C.coral);lab(ctx,'obstacle',ox-20,oy-ob-12,C.coral,8.5);
    var dist=Math.sqrt(Math.pow(rx-ox,2)+Math.pow(ry-oy,2))-rb-ob;
    var safe=dist>20;
    var col=safe?C.green:C.coral;
    lab(ctx,'clearance: '+Math.max(0,Math.round(dist))+'px  '+(safe?'✓ safe':'⚠ too close'),rx+rb+6,ry-8,col,9);
    if(!safe){arrow(ctx,rx+rb,ry,rx+rb+22,ry,C.green,1.5);lab(ctx,'steer away',rx+rb+24,ry-12,C.green,8.5);}
    lab(ctx,'d_obs ≥ d_min must hold for the full robot geometry, not just the center of mass',14,h-14,C.mut);
  };

  /* sff_risk_plan: risk-aware planning — two paths with different risk/speed trade-off */
  A.sff_risk_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Risk-aware planning: spend the risk budget where the speed gain is largest',14,16,C.dim);
    var p=saw(t,5);
    var sx=w*0.08,sy=h*0.52,gx=w*0.88,gy=h*0.52;
    dot(ctx,sx,sy,7,C.cyan);lab(ctx,'start',sx-10,sy+16,C.cyan,9);
    dot(ctx,gx,gy,7,C.green);lab(ctx,'goal',gx-16,gy+16,C.green,9);
    ctx.strokeStyle=hexA(C.coral,0.5);ctx.lineWidth=1.5;ctx.setLineDash([6,4]);
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(w*0.5,h*0.18,gx,gy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'worst-case (slow, conservative)',w*0.38,h*0.14,C.coral,8.5);
    var pamt=Math.min(1,p*2);
    ctx.strokeStyle=hexA(C.green,0.85);ctx.lineWidth=2.5;ctx.beginPath();
    ctx.moveTo(sx,sy);var cpx=w*(0.3+pamt*0.2),cpy=h*(0.65+pamt*0.05);
    ctx.quadraticCurveTo(cpx,cpy,sx+(gx-sx)*pamt,sy);ctx.stroke();
    lab(ctx,'risk-aware (faster, ε-bounded)',w*0.30,h*0.78,C.green,8.5);
    lab(ctx,'P(collision) ≤ ε — formal bound on acceptable violation probability',14,h-14,C.mut);
  };

  /* sff_conformal: conformal prediction — calibration scores → prediction set */
  A.sff_conformal=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Conformal prediction: any black-box predictor gets a coverage-guaranteed set',14,16,C.dim);
    var p=saw(t,5),bx=w*0.06,bw=w*0.86,by=h*0.28,bh=h*0.42;
    var n=18,scores=[];for(var i=0;i<n;i++){scores.push(0.05+i/(n-1)*0.88);}
    var tau=scores[Math.floor((1-0.10)*(1+1/n)*n)];
    if(tau===undefined)tau=scores[scores.length-1];
    var sw=bw/n;
    scores.forEach(function(s2,i){
      var col=s2<=tau?hexA(C.green,0.7):hexA(C.coral,0.5);
      ctx.fillStyle=col;ctx.fillRect(bx+i*sw,by+bh-s2*bh,sw-2,s2*bh);
    });
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=2;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(bx,by+bh-tau*bh);ctx.lineTo(bx+bw,by+bh-tau*bh);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'τ = '+tau.toFixed(2)+' (90th quantile)',bx+bw*0.62,by+bh-tau*bh-12,C.amber,9);
    lab(ctx,'calibration scores',bx+8,by+bh+14,C.mut,9);
    lab(ctx,'C(x) = {y: s(x,y) ≤ τ} — coverage ≥ 90% with no model assumptions',14,h-14,C.mut);
  };

  /* sff_adv_rob: adversarial attack + certified radius diagram */
  A.sff_adv_rob=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Adversarial attacks: small imperceptible changes flip confident predictions',14,16,C.dim);
    var p=saw(t,5);
    var cx=w*0.28,cy=h*0.52,R=50;
    ctx.fillStyle=hexA(C.green,0.12);ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();
    ring(ctx,cx,cy,R,hexA(C.green,0.6));
    lab(ctx,'cert.\nradius',cx-18,cy-8,C.green,8.5);
    dot(ctx,cx,cy,6,C.cyan);lab(ctx,'clean\ninput',cx+8,cy+14,C.cyan,8.5);
    var pert=p*1.6,px2=cx+R*1.4,py2=cy-R*0.3;
    var col2=pert>1.0?C.coral:C.amber;
    dot(ctx,px2,py2,6,col2);
    lab(ctx,(pert>1.0?'✗ flipped':'~ border'),px2+8,py2-12,col2,8.5);
    ctx.strokeStyle=hexA(col2,0.5);ctx.lineWidth=1.2;ctx.setLineDash([5,3]);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px2,py2);ctx.stroke();ctx.setLineDash([]);
    var rx2=w*0.62,ry2=h*0.38;
    box(ctx,rx2,ry2,w*0.28,30,'PGD attack\n40 steps',C.coral,hexA(C.coral,0.07));
    box(ctx,rx2,ry2+50,w*0.28,30,'certified\ndefense',C.green,hexA(C.green,0.07));
    lab(ctx,'PGD follows ∇L in input space; certified defense bounds reachable outputs',14,h-14,C.mut);
  };

  /* sff_calibration: reliability diagram — uncalibrated vs calibrated */
  A.sff_calibration=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Calibration: predicted confidence should equal true accuracy',14,16,C.dim);
    var p=saw(t,5),ox=w*0.12,ow=w*0.76,oy=h*0.65,oh=h*0.42;
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox,oy-oh);ctx.moveTo(ox,oy);ctx.lineTo(ox+ow,oy);ctx.stroke();
    lab(ctx,'confidence',ox+ow/2,oy+16,C.mut,9,'center');
    lab(ctx,'accuracy',ox-8,oy-oh/2,C.mut,9,'right');
    ctx.strokeStyle=hexA(C.mut,0.35);ctx.lineWidth=1;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+ow,oy-oh);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'perfect',ox+ow*0.55,oy-oh*0.62,C.mut,8.5);
    var bins=6,bw2=ow/(bins+1);
    for(var i=0;i<bins;i++){
      var bconf=(i+1)/(bins+1),bacc_over=bconf+0.18*(1-bconf);
      var bacc_cal=bconf+0.03*(1-bconf);
      var bx2=ox+(i+0.5)*bw2+bw2*0.5;
      var oc=p<0.5?C.coral:hexA(C.coral,0.3),nc=p<0.5?hexA(C.green,0.3):C.green;
      dot(ctx,bx2,oy-bacc_over*oh,4,oc);
      dot(ctx,bx2,oy-bacc_cal*oh,4,nc);
    }
    if(p<0.5){lab(ctx,'uncalibrated (overconfident)',ox+8,oy-oh*0.85,C.coral,9);}
    else{lab(ctx,'calibrated (ECE ≈ 0.04)',ox+8,oy-oh*0.85,C.green,9);}
    lab(ctx,'temperature scaling: divide logits by T* found on calibration set',14,h-14,C.mut);
  };

  /* sff_hallucination: VLM attention grounding — grounded vs hallucinated token */
  A.sff_hallucination=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Hallucination detection: does the generated token attend to real image evidence?',14,16,C.dim);
    var p=saw(t,5),imgx=w*0.06,imgy=h*0.22,imgw=w*0.38,imgh=h*0.50;
    rrect(ctx,imgx,imgy,imgw,imgh,6,hexA(C.mut,0.4),hexA(C.mut,0.08));
    lab(ctx,'image',imgx+imgw/2,imgy+imgh/2,C.mut,10,'center');
    var obj1x=imgx+imgw*0.25,obj1y=imgy+imgh*0.4;
    dot(ctx,obj1x,obj1y,14,hexA(C.cyan,0.3));ring(ctx,obj1x,obj1y,14,C.cyan);
    lab(ctx,'laptop\n(real)',obj1x-16,obj1y+22,C.cyan,8.5);
    var halx=imgx+imgw*0.70,haly=imgy+imgh*0.55;
    dot(ctx,halx,haly,10,hexA(C.mut,0.15));
    var tkx=w*0.58,tky=h*0.30,tkw=w*0.36;
    rrect(ctx,tkx,tky,tkw,30,6,hexA(C.green,0.5),hexA(C.green,0.08));
    lab(ctx,'"laptop"  att=0.72',tkx+tkw/2,tky+15,C.green,9,'center');
    rrect(ctx,tkx,tky+44,tkw,30,6,hexA(C.coral,0.5),hexA(C.coral,0.08));
    lab(ctx,'"stapler"  att=0.08',tkx+tkw/2,tky+59,C.coral,9,'center');
    if(p>0.4){lab(ctx,'✗ hallucination: att<0.15',tkx+4,tky+86,C.coral,9);}
    arrow(ctx,obj1x+14,obj1y,tkx,tky+15,C.green,1.2);
    lab(ctx,'PAS: token with low image-patch attention → ungrounded → hallucinated',14,h-14,C.mut);
  };

  /* sff_tta: test-time adaptation — accuracy bars pre/post adaptation, with collapse check */
  A.sff_tta=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Test-time adaptation: update on unlabeled test data to close the distribution gap',14,16,C.dim);
    var p=saw(t,5),bx=w*0.08,bw=w*0.26,by=h*0.25,bh=h*0.50;
    var stages=['base','TENT','NC3+'];var vals=[0.52,0.64,0.78];var cols=[C.coral,C.amber,C.green];
    var sw2=bw/stages.length;
    stages.forEach(function(s,i){
      var v=vals[Math.min(i,vals.length-1)],c=cols[Math.min(i,cols.length-1)];
      ctx.fillStyle=hexA(c,0.20);ctx.fillRect(bx+i*sw2+3,by,sw2-6,bh);
      ctx.fillStyle=c;ctx.fillRect(bx+i*sw2+3,by+bh-v*bh,sw2-6,v*bh);
      lab(ctx,s,bx+i*sw2+sw2/2,by+bh+14,c,9,'center');
      lab(ctx,Math.round(v*100)+'%',bx+i*sw2+sw2/2,by+bh-v*bh-12,c,8.5,'center');
    });
    var ent=w*0.52,ew=w*0.40,ex=w*0.50;
    box(ctx,ex,h*0.32,ew,28,'entropy monitor',C.amber,hexA(C.amber,0.07));
    lab(ctx,'H > 1.8 bits → rollback to ckpt',ex+8,h*0.50,C.amber,8.5);
    arrow(ctx,ex+ew/2,h*0.60,ex+ew/2,h*0.70,C.coral,1.2);
    box(ctx,ex,h*0.70,ew,26,'checkpoint',C.green,hexA(C.green,0.07));
    lab(ctx,'neural collapse geometry gates when adaptation has gone too far',14,h-14,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.sfanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-sfanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
