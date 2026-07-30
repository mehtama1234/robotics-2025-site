/* lo-anim.js — first-principles mechanism animators for the Locomotion / Whole-Body explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-loanim="name". Self-contained boot. */
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
  const saw=(t,p)=>((t%p)/p);
  // a simple quadruped body at (x,y) with leg phase ph
  function quad(ctx,x,y,col,ph){ctx.strokeStyle=col;ctx.lineWidth=2.4;ctx.strokeRect(x-22,y-9,44,16);
    [-16,-6,6,16].forEach((dx,i)=>{const sw=Math.sin(ph+i*1.7)*6;ctx.beginPath();ctx.moveTo(x+dx,y+7);ctx.lineTo(x+dx+sw,y+24);ctx.stroke();});}
  const A={};

  /* 01 — THE PROBLEM: many joints, contact is a cliff, balance under a shove. */
  A.lo_problem=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Walking is hard for three reasons at once: many joints, contact, and balance',14,16,C.dim);
    // (a) many joints — a leg with several segments swinging (smooth)
    const lx=w*0.16,ly=h*0.34;ctx.strokeStyle=C.cyan;ctx.lineWidth=2.4;
    let px=lx,py=ly;const angs=[0.5+0.3*Math.sin(t),-0.6+0.3*Math.sin(t+1),0.8];
    let a=0;angs.forEach(da=>{a+=da;const nx=px+Math.cos(a)*22,ny=py+Math.sin(a)*22;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,px,py,3,C.amber);px=nx;py=ny;});
    lab(ctx,'many joints (smooth in the air)',lx-30,ly+80,C.mut,9.5);
    // (b) contact = a cliff in the force plot
    const fx=w*0.44,fy=h*0.5;lab(ctx,'foot touches down = a cliff',fx,fy-56,C.coral,9.5);
    ctx.strokeStyle=C.coral;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=40;i++){const u=i/40,x=fx+u*w*0.18,y=fy+18-(u<0.5?2:40);ctx.lineTo(x,y);}ctx.stroke();
    lab(ctx,'force jumps on/off — non-smooth physics',fx,fy+34,C.mut,9.5);
    // (c) balance under a push
    const bx=w*0.84,by=h*0.4;ctx.strokeStyle=C.violet;ctx.lineWidth=2.4;const lean=Math.sin(t*1.5)*0.2;
    ctx.save();ctx.translate(bx,by+40);ctx.rotate(lean);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-40);ctx.stroke();dot(ctx,0,-40,4,C.violet);ctx.restore();
    arrow(ctx,bx-34,by,bx-10,by,C.coral,1.8);lab(ctx,'a shove',bx-40,by-12,C.coral,9.5);lab(ctx,'stay up',bx-10,by+56,C.violet,9.5);
    lab(ctx,'gradient-based control chokes on the contact cliff — which is why learning took over',14,h-12,C.mut);
  };

  /* 02 — RL LEARNS GAITS: reward shapes emergent, energy-optimal gaits, no hand-design. */
  A.lo_rl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'No hand-designed gait: a reward, millions of tries, and the gait emerges',14,16,C.dim);
    box(ctx,w*0.06,h*0.44,w*0.14,28,'reward',C.amber);
    lab(ctx,'go fast · stay up · save energy',w*0.06,h*0.44+40,C.mut,9);
    arrow(ctx,w*0.21,h*0.5,w*0.34,h*0.5,C.ink,1.4);box(ctx,w*0.35,h*0.42,w*0.12,h*0.16,'RL policy',C.violet);
    arrow(ctx,w*0.48,h*0.5,w*0.56,h*0.5,C.green,1.6);
    // emergent gaits: walking quadruped + gait labels cycling
    const gx=w*0.72,gy=h*0.5;quad(ctx,gx,gy,C.green,t*5);
    const gaits=['walk','trot','gallop'];const gi=Math.floor(saw(t,3)*3)%3;
    lab(ctx,'emergent gait: '+gaits[gi],gx-40,gy-34,C.green,10);
    lab(ctx,'energy-optimal transitions appear on their own',gx-70,gy+40,C.mut,9.5);
    lab(ctx,'RL discovers gaits, transitions, and recoveries a human never scripted',14,h-12,C.mut);
  };

  /* 03 — TEACHER-STUDENT: a privileged teacher trains an onboard-only student. */
  A.lo_teacher=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Learn with cheats, deploy without: a privileged teacher trains an onboard student',14,16,C.dim);
    // teacher (has privileged info)
    box(ctx,w*0.06,h*0.3,w*0.28,h*0.24,'',C.amber,hexA(C.amber,0.05));lab(ctx,'TEACHER (in sim)',w*0.08,h*0.27,C.amber,10);
    ['knows terrain height','knows friction & mass','sees the future push'].forEach((s,i)=>lab(ctx,'• '+s,w*0.09,h*0.4+i*15,C.ink,9.5));
    // distill arrow
    arrow(ctx,w*0.35,h*0.42,w*0.5,h*0.5,C.violet,1.8);lab(ctx,'distill',w*0.37,h*0.4,C.violet,9.5);
    // student (onboard only)
    box(ctx,w*0.52,h*0.4,w*0.28,h*0.22,'',C.green,hexA(C.green,0.05));lab(ctx,'STUDENT (on the robot)',w*0.54,h*0.37,C.green,10);
    ['only joint sensors','only onboard camera'].forEach((s,i)=>lab(ctx,'• '+s,w*0.55,h*0.49+i*15,C.ink,9.5));
    arrow(ctx,w*0.81,h*0.5,w*0.88,h*0.5,C.green,1.6);lab(ctx,'deploys',w*0.83,h*0.42,C.green,9.5);
    lab(ctx,'the teacher uses privileged simulator info the real robot can’t sense; the student mimics it blind',14,h-12,C.mut);
  };

  /* 04 — BALANCE & RECOVERY: predict where to step to not fall after a shove. */
  A.lo_recover=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Balance is stepping: after a shove, put a foot where it stops the fall',14,16,C.dim);
    const gy=h*0.72;ctx.strokeStyle=hexA(C.mut,0.4);ctx.beginPath();ctx.moveTo(w*0.06,gy);ctx.lineTo(w*0.94,gy);ctx.stroke();
    // biped leaning after push
    const p=saw(t,3);const bx=w*0.4;const lean=Math.min(0.5,p*0.7);
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.6;ctx.save();ctx.translate(bx,gy);ctx.rotate(lean);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-48);ctx.stroke();dot(ctx,0,-52,5,C.violet);ctx.restore();
    lab(ctx,'CoM',bx+Math.sin(lean)*52-16,gy-56,C.violet,9);
    arrow(ctx,bx-40,gy-40,bx-14,gy-40,C.coral,1.8);lab(ctx,'push',bx-46,gy-52,C.coral,9.5);
    // capture-point step target
    const cpx=bx+Math.sin(lean)*90;dot(ctx,cpx,gy,6,C.green);lab(ctx,'step here (capture point)',cpx-30,gy+18,C.green,9.5);
    if(p>0.6){arrow(ctx,bx+8,gy-6,cpx-6,gy-4,C.green,1.6);lab(ctx,'recovered ✓',cpx-10,gy-24,C.green,9.5);}
    lab(ctx,'the controller predicts the foothold that brings the center of mass back over support',14,h-12,C.mut);
  };

  /* 05 — WHOLE-BODY: legs keep balance (CoM over support) while arms do the task. */
  A.lo_wholebody=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Whole-body control: legs hold balance while the arms do the job',14,16,C.dim);
    const cx=w*0.42,gy=h*0.8;
    // support polygon
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.beginPath();ctx.moveTo(cx-40,gy);ctx.lineTo(cx+40,gy);ctx.lineTo(cx+30,gy+10);ctx.lineTo(cx-30,gy+10);ctx.closePath();ctx.fill();
    lab(ctx,'support polygon',cx-40,gy+24,C.cyan,9);
    // humanoid
    const hy=gy-100;ctx.strokeStyle=C.violet;ctx.lineWidth=2.6;
    ctx.beginPath();ctx.arc(cx,hy-8,6,0,TAU);ctx.moveTo(cx,hy-2);ctx.lineTo(cx,hy+40);// torso
    ctx.moveTo(cx,hy+40);ctx.lineTo(cx-16,gy);ctx.moveTo(cx,hy+40);ctx.lineTo(cx+16,gy);// legs
    ctx.stroke();
    // reaching arm (task)
    const reach=0.6+0.5*Math.sin(t*1.2);ctx.strokeStyle=C.amber;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(cx,hy+8);ctx.lineTo(cx+30*reach+10,hy+2-reach*8);ctx.stroke();
    dot(ctx,cx+30*reach+10,hy+2-reach*8,4,C.amber);lab(ctx,'arm: reach the goal',cx+40,hy-8,C.amber,9.5);
    // CoM line stays over polygon
    ctx.strokeStyle=hexA(C.green,0.7);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(cx+4,hy+20);ctx.lineTo(cx+4,gy);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,cx+4,hy+20,4,C.green);lab(ctx,'legs keep CoM over support',cx-30,hy+64,C.green,9.5);
    lab(ctx,'reaching shifts the center of mass — the legs must counter it, or the robot tips (loco-manipulation)',14,h-12,C.mut);
  };

  /* F01 — lof_rl_gait: reward signal → emergent gait (trot / canter phases animate) */
  A.lof_rl_gait=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reward in, gait out: RL discovers footfall timing with no hand-tuning',14,16,C.dim);
    // reward box (left)
    const rx=w*0.06,ry=h*0.36;box(ctx,rx,ry,w*0.15,30,'reward',C.amber,hexA(C.amber,0.08));
    lab(ctx,'velocity + upright',rx+2,ry+46,C.mut,9);lab(ctx,'- energy - fall',rx+2,ry+58,C.mut,9);
    arrow(ctx,rx+w*0.15,ry+15,rx+w*0.15+20,ry+15,C.ink,1.4);
    // RL policy box
    const px=rx+w*0.15+22,py=ry+4;box(ctx,px,py,w*0.13,22,'RL policy',C.violet,hexA(C.violet,0.08));
    arrow(ctx,px+w*0.13,py+11,px+w*0.13+16,py+11,C.green,1.6);
    // gait footfall timeline (right half)
    const gx=w*0.52,gy=h*0.28,bw=w*0.42,lh=24;
    const legs=['LF','RF','LH','RH'];const phases=[0,0.5,0.75,0.25];
    lab(ctx,'Emergent footfall timing at 1.5 m/s (trot):',gx,gy-12,C.mut,9.5);
    legs.forEach((lbl,i)=>{
      const y=gy+i*lh;lab(ctx,lbl,gx-4,y+8,C.dim,9,'right');
      ctx.fillStyle=hexA(C.line,0.4);ctx.fillRect(gx+2,y,bw-2,lh-4);
      // stance bar: 40% duty, offset by phase
      const ph=(phases[i]+saw(t,2.5))%1;
      const sw=bw*0.4;let s1=ph*bw,s2=s1+sw;
      if(s2<=bw){ctx.fillStyle=C.green;ctx.fillRect(gx+2+s1,y,sw,lh-4);}
      else{ctx.fillStyle=C.green;ctx.fillRect(gx+2+s1,y,bw-s1,lh-4);ctx.fillRect(gx+2,y,s2-bw,lh-4);}
    });
    // gait label
    const sp=saw(t,6);const gaitLabel=sp<0.33?'walk':sp<0.66?'trot':'canter';
    lab(ctx,'speed → '+gaitLabel+' (gait emerges from reward)',gx,gy+4*lh+14,C.green,9.5);
    lab(ctx,'gait transitions are not scripted — they are implicit in the energy term of the reward',14,h-12,C.mut);
  };

  /* F02 — lof_mpc_wbc: QP stack — task cost + dynamics constraint + contact cone */
  A.lof_mpc_wbc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Whole-body QP: one solve gives arm + leg torques that respect physics',14,16,C.dim);
    // task (arm reaching) top right
    const tx=w*0.66,ty=h*0.18;
    const reach=0.5+0.35*Math.sin(t*1.1);
    lab(ctx,'task: reach target',tx,ty-10,C.amber,9.5);
    dot(ctx,tx+80*reach,ty+20,5,C.coral);lab(ctx,'target',tx+80*reach+6,ty+18,C.coral,9);
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,ty+20);ctx.lineTo(tx+80*reach,ty+20);ctx.stroke();
    // constraint boxes stacked (left-centre)
    const cx=w*0.06,cy=h*0.25,bh=20,gap=6;
    const cons=[['dynamics  F=ma',C.cyan],['contact μFz≥|Fx|',C.violet],['torque |τ|≤80Nm',C.coral]];
    lab(ctx,'constraints',cx,cy-14,C.mut,9.5);
    cons.forEach((c,i)=>{box(ctx,cx,cy+i*(bh+gap),w*0.22,bh,c[0],c[1],hexA(c[1],0.07));});
    // QP solver arrow
    const qx=cx+w*0.22+8;arrow(ctx,qx,cy+28,qx+24,cy+28,C.ink,1.4);
    box(ctx,qx+26,cy+14,w*0.12,28,'QP solver',C.ink,hexA(C.mut,0.12));
    arrow(ctx,qx+26+w*0.12,cy+28,qx+26+w*0.12+14,cy+28,C.green,1.5);
    box(ctx,qx+26+w*0.12+16,cy+8,w*0.14,40,'joint\ntorques',C.green,hexA(C.green,0.08));
    // friction cone diagram (lower-right, away from constraint boxes)
    const fcx=w*0.46,fcy=h*0.76;
    lab(ctx,'friction cone (no slip):',fcx-10,fcy-50,C.violet,9.5);
    ctx.strokeStyle=hexA(C.violet,0.6);ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(fcx,fcy);ctx.lineTo(fcx-22,fcy-38);ctx.moveTo(fcx,fcy);ctx.lineTo(fcx+22,fcy-38);ctx.stroke();
    ctx.strokeStyle=hexA(C.violet,0.3);ctx.beginPath();ctx.arc(fcx,fcy-38,22,0,Math.PI*2);ctx.stroke();
    const fa=t*0.7%1;const fx2=fcx+Math.sin(fa*Math.PI*2)*11,fy2=fcy-22;
    arrow(ctx,fcx,fcy,fx2,fy2,C.green,1.6);lab(ctx,'F stays inside',fcx+26,fcy-26,C.mut,9);
    lab(ctx,'the QP solves arm task + leg balance simultaneously in <1 ms per tick',14,h-12,C.mut);
  };

  /* F03 — lof_sim2real: domain randomization funnels policy to real robot */
  A.lof_sim2real=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Randomize in sim so reality is just another sample',14,16,C.dim);
    // sim box
    const sx=w*0.05,sy=h*0.28;
    rrect(ctx,sx,sy,w*0.32,h*0.38,9,C.violet,hexA(C.violet,0.06));
    lab(ctx,'SIM',sx+6,sy-10,C.violet,9.5);
    const params=['friction: 0.4-1.2','mass ±20%','push 0-150N','joint lag ±10ms'];
    params.forEach((p,i)=>lab(ctx,'• '+p,sx+8,sy+16+i*18,C.mut,9));
    // policy icon
    const polx=sx+w*0.32+14,poly=sy+h*0.19-14;box(ctx,polx,poly,w*0.14,28,'policy',C.cyan,hexA(C.cyan,0.07));
    // teacher/student split
    const tstx=polx+w*0.14+10;
    box(ctx,tstx,poly-16,w*0.12,22,'teacher',C.amber,hexA(C.amber,0.08));
    lab(ctx,'(has sim info)',tstx,poly+12,C.amber,8.5);
    arrow(ctx,tstx+w*0.12/2,poly+6,tstx+w*0.12/2,poly+40,C.violet,1.4);lab(ctx,'distill',tstx+w*0.12/2+4,poly+24,C.violet,8.5);
    box(ctx,tstx,poly+42,w*0.12,22,'student',C.green,hexA(C.green,0.08));
    lab(ctx,'(sensors only)',tstx,poly+70,C.green,8.5);
    // deploy arrow to real
    const rx=tstx+w*0.12+12;arrow(ctx,rx,poly+52,rx+20,poly+52,C.green,1.6);
    rrect(ctx,rx+22,poly+38,w*0.11,28,7,C.ink,hexA(C.ink,0.06));lab(ctx,'REAL',rx+26,poly+52,C.ink,9.5);
    // animate: pulsing "randomize" label
    const pulse=0.5+0.5*Math.sin(t*2);
    lab(ctx,'randomize →',sx+6,sy+h*0.38-10,hexA(C.violet,0.4+pulse*0.5),9.5);
    lab(ctx,'reality is just one more random sample the policy already saw in training',14,h-12,C.mut);
  };

  /* F04 — lof_terrain: elevation map → foot placement on rough ground */
  A.lof_terrain=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Read the ground ahead, step where the foot fits — before landing',14,16,C.dim);
    // terrain profile
    const gx=w*0.08,gy=h*0.72,tw=w*0.84;
    ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+tw,gy);ctx.stroke();
    const heights=[0,0,4,4,18,18,10,10,0,0,24,24,12,12,0,0];
    ctx.fillStyle=hexA(C.cyan,0.15);ctx.beginPath();ctx.moveTo(gx,gy);
    heights.forEach((hh,i)=>{const x=gx+i*(tw/heights.length);ctx.lineTo(x,gy-hh*1.8);});
    ctx.lineTo(gx+tw,gy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.5;ctx.beginPath();
    heights.forEach((hh,i)=>{const x=gx+i*(tw/heights.length);i===0?ctx.moveTo(x,gy-hh*1.8):ctx.lineTo(x,gy-hh*1.8);});ctx.stroke();
    // quadruped walking along
    const qp=saw(t,4);const qx2=gx+qp*tw*0.85+14;
    const hi=Math.round(qp*heights.length*0.85)%heights.length;const qy=gy-heights[hi]*1.8-22;
    quad(ctx,qx2,qy,C.green,t*4);
    // elevation map sensor cone
    ctx.strokeStyle=hexA(C.amber,0.5);ctx.setLineDash([2,3]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(qx2,qy-10);ctx.lineTo(qx2-30,gy-2);ctx.moveTo(qx2,qy-10);ctx.lineTo(qx2+50,gy-2);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'depth scan',qx2+14,qy-20,C.amber,8.5);
    // step target
    const stx=qx2+50;const shi=Math.round((qp+0.12)*heights.length*0.85)%heights.length;const sty=gy-heights[shi]*1.8;
    dot(ctx,stx,sty,5,C.coral);lab(ctx,'next step',stx+4,sty-14,C.coral,8.5);
    lab(ctx,'curriculum: flat → bumps → stairs → gaps → parkour; perception closes the loop',14,h-12,C.mut);
  };

  /* F05 — lof_humanoid_wbc: one policy, many modes — walk / reach / dance */
  A.lof_humanoid_wbc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One policy, all modes: walking + reaching + expressive motion, no resets',14,16,C.dim);
    const modes=['walk','navigate','manipulate','dance'];const mi=Math.floor(saw(t,6)*modes.length);
    lab(ctx,'mode: '+modes[mi],w*0.5,30,C.amber,11,'center');
    // humanoid
    const hx=w*0.42,hy=h*0.62;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.4;
    ctx.beginPath();ctx.arc(hx,hy-60,8,0,TAU);ctx.moveTo(hx,hy-52);ctx.lineTo(hx,hy-14);ctx.moveTo(hx,hy-14);ctx.lineTo(hx-18,hy+8);ctx.moveTo(hx,hy-14);ctx.lineTo(hx+18,hy+8);ctx.stroke();
    // animated right arm reaching
    const reach2=mi===2?0.8+0.15*Math.sin(t*2):0.3+0.1*Math.sin(t*1.5);
    ctx.strokeStyle=C.amber;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(hx,hy-42);ctx.lineTo(hx+40*reach2,hy-42+10*(1-reach2));ctx.stroke();
    dot(ctx,hx+40*reach2,hy-42+10*(1-reach2),4,C.amber);
    // support polygon
    ctx.fillStyle=hexA(C.green,0.15);ctx.beginPath();ctx.ellipse(hx,hy+10,22,7,0,0,TAU);ctx.fill();
    ctx.strokeStyle=hexA(C.green,0.5);ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(hx,hy+10,22,7,0,0,TAU);ctx.stroke();
    lab(ctx,'support',hx-20,hy+26,C.green,8.5);
    // specialist skills on left
    lab(ctx,'specialists',w*0.08,h*0.3,C.mut,9.5);
    ['walk','manip','dance'].forEach((s,i)=>{box(ctx,w*0.05,h*0.38+i*32,w*0.14,24,s,C.dim,hexA(C.dim,0.08));});
    arrow(ctx,w*0.05+w*0.14,h*0.38+32,w*0.05+w*0.14+24,h*0.38+32,C.violet,1.4);
    box(ctx,w*0.05+w*0.14+26,h*0.38+20,w*0.13,28,'distill',C.violet,hexA(C.violet,0.1));
    arrow(ctx,w*0.05+w*0.14+26+w*0.13,h*0.38+34,hx-28,hy-52,C.green,1.4);
    lab(ctx,'one controller; mode-flag input; 0.3 s to switch; no manual reset needed',14,h-12,C.mut);
  };

  /* F06 — lof_locomani: moving base + arm coordination */
  A.lof_locomani=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Walk and manipulate: keep the end-effector on target while the base moves',14,16,C.dim);
    // base moving left→right
    const bp=saw(t,3.5);const bx=w*0.12+bp*w*0.52,by=h*0.60;
    rrect(ctx,bx-24,by-12,48,20,6,C.violet,hexA(C.violet,0.12));
    lab(ctx,'base',bx-10,by+2,C.violet,9);
    // arm on base
    const armAngle=-0.5+0.3*Math.sin(t*1.8);
    const ex=bx+Math.cos(armAngle)*44,ey=by-12+Math.sin(armAngle)*-28;
    ctx.strokeStyle=C.amber;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(bx,by-12);ctx.lineTo(ex,ey);ctx.stroke();
    dot(ctx,ex,ey,5,C.coral);
    // target is fixed in space
    const targetX=w*0.66,targetY=h*0.36;
    dot(ctx,targetX,targetY,6,C.green);lab(ctx,'fixed target',targetX+8,targetY-2,C.green,9);
    // error line
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([3,4]);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(targetX,targetY);ctx.stroke();ctx.setLineDash([]);
    const err=Math.hypot(ex-targetX,ey-targetY);lab(ctx,'err: '+(err|0)+'px',Math.min(ex,targetX)+4,Math.min(ey,targetY)-12,C.coral,8.5);
    // UMI demos annotation
    box(ctx,w*0.06,h*0.14,w*0.18,26,'50 demos',C.cyan,hexA(C.cyan,0.08));
    arrow(ctx,w*0.06+w*0.18,h*0.27,w*0.06+w*0.18+20,h*0.27,C.cyan,1.3);
    box(ctx,w*0.06+w*0.18+22,h*0.18,w*0.13,26,'policy',C.violet,hexA(C.violet,0.08));
    lab(ctx,'arm must compensate for base motion in real time or the end-effector drifts',14,h-12,C.mut);
  };

  /* F07 — lof_demo_prior: human mocap → retarget → robot policy */
  A.lof_demo_prior=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Human shows, robot adapts: retarget motion across the embodiment gap',14,16,C.dim);
    // human stick figure left
    const hx=w*0.18,hy=h*0.5;const wv=Math.sin(t*1.4)*0.18;
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(hx,hy-52,7,0,TAU);ctx.moveTo(hx,hy-45);ctx.lineTo(hx,hy-14);
    ctx.moveTo(hx,hy-14);ctx.lineTo(hx-16,hy+8);ctx.moveTo(hx,hy-14);ctx.lineTo(hx+16,hy+8);
    ctx.moveTo(hx,hy-36);ctx.lineTo(hx+28*Math.cos(wv+0.5),hy-36+28*Math.sin(wv+0.5));
    ctx.moveTo(hx,hy-36);ctx.lineTo(hx-28*Math.cos(wv-0.3),hy-36+28*Math.sin(wv-0.3));ctx.stroke();
    lab(ctx,'human (mocap)',hx-22,hy+26,C.mut,9);
    // retarget arrow + problem note
    arrow(ctx,hx+30,hy-20,w*0.43,hy-20,C.cyan,1.5);lab(ctx,'retarget',w*0.27,hy-34,C.cyan,9.5);
    lab(ctx,'(remap limb\nlengths)',w*0.27,hy-16,C.mut,8.5);
    // robot figure right
    const rx=w*0.62,ry=h*0.5;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.2;
    ctx.beginPath();ctx.arc(rx,ry-52,8,0,TAU);ctx.moveTo(rx,ry-44);ctx.lineTo(rx,ry-10);
    ctx.moveTo(rx,ry-10);ctx.lineTo(rx-20,ry+14);ctx.moveTo(rx,ry-10);ctx.lineTo(rx+20,ry+14);
    ctx.moveTo(rx,ry-32);ctx.lineTo(rx+32*Math.cos(wv+0.5),ry-32+32*Math.sin(wv+0.5));
    ctx.moveTo(rx,ry-32);ctx.lineTo(rx-32*Math.cos(wv-0.3),ry-32+32*Math.sin(wv-0.3));ctx.stroke();
    lab(ctx,'humanoid (deployed)',rx-26,ry+38,C.violet,9);
    // contact marker (foot preserved)
    dot(ctx,rx-20,ry+14,5,C.green);lab(ctx,'contact\npreserved',rx-98,ry+6,C.green,8.5);
    // AMP discriminator box
    box(ctx,w*0.68,h*0.22,w*0.17,24,'AMP disc.',C.amber,hexA(C.amber,0.08));
    arrow(ctx,w*0.68+w*0.17/2,h*0.22+24,w*0.68+w*0.17/2,h*0.34,C.amber,1.3);
    lab(ctx,'human-like?',w*0.68+w*0.17+4,h*0.28,C.amber,8.5);
    lab(ctx,'contact moments in human motion define where the robot must also make contact',14,h-12,C.mut);
  };

  /* F08 — lof_recovery: capture-point stepping after a push */
  A.lof_recovery=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'After a push: step to the capture point or fall',14,16,C.dim);
    const gy=h*0.76;ctx.strokeStyle=hexA(C.mut,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*0.05,gy);ctx.lineTo(w*0.95,gy);ctx.stroke();
    // biped leaning
    const p=saw(t,3.5);const bx=w*0.38;const lean=Math.min(0.42,p*0.6);
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.6;ctx.save();ctx.translate(bx,gy);ctx.rotate(lean);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-52);ctx.stroke();dot(ctx,0,-58,6,C.violet);ctx.restore();
    lab(ctx,'CoM',bx+Math.sin(lean)*62-10,gy-62,C.violet,9);
    // velocity vector
    const vx=bx+Math.sin(lean)*52;
    arrow(ctx,bx-38,gy-44,bx-12,gy-44,C.coral,1.8);lab(ctx,'push 150N',bx-56,gy-56,C.coral,8.5);
    // capture point formula
    const cpx=bx+Math.sin(lean)*90+20;
    dot(ctx,cpx,gy,7,C.green);lab(ctx,'capture point',cpx-14,gy+16,C.green,9);
    lab(ctx,'ξ = x + ẋ/ω₀',cpx+10,gy-16,C.cyan,9.5);
    if(p>0.55){arrow(ctx,bx+8,gy-8,cpx-6,gy-4,C.green,1.6);lab(ctx,'step here → recovered',cpx-10,gy-28,C.green,9);}
    // FRASA box for large disturbance
    const fbox=w*0.74;if(p<0.3||lean>0.38){box(ctx,fbox,gy-50,w*0.16,28,'learned\nrecovery',C.amber,hexA(C.amber,0.08));lab(ctx,'too large → RL fallback',fbox-4,gy-56,C.amber,8.5);}
    lab(ctx,'if the step cannot reach the capture point, the RL fallback takes over',14,h-12,C.mut);
  };

  /* F09 — lof_diffuse_loco: denoising action from multimodal gait distribution */
  A.lof_diffuse_loco=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Diffusion commits to one gait; regression blends them (and falls)',14,16,C.dim);
    // left: two gait clusters in action space
    const lx=w*0.18,ly=h*0.5;
    lab(ctx,'gait distribution',lx-20,ly-52,C.mut,9.5);
    // cluster 1: trot
    for(let i=0;i<12;i++){const a=i*(TAU/12);dot(ctx,lx+Math.cos(a)*28+6,ly+Math.sin(a)*16-10,2.5,hexA(C.cyan,0.65));}
    lab(ctx,'trot',lx+34,ly-10,C.cyan,9);
    // cluster 2: canter
    const cx2=lx+10,cy2=ly+30;
    for(let i=0;i<10;i++){const a=i*(TAU/10);dot(ctx,cx2+Math.cos(a)*22+6,cy2+Math.sin(a)*12,2.5,hexA(C.amber,0.65));}
    lab(ctx,'canter',cx2+28,cy2,C.amber,9);
    // regression mean (bad)
    const mx=lx+8,my=ly+10;dot(ctx,mx,my,6,C.coral);lab(ctx,'regression\n(averaged → falls)',mx+8,my-4,C.coral,9);
    // denoising trajectory (right of center)
    const dx=w*0.52,dy=h*0.44;
    lab(ctx,'diffusion denoising:',dx,dy-14,C.dim,9.5);
    const steps=8;for(let i=0;i<steps;i++){
      const p=i/steps,tt=(saw(t,4)+p*0.5)%1;
      const nx=dx+p*w*0.26,ny=dy+16+Math.sin(tt*Math.PI)*24*(1-p);
      dot(ctx,nx,ny,3,hexA(C.violet,0.3+p*0.6));}
    // final commitment dot
    const fp=saw(t,4);const fx2=dx+w*0.26,fy2=dy+16;
    dot(ctx,fx2,fy2,6,C.green);lab(ctx,'commits to trot\n(one mode)',fx2+6,fy2-4,C.green,9);
    arrow(ctx,w*0.46,h*0.5,dx-6,dy+12,C.violet,1.3);
    lab(ctx,'1-step distilled inference: 1.2 ms latency, fits 50 Hz control loop',14,h-12,C.mut);
  };

  /* F10 — lof_lang_body: language → plan → primitive → whole-body motion */
  A.lof_lang_body=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Language → plan → primitives → body motion, zero-shot',14,16,C.dim);
    // command box
    box(ctx,w*0.04,h*0.36,w*0.18,28,'"walk to\nred box"',C.amber,hexA(C.amber,0.08));
    arrow(ctx,w*0.04+w*0.18,h*0.50,w*0.04+w*0.18+14,h*0.50,C.ink,1.3);
    // VLM box
    box(ctx,w*0.04+w*0.18+16,h*0.42,w*0.14,24,'VLM',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.04+w*0.18+16+w*0.14,h*0.54,w*0.04+w*0.18+16+w*0.14+12,h*0.54,C.ink,1.3);
    // plan steps
    const planx=w*0.04+w*0.18+16+w*0.14+14,plany=h*0.30;
    lab(ctx,'plan:',planx,plany-10,C.mut,9.5);
    const planSteps=['navigate 2m','stop','grasp obj'];
    planSteps.forEach((s,i)=>{
      box(ctx,planx,plany+i*30,w*0.14,22,s,C.cyan,hexA(C.cyan,0.07));
      if(i<planSteps.length-1)arrow(ctx,planx+w*0.14/2,plany+i*30+22,planx+w*0.14/2,plany+(i+1)*30,C.mut,1);
    });
    // primitive → WBC
    const wx=planx+w*0.14+12,wy=h*0.44;
    arrow(ctx,wx,wy,wx+16,wy,C.green,1.4);
    box(ctx,wx+18,wy-14,w*0.12,28,'WBC',C.green,hexA(C.green,0.08));
    // animate highlight: which step is executing
    const step=Math.floor(saw(t,4.5)*3);
    rrect(ctx,planx-3,plany+step*30-3,w*0.14+6,28,5,C.cyan,null);
    lab(ctx,'4 human corrections in language update the LLM prior for all future behavior',14,h-12,C.mut);
  };

  /* F11 — lof_phys_gen: physics loss in diffusion stops foot-skating */
  A.lof_phys_gen=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Physics loss in the denoising step: force the foot to stay on the floor',14,16,C.dim);
    // floor line
    const gy=h*0.68;ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*0.08,gy);ctx.lineTo(w*0.92,gy);ctx.stroke();
    // left: without physics — foot skating
    const lx=w*0.22;
    lab(ctx,'without physics loss:',lx-20,gy-58,C.coral,9.5);
    const skate=Math.sin(t*3)*12;
    ctx.strokeStyle=C.coral;ctx.lineWidth=1.8;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(lx-20,gy-2+skate);ctx.lineTo(lx+20,gy-2+skate);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,lx,gy-2+skate,5,C.coral);lab(ctx,'foot skates\n('+((Math.abs(skate)*0.003).toFixed(3))+'m/s)',lx-16,gy+14,C.coral,8.5);
    // arrow to with physics
    arrow(ctx,w*0.38,gy-20,w*0.52,gy-20,C.green,1.4);lab(ctx,'+ physics\nloss',w*0.38+6,gy-38,C.green,8.5);
    // right: with physics — foot on floor
    const rx=w*0.68;
    lab(ctx,'with physics loss:',rx-20,gy-58,C.green,9.5);
    dot(ctx,rx,gy-4,5,C.green);
    // ground reaction force arrow
    arrow(ctx,rx,gy-4,rx,gy-28,C.cyan,1.5);lab(ctx,'GRF',rx+6,gy-22,C.cyan,8.5);
    lab(ctx,'friction cone check',rx+6,gy+12,C.mut,8.5);
    ctx.strokeStyle=hexA(C.violet,0.5);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(rx,gy-4);ctx.lineTo(rx-14,gy-28);ctx.moveTo(rx,gy-4);ctx.lineTo(rx+14,gy-28);ctx.stroke();
    lab(ctx,'foot velocity in stance: 0.005 m/s (vs 0.04 without) — 8× reduction in skating',14,h-12,C.mut);
  };

  /* F12 — lof_retarget: human skeleton → robot skeleton, contact preserved */
  A.lof_retarget=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Retargeting: preserve what matters (contact) not just joint angles',14,16,C.dim);
    // human pose (left)
    const hx=w*0.2,hy=h*0.54;const wave=Math.sin(t*1.5)*0.22;
    ctx.strokeStyle=hexA(C.ink,0.7);ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(hx,hy-54,7,0,TAU);ctx.moveTo(hx,hy-47);ctx.lineTo(hx,hy-14);
    ctx.moveTo(hx,hy-14);ctx.lineTo(hx-16,hy+10);ctx.moveTo(hx,hy-14);ctx.lineTo(hx+16,hy+10);
    ctx.moveTo(hx,hy-34);ctx.lineTo(hx+30*Math.cos(wave),hy-34+30*Math.sin(wave));
    ctx.moveTo(hx,hy-34);ctx.lineTo(hx-18,hy-20);ctx.stroke();
    lab(ctx,'human\n(170cm)',hx-14,hy+26,C.mut,9);
    // naive retarget (red — broken)
    const nx=w*0.44,ny=h*0.54;
    ctx.strokeStyle=hexA(C.coral,0.65);ctx.lineWidth=2;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.arc(nx,ny-46,7,0,TAU);ctx.moveTo(nx,ny-39);ctx.lineTo(nx,ny-10);
    ctx.moveTo(nx,ny-10);ctx.lineTo(nx-22,ny+18);ctx.moveTo(nx,ny-10);ctx.lineTo(nx+22,ny+18);
    ctx.moveTo(nx,ny-28);ctx.lineTo(nx+36*Math.cos(wave),ny-28+36*Math.sin(wave));
    ctx.moveTo(nx,ny-28);ctx.lineTo(nx-24,ny-16);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,nx+36*Math.cos(wave),ny-28+36*Math.sin(wave),5,C.coral);
    lab(ctx,'naive copy\n(hands miss)',nx-18,ny+34,C.coral,9);
    // contact-preserving (green)
    const rx2=w*0.70,ry2=h*0.54;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.2;
    ctx.beginPath();ctx.arc(rx2,ry2-48,8,0,TAU);ctx.moveTo(rx2,ry2-40);ctx.lineTo(rx2,ry2-10);
    ctx.moveTo(rx2,ry2-10);ctx.lineTo(rx2-20,ry2+18);ctx.moveTo(rx2,ry2-10);ctx.lineTo(rx2+20,ry2+18);
    const adjAngle=wave*0.7+0.08;
    ctx.moveTo(rx2,ry2-30);ctx.lineTo(rx2+34*Math.cos(adjAngle),ry2-30+34*Math.sin(adjAngle));
    ctx.moveTo(rx2,ry2-30);ctx.lineTo(rx2-22,ry2-18);ctx.stroke();
    dot(ctx,rx2+34*Math.cos(adjAngle),ry2-30+34*Math.sin(adjAngle),5,C.green);
    lab(ctx,'contact-preserving\n(89% accurate)',rx2-24,ry2+34,C.violet,9);
    // solve label
    box(ctx,w*0.34,h*0.24,w*0.24,26,'IK + contact QP',C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'solve: preserve hand distance <3cm',w*0.34,h*0.24+38,C.mut,8.5);
    lab(ctx,'retargeting preserves contact geometry across different body proportions',14,h-12,C.mut);
  };

  /* F13 — lof_phys_synth: scene heightmap grounds generated foot positions */
  A.lof_phys_synth=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Ground the generation: heightmap under each foot, checked every frame',14,16,C.dim);
    // scene heightmap
    const mx=w*0.08,my=h*0.64,mw=w*0.84,mh=32;
    const terrain2=[0,0,0,6,6,14,14,6,6,0,0,8,8,0,0];
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.beginPath();ctx.moveTo(mx,my+mh);
    terrain2.forEach((hh,i)=>{const x=mx+i*(mw/terrain2.length);ctx.lineTo(x,my+mh-hh*1.6);});
    ctx.lineTo(mx+mw,my+mh);ctx.closePath();ctx.fill();
    ctx.strokeStyle=hexA(C.cyan,0.5);ctx.lineWidth=1.3;ctx.beginPath();
    terrain2.forEach((hh,i)=>{const x=mx+i*(mw/terrain2.length);i===0?ctx.moveTo(x,my+mh-hh*1.6):ctx.lineTo(x,my+mh-hh*1.6);});ctx.stroke();
    lab(ctx,'scene heightmap',mx,my+mh+14,C.mut,9);
    // figure walking
    const pp=saw(t,4);const fx2=mx+pp*mw*0.8+20;const hi2=Math.round(pp*terrain2.length*0.8)%terrain2.length;const fy2=my+mh-terrain2[hi2]*1.6-44;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();ctx.arc(fx2,fy2-16,6,0,TAU);ctx.moveTo(fx2,fy2-10);ctx.lineTo(fx2,fy2+10);
    ctx.moveTo(fx2,fy2+10);ctx.lineTo(fx2-12,my+mh-terrain2[hi2]*1.6);ctx.moveTo(fx2,fy2+10);ctx.lineTo(fx2+12,my+mh-terrain2[hi2]*1.6);ctx.stroke();
    // foot contact check
    const fi=Math.round(pp*terrain2.length*0.8)%terrain2.length;const fh=terrain2[fi]*1.6;
    dot(ctx,fx2-12,my+mh-fh,4,C.green);dot(ctx,fx2+12,my+mh-fh,4,C.green);
    // validity filter box
    box(ctx,w*0.62,h*0.26,w*0.22,28,'validity filter',C.amber,hexA(C.amber,0.08));
    lab(ctx,'foot below map → reject',w*0.62,h*0.26+40,C.coral,8.5);lab(ctx,'foot on map → keep',w*0.62,h*0.26+52,C.green,8.5);
    // contact accuracy
    lab(ctx,'contact accuracy: 0.98 (SceMoS) vs 0.81 scene-blind baseline',w*0.06,h*0.88,C.cyan,9.5);
    lab(ctx,'per-frame heightmap condition: generated feet land on actual surfaces',14,h-12,C.mut);
  };

  /* F14 — lof_hoi: hand-object contact: grasp synthesis with physics filtering */
  A.lof_hoi=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Grasp generation: finger contacts must point inward and not penetrate',14,16,C.dim);
    // mug (center)
    const mx=w*0.50,my=h*0.48;
    rrect(ctx,mx-14,my-28,28,52,5,hexA(C.amber,0.5),hexA(C.amber,0.1));
    lab(ctx,'object',mx+18,my-38,C.amber,9);
    // fingers approaching from left
    const nf=5;for(let i=0;i<nf;i++){
      const ang=-0.5+i*0.28;const dist=28+6*Math.sin(t*1.2+i);
      const fx2=mx-dist*Math.cos(ang)-30,fy2=my+dist*Math.sin(ang);
      ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx2-10,fy2);ctx.lineTo(mx-28*Math.cos(ang)-4,my+28*Math.sin(ang));ctx.stroke();
      dot(ctx,mx-28*Math.cos(ang)-4,my+28*Math.sin(ang),3.5,C.violet);
    }
    // contact normals (should point inward)
    for(let i=0;i<3;i++){const ang=-0.3+i*0.32;
      const cx2=mx-28*Math.cos(ang)-4,cy2=my+28*Math.sin(ang);
      arrow(ctx,cx2,cy2,mx-12*Math.cos(ang)-2,my+12*Math.sin(ang),C.green,1.3);}
    lab(ctx,'green: contact normals\npoint inward (valid)',w*0.04,h*0.30,C.green,8.5);
    // penetration bad example (red dashed)
    const px2=mx+14,py2=my-8;ctx.strokeStyle=C.coral;ctx.lineWidth=1.5;ctx.setLineDash([2,3]);
    ctx.beginPath();ctx.moveTo(px2+10,py2);ctx.lineTo(px2-4,py2);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,px2-4,py2,3,C.coral);lab(ctx,'red: finger\npenetrates → reject',mx+40,my+16,C.coral,8.5);
    // physics filter
    box(ctx,w*0.04,h*0.76,w*0.18,26,'physics\nsim 0.5s',C.cyan,hexA(C.cyan,0.08));
    arrow(ctx,w*0.04+w*0.18,h*0.89,w*0.36,h*0.89,C.green,1.3);lab(ctx,'−40% penetration vs prior SOTA',w*0.38,h*0.89,C.green,9);
    lab(ctx,'SIM(3)-equivariant encoding: grasp score is rotation-invariant — learn once, apply anywhere',14,h-12,C.mut);
  };

  /* F15 — lof_text_motion: multi-modal latent space → motion tokens */
  A.lof_text_motion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Any modality in, one shared latent, coherent motion out',14,16,C.dim);
    // modalities on left column — taller rows so labels don't overlap
    const mods=[['text',C.cyan],['music',C.amber],['pose',C.violet],['traj',C.green]];
    const lx2=w*0.05,ly2=h*0.20,lh2=46;
    mods.forEach((m,i)=>{
      box(ctx,lx2,ly2+i*lh2,w*0.16,28,m[0],m[1],hexA(m[1],0.08));
    });
    // arrows to shared latent
    const ltx=w*0.30,lty=h*0.46;
    mods.forEach((_,i)=>{arrow(ctx,lx2+w*0.16,ly2+i*lh2+14,ltx,lty,hexA(C.ink,0.4),1);});
    rrect(ctx,ltx,lty-20,w*0.18,40,8,C.ink,hexA(C.ink,0.12));lab(ctx,'shared latent 512d',ltx+6,lty,C.ink,9,'left');
    // transformer decoder
    arrow(ctx,ltx+w*0.18,lty,ltx+w*0.18+16,lty,C.violet,1.3);
    box(ctx,ltx+w*0.18+18,lty-14,w*0.12,28,'decoder',C.violet,hexA(C.violet,0.08));
    arrow(ctx,ltx+w*0.18+18+w*0.12,lty,ltx+w*0.18+18+w*0.12+12,lty,C.green,1.4);
    // motion output (animated figure)
    const ox=ltx+w*0.18+18+w*0.12+16,oy=h*0.46;const dance=Math.sin(t*2)*0.3;
    ctx.strokeStyle=C.green;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(ox+8,oy-36,6,0,TAU);ctx.moveTo(ox+8,oy-30);ctx.lineTo(ox+8,oy-8);
    ctx.moveTo(ox+8,oy-8);ctx.lineTo(ox-4,oy+12);ctx.moveTo(ox+8,oy-8);ctx.lineTo(ox+20,oy+12);
    ctx.moveTo(ox+8,oy-22);ctx.lineTo(ox+8+24*Math.cos(dance+0.6),oy-22+24*Math.sin(dance+0.6));
    ctx.moveTo(ox+8,oy-22);ctx.lineTo(ox+8-18*Math.cos(dance-0.4),oy-22+18*Math.sin(dance-0.4));ctx.stroke();
    // active modality highlight (cycles)
    const act=Math.floor(saw(t,4)*mods.length);
    ctx.strokeStyle=mods[act][1];ctx.lineWidth=1.8;ctx.strokeRect(lx2-2,ly2+act*lh2-2,w*0.16+4,32);
    lab(ctx,'FID 0.52 on HumanML3D (vs 1.1 single-modality); missing inputs are masked, not required',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.loanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-loanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
