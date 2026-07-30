/* va-anim.js — first-principles mechanism animators for the VLA (Vision-Language-Action) explainer.
   Same harness: A[name]=fn(ctx,w,h,t); canvases carry data-vaanim="name". Self-contained boot. */
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
  const saw=(t,p)=>((t%p)/p);

  const A={};

  /* 01 — GENERALIST vs SPECIALIST: language is the task selector; one model does many tasks. */
  A.va_generalist=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Don’t script every task — one model, commanded in language, does many',14,16,C.dim);
    const tasks=['fold','pour','open'];
    // left: specialists (one model per task, retrained)
    lab(ctx,'specialist: retrain a model per task',w*0.06,h*0.28,C.coral,10);
    tasks.forEach((tk,i)=>{const y=h*0.4+i*h*0.18;box(ctx,w*0.06,y-13,w*0.14,26,'model '+(i+1),C.mut);lab(ctx,'→ '+tk,w*0.22,y,C.mut,10);});
    // right: one generalist VLA
    const gx=w*0.66,gy=h*0.5;box(ctx,gx-w*0.1,gy-24,w*0.2,48,'one VLA',C.green,hexA(C.green,0.06));
    lab(ctx,'generalist: one model, language picks the task',gx-70,h*0.24,C.green,10);
    const hi=Math.floor(saw(t,3)*3)%3;
    tasks.forEach((tk,i)=>{const y=gy-26+i*26,on=i===hi;lab(ctx,'“'+tk+' it”',gx-w*0.24,y,on?C.amber:hexA(C.mut,0.5),10);
      arrow(ctx,gx-w*0.13,y,gx-w*0.1,gy,on?C.amber:hexA(C.mut,0.3),on?1.4:1);});
    arrow(ctx,gx+w*0.1,gy,gx+w*0.16,gy,C.green,1.6);lab(ctx,'acts',gx+w*0.16,gy-12,C.green,10);
    lab(ctx,'the instruction selects the behavior → new tasks without a new model',14,h-12,C.mut);
  };

  /* 02 — BACKBONE: adapt an internet-pretrained VLM (it already knows objects + words) into an actor. */
  A.va_backbone=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Start from a VLM that already learned the world from the web — then teach it to act',14,16,C.dim);
    // pretrained VLM box with knowledge chips
    const bx=w*0.28,by=h*0.5;box(ctx,bx-w*0.16,by-40,w*0.32,80,'',C.cyan,hexA(C.cyan,0.05));
    lab(ctx,'pretrained VLM',bx,by-30,C.cyan,11,'center');
    ['objects','words','places','common sense'].forEach((k,i)=>{lab(ctx,k,bx-w*0.13+ (i%2)*w*0.15,by-6+Math.floor(i/2)*18,hexA(C.cyan,0.9),9.5);});
    lab(ctx,'(from oceans of images + text)',bx,by+50,C.mut,9.5,'center');
    // bolt on action head
    arrow(ctx,bx+w*0.16,by,bx+w*0.26,by,C.ink,1.6);
    box(ctx,bx+w*0.27,by-16,w*0.16,32,'+ action head',C.amber,hexA(C.amber,0.06));
    arrow(ctx,bx+w*0.44,by,bx+w*0.52,by,C.green,1.8);
    box(ctx,bx+w*0.53,by-16,w*0.16,32,'acts',C.green);
    lab(ctx,'inherit web knowledge → generalize to objects & words never seen in robot data',14,h-12,C.mut);
  };

  /* 03 — GETTING ACTIONS OUT: discrete action tokens the LM predicts, vs a continuous (diffusion/flow) head. */
  A.va_action=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'How does a language model output a robot action? Two ways.',14,16,C.dim);
    box(ctx,w*0.04,h*0.44,w*0.2,30,'image + “grasp it”',C.cyan);
    arrow(ctx,w*0.25,h*0.5,w*0.31,h*0.5,C.ink,1.4);box(ctx,w*0.32,h*0.42,w*0.12,h*0.16,'VLA',C.violet);
    // branch A: discrete tokens
    arrow(ctx,w*0.45,h*0.46,w*0.54,h*0.3,C.amber,1.4);
    lab(ctx,'A · action tokens',w*0.55,h*0.24,C.amber,10);
    for(let k=0;k<6;k++){ctx.fillStyle=hexA(C.amber,0.85);ctx.fillRect(w*0.55+k*16,h*0.3-6,13,13);}
    lab(ctx,'quantize the action → the LM predicts it like words',w*0.55,h*0.4,C.mut,9.5);
    // branch B: continuous head
    arrow(ctx,w*0.45,h*0.54,w*0.54,h*0.7,C.green,1.4);
    lab(ctx,'B · continuous head',w*0.55,h*0.64,C.green,10);
    ctx.strokeStyle=C.green;ctx.lineWidth=1.8;ctx.beginPath();for(let i=0;i<=20;i++){const u=i/20,x=w*0.55+w*0.18*u,y=h*0.72+Math.sin(u*4)*8;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    lab(ctx,'a diffusion / flow head → smooth continuous action',w*0.55,h*0.8,C.mut,9.5);
    lab(ctx,'tokens are simple and reuse the LM; continuous heads are smoother and multimodal',14,h-12,C.mut);
  };

  /* 04 — CO-TRAINING: huge web data + scarce robot demos, mixed, so grounding survives. */
  A.va_cotrain=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Robot data is scarce — co-train with web data so language grounding survives',14,16,C.dim);
    // web data: big block of many dots
    const wx=w*0.1,wy=h*0.32;lab(ctx,'web image+text (billions)',wx,wy-16,C.cyan,10);
    for(let i=0;i<80;i++)dot(ctx,wx+((i*7)%140),wy+Math.floor(i/20)*9,1.8,hexA(C.cyan,0.6));
    // robot data: tiny block
    const rx=w*0.1,ry=h*0.68;lab(ctx,'robot demos (thousands)',rx,ry-16,C.amber,10);
    for(let i=0;i<10;i++)dot(ctx,rx+((i*10)%100),ry,2.4,C.amber);
    // mix -> one VLA
    arrow(ctx,w*0.4,wy,w*0.52,h*0.48,C.ink,1.3);arrow(ctx,w*0.4,ry,w*0.52,h*0.52,C.ink,1.3);
    box(ctx,w*0.53,h*0.42,w*0.2,h*0.16,'co-trained VLA',C.green,hexA(C.green,0.06));
    arrow(ctx,w*0.74,h*0.5,w*0.82,h*0.5,C.green,1.6);
    lab(ctx,'keeps',w*0.83,h*0.44,C.green,10);lab(ctx,'language',w*0.83,h*0.5,C.green,10);lab(ctx,'+ acts',w*0.83,h*0.56,C.green,10);
    lab(ctx,'without the web mix, fine-tuning on robot data alone forgets how to understand language',14,h-12,C.mut);
  };

  /* 05 — REASON THEN ACT: think in words/space (waypoints, CoT) before moving. */
  A.va_reason=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reason first, then act: think in words or space before the arm moves',14,16,C.dim);
    box(ctx,w*0.04,h*0.46,w*0.2,30,'“put mug by sink”',C.cyan);
    arrow(ctx,w*0.25,h*0.5,w*0.31,h*0.5,C.ink,1.4);
    // reasoning chain
    box(ctx,w*0.32,h*0.28,w*0.36,h*0.44,'',C.violet,hexA(C.violet,0.05));lab(ctx,'reason',w*0.34,h*0.24,C.violet,10);
    const steps=['find the mug','plan: approach → grasp → carry','waypoints in 3D'];
    const lit=Math.floor(saw(t,3)*3);
    steps.forEach((s,i)=>{const y=h*0.4+i*h*0.11,on=i<=lit;dot(ctx,w*0.35,y,4,on?C.violet:hexA(C.violet,0.35));lab(ctx,s,w*0.37,y,on?C.ink:C.dim,9.5);});
    arrow(ctx,w*0.68,h*0.5,w*0.76,h*0.5,C.green,1.6);box(ctx,w*0.77,h*0.42,w*0.16,h*0.16,'action',C.green);
    lab(ctx,'explicit intermediate reasoning grounds loose words in geometry → far more robust',14,h-12,C.mut);
  };

  // ===== per-family diagrams (wave 2a: families 1-8) =====

  // F1 GENERALIST — pool many robots' data into one VLA that deploys back to all of them.
  A.vaf_generalist=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pool every robot’s data into one policy that deploys back to all of them',14,16,C.dim);
    const bodies=['arm','quadruped','humanoid','drone','car'];
    const cx=w*0.5,cy=h*0.5;box(ctx,cx-w*0.1,cy-20,w*0.2,40,'one VLA',C.green,hexA(C.green,0.06));
    const hi=Math.floor(saw(t,5)*5)%5;
    bodies.forEach((b,i)=>{const a=(i/5)*TAU-Math.PI/2,r=Math.min(w,h)*0.42;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*0.72;
      const on=i===hi;dot(ctx,x,y,on?7:5,on?C.amber:hexA(C.mut,0.6));lab(ctx,b,x-14,y+ (y<cy?-14:16),on?C.amber:C.mut,9.5);
      // data in (thin) and deploy out (highlighted)
      arrow(ctx,x+(cx-x)*0.16,y+(cy-y)*0.16,cx+(x-cx)*0.16,cy+(y-cy)*0.16,on?C.green:hexA(C.mut,0.4),on?1.6:1);});
    lab(ctx,'data in from every body → one set of weights out',cx,cy+38,C.mut,10,'center');
    lab(ctx,'a new task is a new sentence; a new robot needs only a little adaptation data',14,h-12,C.mut);
  };

  // F2 LATENT ACTION FROM VIDEO — learn actions from unlabeled video via motion, bridge to the robot.
  A.vaf_action=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Learn to act from unlabeled VIDEO — motion is a free action label',14,16,C.dim);
    // video frames
    const fy=h*0.4,fw=Math.min(52,w*0.1);const p=saw(t,3);
    for(let k=0;k<3;k++){const x=w*0.06+k*(w*0.12);rrect(ctx,x,fy-fw*0.3,fw,fw*0.6,4,C.cyan,hexA(C.cyan,0.08));
      // flow arrows between frames
      if(k<2)arrow(ctx,x+fw+2,fy,x+w*0.12-2,fy,hexA(C.amber,0.8),1.4);}
    lab(ctx,'web / human video',w*0.06,fy+fw*0.5+10,C.cyan,10);
    lab(ctx,'optical flow = motion',w*0.06,fy-fw*0.5-8,C.amber,9.5);
    arrow(ctx,w*0.42,fy,w*0.5,fy,C.ink,1.4);
    // latent action tokens
    for(let k=0;k<5;k++){ctx.fillStyle=C.violet;ctx.fillRect(w*0.52+k*16,fy-6,13,13);}
    lab(ctx,'latent action tokens',w*0.52,fy+22,C.violet,10);
    // bridge to robot with a little data
    arrow(ctx,w*0.52,h*0.7,w*0.7,h*0.7,C.green,1.6);box(ctx,w*0.71,h*0.62,w*0.22,h*0.16,'+ little robot data → motor commands',C.green);
    lab(ctx,'pretrain on oceans of video, then map latent actions to the robot with a few demos',14,h-12,C.mut);
  };

  // F3 LLM PLANNING — decompose an instruction into skill calls + a feasibility check.
  A.vaf_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'An LLM decomposes the goal into skills, and checks each is feasible',14,16,C.dim);
    box(ctx,w*0.05,h*0.44,w*0.16,28,'“make coffee”',C.cyan);
    arrow(ctx,w*0.22,h*0.5,w*0.3,h*0.5,C.ink,1.4);box(ctx,w*0.31,h*0.42,w*0.12,h*0.16,'LLM',C.violet);
    const steps=['grind','fill water','brew','pour'];const lit=Math.floor(saw(t,4)*4);
    steps.forEach((s,i)=>{const y=h*0.28+i*h*0.16,on=i<=lit;arrow(ctx,w*0.44,h*0.5,w*0.5,y,hexA(C.mut,0.5),1);
      box(ctx,w*0.51,y-12,w*0.2,24,s,on?C.amber:C.mut);
      lab(ctx,on?'✓ feasible':'…',w*0.72,y,on?C.green:C.dim,10);});
    lab(ctx,'each step calls a low-level skill; infeasible steps trigger a re-plan',14,h-12,C.mut);
  };

  // F4 OPEN-VOCAB — the VLM points at the requested thing in the image; grasp there, no class list.
  A.vaf_openvocab=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Say it in any words → the VLM points at it → grasp there (no fixed classes)',14,16,C.dim);
    box(ctx,w*0.05,h*0.3,w*0.2,26,'“the striped mug”',C.cyan);
    // scene with 3 objects
    const scene=[[w*0.42,h*0.62,'cup',false],[w*0.56,h*0.6,'mug',true],[w*0.7,h*0.64,'bowl',false]];
    rrect(ctx,w*0.35,h*0.44,w*0.42,h*0.34,8,C.line,null);lab(ctx,'camera view',w*0.36,h*0.42,C.dim,9);
    scene.forEach(o=>{const on=o[3];dot(ctx,o[0],o[1],on?12:9,on?C.amber:hexA(C.mut,0.6));lab(ctx,o[2],o[0]-8,o[1]+22,on?C.amber:C.mut,9.5);
      if(on){ctx.strokeStyle=C.amber;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(o[0],o[1],16,0,TAU);ctx.stroke();
        arrow(ctx,o[0],o[1]-40,o[0],o[1]-18,C.amber,1.6);lab(ctx,'VLM marks it',o[0]-24,o[1]-48,C.amber,9.5);}});
    arrow(ctx,w*0.79,h*0.6,w*0.86,h*0.6,C.green,1.6);lab(ctx,'grasp',w*0.86,h*0.55,C.green,10);
    lab(ctx,'the same pipeline handles a tool, a fruit, or a cable it never saw in robot data',14,h-12,C.mut);
  };

  // F5 CHAIN/TREE OF THOUGHT — reason several plans, score, pick the best.
  A.vaf_cot=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Think before acting: draft several plans, score them, pick the best',14,16,C.dim);
    box(ctx,w*0.05,h*0.46,w*0.16,28,'instruction',C.cyan);
    arrow(ctx,w*0.22,h*0.5,w*0.3,h*0.5,C.ink,1.4);dot(ctx,w*0.31,h*0.5,5,C.violet);
    const plans=[[-0.2,'plan A','6',false],[0,'plan B','9',true],[0.2,'plan C','3',false]];
    plans.forEach(p=>{const y=h*0.5+p[0]*h;const on=p[3];
      ctx.strokeStyle=on?C.green:hexA(C.violet,0.6);ctx.lineWidth=on?2:1.2;ctx.beginPath();ctx.moveTo(w*0.31,h*0.5);ctx.bezierCurveTo(w*0.45,h*0.5,w*0.5,y,w*0.62,y);ctx.stroke();
      lab(ctx,p[1]+'  score '+p[2],w*0.63,y,on?C.green:C.violet,10);if(on)lab(ctx,'▸ act on this',w*0.63,y+15,C.green,9.5);});
    lab(ctx,'tree-of-thought scores candidates for safety / progress; the written reasoning is auditable',14,h-12,C.mut);
  };

  // F6 SPATIAL GROUNDING — VLM names it (semantic ✓) but off; 3D snaps it to the right metric point.
  A.vaf_spatial=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'VLM knows WHAT (“the mug”) but not exactly WHERE — 3D fixes the geometry',14,16,C.dim);
    // left: VLM semantic guess (fuzzy, off)
    const lx=w*0.26,ly=h*0.5;rrect(ctx,lx-w*0.16,ly-h*0.2,w*0.32,h*0.4,8,C.line,null);lab(ctx,'VLM 2D guess',lx-w*0.14,ly-h*0.2-8,C.cyan,9.5);
    const g=ctx.createRadialGradient(lx+20,ly,2,lx+20,ly,26);g.addColorStop(0,hexA(C.coral,0.5));g.addColorStop(1,hexA(C.coral,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx+20,ly,26,0,TAU);ctx.fill();
    dot(ctx,lx-6,ly-6,4,C.green);lab(ctx,'true mug',lx-30,ly-24,C.green,9);lab(ctx,'off by cm ✗',lx+6,ly+30,C.coral,10);
    arrow(ctx,w*0.44,ly,w*0.52,ly,C.ink,1.4);lab(ctx,'+ 3D',w*0.44,ly-12,C.violet,9);
    // right: 3D grid snaps to correct metric point
    const rx=w*0.72;ctx.strokeStyle=hexA(C.mut,0.35);for(let i=0;i<=5;i++){ctx.beginPath();ctx.moveTo(rx-w*0.14+i*w*0.056,ly-h*0.18);ctx.lineTo(rx-w*0.14+i*w*0.056,ly+h*0.18);ctx.stroke();}
    for(let j=0;j<=5;j++){ctx.beginPath();ctx.moveTo(rx-w*0.14,ly-h*0.18+j*h*0.072);ctx.lineTo(rx+w*0.14,ly-h*0.18+j*h*0.072);ctx.stroke();}
    dot(ctx,rx+6,ly-4,6,C.green);lab(ctx,'metric target ✓',rx-20,ly+30,C.green,10);
    lab(ctx,'snap the semantic target onto real depth / point-cloud geometry → centimeters, not vibes',14,h-12,C.mut);
  };

  // F7 NAVIGATION — ground the goal, traverse a topological/semantic map, replan.
  A.vaf_nav=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Follow language through an unseen building: map, remember, replan',14,16,C.dim);
    box(ctx,w*0.05,h*0.24,w*0.3,26,'“go to the kitchen, find a mug”',C.cyan);
    // topological graph
    const nodes=[[w*0.15,h*0.6],[w*0.32,h*0.5],[w*0.5,h*0.66],[w*0.66,h*0.48],[w*0.82,h*0.62]];
    const edges=[[0,1],[1,2],[2,3],[3,4],[1,3]];
    ctx.strokeStyle=hexA(C.mut,0.5);edges.forEach(e=>{ctx.beginPath();ctx.moveTo(...nodes[e[0]]);ctx.lineTo(...nodes[e[1]]);ctx.stroke();});
    // path progress
    const path=[0,1,3,4];const prog=saw(t,4)*(path.length-1);
    for(let k=0;k<path.length-1;k++){if(prog>k){const a=nodes[path[k]],b=nodes[path[k+1]],f=Math.min(1,prog-k);
      ctx.strokeStyle=C.green;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f);ctx.stroke();}}
    nodes.forEach((n,i)=>{dot(ctx,n[0],n[1],i===0?6:i===4?7:5,i===4?C.amber:C.violet);});
    lab(ctx,'start',nodes[0][0]-6,nodes[0][1]+16,C.mut,9);lab(ctx,'goal',nodes[4][0]-6,nodes[4][1]+16,C.amber,9);
    lab(ctx,'a long-context VLM picks the next node on a map it builds; replans when confidence drops',14,h-12,C.mut);
  };

  // F8 DRIVING VLA — reason about the scene in language, score trajectories, output one with a rationale.
  A.vaf_drive=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Driving VLA: reason about the scene in words, then output a trajectory',14,16,C.dim);
    // scene
    rrect(ctx,w*0.05,h*0.3,w*0.3,h*0.42,8,C.line,null);lab(ctx,'scene (cameras/LiDAR)',w*0.06,h*0.28,C.dim,9);
    dot(ctx,w*0.14,h*0.6,6,C.cyan);lab(ctx,'ego',w*0.11,h*0.68,C.cyan,9);dot(ctx,w*0.26,h*0.44,6,C.coral);lab(ctx,'ped',w*0.24,h*0.4,C.coral,9);
    // reason bubble
    arrow(ctx,w*0.36,h*0.5,w*0.42,h*0.5,C.ink,1.4);box(ctx,w*0.43,h*0.36,w*0.24,h*0.28,'',C.violet,hexA(C.violet,0.05));lab(ctx,'reason',w*0.44,h*0.33,C.violet,9.5);
    ['pedestrian may cross','slow, keep right'].forEach((s,i)=>lab(ctx,'• '+s,w*0.45,h*0.45+i*16,C.ink,9.5));
    // candidate trajectories scored
    arrow(ctx,w*0.68,h*0.5,w*0.74,h*0.5,C.ink,1.4);
    [[-0.08,'risky','coral'],[0.06,'safe','green']].forEach((tr,i)=>{const on=tr[1]==='safe';ctx.strokeStyle=on?C.green:hexA(C.coral,0.7);ctx.lineWidth=on?2.2:1.3;
      ctx.beginPath();ctx.moveTo(w*0.75,h*0.5);ctx.bezierCurveTo(w*0.85,h*0.5,w*0.9,h*0.5+tr[0]*h,w*0.96,h*0.5+tr[0]*h);ctx.stroke();
      lab(ctx,tr[1],w*0.9,h*0.5+tr[0]*h-8,on?C.green:C.coral,9.5);});
    lab(ctx,'trades the brittle detect→track→plan cascade for grounded, explainable decisions',14,h-12,C.mut);
  };

  // ===== per-family diagrams (wave 2b: families 9-15) =====

  // F9 AFFORDANCE — predict the hinge/handle so "open it" becomes a constrained motion.
  A.vaf_afford=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'“Open it” → predict the affordance: where the hinge is, where to pull',14,16,C.dim);
    box(ctx,w*0.05,h*0.3,w*0.14,26,'“open it”',C.cyan);
    // a hinged door
    const hx=w*0.4,hy=h*0.42,dw=w*0.16,dh=h*0.34;
    ctx.strokeStyle=C.mut;ctx.lineWidth=2;ctx.strokeRect(hx,hy,dw,dh);
    // hinge axis (left)
    ctx.strokeStyle=C.violet;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx,hy+dh);ctx.stroke();
    lab(ctx,'hinge axis',hx-10,hy-8,C.violet,9.5);
    // handle
    dot(ctx,hx+dw-6,hy+dh/2,5,C.amber);lab(ctx,'handle',hx+dw+2,hy+dh/2,C.amber,9.5);
    // open arc about hinge
    const ang=saw(t,3)*0.9;ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.arc(hx,hy+dh/2,dw,-0.2,ang,false);ctx.stroke();
    arrow(ctx,hx+dw*Math.cos(ang),hy+dh/2+dw*Math.sin(ang),hx+dw*Math.cos(ang+0.1),hy+dh/2+dw*Math.sin(ang+0.1),C.green,1.6);
    lab(ctx,'motion = arc about the hinge',w*0.62,hy+dh/2,C.green,10);
    lab(ctx,'the same reasoning transfers to drawers, lids, and levers it never saw',14,h-12,C.mut);
  };

  // F10 FAILURE RECOVERY — a VLM watches, flags divergence, takes a correction, resumes.
  A.vaf_recover=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A VLM watches execution, flags failure, and recovers instead of barreling on',14,16,C.dim);
    const x0=w*0.08,x1=w*0.92,yy=h*0.46,p=saw(t,5);
    // intended (cyan) vs actual (amber diverges) then recovery (green)
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(x1,yy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'intended',x0,yy-12,C.cyan,10);
    const dv=x0+(x1-x0)*0.45, rc=x0+(x1-x0)*0.62;
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(dv,yy);ctx.lineTo(rc,yy+h*0.16);ctx.stroke();
    // flag at divergence
    if(p>0.45){dot(ctx,rc,yy+h*0.16,4,C.coral);lab(ctx,'⚑ failure detected',rc-10,yy+h*0.16+16,C.coral,10);
      lab(ctx,'“no, the other one”',rc,yy+h*0.16-14,C.violet,9.5);}
    // recovery back to green
    if(p>0.62){ctx.strokeStyle=C.green;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(rc,yy+h*0.16);ctx.lineTo(x1,yy);ctx.stroke();lab(ctx,'recover ✓',x1-40,yy-12,C.green,10);}
    lab(ctx,'progress + outcome checks catch the slip; a recovery skill or a spoken correction fixes it',14,h-12,C.mut);
  };

  // F11 CROSS-EMBODIMENT — mask the source robot, inpaint the target; transfer zero-shot.
  A.vaf_cross=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Transfer to a new robot: mask the source body, paint in the target',14,16,C.dim);
    function panel(cx,lbl,col,drawArm){rrect(ctx,cx-w*0.11,h*0.34,w*0.22,h*0.34,8,C.line,null);lab(ctx,lbl,cx-w*0.09,h*0.32,col,9.5);
      dot(ctx,cx-w*0.05,h*0.58,6,C.amber);/*object*/
      if(drawArm){ctx.strokeStyle=col;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(cx+w*0.07,h*0.4);ctx.lineTo(cx+w*0.02,h*0.5);ctx.lineTo(cx-w*0.03,h*0.56);ctx.stroke();}}
    panel(w*0.2,'source robot',C.cyan,true);
    arrow(ctx,w*0.32,h*0.5,w*0.4,h*0.5,C.ink,1.4);
    // masked
    panel(w*0.5,'mask the robot',C.mut,false);ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(w*0.5-w*0.01,h*0.38,w*0.1,h*0.22);
    arrow(ctx,w*0.62,h*0.5,w*0.7,h*0.5,C.ink,1.4);
    panel(w*0.8,'inpaint target',C.green,true);
    lab(ctx,'the policy sees “its own” body → zero-shot transfer; a little target data closes the rest',14,h-12,C.mut);
  };

  // F12 EFFICIENT — distill a big slow VLM into a small fast one for the control loop.
  A.vaf_fast=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Big VLMs are too slow for control — distill into a small, fast VLA',14,16,C.dim);
    box(ctx,w*0.08,h*0.4,w*0.22,h*0.24,'big VLM (7B)',C.coral,hexA(C.coral,0.05));
    lab(ctx,'≈ 2 s / action',w*0.1,h*0.7,C.coral,10);
    arrow(ctx,w*0.31,h*0.52,w*0.44,h*0.52,C.ink,1.6);lab(ctx,'distill + prune',w*0.31,h*0.44,C.dim,9.5);
    box(ctx,w*0.46,h*0.44,w*0.16,h*0.16,'small VLA',C.green,hexA(C.green,0.06));
    lab(ctx,'≈ 10 ms / action',w*0.46,h*0.66,C.green,10);
    // latency bars
    ctx.fillStyle=C.coral;ctx.fillRect(w*0.7,h*0.42,w*0.24,10);lab(ctx,'big: slow',w*0.7,h*0.38,C.coral,9.5);
    ctx.fillStyle=C.green;ctx.fillRect(w*0.7,h*0.56,w*0.02,10);lab(ctx,'small: real-time',w*0.73,h*0.6,C.green,9.5);
    lab(ctx,'keep most of the accuracy at a fraction of the latency and memory',14,h-12,C.mut);
  };

  // F13 FORCE-AWARE — add force/tactile so contact is felt; blend force + position control.
  A.vaf_force=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Vision can’t feel contact — add force/tactile for insertion, pressing, wiping',14,16,C.dim);
    box(ctx,w*0.05,h*0.32,w*0.16,24,'vision',C.cyan);box(ctx,w*0.05,h*0.5,w*0.16,24,'force / tactile',C.amber);
    arrow(ctx,w*0.22,h*0.44,w*0.3,h*0.44,C.ink,1.4);box(ctx,w*0.31,h*0.36,w*0.12,h*0.16,'VLA',C.violet);
    arrow(ctx,w*0.44,h*0.44,w*0.5,h*0.44,C.green,1.4);
    // peg-in-hole
    ctx.strokeStyle=C.mut;ctx.lineWidth=2;ctx.strokeRect(w*0.56,h*0.5,w*0.2,h*0.16);ctx.clearRect(w*0.64,h*0.5,w*0.04,h*0.1);
    const py=h*0.3+saw(t,3)*h*0.16;ctx.fillStyle=C.green;ctx.fillRect(w*0.645,py,w*0.03,h*0.14);
    lab(ctx,'peg → hole',w*0.58,h*0.44,C.mut,9.5);
    // force curve rising at contact
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.6;ctx.beginPath();for(let i=0;i<=30;i++){const u=i/30,x=w*0.56+w*0.36*u,y=h*0.86-(u<0.6?2:(u-0.6)*70);ctx.lineTo(x,y);}ctx.stroke();
    lab(ctx,'force: spikes at contact → press, comply, or back off',w*0.56,h*0.9,C.mut,9.5);
    lab(ctx,'blend force control with position control in one policy',14,h-12,C.mut);
  };

  // F14 ACTIVE PERCEPTION — move the camera to see the occluded thing before acting.
  A.vaf_active=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Don’t assume you can see everything — move to look, then act',14,16,C.dim);
    // target occluded behind a box
    const ox=w*0.55,oy=h*0.55;ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(ox-30,oy-30,44,60);lab(ctx,'occluder',ox-30,oy+44,C.mut,9);
    dot(ctx,ox+30,oy,7,C.amber);lab(ctx,'target',ox+22,oy+22,C.amber,9.5);
    // camera moves from fixed (blocked) to active (sees)
    const p=saw(t,4);
    const c1=[w*0.2,h*0.4],c2=[w*0.82,h*0.4];
    // fixed view (line-of-sight blocked)
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(c1[0],c1[1]);ctx.lineTo(ox-20,oy);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,c1[0],c1[1],5,C.coral);lab(ctx,'fixed view: blocked ✗',c1[0]-10,c1[1]-14,C.coral,9.5);
    // active view (clear)
    if(p>0.4){ctx.strokeStyle=C.green;ctx.beginPath();ctx.moveTo(c2[0],c2[1]);ctx.lineTo(ox+30,oy);ctx.stroke();dot(ctx,c2[0],c2[1],6,C.green);lab(ctx,'active view: sees it ✓',c2[0]-40,c2[1]-14,C.green,9.5);}
    lab(ctx,'choose where to look next, update belief (POMDP-style), then act once you can see',14,h-12,C.mut);
  };

  // F15 ROBUSTNESS — clean scores collapse under perturbation; RL + grounding recover part of it.
  A.vaf_robust=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'VLAs ace clean benchmarks, then crash under mild perturbation',14,16,C.dim);
    const bx=w*0.12,by=h*0.82,bw=w*0.18,gap=w*0.06;
    const bars=[['clean',0.95,C.green],['perturbed',0.28,C.coral],['+ RL / grounding',0.62,C.amber]];
    const grow=Math.min(1,saw(t,4)*1.4);
    bars.forEach((b,i)=>{const x=bx+i*(bw+gap),bh=(by-h*0.28)*b[1]*grow;ctx.fillStyle=b[2];ctx.fillRect(x,by-bh,bw,bh);
      lab(ctx,Math.round(b[1]*100)+'%',x+bw/2,by-bh-10,b[2],11,'center');lab(ctx,b[0],x+bw/2,by+14,C.mut,9.5,'center');});
    // axis
    ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(bx-8,by);ctx.lineTo(bx+3*(bw+gap),by);ctx.stroke();
    lab(ctx,'success rate',bx-8,h*0.24,C.dim,9.5);
    lab(ctx,'perturb viewpoint / light / phrasing → diagnose weak spots → harden with data + grounding + RL',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.vaanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-vaanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
