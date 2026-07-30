/* rl-anim.js — first-principles mechanism animators for the RL & Imitation explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-rlanim="name". Self-contained boot. */
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

  /* 01 — WHY: you can't hand-write every behavior; define a reward, let the robot discover the policy. */
  A.rl_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'You can\'t script every situation — so define what "good" means and let it discover how',14,16,C.dim);
    // left: hand-coded rules pile (brittle); right: reward + discovered policy
    const lx=w*0.06;lab(ctx,'hand-coded rules',lx,h*0.3,C.coral,10);
    ['if obstacle: turn','if slope: slow','if ... : ...','if ??? : ✗'].forEach((s,i)=>{rrect(ctx,lx,h*0.34+i*22,w*0.32,18,4,hexA(C.coral,0.5),null);lab(ctx,s,lx+8,h*0.34+i*22+9,i===3?C.coral:C.mut,9);});
    lab(ctx,'endless cases → brittle',lx,h*0.34+4*22+12,C.coral,9);
    // right: reward -> policy discovers
    const rx=w*0.56;box(ctx,rx,h*0.34,w*0.14,26,'reward:\n"go fast,\nstay safe"',C.green,hexA(C.green,0.08));
    arrow(ctx,rx+w*0.14,h*0.5,rx+w*0.2,h*0.5,C.green,1.4);
    box(ctx,rx+w*0.22,h*0.4,w*0.16,30,'discovered\npolicy',C.violet,hexA(C.violet,0.08));
    lab(ctx,'one goal → behavior found by trial and error',rx-6,h*0.78,C.mut,9);
    lab(ctx,'reinforcement learning trades writing the how for specifying the what — the reward',14,h-12,C.mut);
  };

  /* 02 — THE LOOP: state -> action -> reward -> repeat; maximize return. */
  A.rl_loop=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The loop: see the state, act, get a reward, and learn to earn more of it',14,16,C.dim);
    const cx=w*0.5,cy=h*0.54,R=Math.min(w*0.3,h*0.34);
    box(ctx,cx-R-w*0.09,cy-14,w*0.16,28,'agent\n(policy)',C.violet,hexA(C.violet,0.08));
    box(ctx,cx+R-w*0.07,cy-14,w*0.16,28,'environment',C.cyan,hexA(C.cyan,0.08));
    const p=saw(t,3);
    // action arrow top
    arrow(ctx,cx-R+w*0.09,cy-8,cx+R-w*0.07,cy-8,hexA(C.amber,0.8),1.6);lab(ctx,'action',cx-30,cy-24,C.amber,9);
    // state+reward arrow bottom
    arrow(ctx,cx+R-w*0.07,cy+8,cx-R+w*0.09,cy+8,hexA(C.green,0.8),1.6);lab(ctx,'new state + reward',cx-56,cy+26,C.green,9);
    // pulse moving around
    const px=(p<0.5)?(cx-R+w*0.09+(p/0.5)*(2*R-w*0.16)):(cx+R-w*0.07-((p-0.5)/0.5)*(2*R-w*0.16));
    dot(ctx,px,cy-8+(p<0.5?0:16),4,p<0.5?C.amber:C.green);
    lab(ctx,'maximize total future reward (return), not just the next step',14,h-12,C.mut);
  };

  /* 03 — EXPLORE vs EXPLOIT: try new things to find better, or cash in what works. */
  A.rl_explore=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The dilemma: exploit the reward you know, or explore for a bigger one',14,16,C.dim);
    // a reward landscape (1D) with a small local peak (known) and a taller far peak (unknown)
    const gx=w*0.08,gw=w*0.84,base=h*0.72;
    ctx.strokeStyle=hexA(C.mut,0.7);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const x=gx+i,fx=i/gw;const y=base-(Math.exp(-((fx-0.25)**2)/0.006)*40 + Math.exp(-((fx-0.75)**2)/0.01)*80);ctx.lineTo(x,y);}
    ctx.stroke();
    lab(ctx,'known small reward',gx+gw*0.12,base-52,C.amber,8.5);lab(ctx,'bigger reward, unexplored',gx+gw*0.58,base-96,C.green,8.5);
    // agent oscillates near local peak then jumps to explore
    const p=saw(t,5);let fx;if(p<0.6){fx=0.25+Math.sin(t*3)*0.03;}else{fx=0.25+(p-0.6)/0.4*0.5;}
    const ax=gx+fx*gw,ay=base-(Math.exp(-((fx-0.25)**2)/0.006)*40 + Math.exp(-((fx-0.75)**2)/0.01)*80);
    dot(ctx,ax,ay,6,p<0.6?C.amber:C.green);
    lab(ctx,'explore too little → stuck on the small peak; too much → never cash in',14,h-12,C.mut);
  };

  /* 04 — IMITATION: copy a few demos to skip the slow search. */
  A.rl_imitation=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Imitation: skip the search — copy a handful of expert demonstrations',14,16,C.dim);
    // expert trajectory (green) demonstrated; policy copies it
    const y0=h*0.5;const p=saw(t,4);
    lab(ctx,'expert demo',w*0.06,h*0.3,C.green,9.5);
    ctx.strokeStyle=hexA(C.green,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=w*0.8;i++){const x=w*0.1+i;ctx.lineTo(x,y0-30+Math.sin(i*0.02)*22);}ctx.stroke();
    // learner dot follows, then drifts where no demo exists (distribution shift)
    const lx=w*0.1+p*w*0.8;const drift=p>0.7?(p-0.7)/0.3*30:0;
    const ly=y0-30+Math.sin((lx-w*0.1)*0.02)*22 + drift;
    dot(ctx,lx,ly,6,C.amber);
    if(p>0.7){lab(ctx,'off the demos → it drifts (distribution shift)',w*0.4,y0+40,C.coral,9);}
    lab(ctx,'cheap and fast, but a copy fails where no demo went — the fix is asking the expert there (DAgger)',14,h-12,C.mut);
  };

  /* 05 — SIM: millions of tries in a parallel dream, then transfer to reality. */
  A.rl_sim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'RL needs millions of tries — so run them in fast, parallel simulation',14,16,C.dim);
    // grid of many sim robots learning in parallel
    const gx=w*0.06,gy=h*0.28,cols=8,rows=3,cw=(w*0.5)/cols,ch=(h*0.42)/rows;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const ph=saw(t*1.5 + (i*7+j*13)*0.05,1);
      rrect(ctx,gx+i*cw,gy+j*ch,cw-3,ch-3,3,hexA(C.cyan,0.5),null);
      dot(ctx,gx+i*cw+cw*0.2+ph*(cw-8),gy+j*ch+ch*0.5,2.2,C.cyan);}
    lab(ctx,'thousands of parallel sims',gx,gy-8,C.cyan,9);
    // transfer arrow to one real robot
    arrow(ctx,gx+w*0.5+4,h*0.5,w*0.72,h*0.5,C.green,1.6);lab(ctx,'transfer',w*0.60,h*0.44,C.green,9);
    box(ctx,w*0.76,h*0.42,w*0.16,30,'real robot',C.green,hexA(C.green,0.08));
    lab(ctx,'randomize the sim so reality is just one more variant it already handled',14,h-12,C.mut);
  };

  /* rlf_deep_ctrl — state vector → neural net → joint torques, animated pass */
  A.rlf_deep_ctrl=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'State vector → policy network → 12 joint torques, 100 Hz',14,16,C.dim);
    // state box left
    const sx=w*0.04,sy=h*0.22,sw=w*0.18,sh=h*0.52;
    rrect(ctx,sx,sy,sw,sh,6,C.violet,hexA(C.violet,0.07));
    lab(ctx,'state s\n48-dim',sx+sw/2,sy+14,C.violet,9,'center');
    ['joint ×12','vel ×12','IMU×6','contact×6','target×2'].forEach(function(s,i){lab(ctx,s,sx+8,sy+34+i*17,C.mut,8.5);});
    // neural net (3 layers of circles)
    const nx=w*0.32,ny=h*0.22,nw=w*0.36,nh=h*0.52;
    const layers=[[3,h*0.3],[4,h*0.5],[3,h*0.7]];const cr=5;
    const nodePos=[];
    layers.forEach(function(lr,li){const n=lr[0],y=lr[1],xs=nx+nw*(li+1)/4;
      const col=li===1?C.cyan:C.violet;const ps=[];
      for(let j=0;j<n;j++){const ny2=y-((n-1)*16)/2+j*16;ps.push([xs,ny2]);dot(ctx,xs,ny2,cr,hexA(col,0.6));}
      nodePos.push(ps);});
    // edges
    for(let li=0;li<nodePos.length-1;li++){nodePos[li].forEach(function(p){nodePos[li+1].forEach(function(q){
      ctx.strokeStyle=hexA(C.line,0.5);ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();});});}
    // animated dot passing through network
    const p=saw(t,3);const layerIdx=Math.min(2,Math.floor(p*3));const lp=(p*3)%1;
    if(layerIdx<2){const fromN=nodePos[layerIdx],toN=nodePos[layerIdx+1];
      const fi=Math.floor(fromN.length/2),ti=Math.floor(toN.length/2);
      dot(ctx,fromN[fi][0]+(toN[ti][0]-fromN[fi][0])*lp,fromN[fi][1]+(toN[ti][1]-fromN[fi][1])*lp,4,C.amber);}
    // torques right
    const tx=w*0.74,ty=h*0.22,tw=w*0.2,th=h*0.52;
    rrect(ctx,tx,ty,tw,th,6,C.cyan,hexA(C.cyan,0.07));
    lab(ctx,'torques\n12 joints',tx+tw/2,ty+14,C.cyan,9,'center');
    for(let i=0;i<6;i++){const barw=(0.3+Math.sin(t*1.3+i)*0.2)*tw*0.6;
      rrect(ctx,tx+8,ty+34+i*14,barw,8,2,null,hexA(C.cyan,0.4));}
    arrow(ctx,sx+sw,h*0.48,nx,h*0.48,C.violet,1.4);
    arrow(ctx,nx+nw,h*0.48,tx,h*0.48,C.cyan,1.4);
    lab(ctx,'4,096 parallel sims; 24 M steps each; reward = +velocity −torque² −stumble',14,h-12,C.mut);};

  /* rlf_sim2real — sim grid + domain randomization bars → real robot */
  A.rlf_sim2real=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Sim: randomize physics params; reality becomes just one more sample',14,16,C.dim);
    // sim grid of robots
    const gx=w*0.04,gy=h*0.22,cols=6,rows=3,cw=w*0.28/cols,ch=h*0.42/rows;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const ph=saw(t*1.2+(i*7+j*13)*0.08,1);
      rrect(ctx,gx+i*cw,gy+j*ch,cw-2,ch-2,3,hexA(C.cyan,0.35),null);
      dot(ctx,gx+i*cw+4+ph*(cw-10),gy+j*ch+ch*0.5,2,C.cyan);}
    lab(ctx,'sim (2,048 envs)',gx,gy-8,C.cyan,9);
    // domain randomization params as range bars
    const bx=w*0.4,by=h*0.22,bw=w*0.26;
    lab(ctx,'domain randomization',bx,by-8,C.amber,9);
    const params=[['friction','0.3','1.6'],['damping','0.8×','1.2×'],['latency','0ms','20ms']];
    params.forEach(function(p,i){
      const y=by+14+i*28;lab(ctx,p[0],bx,y+8,C.mut,8.5);
      rrect(ctx,bx+52,y,bw-52,12,3,hexA(C.amber,0.3),null);
      // sampled value oscillating
      const v=0.2+0.6*(0.5+0.5*Math.sin(t*0.8+i*1.7));
      dot(ctx,bx+52+v*(bw-52),y+6,4,C.amber);
      lab(ctx,p[1],bx+52,y+20,C.mut,7.5);lab(ctx,p[2],bx+52+bw-52-20,y+20,C.mut,7.5);});
    // arrow to real robot
    arrow(ctx,w*0.68,h*0.48,w*0.78,h*0.48,C.green,1.6);lab(ctx,'transfer',w*0.70,h*0.42,C.green,8.5);
    box(ctx,w*0.79,h*0.38,w*0.16,h*0.22,'real\nrobot',C.green,hexA(C.green,0.08));
    // success rate bar
    const sr=0.23+(0.87-0.23)*Math.min(1,t/6);
    rrect(ctx,w*0.79,h*0.65,w*0.16*sr,10,3,null,hexA(C.green,0.6));
    lab(ctx,Math.round(sr*100)+'% success',w*0.79,h*0.78,C.green,9);
    lab(ctx,'zero-shot: 23% (no DR) → 87% after randomizing; reality is already inside the trained range',14,h-12,C.mut);};

  /* rlf_reward — sparse vs shaped reward landscape; agent climbs shaped faster */
  A.rlf_reward=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Sparse reward: zero gradient almost everywhere. Shaped: always a slope to climb',14,16,C.dim);
    const base=h*0.72,gw=w*0.38,gx1=w*0.04,gx2=w*0.52;
    // sparse landscape (left)
    lab(ctx,'sparse',gx1,h*0.25,C.coral,9);
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1.5;ctx.beginPath();
    for(let i=0;i<=gw;i++){const fx=i/gw;const y=base-(fx>0.88&&fx<0.96?75:0);ctx.lineTo(gx1+i,y);}ctx.stroke();
    // sparse agent stuck at random
    const sp=saw(t,6);const sax=gx1+sp*gw*0.8;
    dot(ctx,sax,base,5,C.coral);
    // shaped landscape (right)
    lab(ctx,'shaped',gx2,h*0.25,C.green,9);
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1.5;ctx.beginPath();
    for(let i=0;i<=gw;i++){const fx=i/gw;const y=base-(fx*55+Math.exp(-((fx-0.92)**2)/0.005)*30);ctx.lineTo(gx2+i,y);}ctx.stroke();
    // shaped agent climbing
    const hp=saw(t,4);const hfx=hp*0.95;
    const hay=base-(hfx*55+Math.exp(-((hfx-0.92)**2)/0.005)*30);
    dot(ctx,gx2+hfx*gw,hay,5,C.green);
    if(hp>0.5){lab(ctx,'goal!',gx2+gw*0.82,base-88,C.green,9);}
    lab(ctx,'step '+Math.round(hp*12000)+' / 80,000',gx2,h*0.85,C.green,8.5);
    lab(ctx,'shaping adds sub-goals (distance, height) so learning gets started long before first grasp',14,h-12,C.mut);};

  /* rlf_offline — dataset cloud + conservative Q suppressing OOD actions */
  A.rlf_offline=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Offline RL: learn from a fixed dataset; conservative Q suppresses unseen actions',14,16,C.dim);
    // dataset cloud — scatter of trajectory dots
    const cx=w*0.28,cy=h*0.5,r=h*0.3;
    const rng=function(seed){return(Math.sin(seed*127.1+0.5)*43758.5453)%1;};
    for(let i=0;i<60;i++){const angle=rng(i)*TAU,dist=rng(i+100)*r;
      const dx=cx+Math.cos(angle)*dist,dy=cy+Math.sin(angle)*dist;
      const quality=rng(i+200);
      dot(ctx,dx,dy,2.5,quality>0.8?C.green:hexA(C.mut,0.5));}
    lab(ctx,'dataset D\n50k trajs',cx,cy-r-12,C.mut,8.5,'center');
    rrect(ctx,cx-r*0.95,cy-r*0.95,r*1.9,r*1.9,r,hexA(C.mut,0.15),null);
    // learned policy path through dataset
    const pp=saw(t,5);const steps=12;
    ctx.strokeStyle=hexA(C.cyan,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=Math.round(pp*steps);i++){const angle=i*0.5,dist=r*0.4+Math.sin(i*0.9)*r*0.15;
      const x=cx+Math.cos(angle)*dist,y=cy+Math.sin(angle)*dist;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    // Q-value bar chart right — in-dataset high, OOD suppressed
    const bx=w*0.58,by=h*0.22,bw=w*0.36,bh=h*0.55;
    lab(ctx,'Q-value estimates',bx,by-8,C.mut,8.5);
    const bars=[['a_1 (in data)',0.82,C.green],['a_2 (in data)',0.65,C.green],['a_3 (OOD)',0.18,C.coral],['a_4 (OOD)',0.09,C.coral]];
    bars.forEach(function(b,i){const bh2=b[1]*bh*0.7;
      rrect(ctx,bx+i*(bw/4)+3,by+bh*0.7-bh2,bw/4-6,bh2,3,null,hexA(b[2],0.5));
      lab(ctx,b[0],bx+i*(bw/4)+bw/8,by+bh*0.76,C.mut,7.5,'center');});
    lab(ctx,'CQL penalty α=5.0 clamps OOD Q; policy stays within dataset; val loss 0.032 → 74% success',14,h-12,C.mut);};

  /* rlf_bc — expert trajectory vs learner drift at distribution boundary */
  A.rlf_bc=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'BC copies the expert perfectly — until it reaches a state no demo visited',14,16,C.dim);
    const y0=h*0.5,pts=18,pw=w*0.82,ox=w*0.08;
    // expert path
    const exy=function(i){return y0-20+Math.sin(i*0.38)*28;};
    ctx.strokeStyle=hexA(C.green,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=pts;i++){i===0?ctx.moveTo(ox+i*(pw/pts),exy(i)):ctx.lineTo(ox+i*(pw/pts),exy(i));}ctx.stroke();
    lab(ctx,'expert',ox,h*0.26,C.green,9);
    // waypoints on expert path
    for(let i=0;i<=pts;i+=4){dot(ctx,ox+i*(pw/pts),exy(i),3,hexA(C.green,0.6));}
    // drift boundary
    const boundary=pts*0.62;const bx=ox+boundary*(pw/pts);
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.lineWidth=1;
    for(let yy=h*0.2;yy<h*0.8;yy+=7){ctx.beginPath();ctx.moveTo(bx,yy);ctx.lineTo(bx,Math.min(yy+4,h*0.8));ctx.stroke();}
    lab(ctx,'demo boundary',bx+3,h*0.22,C.coral,8);
    // learner — follows, then drifts after boundary
    const lp=saw(t,5);const li=lp*pts;
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=li;i++){const x=ox+i*(pw/pts);
      const drift=i>boundary?(i-boundary)*3.5:0;
      const y=exy(i)+drift;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    const ldx=ox+li*(pw/pts),ldy=exy(li)+(li>boundary?(li-boundary)*3.5:0);
    dot(ctx,ldx,ldy,5,C.amber);
    if(li>boundary){lab(ctx,'drift!',ldx+6,ldy,C.coral,9);}
    lab(ctx,'learner follows demos at 94%; 1 cm off the demonstrated angle → 31% — errors compound',14,h-12,C.mut);};

  /* rlf_dagger — iterative DAgger rounds: failure states queried, policy improves */
  A.rlf_dagger=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'DAgger: roll out policy, query expert at failures, retrain — repeat until stable',14,16,C.dim);
    const rounds=[{label:'Round 0',success:0.31,queries:0},{label:'Round 1',success:0.67,queries:42},
                  {label:'Round 2',success:0.82,queries:80},{label:'Round 3',success:0.92,queries:35}];
    const rp=saw(t,8);const currentRound=Math.min(3,Math.floor(rp*4));
    const bw=w*0.18,bh=h*0.55,by=h*0.25,gap=w*0.04;
    rounds.forEach(function(r,i){
      const bx=w*0.06+i*(bw+gap);
      const col=i<=currentRound?C.cyan:hexA(C.mut,0.3);
      rrect(ctx,bx,by,bw,bh,6,col,i<=currentRound?hexA(C.cyan,0.07):null);
      lab(ctx,r.label,bx+bw/2,by+12,col,8.5,'center');
      // success bar
      const sh=r.success*bh*0.6;
      rrect(ctx,bx+8,by+bh-sh-8,bw-16,sh,3,null,i<=currentRound?hexA(C.green,0.5):hexA(C.mut,0.2));
      lab(ctx,Math.round(r.success*100)+'%',bx+bw/2,by+bh-sh-18,col,8.5,'center');
      if(i>0){lab(ctx,'+'+r.queries+' labels',bx+bw/2,by+bh-8,i<=currentRound?C.amber:hexA(C.mut,0.3),7.5,'center');}
      // arrow between rounds
      if(i<3){arrow(ctx,bx+bw+2,by+bh*0.5,bx+bw+gap-2,by+bh*0.5,hexA(C.mut,0.5),1.2);}});
    lab(ctx,'157 expert labels total → 92% success; BC alone needed 300 demos for 85%',14,h-12,C.mut);};

  /* rlf_irl — expert trajectories → feature weights recovered → transfer to new road */
  A.rlf_irl=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Inverse RL: infer the reward that explains expert behavior; then transfer it',14,16,C.dim);
    // expert trajectories through intersection (left)
    const ix=w*0.12,iy=h*0.35,iw=w*0.3,ih=h*0.42;
    rrect(ctx,ix,iy,iw,ih,4,hexA(C.mut,0.3),null);
    lab(ctx,'expert demos\n2,000 trajs',ix,iy-10,C.green,8.5);
    // draw some crossing paths
    for(let k=0;k<4;k++){ctx.strokeStyle=hexA(C.green,0.4+k*0.1);ctx.lineWidth=1.2;ctx.beginPath();
      const y1=iy+ih*0.25+k*ih*0.12;const y2=iy+ih*0.5;
      for(let s=0;s<=16;s++){const fx=s/16;const y=y1+(y2-y1)*(3*fx*fx-2*fx*fx*fx);
        s===0?ctx.moveTo(ix+fx*iw,y):ctx.lineTo(ix+fx*iw,y);}ctx.stroke();}
    // animated learner path
    const lp=saw(t,5);ctx.strokeStyle=hexA(C.amber,0.8);ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=lp*50;i++){const fx=i/50;const y2=iy+ih*0.25+fx*(ih*0.25);ctx.lineTo(ix+fx*iw,y2);}ctx.stroke();
    // feature weight bars (center)
    const wx=w*0.48,wy=h*0.22,ww=w*0.22,wh=h*0.55;
    lab(ctx,'weight θ',wx,wy-10,C.violet,8.5);
    const feats=[['jerk',0.4,'coral'],['speed',0.3,'green'],['near-col',0.5,'coral'],['headway',0.2,'cyan']];
    feats.forEach(function(f,i){const progress=Math.min(1,t/4);
      const val=f[1]*progress;const col=C[f[2]];
      const barh=val*wh*0.35;const bx=wx+i*(ww/4)+2;
      rrect(ctx,bx,wy+wh-barh-4,ww/4-4,barh,2,null,hexA(col,0.6));
      lab(ctx,f[0],bx+(ww/4-4)/2,wy+wh+4,C.mut,7,'center');});
    // transfer arrow + new road (right)
    arrow(ctx,w*0.71,h*0.5,w*0.76,h*0.5,C.violet,1.4);lab(ctx,'transfer',w*0.71,h*0.44,C.violet,8);
    const rx=w*0.77,ry=h*0.3,rw=w*0.19,rh=h*0.4;
    rrect(ctx,rx,ry,rw,rh,4,hexA(C.violet,0.3),null);
    lab(ctx,'roundabout\n(never seen)',rx,ry-10,C.violet,8.5);
    lab(ctx,'91% comfort',rx,ry+rh+8,C.green,8.5);
    lab(ctx,'recovered θ = [−0.4 jerk, +0.3 speed, −0.5 near-collision]; R²=0.77; 91% on new road',14,h-12,C.mut);};

  /* rlf_video — video frames + optical flow → latent action → robot arm */
  A.rlf_video=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Video → optical-flow proxy actions → latent policy → robot fine-tuned on 20 demos',14,16,C.dim);
    // video frames stack (left)
    const fx=w*0.04,fy=h*0.22,fw=w*0.22,fh=h*0.18;
    for(let i=0;i<3;i++){rrect(ctx,fx+i*4,fy+i*6,fw,fh,4,hexA(C.mut,0.4),hexA(C.line,0.15));
      lab(ctx,'frame '+(i+1),fx+fw/2+i*4,fy+fh/2+i*6,C.mut,8,'center');}
    lab(ctx,'5,000 YouTube\nkitchen clips',fx,fy-10,C.mut,8.5);
    // optical flow arrows on top frame, animated
    const fp=saw(t,3);
    for(let i=0;i<6;i++){for(let j=0;j<3;j++){
      const ax=fx+8+i*fw/6,ay=fy+8+j*fh/3;
      const mag=8+Math.sin(t*2+i+j)*4;const ang=0.5+Math.sin(t*1.5+i*0.7+j)*0.4;
      arrow(ctx,ax,ay,ax+Math.cos(ang)*mag*fp,ay+Math.sin(ang)*mag*fp,hexA(C.amber,0.7),1);}}
    // arrow to latent action extraction
    arrow(ctx,fx+fw+4,h*0.38,w*0.36,h*0.38,C.amber,1.4);
    // latent action box
    box(ctx,w*0.37,h*0.3,w*0.22,h*0.22,'latent\naction\nextract',C.cyan,hexA(C.cyan,0.08));
    lab(ctx,'flow → 2D\nwrist vector',w*0.37,h*0.56,C.mut,8);
    // Transformer pre-training
    const tx=w*0.37,ty=h*0.65,tw=w*0.22,th=h*0.14;
    rrect(ctx,tx,ty,tw,th,4,hexA(C.violet,0.4),null);
    lab(ctx,'Transformer\n200 epochs pre-train',tx+tw/2,ty+th/2,C.violet,8.5,'center');
    // arrow to robot
    arrow(ctx,w*0.6,h*0.38,w*0.68,h*0.38,C.green,1.4);
    box(ctx,w*0.69,h*0.28,w*0.26,h*0.35,'robot arm\n20 demos\n+RLHF\n68% success',C.green,hexA(C.green,0.08));
    lab(ctx,'video pre-training worth ~300 extra robot demos; action labels not needed in the video',14,h-12,C.mut);};

  /* rlf_explore2 — 2D grid, curiosity-driven exploration frontier expanding */
  A.rlf_explore2=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Curiosity: intrinsic reward for predicting-error — drives exploration to unseen states',14,16,C.dim);
    const gx=w*0.08,gy=h*0.22,gw=w*0.5,gh=h*0.58,cols=14,rows=10;
    const cw=gw/cols,ch=gh/rows;
    const center=[Math.floor(cols/2),Math.floor(rows*0.8)];
    const maxDist=Math.sqrt(center[0]*center[0]+center[1]*center[1]);
    const radius=Math.min(t*1.4,maxDist*0.95);
    for(let i=0;i<cols;i++){for(let j=0;j<rows;j++){
      const dx=i-center[0],dy=j-center[1];const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<=radius){const heat=1-dist/maxDist;
        ctx.fillStyle=hexA(dist<radius*0.4?C.cyan:C.violet,heat*0.5);
        ctx.fillRect(gx+i*cw+1,gy+j*ch+1,cw-2,ch-2);}
      else{ctx.fillStyle=hexA(C.line,0.3);ctx.fillRect(gx+i*cw+1,gy+j*ch+1,cw-2,ch-2);}}}
    // needle goal in corner
    const gox=gx+gw-cw*1.5,goy=gy+ch*0.5;
    dot(ctx,gox,goy,5,C.amber);lab(ctx,'needle\ngoal',gox+8,goy,C.amber,8);
    // agent dot at frontier
    const angle=t*0.8,ar=radius*Math.min(cw,ch)*0.7;
    const adx=center[0]+Math.cos(angle)*radius*0.7,ady=center[1]+Math.sin(angle)*radius*0.5;
    dot(ctx,gx+Math.min(cols-1,Math.max(0,adx))*cw+cw/2,gy+Math.min(rows-1,Math.max(0,ady))*ch+ch/2,4,C.green);
    // RND intrinsic reward bar (right)
    const rx=w*0.63,ry=h*0.22,rw=w*0.3,rh=h*0.55;
    lab(ctx,'RND intrinsic\nreward r_i',rx,ry-10,C.violet,8.5);
    const curiosity=Math.max(0,1-t/8);
    rrect(ctx,rx,ry+rh*(1-curiosity),rw*0.4,rh*curiosity,3,null,hexA(C.violet,0.5));
    lab(ctx,'curiosity\nfading as\nexplored',rx+rw*0.42,ry+rh*0.4,C.mut,8);
    lab(ctx,'first contact at 180 k steps (vs 2.3 M without curiosity); 94% threading at 4 M steps',14,h-12,C.mut);};

  /* rlf_mbrl — real robot + world model + imagined rollout tree */
  A.rlf_mbrl=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'World model: plan inside imagination; pay real-world sample cost only for model training',14,16,C.dim);
    // real robot (left)
    box(ctx,w*0.04,h*0.38,w*0.16,h*0.24,'real\nrobot\n5k eps',C.green,hexA(C.green,0.08));
    arrow(ctx,w*0.21,h*0.5,w*0.33,h*0.5,C.green,1.4);lab(ctx,'train',w*0.24,h*0.44,C.green,8);
    // world model brain (center)
    const mx=w*0.34,my=h*0.32,mw=w*0.2,mh=h*0.36;
    rrect(ctx,mx,my,mw,mh,8,C.violet,hexA(C.violet,0.1));
    lab(ctx,'world\nmodel\nRSSM',mx+mw/2,my+mh/2,C.violet,9.5,'center');
    arrow(ctx,mx+mw,h*0.5,w*0.6,h*0.5,C.violet,1.4);lab(ctx,'imagine',w*0.59,h*0.44,C.violet,8);
    // imagined rollout tree (right)
    const rootx=w*0.62,rooty=h*0.5;
    dot(ctx,rootx,rooty,5,C.amber);
    const branches=[[1,0.18],[1,-0.18],[0.8,0.32],[0.8,-0.05],[0.8,-0.32]];
    const tp=Math.min(1,t/3);
    branches.forEach(function(b,i){
      if(i/branches.length>tp)return;
      const endx=rootx+b[0]*w*0.22,endy=rooty+b[1]*h;
      ctx.strokeStyle=hexA(C.violet,0.5);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(rootx,rooty);ctx.lineTo(endx,endy);ctx.stroke();
      dot(ctx,endx,endy,3,i<2?C.green:C.cyan);
      if(i<2){lab(ctx,'h='+((i+1)*8),endx+4,endy,C.mut,7.5);}});
    // model error bar chart
    const ex=w*0.64,ey=h*0.72,ew=w*0.3,eh=h*0.12;
    lab(ctx,'pred error by horizon',ex,ey-8,C.mut,8);
    [4,8,12,16].forEach(function(horizon,i){const err=horizon*0.011;const bh=err*eh*5;
      const col=horizon<=12?C.cyan:C.coral;
      rrect(ctx,ex+i*ew/4+2,ey+eh-bh,ew/4-4,bh,2,null,hexA(col,0.6));
      lab(ctx,'h='+horizon,ex+i*ew/4+ew/8,ey+eh+4,C.mut,7,'center');});
    lab(ctx,'8,000 real steps (vs 800,000 model-free) for 82% block-stack success; clip horizon at 12',14,h-12,C.mut);};

  /* rlf_hier — high-level policy chooses subgoals; low-level executes; 200-step peg task */
  A.rlf_hier=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Hierarchy: high-level picks subgoals every 20 steps; low-level earns reward each step',14,16,C.dim);
    // high-level policy box (top)
    const hlx=w*0.3,hly=h*0.12,hlw=w*0.4,hlh=h*0.16;
    rrect(ctx,hlx,hly,hlw,hlh,6,C.violet,hexA(C.violet,0.1));
    lab(ctx,'high-level policy (PPO)',hlx+hlw/2,hly+hlh/2,C.violet,9.5,'center');
    // subgoal timeline
    const tlx=w*0.06,tly=h*0.42,tlw=w*0.88,tlh=h*0.1;
    rrect(ctx,tlx,tly,tlw,tlh,4,hexA(C.mut,0.2),null);
    const subgoals=['approach','align','insert'];
    for(let s=0;s<3;s++){const sx=tlx+tlw*(s/3);const sw=tlw/3-2;
      const col=C[s===0?'cyan':s===1?'amber':'green'];
      rrect(ctx,sx+1,tly+2,sw,tlh-4,3,hexA(col,0.5),null);
      lab(ctx,subgoals[s]+'\n(k=20 steps)',sx+sw/2,tly+tlh/2,col,8,'center');}
    // step markers
    for(let step=0;step<=200;step+=20){const sx=tlx+step*(tlw/200);
      ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,tly+tlh);ctx.lineTo(sx,tly+tlh+8);ctx.stroke();
      if(step%40===0)lab(ctx,''+step,sx,tly+tlh+16,C.mut,7,'center');}
    // animated token
    const tp=saw(t,4);const tokenStep=Math.floor(tp*200);const tokenX=tlx+tokenStep*(tlw/200);
    dot(ctx,tokenX,tly+tlh/2,5,C.amber);
    // low-level policy box (bottom)
    const llx=w*0.3,lly=h*0.7,llw=w*0.4,llh=h*0.16;
    rrect(ctx,llx,lly,llw,llh,6,C.cyan,hexA(C.cyan,0.1));
    lab(ctx,'low-level policy (SAC)',llx+llw/2,lly+llh/2,C.cyan,9.5,'center');
    arrow(ctx,hlx+hlw/2,hly+hlh,hlx+hlw/2,tly,C.violet,1.2);
    arrow(ctx,llx+llw/2,tly+tlh,llx+llw/2,lly,C.cyan,1.2);
    lab(ctx,'2 M steps total vs 8 M flat RL; low-level skills reused across 3 peg geometries',14,h-12,C.mut);};

  /* rlf_residual — base policy coarse + residual fine; target circle showing accuracy */
  A.rlf_residual=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Residual RL: imitation covers 3 mm; a small MLP correction closes the last 2.7 mm',14,16,C.dim);
    // target circles (left)
    const cx=w*0.28,cy=h*0.52;
    [50,32,18,8].forEach(function(r,i){ring(ctx,cx,cy,r,hexA(i===3?C.green:C.mut,0.4));});
    lab(ctx,'target\n±0.3 mm',cx,cy-55,C.mut,8,'center');
    // base policy arrow (large, misses)
    const baseErr=20+Math.sin(t*0.5)*5;
    arrow(ctx,cx-90,cy,cx-baseErr,cy-baseErr*0.4,C.amber,2.5);
    dot(ctx,cx-baseErr,cy-baseErr*0.4,5,C.amber);
    lab(ctx,'π_0\nbase BC\n±3 mm',cx-110,cy-10,C.amber,8,'center');
    // residual correction arrow
    const combined=saw(t,4);const resErr=baseErr*(1-combined*0.9);
    arrow(ctx,cx-baseErr,cy-baseErr*0.4,cx-resErr*0.3,cy-resErr*0.15,C.cyan,1.8);
    dot(ctx,cx-resErr*0.3,cy-resErr*0.15,4,C.cyan);
    lab(ctx,'+δ(s)\nresidual',cx-baseErr-20,cy-baseErr*0.4-20,C.cyan,8,'center');
    // result arrow
    if(combined>0.5){dot(ctx,cx-resErr*0.3,cy-resErr*0.15,6,C.green);
      lab(ctx,'±0.3 mm\n94%',cx-resErr*0.3+8,cy-resErr*0.15-12,C.green,8);}
    // comparison table (right)
    const tx=w*0.52,ty=h*0.28,tw=w*0.44,th=h*0.44;
    rrect(ctx,tx,ty,tw,th,6,hexA(C.mut,0.2),null);
    lab(ctx,'success rate',tx+tw/2,ty+10,C.mut,8.5,'center');
    [['base BC',0.31,C.amber,0],['flat RL',0.87,C.violet,1],['residual',0.94,C.green,2]].forEach(function(r,i){
      const bh=r[1]*th*0.55,by=ty+th-bh-4,bx=tx+8+i*(tw/3);
      rrect(ctx,bx,by,tw/3-8,bh,3,null,hexA(r[2],0.5));
      lab(ctx,Math.round(r[1]*100)+'%',bx+(tw/3-8)/2,by-10,r[2],8.5,'center');
      lab(ctx,r[0],bx+(tw/3-8)/2,ty+th+4,C.mut,7.5,'center');});
    lab(ctx,'80,000 real robot steps (vs 2 M for RL from scratch); π_0 handles approach, δ handles insertion',14,h-12,C.mut);};

  /* rlf_vla — VLM backbone + GRPO group sampling + reward scores */
  A.rlf_vla=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'VLA fine-tuning: sample a group of 8 actions, score with reward model, update toward winners',14,16,C.dim);
    // input (left)
    const ix=w*0.03,iy=h*0.25,iw=w*0.18,ih=h*0.45;
    rrect(ctx,ix,iy,iw,ih,6,hexA(C.mut,0.3),null);
    lab(ctx,'image\n+text\n"apple in\nblue bowl"',ix+iw/2,iy+ih/2,C.ink,8.5,'center');
    arrow(ctx,ix+iw,h*0.5,w*0.26,h*0.5,C.mut,1.2);
    // VLM backbone (center)
    const vx=w*0.27,vy=h*0.25,vw=w*0.22,vh=h*0.45;
    rrect(ctx,vx,vy,vw,vh,6,C.violet,hexA(C.violet,0.1));
    lab(ctx,'VLM\nPaLI-X\n55B\nparams',vx+vw/2,vy+vh/2,C.violet,9,'center');
    // GRPO group (right column)
    const gx=w*0.56,gy=h*0.2,gscore_progress=Math.min(1,t/5);
    lab(ctx,'GRPO group (G=8)',gx,gy-8,C.amber,8.5);
    const scores=[0.12,0.68,0.31,0.95,0.22,0.88,0.44,0.71];
    const improved=[0.28,0.74,0.41,0.98,0.35,0.91,0.56,0.79];
    scores.forEach(function(s,i){const y=gy+i*((h*0.62)/8);
      const score=s+(improved[i]-s)*gscore_progress;
      const bw2=score*w*0.32;const col=score>0.6?C.green:C.coral;
      rrect(ctx,gx,y+1,bw2,10,2,null,hexA(col,0.5));
      lab(ctx,(score*100).toFixed(0)+'%',gx+bw2+3,y+6,col,7.5);});
    arrow(ctx,vx+vw,h*0.5,gx-3,h*0.5,C.amber,1.4);lab(ctx,'sample\n8 actions',vx+vw+2,h*0.44,C.amber,7.5);
    // gradient arrow back
    arrow(ctx,gx-3,h*0.62,vx+vw,h*0.62,C.green,1.4);lab(ctx,'update toward\nhigh-reward',gx-60,h*0.68,C.green,7.5);
    lab(ctx,'43% → 68% success after 20 k GRPO steps; 3 hours on 8×A100; add brevity penalty for verbosity',14,h-12,C.mut);};

  /* rlf_rlhf — preference A/B → reward model → policy update with KL fence */
  A.rlf_rlhf=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Preference RL: human A/B labels train a reward model; GRPO optimizes toward it',14,16,C.dim);
    // two outputs (left)
    const ax=w*0.04,ay=h*0.22,aw=w*0.2,ah=h*0.2;
    rrect(ctx,ax,ay,aw,ah,6,hexA(C.coral,0.3),null);lab(ctx,'output A\n(not preferred)',ax+aw/2,ay+ah/2,C.coral,8,'center');
    const bx=w*0.04,by=h*0.52,bw=w*0.2,bh=h*0.2;
    rrect(ctx,bx,by,bw,bh,6,hexA(C.green,0.4),null);lab(ctx,'output B\n(preferred)',bx+bw/2,by+bh/2,C.green,8.5,'center');
    // human preference arrow
    arrow(ctx,ax+aw,ay+ah/2,w*0.34,h*0.4,hexA(C.coral,0.5),1.2);
    arrow(ctx,bx+bw,by+bh/2,w*0.34,h*0.55,C.green,1.6);lab(ctx,'human\nlabels\n800 pairs',ax+aw+2,h*0.46,C.mut,7.5);
    // reward model (center)
    box(ctx,w*0.35,h*0.38,w*0.2,h*0.24,'reward\nmodel\nBERT\nAUC 0.84',C.amber,hexA(C.amber,0.08));
    arrow(ctx,w*0.56,h*0.5,w*0.66,h*0.5,C.amber,1.4);
    // policy bar chart (right) — shifting toward preferred
    const pp=saw(t,6);const shift=pp*0.32;
    const rx=w*0.67,ry=h*0.22,rw=w*0.28,rh=h*0.55;
    lab(ctx,'policy score',rx,ry-8,C.mut,8.5);
    [['SFT only',0.41,C.mut],['after GRPO',0.41+shift,C.green]].forEach(function(b,i){
      const bh2=b[1]*rh*0.8;rrect(ctx,rx+i*(rw/2)+4,ry+rh-bh2,rw/2-8,bh2,3,null,hexA(b[2],0.5));
      lab(ctx,Math.round(b[1]*100)+'%',rx+i*(rw/2)+rw/4,ry+rh-bh2-10,b[2],8.5,'center');
      lab(ctx,b[0],rx+i*(rw/2)+rw/4,ry+rh+5,C.mut,7,'center');});
    // KL fence
    const klx=w*0.67,kly=h*0.83;
    lab(ctx,'KL β=0.04 keeps outputs near SFT baseline (factuality F1 = 0.89 unchanged)',klx-w*0.63,kly,C.mut,8.5);
    lab(ctx,'41% → 73% preferred by radiologists; 800 labels; same factuality; ~5,000 supervised labels to match',14,h-12,C.mut);};

  /* rlf_safe — robot + CBF boundary + 3 curriculum terrain stages */
  A.rlf_safe=function(ctx,w,h,t){clear(ctx,w,h);ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Safe RL: CBF projects unsafe actions; curriculum grows terrain difficulty; zero hardware falls',14,16,C.dim);
    // 3 curriculum stages
    const stages=[{label:'Stage 1\nflat\n0.5 m/s',col:C.green},{label:'Stage 2\n3 cm steps\n1.0 m/s',col:C.amber},{label:'Stage 3\n8 cm steps\n2.0 m/s',col:C.cyan}];
    const sp=saw(t,9);const activeStage=Math.min(2,Math.floor(sp*3));
    stages.forEach(function(s,i){const sx=w*0.04+i*(w*0.27),sy=h*0.22,sw=w*0.24,sh=h*0.38;
      rrect(ctx,sx,sy,sw,sh,6,i<=activeStage?s.col:hexA(C.mut,0.3),i<=activeStage?hexA(s.col,0.08):null);
      lab(ctx,s.label,sx+sw/2,sy+sh/2,i<=activeStage?s.col:hexA(C.mut,0.4),8.5,'center');
      // terrain bumps
      if(i>0){for(let b=0;b<3;b++){const bx=sx+10+b*(sw/3.2);const bh2=i*6+3;
        ctx.fillStyle=hexA(s.col,i<=activeStage?0.5:0.2);ctx.fillRect(bx,sy+sh-bh2-4,sw/4,bh2);}}});
    // CBF boundary arc
    const cbfx=w*0.5,cbfy=h*0.65,cbfr=h*0.14;
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.lineWidth=2;
    {const a0=Math.PI*1.1,a1=Math.PI*1.9,acy=cbfy-cbfr*0.3;
     for(let a=a0;a<a1;a+=0.22){const ae=Math.min(a+0.13,a1);
       ctx.beginPath();ctx.arc(cbfx,acy,cbfr,a,ae);ctx.stroke();}}
    lab(ctx,'CBF\nh(s)≥0',cbfx-cbfr,cbfy-cbfr*0.3+cbfr*0.2,C.coral,8,'center');
    // robot dot on terrain
    const angle=t*0.5;const rx=cbfx+Math.cos(angle)*cbfr*0.5,ry=cbfy-cbfr*0.3+Math.sin(angle)*cbfr*0.3;
    dot(ctx,rx,ry,5,C.green);
    // unsafe action projection
    const ux=rx+20,uy=ry-30;dot(ctx,ux,uy,3,hexA(C.coral,0.7));
    arrow(ctx,ux,uy,rx+8,ry-10,C.coral,1.2);lab(ctx,'QP\nproject',ux+4,uy-14,C.coral,7.5);
    // safety stats
    lab(ctx,'0 falls during 2 M safe-RL steps; unconstrained RL: 47 falls for same speed target',14,h-12,C.mut);};

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.rlanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-rlanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
