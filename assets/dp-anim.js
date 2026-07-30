/* dp-anim.js — first-principles mechanism animators for the Diffusion-Policies explainer.
   Same harness contract: A[name]=fn(ctx,w,h,t); canvases carry data-dpanim="name". Self-contained boot. */
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
  function box(ctx,x,y,w,h,text,col,fill){rrect(ctx,x,y,w,h,7,col,fill||null);lab(ctx,text,x+w/2,y+h/2,col,11,'center');}
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=6;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  function xmark(ctx,x,y,r,col){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r,y-r);ctx.lineTo(x+r,y+r);ctx.moveTo(x+r,y-r);ctx.lineTo(x-r,y+r);ctx.stroke();}
  const saw=(t,p)=>((t%p)/p),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  // deterministic jitter
  function jit(i){const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s);}

  const A={};

  /* 01 — THE AVERAGING TRAP: two valid actions; a regressor outputs their mean, which is wrong. */
  A.dp_multimodal=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The trap: when a task has TWO right answers, averaging them gives a wrong one',14,16,C.dim);
    const cx=w*0.5,cy=h*0.56;
    // object (a mug) in the middle
    rrect(ctx,cx-26,cy-24,52,44,6,C.mut,hexA(C.mut,0.12));lab(ctx,'mug',cx,cy-2,C.mut,10,'center');
    // two valid grasps
    const lx=cx-90,rx=cx+90;
    dot(ctx,lx,cy,8,C.green);lab(ctx,'grab left ✓',lx-30,cy-18,C.green,10);
    dot(ctx,rx,cy,8,C.green);lab(ctx,'grab right ✓',rx-14,cy-18,C.green,10);
    // regressor averages -> middle (empty, above the mug)
    const my=cy-70;
    arrow(ctx,lx,cy-6,cx-2,my+6,hexA(C.coral,0.5),1.2);arrow(ctx,rx,cy-6,cx+2,my+6,hexA(C.coral,0.5),1.2);
    dot(ctx,cx,my,7,C.coral);xmark(ctx,cx,my,10,C.coral);
    lab(ctx,'a regressor outputs the AVERAGE → reaches empty space ✗',cx-150,my-16,C.coral,10);
    lab(ctx,'ordinary behavior cloning minimizes error to “the” action — but there is no single right action',14,h-12,C.mut);
  };

  /* 02 — DENOISING: start from pure noise, refine step by step into one clean action, conditioned on the obs. */
  A.dp_denoise=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The fix, borrowed from image generators: turn noise into an action, step by step',14,16,C.dim);
    const steps=5,y=h*0.55,x0=w*0.1,dx=(w*0.8)/(steps-1);
    const p=saw(t,4)*(steps-1);
    for(let s=0;s<steps;s++){const x=x0+dx*s;
      // cloud tightening toward a point as s grows
      const spread=28*(1-s/(steps-1));
      for(let k=0;k<10;k++){const a=k/10*TAU;dot(ctx,x+Math.cos(a+k)*spread*(0.4+0.6*jit(k+s)),y+Math.sin(a+k)*spread*(0.4+0.6*jit(k+s*3)),1.8,hexA(C.cyan,0.5));}
      if(s===steps-1){dot(ctx,x,y,6,C.cyan);lab(ctx,'action',x,y+22,C.cyan,10,'center');}
      lab(ctx,s===0?'pure noise':('step '+s),x,y-40,s<=p?C.ink:C.dim,9.5,'center');
      if(s<steps-1)arrow(ctx,x+spread+4,y,x+dx-spread-2,y,hexA(C.mut,0.6),1.2);
    }
    // obs conditioning
    box(ctx,w*0.42,h*0.18,w*0.16,26,'observation',C.amber);arrow(ctx,w*0.5,h*0.29,w*0.5,y-46,hexA(C.amber,0.7),1.2);
    lab(ctx,'each denoising step is nudged by what the robot sees → a clean, decisive action falls out',14,h-12,C.mut);
  };

  /* 03 — MODEL THE WHOLE DISTRIBUTION: bimodal; a sample lands on one mode, a regressor sits in the dead valley. */
  A.dp_distribution=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Model the whole distribution of good actions — then SAMPLE one, don’t average',14,16,C.dim);
    const x0=w*0.1,x1=w*0.9,base=h*0.72;
    // bimodal curve
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    const f=x=>{const u=(x-x0)/(x1-x0);return Math.exp(-Math.pow((u-0.28)/0.12,2))+Math.exp(-Math.pow((u-0.72)/0.12,2));};
    for(let i=0;i<=60;i++){const x=x0+(x1-x0)*i/60,y=base-f(x)*h*0.34;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'distribution of valid actions',x0,base-h*0.4,C.cyan,10);
    // regressor at the valley (average)
    const mx=x0+(x1-x0)*0.5;dot(ctx,mx,base,6,C.coral);xmark(ctx,mx,base-24,9,C.coral);
    lab(ctx,'regressor → the valley (average) ✗',mx-70,base+16,C.coral,10);
    // diffusion sample onto a mode, alternating
    const peak=Math.floor(saw(t,3)*2)%2; const px=x0+(x1-x0)*(peak?0.72:0.28);
    dot(ctx,px,base-f(px)*h*0.34,7,C.green);lab(ctx,'a sample → one real mode ✓',px-40,base-f(px)*h*0.34-16,C.green,10);
    lab(ctx,'left grasp OR right grasp, committed — never the impossible blend of the two',14,h-12,C.mut);
  };

  /* 04 — ACTION CHUNKING: predict a short trajectory, execute a few, replan — smooth vs single-step jitter. */
  A.dp_chunk=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Predict a CHUNK of future actions, execute a few, replan — steady, not twitchy',14,16,C.dim);
    // top: single-step jitter
    const ty=h*0.34,x0=w*0.1,x1=w*0.9;
    lab(ctx,'one action at a time:',14,ty-24,C.coral,10);
    ctx.strokeStyle=hexA(C.coral,0.8);ctx.lineWidth=1.4;ctx.beginPath();
    for(let i=0;i<=24;i++){const x=x0+(x1-x0)*i/24,y=ty+ (jit(i)*2-1)*16;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'jitter',x1+4,ty,C.coral,10);
    // bottom: chunked + receding horizon
    const by=h*0.72;lab(ctx,'chunked + receding horizon:',14,by-24,C.green,10);
    const H=w*0.26;const start=saw(t,4)*(x1-x0-H)+x0;
    // executed part (solid) then predicted chunk (dashed) ahead
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,by);ctx.lineTo(start,by+6*Math.sin(start/40));ctx.stroke();
    ctx.strokeStyle=hexA(C.cyan,0.9);ctx.setLineDash([5,4]);ctx.beginPath();
    for(let i=0;i<=20;i++){const x=start+H*i/20,y=by+6*Math.sin(x/40);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);
    for(let i=0;i<=4;i++){const x=start+H*i/4;dot(ctx,x,by+6*Math.sin(x/40),2.5,C.cyan);}
    lab(ctx,'predicted chunk (execute first few)',start,by-14,C.cyan,10);
    lab(ctx,'predicting a short trajectory keeps motion consistent and lets the policy commit to a plan',14,h-12,C.mut);
  };

  /* 05 — SPEED: many denoise steps (slow) vs consistency/flow (1-2 steps) for a real-time control loop. */
  A.dp_speed=function(ctx,w,h,t){clear(ctx,w,h);
    const midY=h*0.5;ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(0,midY);ctx.lineTo(w,midY);ctx.stroke();
    // top: 50 steps
    lab(ctx,'plain diffusion — ~50 denoising steps per action',14,16,C.coral);
    const ty=h*0.30,x0=w*0.06,x1=w*0.7;const p=saw(t,3);
    for(let i=0;i<16;i++){const x=x0+(x1-x0)*i/15;const on=i<=p*16;dot(ctx,x,ty,on?3.2:2,on?C.coral:hexA(C.dim,0.5));
      if(i<15)ctx.strokeStyle=hexA(C.coral,0.4),ctx.beginPath(),ctx.moveTo(x,ty),ctx.lineTo(x0+(x1-x0)*(i+1)/15,ty),ctx.stroke();}
    dot(ctx,x1+16,ty,6,C.coral);lab(ctx,'action',x1+16,ty+16,C.coral,9,'center');
    lab(ctx,'accurate, but too slow for a fast control loop',x0,ty+22,C.mut);lab(ctx,'≈ few Hz',w*0.84,ty,C.coral,12);
    // bottom: consistency / flow, 1-2 steps
    lab(ctx,'consistency model / flow matching — 1–2 steps',14,midY+22,C.green);
    const gy=h*0.76;dot(ctx,x0,gy,4,hexA(C.dim,0.6));arrow(ctx,x0+10,gy,x0+w*0.5,gy,C.green,2);
    dot(ctx,x0+w*0.5+12,gy,6,C.green);lab(ctx,'action',x0+w*0.5+12,gy-16,C.green,9,'center');
    lab(ctx,'jump almost straight to the answer → fast enough to run on a real robot',x0,gy+22,C.mut);lab(ctx,'≈ 100s of Hz',w*0.84,gy,C.green,12);
  };

  // ===== per-family diagrams (wave A: families 1-8) =====

  // F1 MULTIMODAL BC — varied demos in -> a policy that reproduces the variety, not the average.
  A.dpf_bc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A few dozen demos, several valid ways each → learn the variety, not the average',14,16,C.dim);
    // stack of demo trajectories (varied)
    const cols=[C.cyan,C.violet,C.amber,C.green];
    for(let d=0;d<4;d++){ctx.strokeStyle=hexA(cols[d],0.8);ctx.lineWidth=1.4;ctx.beginPath();
      for(let i=0;i<=20;i++){const u=i/20,x=w*0.08+w*0.24*u,y=h*0.42+(d-1.5)*10+Math.sin(u*3+d)*10;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
    lab(ctx,'~40 demos (varied)',w*0.08,h*0.66,C.mut,10);
    arrow(ctx,w*0.34,h*0.44,w*0.44,h*0.44,C.ink,1.6);
    box(ctx,w*0.45,h*0.34,w*0.18,h*0.2,'diffusion policy',C.accent||C.cyan);
    arrow(ctx,w*0.64,h*0.44,w*0.72,h*0.44,C.ink,1.6);
    // samples: two distinct actions
    const pk=Math.floor(saw(t,3)*2)%2;
    dot(ctx,w*0.8,h*0.34,7,pk?hexA(C.green,0.4):C.green);dot(ctx,w*0.8,h*0.54,7,pk?C.green:hexA(C.green,0.4));
    lab(ctx,'sample → one real way',w*0.74,h*0.66,C.green,10);
    lab(ctx,'the denoiser keeps every demonstrated mode alive and commits to one on each run',14,h-12,C.mut);
  };

  // F2 STREAMING CHUNKS — receding-horizon window slides; warm-start reuses the last denoise.
  A.dpf_chunk=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Keep a chunk always ready: slide the horizon, warm-start the next denoise',14,16,C.dim);
    const x0=w*0.08,x1=w*0.92,yy=h*0.5,H=w*0.32,p=saw(t,4);
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x1,yy);ctx.stroke();lab(ctx,'task time →',x0,yy+24,C.dim,10);
    const start=x0+(x1-x0-H)*p;
    // executed (solid) up to start
    ctx.strokeStyle=C.green;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(start,yy);ctx.stroke();
    // current chunk (solid cyan) then predicted tail (dashed)
    rrect(ctx,start,yy-26,H,52,6,hexA(C.cyan,0.6),hexA(C.cyan,0.05));
    for(let i=0;i<=6;i++){const x=start+H*i/6;dot(ctx,x,yy,i<2?3.5:2.5,i<2?C.green:C.cyan);}
    lab(ctx,'chunk: execute first few (green), rest predicted',start,yy-34,C.cyan,10);
    // warm-start arrow from previous chunk position (ghost)
    rrect(ctx,start-H*0.5,yy-20,H,40,6,hexA(C.mut,0.3),null);
    arrow(ctx,start-H*0.5+H*0.5,yy+30,start+6,yy+22,hexA(C.amber,0.8),1.4);lab(ctx,'warm-start from last solution',start-H*0.5,yy+44,C.amber,10);
    lab(ctx,'the next chunk is denoised before the current one runs out → smooth motion, no stalls',14,h-12,C.mut);
  };

  // F3 3D-CONDITIONED — point cloud in, 3D pose trajectory out; robust where pixels fail.
  A.dpf_3d=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Condition on 3D geometry, not flat pixels → robust to viewpoint & lighting',14,16,C.dim);
    // point cloud
    const cx=w*0.2,cy=h*0.5;for(let i=0;i<60;i++){const a=jit(i)*TAU,r=jit(i+9)*44;dot(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.8,1.6,hexA(C.cyan,0.7));}
    lab(ctx,'point cloud',cx-24,cy+58,C.mut,10);
    // faded 2D note
    lab(ctx,'(2D pixels: fragile when the camera moves ✗)',w*0.06,h*0.86,hexA(C.coral,0.8),10);
    arrow(ctx,w*0.34,cy,w*0.44,cy,C.cyan,1.6);
    box(ctx,w*0.45,cy-16,w*0.18,32,'3D denoiser',C.cyan);
    arrow(ctx,w*0.64,cy,w*0.72,cy,C.cyan,1.6);
    // 3D pose trajectory (a gripper path)
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=16;i++){const u=i/16,x=w*0.74+w*0.16*u,y=cy-20+Math.sin(u*4)*16;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    for(let i=0;i<=4;i++){const u=i/4,x=w*0.74+w*0.16*u,y=cy-20+Math.sin(u*4)*16;dot(ctx,x,y,2.5,C.green);}
    lab(ctx,'3D pose trajectory',w*0.72,cy+40,C.green,10);
    lab(ctx,'the denoiser predicts poses in 3D space → same demos generalize across views',14,h-12,C.mut);
  };

  // F4 EQUIVARIANT — rotate the scene, the action rotates with it; one demo covers many poses.
  A.dpf_equi=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Build in symmetry: rotate the input → the action rotates the same way (for free)',14,16,C.dim);
    function scene(cx,cy,rot,lbl){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);
      rrect(ctx,-22,-18,44,36,5,C.mut,hexA(C.mut,0.12));arrow(ctx,0,0,44,-30,C.green,2);ctx.restore();
      lab(ctx,lbl,cx-24,cy+40,C.mut,10);}
    scene(w*0.26,h*0.5,0,'a demo at one pose');
    const rot=0.5+0.4*Math.sin(t*0.8);
    scene(w*0.68,h*0.5,rot,'any rotation → correct action');
    arrow(ctx,w*0.42,h*0.5,w*0.52,h*0.5,C.ink,1.4);lab(ctx,'rotate',w*0.42,h*0.42,C.dim,9);
    lab(ctx,'one demonstration automatically teaches every rotated version → far fewer demos needed',14,h-12,C.mut);
  };

  // F5 FLOW MATCHING — a straight velocity field from noise to action in 1-2 steps vs the long diffusion path.
  A.dpf_flow=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Flow matching: learn a straight velocity from noise to action → 1–2 steps',14,16,C.dim);
    const nx=w*0.12,ny=h*0.5,ax=w*0.8,ay=h*0.5;
    dot(ctx,nx,ny,6,hexA(C.dim,0.8));lab(ctx,'noise',nx-6,ny+18,C.mut,10);
    // curved multi-step diffusion path (faded)
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.lineWidth=1.4;ctx.setLineDash([4,3]);ctx.beginPath();
    ctx.moveTo(nx,ny);ctx.bezierCurveTo(w*0.35,ny-60,w*0.6,ny+60,ax,ay);ctx.stroke();ctx.setLineDash([]);
    for(let i=1;i<10;i++){const u=i/10;const x=nx+(ax-nx)*u;const y=ny+Math.sin(u*Math.PI*2)*40*(1-u);dot(ctx,x,y,2,hexA(C.coral,0.6));}
    lab(ctx,'diffusion: curved, ~50 steps',w*0.32,ny-60,C.coral,10);
    // straight flow arrow with a couple of nodes
    const p=saw(t,2);arrow(ctx,nx+8,ny,ax-8,ay,C.green,2.4);dot(ctx,nx+(ax-nx)*Math.min(1,p),ny,4,C.ink);
    lab(ctx,'flow: straight, 1–2 steps',w*0.36,ny+34,C.green,10);
    dot(ctx,ax,ay,7,C.green);lab(ctx,'action',ax-6,ay-16,C.green,10);
    lab(ctx,'same multimodal quality, fast enough to run on a real robot — why flow is taking over',14,h-12,C.mut);
  };

  // F6 VLA — instruction + image -> reasoning (waypoints) -> denoised action.
  A.dpf_vla=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Command in words: reason first (waypoints), then denoise the action',14,16,C.dim);
    box(ctx,w*0.05,h*0.28,w*0.24,26,'“put mug on shelf”',C.amber);
    box(ctx,w*0.05,h*0.5,w*0.24,26,'camera image',C.cyan);
    arrow(ctx,w*0.3,h*0.4,w*0.38,h*0.4,C.ink,1.4);
    // reasoning trace: waypoints
    box(ctx,w*0.39,h*0.3,w*0.24,h*0.24,'',C.violet,hexA(C.violet,0.05));lab(ctx,'reasoning',w*0.4,h*0.27,C.violet,10);
    ['pick','lift','place'].forEach((s,i)=>{dot(ctx,w*0.43+i*w*0.07,h*0.42,4,C.violet);lab(ctx,s,w*0.43+i*w*0.07,h*0.48,C.violet,8.5,'center');});
    arrow(ctx,w*0.64,h*0.42,w*0.72,h*0.42,C.ink,1.4);
    box(ctx,w*0.73,h*0.34,w*0.2,h*0.16,'denoise → action',C.green);
    lab(ctx,'one model, many instructions; explicit reasoning makes it robust to rephrasing',14,h-12,C.mut);
  };

  // F7 HIERARCHICAL — high-level subgoals, each a low-level diffusion trajectory.
  A.dpf_hier=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Split the long task: high-level subgoals, low-level diffusion trajectories',14,16,C.dim);
    // high-level chain
    const hy=h*0.32;box(ctx,w*0.05,hy-14,w*0.2,28,'high-level plan',C.violet);
    const gs=[w*0.42,w*0.62,w*0.82];
    arrow(ctx,w*0.26,hy,w*0.36,hy,C.ink,1.4);
    gs.forEach((gx,i)=>{dot(ctx,gx,hy,7,C.amber);lab(ctx,'g'+(i+1),gx,hy-16,C.amber,10,'center');if(i<2)arrow(ctx,gx+9,hy,gs[i+1]-9,hy,hexA(C.mut,0.6),1.2);});
    lab(ctx,'subgoals',w*0.42,hy+16,C.amber,9);
    // low-level trajectories under each subgoal
    const ly=h*0.72;
    gs.forEach((gx)=>{arrow(ctx,gx,hy+10,gx,ly-24,hexA(C.mut,0.5),1);
      ctx.strokeStyle=C.green;ctx.lineWidth=1.6;ctx.beginPath();for(let i=0;i<=12;i++){const u=i/12,x=gx-24+48*u,y=ly+Math.sin(u*5)*10;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();});
    lab(ctx,'diffusion trajectory to reach each subgoal',w*0.34,ly+30,C.green,10);
    lab(ctx,'reusable subgoals compose into new long-horizon tasks without one giant rollout',14,h-12,C.mut);
  };

  // F8 CROSS-EMBODIMENT — one denoiser, many robot bodies.
  A.dpf_cross=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One policy, many bodies: share the skill across arms, legs, and rotors',14,16,C.dim);
    const cx=w*0.5,cy=h*0.5;box(ctx,cx-w*0.11,cy-18,w*0.22,36,'one diffusion policy',C.accent||C.cyan);
    const bodies=[[w*0.12,h*0.28,'arm'],[w*0.12,h*0.72,'quadruped'],[w*0.88,h*0.28,'humanoid'],[w*0.88,h*0.72,'drone']];
    const hi=Math.floor(saw(t,4)*4)%4;
    bodies.forEach((b,i)=>{const on=i===hi;arrow(ctx,cx+(b[0]<cx?-w*0.11:w*0.11),cy,b[0]+(b[0]<cx?30:-30),b[1],on?C.green:hexA(C.mut,0.5),on?1.8:1);
      // simple glyph
      ctx.strokeStyle=on?C.green:C.mut;ctx.lineWidth=2;
      if(b[2]==='arm'){ctx.beginPath();ctx.moveTo(b[0]-14,b[1]+8);ctx.lineTo(b[0],b[1]-6);ctx.lineTo(b[0]+14,b[1]+2);ctx.stroke();}
      else if(b[2]==='quadruped'){ctx.strokeRect(b[0]-14,b[1]-6,28,10);[-10,-4,4,10].forEach(dx=>{ctx.beginPath();ctx.moveTo(b[0]+dx,b[1]+4);ctx.lineTo(b[0]+dx,b[1]+14);ctx.stroke();});}
      else if(b[2]==='humanoid'){ctx.beginPath();ctx.arc(b[0],b[1]-10,4,0,TAU);ctx.moveTo(b[0],b[1]-6);ctx.lineTo(b[0],b[1]+8);ctx.moveTo(b[0]-8,b[1]);ctx.lineTo(b[0]+8,b[1]);ctx.moveTo(b[0],b[1]+8);ctx.lineTo(b[0]-6,b[1]+18);ctx.moveTo(b[0],b[1]+8);ctx.lineTo(b[0]+6,b[1]+18);ctx.stroke();}
      else {ctx.beginPath();ctx.moveTo(b[0]-14,b[1]-8);ctx.lineTo(b[0]+14,b[1]+8);ctx.moveTo(b[0]+14,b[1]-8);ctx.lineTo(b[0]-14,b[1]+8);ctx.stroke();}
      lab(ctx,b[2],b[0]-14,b[1]+26,on?C.green:C.mut,9.5);});
    lab(ctx,'shared encoders map each body to one space → the single policy matches specialists',14,h-12,C.mut);
  };

  // ===== per-family diagrams (wave B: families 9-15) =====

  // F9 PLANNING — denoise several whole trajectories at once; diverse routes around obstacles.
  A.dpf_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Generate whole trajectories directly — several diverse routes at once',14,16,C.dim);
    const sx=w*0.1,gx=w*0.9,my=h*0.52;
    dot(ctx,sx,my,7,C.ink);lab(ctx,'start',sx-6,my+18,C.mut,10);dot(ctx,gx,my,7,C.green);lab(ctx,'goal',gx-6,my+18,C.green,10);
    // obstacles
    rrect(ctx,w*0.42,my-46,w*0.06,36,4,C.coral,hexA(C.coral,0.15));rrect(ctx,w*0.56,my+10,w*0.06,40,4,C.coral,hexA(C.coral,0.15));
    lab(ctx,'obstacles',w*0.44,my-54,C.coral,9);
    // three sampled trajectories
    const routes=[[-70,C.mut],[0,C.green],[64,C.violet]];const best=1;
    routes.forEach((r,i)=>{const on=i===best;ctx.strokeStyle=on?C.green:hexA(r[1],0.6);ctx.lineWidth=on?2.2:1.3;
      ctx.beginPath();ctx.moveTo(sx,my);ctx.bezierCurveTo(w*0.4,my+r[0],w*0.6,my+r[0],gx,my);ctx.stroke();});
    lab(ctx,'diffusion samples 3 valid paths → keep the best (or seed a fast solver)',14,h-12,C.mut);
  };

  // F10 GUIDED — a cost bends the denoising away from a hazard, no retraining.
  A.dpf_guide=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Steer at sampling time: a cost nudges each denoising step away from danger',14,16,C.dim);
    const sx=w*0.1,gx=w*0.9,my=h*0.52;dot(ctx,sx,my,6,C.ink);dot(ctx,gx,my,6,C.green);
    // hazard
    ctx.fillStyle=hexA(C.coral,0.18);ctx.beginPath();ctx.arc(w*0.5,my,34,0,TAU);ctx.fill();lab(ctx,'hazard',w*0.5,my,C.coral,10,'center');
    // unguided path straight into hazard
    ctx.strokeStyle=hexA(C.coral,0.7);ctx.lineWidth=1.4;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(sx,my);ctx.lineTo(gx,my);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'unguided → into it ✗',w*0.3,my-10,C.coral,10);
    // guided path curving around, with nudge arrows
    ctx.strokeStyle=C.green;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(sx,my);ctx.bezierCurveTo(w*0.4,my-58,w*0.6,my-58,gx,my);ctx.stroke();
    lab(ctx,'guided → around it ✓',w*0.42,my-64,C.green,10);
    for(let k=0;k<3;k++){const x=w*(0.4+k*0.1);arrow(ctx,x,my-6,x,my-24,hexA(C.violet,0.8),1.2);}
    lab(ctx,'cost gradient',w*0.4,my+22,C.violet,9);
    lab(ctx,'same trained policy → change the cost, get a different safe behavior, no retraining',14,h-12,C.mut);
  };

  // F11 TACTILE — vision + touch into the denoiser; the contact on/off is handled.
  A.dpf_tactile=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Fold in touch: the tactile signal marks exactly when contact changes the physics',14,16,C.dim);
    box(ctx,w*0.05,h*0.3,w*0.2,26,'camera',C.cyan);
    box(ctx,w*0.05,h*0.52,w*0.2,26,'touch / force',C.amber);
    arrow(ctx,w*0.26,h*0.44,w*0.36,h*0.44,C.ink,1.4);
    box(ctx,w*0.37,h*0.34,w*0.18,h*0.2,'denoiser',C.accent||C.cyan);
    arrow(ctx,w*0.56,h*0.44,w*0.64,h*0.44,C.ink,1.4);box(ctx,w*0.65,h*0.36,w*0.16,h*0.16,'action',C.green);
    // force curve: flat then spike at contact
    const fx=w*0.05,fy=h*0.86,fw=w*0.5;ctx.strokeStyle=C.amber;ctx.lineWidth=1.6;ctx.beginPath();
    for(let i=0;i<=40;i++){const u=i/40,x=fx+fw*u;const y=fy-(u<0.55?2: (u<0.62? (u-0.55)/0.07*26 : 26))*1;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'force: flat → spike at contact',fx,fy+10,C.mut,9.5);
    lab(ctx,'press don’t crush, slide don’t drop — touch-aware beats vision-only on fragile items',14,h-12,C.mut);
  };

  // F12 LOCOMOTION — many valid gaits sampled; commit to one, in real time.
  A.dpf_loco=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Legged control has many valid gaits — sample one coherent gait, fast',14,16,C.dim);
    // quadruped glyph
    const qx=w*0.2,qy=h*0.5;ctx.strokeStyle=C.ink;ctx.lineWidth=2.5;ctx.strokeRect(qx-26,qy-10,52,18);
    [-20,-8,8,20].forEach((dx,i)=>{const ph=Math.sin(t*4+i*1.6)*5;ctx.beginPath();ctx.moveTo(qx+dx,qy+8);ctx.lineTo(qx+dx,qy+22+ph);ctx.stroke();});
    lab(ctx,'quadruped',qx-24,qy+34,C.mut,10);
    // two gait footfall patterns, one highlighted
    const pick=Math.floor(saw(t,3)*2)%2;
    ['trot','bound'].forEach((g,gi)=>{const y=h*0.32+gi*h*0.34,on=gi===pick;lab(ctx,g,w*0.5,y-16,on?C.green:C.mut,10);
      for(let leg=0;leg<4;leg++)for(let s=0;s<8;s++){const stance=(g==='trot')?((s+leg)%2===0):((s+ (leg<2?0:1))%2===0);
        ctx.fillStyle=stance?(on?C.green:hexA(C.mut,0.5)):hexA(C.line,1);ctx.fillRect(w*0.52+s*16,y-8+leg*5,12,3);}});
    lab(ctx,'sample a gait-consistent chunk in real time → commit, don’t average into a stumble',14,h-12,C.mut);
  };

  // F13 HUMAN MOTION — one text prompt, several valid motions sampled.
  A.dpf_motion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One prompt, many valid motions: diffusion samples the multimodal futures',14,16,C.dim);
    box(ctx,w*0.06,h*0.46,w*0.2,28,'“a person waving”',C.amber);
    arrow(ctx,w*0.27,h*0.5,w*0.35,h*0.5,C.ink,1.4);
    // three skeletons, waving differently, one animated
    const pick=Math.floor(saw(t,3)*3)%3;
    for(let k=0;k<3;k++){const cx=w*(0.46+k*0.17),cy=h*0.5,on=k===pick;const arm=(on?Math.sin(t*4):0.4)*0.6+ (k-1)*0.4;
      ctx.strokeStyle=on?C.green:C.mut;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy-24,5,0,TAU);ctx.moveTo(cx,cy-19);ctx.lineTo(cx,cy+6);
      ctx.moveTo(cx,cy-10);ctx.lineTo(cx-12,cy-4);ctx.moveTo(cx,cy-10);ctx.lineTo(cx+12,cy-18-arm*10);
      ctx.moveTo(cx,cy+6);ctx.lineTo(cx-7,cy+22);ctx.moveTo(cx,cy+6);ctx.lineTo(cx+7,cy+22);ctx.stroke();}
    lab(ctx,'each sample is a different, valid wave — physics-aware losses keep balance plausible',14,h-12,C.mut);
  };

  // F14 FORECASTING — a fan of distinct futures vs regression's averaged middle path.
  A.dpf_forecast=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The future is multimodal: forecast the distinct options, not their average',14,16,C.dim);
    const ax=w*0.16,ay=h*0.55;
    // recent track
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*0.06,ay+18);ctx.lineTo(ax,ay);ctx.stroke();dot(ctx,ax,ay,6,C.ink);lab(ctx,'now',ax-6,ay+18,C.mut,10);
    // regression averaged straight (wrong)
    ctx.strokeStyle=hexA(C.coral,0.75);ctx.lineWidth=1.6;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(w*0.9,ay);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'regression → averaged middle ✗',w*0.5,ay+4,C.coral,10);
    // diffusion fan of futures
    const outs=[-70,-10,60];outs.forEach((dy,i)=>{ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,ay);ctx.bezierCurveTo(w*0.5,ay,w*0.7,ay+dy,w*0.9,ay+dy);ctx.stroke();
      lab(ctx,['left','straight','right'][i],w*0.91,ay+dy,C.green,9);});
    lab(ctx,'left / straight / right — hand the whole distribution to the planner',14,h-12,C.mut);
  };

  // F15 RL FINE-TUNE — push past the demonstration ceiling with reward / preference / world model.
  A.dpf_rl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Go beyond copying: fine-tune past the demonstrations with reward or preference',14,16,C.dim);
    const bx=w*0.1,bw=w*0.8,by=h*0.78;
    // performance axis
    ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+bw,by);ctx.moveTo(bx,by);ctx.lineTo(bx,h*0.24);ctx.stroke();
    lab(ctx,'performance',bx-4,h*0.2,C.dim,9);
    // demo ceiling
    const demoY=h*0.5;ctx.strokeStyle=hexA(C.mut,0.6);ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(bx,demoY);ctx.lineTo(bx+bw,demoY);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'demonstration ceiling (imitation stops here)',bx+6,demoY-10,C.mut,10);
    // rising curve above it
    const p=saw(t,4);ctx.strokeStyle=C.green;ctx.lineWidth=2.4;ctx.beginPath();
    for(let i=0;i<=40;i++){const u=i/40;if(u>p)break;const x=bx+bw*u;const y=by-(by-h*0.3)*(u<0.5?u*1.6:0.8+ (u-0.5)*0.4);ctx.lineTo(x,y);}ctx.stroke();
    arrow(ctx,bx+bw*0.5,demoY,bx+bw*0.7,h*0.34,C.green,1.6);lab(ctx,'RL / preference / world-model rollouts',bx+bw*0.42,h*0.3,C.green,10);
    lab(ctx,'roll out, score what beat the demos, fine-tune toward it (KL-regularized so it stays stable)',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.dpanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-dpanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
