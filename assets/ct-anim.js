/* ct-anim.js — first-principles mechanism animators for the Control & MPC explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-ctanim="name". Self-contained boot. */
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

  /* 01 — WHY: a plan is not motion; the body has dynamics, limits, disturbances. */
  A.ct_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A plan is a wish; the body has mass, limits, and gets pushed around',14,16,C.dim);
    const gx=w*0.08,gw=w*0.84,cy=h*0.5;
    // desired trajectory (dashed) vs actual (drifts off without control)
    ctx.strokeStyle=hexA(C.green,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const x=gx+i;ctx.lineTo(x,cy-Math.sin(i*0.02)*40);}ctx.stroke();
    lab(ctx,'planned trajectory',gx,cy-60,C.green,9);
    // actual drifts (open loop): lags + a disturbance kick
    const p=saw(t,4);ctx.strokeStyle=hexA(C.coral,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=p*gw;i++){const x=gx+i;const kick=(i>gw*0.5)?18:0;ctx.lineTo(x,cy-Math.sin((i-30)*0.02)*40+kick);}ctx.stroke();
    const ax=gx+p*gw;dot(ctx,ax,cy-Math.sin((p*gw-30)*0.02)*40+((p*gw>gw*0.5)?18:0),6,C.amber);
    if(p*gw>gw*0.5)lab(ctx,'← a push (disturbance)',gx+gw*0.52,cy+34,C.coral,8.5);
    lab(ctx,'actual (no correction) drifts',gx+gw*0.3,cy+50,C.coral,9);
    lab(ctx,'control is what turns the wished-for trajectory into motion the robot actually follows',14,h-12,C.mut);
  };

  /* 02 — FEEDBACK: measure the error, correct it, repeat. */
  A.ct_feedback=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Feedback: measure how far off you are, push back proportionally, repeat',14,16,C.dim);
    // loop diagram
    const cy=h*0.4;box(ctx,w*0.06,cy-14,w*0.14,28,'controller',C.violet,hexA(C.violet,0.08));
    box(ctx,w*0.4,cy-14,w*0.14,28,'robot',C.cyan,hexA(C.cyan,0.08));
    arrow(ctx,w*0.2,cy,w*0.4,cy,C.amber,1.5);lab(ctx,'command',w*0.24,cy-10,C.amber,8.5);
    // feedback line
    ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(w*0.54,cy);ctx.lineTo(w*0.7,cy);ctx.lineTo(w*0.7,cy+40);ctx.lineTo(w*0.02,cy+40);ctx.lineTo(w*0.02,cy);ctx.lineTo(w*0.06,cy);ctx.stroke();
    lab(ctx,'measured state (error) fed back',w*0.2,cy+50,C.green,8.5);
    // a dot tracking a moving target below
    const p=saw(t,3);const ty=h*0.8;const tgt=w*0.3+Math.sin(t*1.5)*w*0.2;
    ring(ctx,tgt,ty,9,C.green);lab(ctx,'target',tgt-14,ty-16,C.green,8);
    const cur=tgt - (tgt-(w*0.3))*0.3*Math.cos(t*4); // lags then corrects
    dot(ctx,cur,ty,6,C.amber);lab(ctx,'controlled →',cur+10,ty,C.amber,8);
    lab(ctx,'the closed loop chases down the error — bigger error, harder correction — and stays stable',14,h-12,C.mut);
  };

  /* 03 — MPC: predict a short horizon, optimize, act, replan. */
  A.ct_mpc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Model-predictive control: plan a few steps ahead, take one, then replan',14,16,C.dim);
    const gx=w*0.08,gw=w*0.84,cy=h*0.52;
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.beginPath();ctx.moveTo(gx,cy);ctx.lineTo(gx+gw,cy);ctx.stroke();
    const p=saw(t,4);const nowx=gx+0.1*gw+p*gw*0.7;
    // horizon window
    const hw=gw*0.22;ctx.fillStyle=hexA(C.violet,0.1);ctx.fillRect(nowx,cy-50,hw,100);
    lab(ctx,'prediction horizon',nowx+6,cy-56,C.violet,8.5);
    // predicted optimized trajectory in window
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<hw;i++){ctx.lineTo(nowx+i,cy-Math.sin(i*0.04)*24 - i*0.1);}ctx.stroke();
    dot(ctx,nowx,cy,6,C.green);lab(ctx,'execute just the first step →',nowx-4,cy+40,C.green,8.5);
    // trail of executed
    ctx.strokeStyle=hexA(C.green,0.6);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx+0.1*gw,cy);ctx.lineTo(nowx,cy);ctx.stroke();
    lab(ctx,'optimize controls over a short future under the model + limits, act once, slide the window',14,h-12,C.mut);
  };

  /* 04 — WHOLE-BODY: distribute one task across many joints under limits. */
  A.ct_wholebody=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Whole-body control: split one goal across every joint, within its limits',14,16,C.dim);
    // a stick robot (torso + arm chain) reaching a target; joints share the work
    const bx=w*0.34,by=h*0.72;const p=saw(t,4);const reach=Math.sin(t*1.2)*0.3;
    let x=bx,y=by,ang=-1.2;const angs=[-1.2+reach*0.3,-0.6+reach*0.4,-0.2+reach*0.5,0.2+reach*0.4];
    ctx.strokeStyle=C.cyan;ctx.lineWidth=5;
    angs.forEach((a,i)=>{const nx=x+Math.cos(a)*46,ny=y+Math.sin(a)*46;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,x,y,5,C.amber);
      lab(ctx,'τ'+(i+1),(x+nx)/2+4,(y+ny)/2-4,C.mut,8);x=nx;y=ny;});
    ring(ctx,w*0.8,h*0.34,10,C.green);lab(ctx,'task: hand here',w*0.72,h*0.28,C.green,9);
    dot(ctx,x,y,6,C.green);
    lab(ctx,'each joint torque τ contributes',w*0.06,h*0.34,C.mut,9);
    lab(ctx,'a QP finds joint torques that hit the task while respecting torque, balance, and contact limits',14,h-12,C.mut);
  };

  /* 05 — REAL-TIME: the solve must finish inside the control tick. */
  A.ct_realtime=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The clock: the optimization must finish before the next control tick',14,16,C.dim);
    // a control tick budget bar filling; solve must fit
    const gx=w*0.1,gw=w*0.8,by=h*0.4,bh=26;
    rrect(ctx,gx,by,gw,bh,5,C.line,null);
    const p=saw(t,2);ctx.fillStyle=hexA(C.amber,0.6);ctx.fillRect(gx,by,gw*Math.min(1,p*0.8),bh);
    lab(ctx,'solve time',gx+6,by+bh/2,C.ink,9);
    // deadline marker at ~1ms
    const dl=gx+gw*0.85;ctx.strokeStyle=C.coral;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(dl,by-8);ctx.lineTo(dl,by+bh+8);ctx.stroke();
    lab(ctx,'deadline (~1 ms)',dl-30,by-16,C.coral,8.5);
    // the trade dial
    lab(ctx,'the trade-off:',w*0.1,h*0.66,C.mut,9.5);
    lab(ctx,'richer model → better motion, but slower solve',w*0.12,h*0.72,C.mut,9);
    lab(ctx,'simpler model → fits the tick, but approximate',w*0.12,h*0.78,C.mut,9);
    lab(ctx,'control lives under a hard real-time budget — fidelity is always traded against solve speed',14,h-12,C.mut);
  };

  // ---- family animators ----

  /* ctf_mpc_rt: receding-horizon window sliding along a timeline */
  A.ctf_mpc_rt=function(ctx,w,h,t){
    var p=saw(t,4);
    clear(ctx,w,h);
    lab(ctx,'MPC & real-time control',w/2,14,C.dim,10.5,'center');
    var gx=w*0.06,gw=w*0.88,cy=h*0.48,nowx=gx+p*gw*0.8;
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,cy);ctx.lineTo(gx+gw,cy);ctx.stroke();
    var hw=gw*0.2;
    ctx.fillStyle=hexA(C.violet,0.13);ctx.fillRect(nowx,cy-38,hw,76);
    lab(ctx,'horizon',nowx+hw/2,cy-46,C.violet,9,'center');
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(var i=0;i<hw;i++){ctx.lineTo(nowx+i,cy-Math.sin(i*0.05)*22);}ctx.stroke();
    ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,cy);ctx.lineTo(nowx,cy);ctx.stroke();
    dot(ctx,nowx,cy,6,C.green);
    lab(ctx,'execute first step only',nowx+4,cy+30,C.green,8.5);
    lab(ctx,'slide window → replan with fresh measurement',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_ddp: backward-forward sweep arrows on a timeline */
  A.ctf_ddp=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Trajectory & optimal control (DDP)',w/2,14,C.dim,10.5,'center');
    var steps=6,sx=w*0.1,ex=w*0.9,cy=h*0.46,dx=(ex-sx)/(steps-1);
    for(var i=0;i<steps;i++){dot(ctx,sx+i*dx,cy,5,i===0?C.green:C.mut);}
    lab(ctx,'start',sx-4,cy+18,C.green,8.5);lab(ctx,'goal',ex-6,cy+18,C.amber,8.5);dot(ctx,ex,cy,5,C.amber);
    var bi=Math.floor(p*(steps-1));
    arrow(ctx,sx+(bi+1)*dx,cy-22,sx+bi*dx,cy-22,C.cyan,2);
    lab(ctx,'backward pass: value function ←',w/2,cy-36,C.cyan,8.5,'center');
    var fi=Math.min(steps-1,Math.floor(p*(steps-1)));
    arrow(ctx,sx+fi*dx,cy+22,sx+(fi+1)*dx,cy+22,C.amber,2);
    lab(ctx,'forward pass: apply gains →',w/2,cy+38,C.amber,8.5,'center');
    lab(ctx,'alternate backward/forward sweeps until convergence — O(n²N) not O(n³)',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_impedance: spring-damper coupling between robot end-effector and wall */
  A.ctf_impedance=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Feedback & impedance control',w/2,14,C.dim,10.5,'center');
    var wx=w*0.78,wy=h*0.28,wh=h*0.44;
    rrect(ctx,wx,wy,w*0.12,wh,4,C.mut,hexA(C.mut,0.12));
    lab(ctx,'surface',wx+w*0.06,wy+wh+12,C.mut,8.5,'center');
    var ex=w*0.3+Math.sin(t*1.5)*w*0.12,ey=h*0.5;
    var springX=wx-4;
    ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=1.5;ctx.beginPath();
    var segs=8,sd=(springX-ex)/segs;
    ctx.moveTo(ex,ey);
    for(var i=1;i<segs;i++){ctx.lineTo(ex+i*sd,ey+(i%2===0?-10:10));}
    ctx.lineTo(springX,ey);ctx.stroke();
    lab(ctx,'K, B',ex+(springX-ex)/2,ey-20,C.cyan,8.5,'center');
    dot(ctx,ex,ey,7,C.amber);lab(ctx,'end-effector',ex,ey+20,C.amber,8.5,'center');
    var err=Math.abs(ex-springX+4).toFixed(0);
    lab(ctx,'F = K·x + B·ẋ',w*0.08,h*0.82,C.green,9);
    lab(ctx,'compliance absorbs contact — bigger error → stronger restoring force',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_qp: priority-stacked objectives with weights */
  A.ctf_qp=function(ctx,w,h,t){
    var p=saw(t,4);
    clear(ctx,w,h);
    lab(ctx,'Whole-body & QP control',w/2,14,C.dim,10.5,'center');
    var objs=[{l:'balance (hard)',w:0.85,c:C.coral},{l:'hand target',w:0.55,c:C.amber},{l:'min torques',w:0.25,c:C.green}];
    var bx=w*0.08,bw=w*0.84,by=h*0.28,bh=22,gap=14;
    objs.forEach(function(o,i){
      var filled=Math.min(o.w,p<0.5?p*2*o.w:o.w);
      rrect(ctx,bx,by+i*(bh+gap),bw,bh,5,hexA(o.c,0.3),null);
      ctx.fillStyle=hexA(o.c,0.7);ctx.fillRect(bx,by+i*(bh+gap),bw*filled,bh);
      lab(ctx,o.l,bx+6,by+i*(bh+gap)+bh/2,C.ink,9);
      lab(ctx,'w='+(o.w*100).toFixed(0)+'%',bx+bw+4,by+i*(bh+gap)+bh/2,o.c,8.5);
    });
    lab(ctx,'single QP finds torques that satisfy all objectives weighted by priority',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_legged: footstep dots + balance zone */
  A.ctf_legged=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Legged locomotion control',w/2,14,C.dim,10.5,'center');
    var cy=h*0.56,robot_x=w*0.1+p*w*0.7;
    var footsteps=[0.12,0.22,0.34,0.44,0.56,0.66,0.78];
    footsteps.forEach(function(fx){
      var x=w*fx;
      ctx.fillStyle=x<robot_x?hexA(C.green,0.5):hexA(C.mut,0.25);
      ctx.beginPath();ctx.ellipse(x,cy+18,10,5,0,0,Math.PI*2);ctx.fill();
    });
    dot(ctx,robot_x,cy-8,10,C.cyan);
    var cone_w=w*0.1;
    ctx.strokeStyle=hexA(C.amber,0.6);ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(robot_x,cy+5);ctx.lineTo(robot_x-cone_w/2,cy+22);ctx.lineTo(robot_x+cone_w/2,cy+22);ctx.closePath();ctx.stroke();
    lab(ctx,'support\npolygon',robot_x+cone_w/2+4,cy+14,C.amber,8);
    lab(ctx,'↑ CoM','',0,'');
    lab(ctx,'MPC plans foot forces that keep CoM inside friction cone — capture-point logic',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_aerial: nested inner/outer loop cascade */
  A.ctf_aerial=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Aerial vehicle control',w/2,14,C.dim,10.5,'center');
    box(ctx,w*0.06,h*0.28,w*0.2,28,'position\ncontroller\n(100 Hz)',C.cyan,hexA(C.cyan,0.07));
    box(ctx,w*0.38,h*0.28,w*0.2,28,'attitude\ncontroller\n(1 kHz)',C.amber,hexA(C.amber,0.07));
    box(ctx,w*0.70,h*0.28,w*0.18,28,'motors',C.violet,hexA(C.violet,0.07));
    arrow(ctx,w*0.26,h*0.28+14,w*0.38,h*0.28+14,C.cyan,1.8);
    lab(ctx,'θ_des',w*0.30,h*0.28+4,C.cyan,8.5,'center');
    arrow(ctx,w*0.58,h*0.28+14,w*0.70,h*0.28+14,C.amber,1.8);
    lab(ctx,'rates',w*0.63,h*0.28+4,C.amber,8.5,'center');
    var drone_x=w*0.5+Math.sin(t*1.2)*w*0.12,drone_y=h*0.72;
    dot(ctx,drone_x,drone_y,9,C.green);
    var tilt=Math.sin(t*1.2)*0.3;
    ctx.save();ctx.translate(drone_x,drone_y);ctx.rotate(tilt);
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(20,0);ctx.stroke();
    ctx.restore();
    lab(ctx,'outer loop steers lean angle; inner loop tracks it — timescale separation',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_contact: complementarity smooth contact selection */
  A.ctf_contact=function(ctx,w,h,t){
    var p=saw(t,4);
    clear(ctx,w,h);
    lab(ctx,'Contact-implicit control',w/2,14,C.dim,10.5,'center');
    var segs=5,sw=(w*0.7)/segs,sx=w*0.15,cy=h*0.5;
    for(var i=0;i<segs;i++){
      var active=Math.sin(t*1.2+i*1.1)>0.1;
      box(ctx,sx+i*sw+3,cy-12,sw-6,24,'seg '+(i+1),active?C.cyan:C.mut,active?hexA(C.cyan,0.15):hexA(C.mut,0.08));
      if(active){
        ctx.strokeStyle=hexA(C.amber,0.7);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx+i*sw+sw/2,cy+12);ctx.lineTo(sx+i*sw+sw/2,cy+30);ctx.stroke();
        dot(ctx,sx+i*sw+sw/2,cy+33,3,C.amber);
      }
    }
    lab(ctx,'contact selected automatically',w/2,cy+46,C.amber,8.5,'center');
    lab(ctx,'complementarity relaxation: g(x)·f ≈ 0 — solver picks contacts without mode enumeration',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_learnmpc: first-principles + residual network correction */
  A.ctf_learnmpc=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Learning-augmented MPC',w/2,14,C.dim,10.5,'center');
    var cy=h*0.44;
    box(ctx,w*0.06,cy-14,w*0.22,28,'physics\nmodel',C.cyan,hexA(C.cyan,0.09));
    box(ctx,w*0.06,cy+34,w*0.22,28,'neural\nresidual',C.violet,hexA(C.violet,0.09));
    arrow(ctx,w*0.28,cy,w*0.42,cy,C.cyan,1.6);
    arrow(ctx,w*0.28,cy+48,w*0.42,cy+34,C.violet,1.6);
    box(ctx,w*0.42,cy-14,w*0.18,56,'augmented\nf_aug',C.amber,hexA(C.amber,0.09));
    arrow(ctx,w*0.60,cy+14,w*0.74,cy+14,C.amber,1.6);
    box(ctx,w*0.74,cy,w*0.18,28,'MPC\nsolver',C.green,hexA(C.green,0.09));
    var err_phys=12,err_aug=3.1;
    lab(ctx,'physics error: '+err_phys+' cm',w*0.06,h*0.82,C.cyan,8.5);
    lab(ctx,'augmented error: '+err_aug+' cm',w*0.06,h*0.88,C.amber,8.5);
    lab(ctx,'residual patches the model blind spots while keeping physics structure intact',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_robust: tube of safety around nominal trajectory */
  A.ctf_robust=function(ctx,w,h,t){
    var p=saw(t,4);
    clear(ctx,w,h);
    lab(ctx,'Robust & adaptive control',w/2,14,C.dim,10.5,'center');
    var gx=w*0.08,gw=w*0.84,cy=h*0.48;
    ctx.strokeStyle=hexA(C.green,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(var i=0;i<=gw;i++){ctx.lineTo(gx+i,cy-Math.sin(i*0.018)*30);}ctx.stroke();
    lab(ctx,'nominal trajectory',gx,cy-46,C.green,8.5);
    var tube=18;
    ctx.strokeStyle=hexA(C.amber,0.4);ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();
    for(var i=0;i<=gw;i++){ctx.lineTo(gx+i,cy-Math.sin(i*0.018)*30-tube);}ctx.stroke();
    ctx.beginPath();for(var i=0;i<=gw;i++){ctx.lineTo(gx+i,cy-Math.sin(i*0.018)*30+tube);}ctx.stroke();
    ctx.setLineDash([]);
    lab(ctx,'safety tube',gx+gw*0.5,cy+tube+12,C.amber,8.5,'center');
    var rx=gx+p*gw*0.9,ry=cy-Math.sin(p*gw*0.9*0.018)*30+(Math.sin(t*3)*tube*0.6);
    dot(ctx,rx,ry,5,C.coral);
    lab(ctx,'actual state (stays inside)',rx+8,ry-10,C.coral,8);
    lab(ctx,'adaptive loop estimates parameters online; tube tightens as estimate improves',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_variational: energy conservation comparison */
  A.ctf_variational=function(ctx,w,h,t){
    var p=saw(t,4);
    clear(ctx,w,h);
    lab(ctx,'Variational & structure-preserving control',w/2,14,C.dim,10.5,'center');
    var gx=w*0.1,gw=w*0.8,cy=h*0.5,steps=60;
    lab(ctx,'energy vs time step',gx,h*0.28,C.dim,9);
    ctx.strokeStyle=hexA(C.coral,0.85);ctx.lineWidth=2;ctx.beginPath();
    for(var i=0;i<steps;i++){var x=gx+i*(gw/steps),drift=i*0.6;ctx.lineTo(x,cy-drift);}ctx.stroke();
    lab(ctx,'Euler (drifts +0.8%)',gx+gw*0.55,cy-36,C.coral,8.5);
    ctx.strokeStyle=hexA(C.green,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(var i=0;i<steps;i++){var x=gx+i*(gw/steps);ctx.lineTo(x,cy+Math.sin(i*0.3)*0.5);}ctx.stroke();
    lab(ctx,'variational (stable)',gx+gw*0.55,cy+10,C.green,8.5);
    var px=gx+Math.min(p*gw*1.1,gw);
    dot(ctx,px,cy-px*0.006*gw/gw,5,C.coral);dot(ctx,px,cy+Math.sin(px/gw*steps*0.3)*0.5,5,C.green);
    lab(ctx,'symplectic structure preserves energy exactly — long horizons stay faithful to physics',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_multiagent: distributed consensus exchange */
  A.ctf_multiagent=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Multi-agent & distributed control',w/2,14,C.dim,10.5,'center');
    var agents=[{x:w*0.15,y:h*0.45},{x:w*0.38,y:h*0.32},{x:w*0.62,y:h*0.58},{x:w*0.80,y:h*0.40},{x:w*0.50,y:h*0.72}];
    var edges=[[0,1],[1,2],[2,3],[1,4],[2,4]];
    edges.forEach(function(e){
      var a=agents[e[0]],b=agents[e[1]];
      ctx.strokeStyle=hexA(C.cyan,0.3+p*0.4);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    });
    agents.forEach(function(a,i){
      dot(ctx,a.x,a.y,9,C.amber);lab(ctx,'R'+(i+1),a.x,a.y+20,C.mut,8,'center');
    });
    var round=Math.min(3,Math.floor(p*4));
    lab(ctx,'consensus round '+round+' / 3',w/2,h*0.16,C.green,9,'center');
    lab(ctx,'each robot solves its own MPC; broadcasts predicted path; neighbors add it as constraint',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_worldmodel: state → model → predicted next state → plan */
  A.ctf_worldmodel=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Learned world models & dynamics prediction',w/2,14,C.dim,10.5,'center');
    var cy=h*0.44;
    box(ctx,w*0.04,cy-14,w*0.18,28,'state\n+ action',C.cyan,hexA(C.cyan,0.09));
    box(ctx,w*0.36,cy-14,w*0.22,28,'learned\nworld model',C.violet,hexA(C.violet,0.09));
    box(ctx,w*0.72,cy-14,w*0.22,28,'predicted\nnext state',C.amber,hexA(C.amber,0.09));
    arrow(ctx,w*0.22,cy,w*0.36,cy,C.cyan,1.8);
    arrow(ctx,w*0.58,cy,w*0.72,cy,C.amber,1.8);
    var aflow=saw(t,2);
    dot(ctx,w*0.22+aflow*(w*0.14),cy,4,C.violet);
    lab(ctx,'roll out K action seqs → score → pick best',w/2,cy+36,C.green,8.5,'center');
    lab(ctx,'fast differentiable rollout replaces real-world interaction at plan time',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_diffrend: image pixels → gradient → joint angles */
  A.ctf_diffrend=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Differentiable rendering & trajectory optimization',w/2,14,C.dim,10.5,'center');
    var cy=h*0.44;
    box(ctx,w*0.04,cy-14,w*0.2,28,'joint\nangles q',C.cyan,hexA(C.cyan,0.09));
    box(ctx,w*0.36,cy-14,w*0.24,28,'differentiable\nrenderer',C.violet,hexA(C.violet,0.09));
    box(ctx,w*0.74,cy-14,w*0.2,28,'image\nI(q)',C.amber,hexA(C.amber,0.09));
    arrow(ctx,w*0.24,cy,w*0.36,cy,C.cyan,1.8);
    arrow(ctx,w*0.60,cy,w*0.74,cy,C.amber,1.8);
    ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(w*0.74,cy+14);ctx.lineTo(w*0.24,cy+40);ctx.lineTo(w*0.24,cy+14);ctx.stroke();
    ctx.setLineDash([]);
    lab(ctx,'∂L/∂q gradient flows back',w*0.44,cy+52,C.green,8.5,'center');
    lab(ctx,'backprop from pixels to joints — no separate pose estimator needed',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_physmotion: physics loss inside diffusion generation */
  A.ctf_physmotion=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Physics-aware motion synthesis',w/2,14,C.dim,10.5,'center');
    var cy=h*0.44;
    box(ctx,w*0.04,cy-14,w*0.20,28,'noisy\nmotion',C.mut,hexA(C.mut,0.09));
    box(ctx,w*0.36,cy-14,w*0.24,28,'denoiser\n+phys loss',C.violet,hexA(C.violet,0.09));
    box(ctx,w*0.74,cy-14,w*0.20,28,'clean\nmotion',C.green,hexA(C.green,0.09));
    arrow(ctx,w*0.24,cy,w*0.36,cy,C.mut,1.8);
    arrow(ctx,w*0.60,cy,w*0.74,cy,C.green,1.8);
    var fv=Math.sin(t*1.8)*10;
    var fx=w*0.48,fy=cy+42;
    lab(ctx,'L_phys = ||m·a − F_contact||²',fx,fy,C.amber,8.5,'center');
    arrow(ctx,fx,fy-10,fx,cy+14,C.amber,1.4);
    dot(ctx,w*0.36+p*(w*0.24),cy,4,C.cyan);
    lab(ctx,'physics loss at each denoising step — no full simulator needed',w/2,h-12,C.mut,9,'center');
  };

  /* ctf_flowphys: distribution of physics param samples */
  A.ctf_flowphys=function(ctx,w,h,t){
    var p=saw(t,3);
    clear(ctx,w,h);
    lab(ctx,'Flow matching & probabilistic physics prediction',w/2,14,C.dim,10.5,'center');
    var n=8,cx=w*0.5,cy=h*0.5,r=h*0.28;
    for(var i=0;i<n;i++){
      var ang=i*(Math.PI*2/n)+t*0.4;
      var tx=cx+Math.cos(ang)*r*(0.7+i*0.04),ty=cy+Math.sin(ang)*r*(0.7+i*0.04);
      var alpha=0.2+i*0.07;
      dot(ctx,tx,ty,5,hexA(C.amber,alpha));
      if(p>i/n){
        ctx.strokeStyle=hexA(C.cyan,0.25);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(tx,ty);ctx.stroke();
      }
    }
    dot(ctx,cx,cy,7,C.violet);lab(ctx,'noise',cx,cy-14,C.violet,8.5,'center');
    lab(ctx,'K param\nsamples',cx+r+8,cy,C.amber,8.5);
    lab(ctx,'flow maps noise → distribution of material params → K physics rollouts',w/2,h-12,C.mut,9,'center');
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.ctanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-ctanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
