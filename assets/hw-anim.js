/* hw-anim.js — first-principles mechanism animators for the Hardware & Actuation explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-hwanim="name". Self-contained boot. */
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

  /* 01 — WHY: the smartest policy does nothing without a body to run it. */
  A.hw_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The smartest policy moves nothing without a body — actuators, structure, power',14,16,C.dim);
    // a "brain" box connected down to a physical limb that actually moves
    box(ctx,w*0.4,h*0.24,w*0.2,26,'policy / brain',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.5,h*0.24+26,w*0.5,h*0.4,C.mut,1.4);lab(ctx,'command',w*0.52,h*0.35,C.mut,8.5);
    // limb: shoulder joint + link + hand, actuated
    const p=saw(t,3);const ang=Math.sin(p*TAU)*0.5;
    const jx=w*0.5,jy=h*0.44;dot(ctx,jx,jy,6,C.amber);
    const ex=jx+Math.cos(ang+0.4)*80,ey=jy+Math.sin(ang+0.4)*80;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(jx,jy);ctx.lineTo(ex,ey);ctx.stroke();
    dot(ctx,ex,ey,7,C.green);
    lab(ctx,'motor + link + hand: where bits become force',w*0.14,h*0.86,C.mut,9);
    // labels of the three needs
    ['actuators (make force)','structure (carry load)','power (feed it)'].forEach((s,i)=>lab(ctx,'• '+s,w*0.66,h*0.5+i*16,C.mut,9));
    lab(ctx,'hardware is the substrate — and its design decides what any controller can even attempt',14,h-12,C.mut);
  };

  /* 02 — ACTUATOR: ways to turn energy into motion, each with a trade. */
  A.hw_actuator=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'How a robot makes force: motors, tendons, fluids, artificial muscle',14,16,C.dim);
    const p=saw(t,3);const stroke=Math.sin(p*TAU)*0.5+0.5;
    // electric motor (rotary)
    const mx=w*0.16,my=h*0.42;ring(ctx,mx,my,20,C.cyan);ctx.save();ctx.translate(mx,my);ctx.rotate(p*TAU);ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(16,0);ctx.stroke();ctx.restore();
    lab(ctx,'electric motor\nfast, precise, heavy',mx-30,my+40,C.mut,8.5);
    // tendon-driven
    const tx=w*0.42;ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx-24,my);ctx.lineTo(tx+10-stroke*10,my);ctx.stroke();dot(ctx,tx+10-stroke*10,my,5,C.amber);
    lab(ctx,'tendon / cable\nremote, light, hysteresis',tx-30,my+40,C.mut,8.5);
    // fluidic / muscle (contracts)
    const fx=w*0.68;const len=30-stroke*12;rrect(ctx,fx-8,my-len/2,16,len,6,C.violet,hexA(C.violet,0.2));
    lab(ctx,'artificial muscle\nsoft, compliant, slow',fx-30,my+40,C.mut,8.5);
    // scale of trade: torque density vs compliance
    lab(ctx,'each converts energy → motion with a different balance of force, speed, weight, and give',14,h-12,C.mut);
  };

  /* 03 — SOFT: no rigid links — the material itself bends and is safe. */
  A.hw_soft=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Soft robots have no rigid links — the body deforms to do the work',14,16,C.dim);
    // a soft finger curling under pressure vs a rigid jointed one
    const p=saw(t,3);const curl=Math.sin(p*TAU)*0.5+0.5;
    // rigid (left): discrete segments
    const rx=w*0.24,ry=h*0.34;let x=rx,y=ry,ang=0.2;
    ctx.strokeStyle=hexA(C.mut,0.8);ctx.lineWidth=5;
    for(let i=0;i<3;i++){const nx=x+Math.cos(ang)*28,ny=y+Math.sin(ang)*28;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,x,y,4,C.amber);x=nx;y=ny;ang+=0.4;}
    lab(ctx,'rigid: joints + links',rx-20,ry-14,C.mut,9);
    // soft (right): smooth curve that curls with pressure
    const sx=w*0.62,sy=h*0.34;ctx.strokeStyle=C.violet;ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);
    for(let i=1;i<=20;i++){const a=curl*i*0.09;ctx.lineTo(sx+Math.cos(a)*i*4.5,sy+Math.sin(a)*i*4.5);}ctx.stroke();ctx.lineCap='butt';
    lab(ctx,'soft: continuous bend',sx-16,sy-14,C.violet,9);
    lab(ctx,'compliance is built into the material — safe on contact, but nonlinear and hard to model precisely',14,h-12,C.mut);
  };

  /* 04 — MORPH: the body's shape does part of the computation. */
  A.hw_morph=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The shape of the body does part of the work — morphology is computation',14,16,C.dim);
    // a passive springy leg bouncing (elastic storage) vs stiff leg
    const gy=h*0.72;ctx.strokeStyle=hexA(C.mut,0.6);ctx.beginPath();ctx.moveTo(w*0.05,gy);ctx.lineTo(w*0.95,gy);ctx.stroke();
    const p=saw(t,2);const bounce=Math.abs(Math.sin(p*Math.PI));const hipY=gy-40-bounce*40;
    // spring leg
    const hx=w*0.36;dot(ctx,hx,hipY,8,C.amber);
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();const segs=8;for(let i=0;i<=segs;i++){const yy=hipY+(gy-hipY)*i/segs;const xx=hx+((i%2)?6:-6)*(1-bounce*0.5);ctx.lineTo(xx,yy);}ctx.stroke();
    lab(ctx,'elastic leg: stores &\nreturns energy for free',hx-30,hipY-20,C.green,8.5);
    // series-elastic idea: spring between motor and load
    const mx=w*0.72,my=h*0.42;box(ctx,mx-26,my-12,34,24,'motor',C.cyan);
    // spring
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=16;i++){ctx.lineTo(mx+12+i*4,my+((i%2)?6:-6));}ctx.stroke();
    dot(ctx,mx+12+16*4,my,6,C.amber);lab(ctx,'spring in the joint = soft, safe force',mx-30,my+34,C.mut,8.5);
    lab(ctx,'good mechanics make behaviors cheap — a springy body bounces with almost no control effort',14,h-12,C.mut);
  };

  /* 05 — SENSE: a body needs to feel itself — proprioception + skin + limits. */
  A.hw_sense=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A body must feel itself: joint angles, contact, and its own limits',14,16,C.dim);
    // an arm with encoder at joint, skin patch, and a limit indicator
    const jx=w*0.28,jy=h*0.5;const p=saw(t,4);const ang=Math.sin(p*TAU)*0.6;
    dot(ctx,jx,jy,7,C.amber);ring(ctx,jx,jy,14,hexA(C.cyan,0.6));lab(ctx,'encoder\n(joint angle)',jx-24,jy+30,C.cyan,8.5);
    const ex=jx+Math.cos(ang)*100,ey=jy+Math.sin(ang)*100;
    ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(jx,jy);ctx.lineTo(ex,ey);ctx.stroke();
    // skin patch on the link
    for(let i=0;i<4;i++){const fx=jx+Math.cos(ang)*(40+i*12),fy=jy+Math.sin(ang)*(40+i*12);dot(ctx,fx,fy,3,hexA(C.green,0.7));}
    lab(ctx,'skin (contact)',w*0.5,h*0.3,C.green,8.5);
    // limit arc
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.lineWidth=2;ctx.beginPath();ctx.arc(jx,jy,110,-0.6,0.6);ctx.stroke();lab(ctx,'joint limit',jx+118,jy,C.coral,8.5);
    lab(ctx,'sensing built into the body closes the loop — and the best designs co-tune body, sensor, and controller',14,h-12,C.mut);
  };

  /* hwf_electric — DC motor: rotor spins, gearbox steps down speed, encoder counts teeth */
  A.hwf_electric=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'DC motor: rotor spins fast & weak → gearbox multiplies torque, encoder closes the loop',14,16,C.dim);
    const p=saw(t,2);const motorAng=p*TAU*6;
    const gearAng=p*TAU*6/50;
    const mx=w*0.22,my=h*0.5;ring(ctx,mx,my,28,C.cyan);
    ctx.save();ctx.translate(mx,my);ctx.rotate(motorAng);ctx.strokeStyle=C.cyan;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(20,0);ctx.stroke();ctx.restore();
    dot(ctx,mx,my,4,C.amber);
    lab(ctx,'motor\n1000 rpm',mx-18,my+38,C.mut,8.5);
    rrect(ctx,w*0.34,my-18,w*0.16,36,6,C.amber,hexA(C.amber,0.06));
    lab(ctx,'50:1\ngearbox',w*0.34+w*0.04,my-2,C.amber,8.5,'center');
    arrow(ctx,w*0.31,my,w*0.34,my,C.mut,1.4);
    const ox=w*0.54,oy=my;ctx.save();ctx.translate(ox,oy);ctx.rotate(gearAng);ctx.strokeStyle=C.green;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(22,0);ctx.stroke();ctx.restore();
    dot(ctx,ox,oy,5,C.green);
    lab(ctx,'output\n20 rpm\n2.5 N·m',ox+8,oy+12,C.green,8.5);
    const fx=w*0.74,fy=h*0.32;
    lab(ctx,'friction curve',fx,fy-8,C.dim,8.5);
    ctx.strokeStyle=hexA(C.coral,0.7);ctx.lineWidth=1.5;ctx.beginPath();
    for(let i=0;i<=30;i++){const v=i/30*3;const f2=0.3*Math.exp(-v*2)+0.004*v+0.04;ctx.lineTo(fx+i*3.5,fy+8+f2*60);}ctx.stroke();
    lab(ctx,'Stribeck: static→viscous; sim must model this or position error = 8°',14,h-12,C.mut);
  };

  /* hwf_pneumatic — silicone chamber inflates, tip curls, force shown against pressure */
  A.hwf_pneumatic=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pneumatic chamber: pressure inflates silicone → tip curls, force is nonlinear not spring-like',14,16,C.dim);
    const p=saw(t,3);const pres=Math.sin(p*TAU)*0.5+0.5;
    const bx=w*0.22,by=h*0.55;dot(ctx,bx,by,5,C.amber);
    ctx.strokeStyle=C.violet;ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bx,by);
    for(let i=1;i<=18;i++){const a=pres*i*0.07;ctx.lineTo(bx+Math.cos(a)*i*4.8,by-Math.sin(a)*i*4.8);}ctx.stroke();ctx.lineCap='butt';
    lab(ctx,'silicone finger\n'+(Math.round(pres*20))+' kPa',(bx+Math.cos(pres*18*0.07)*18*4.8)+6,by-Math.sin(pres*18*0.07)*18*4.8,C.violet,8.5);
    const gx=w*0.55,gy=h*0.3;
    lab(ctx,'pressure → force (nonlinear)',gx,gy-10,C.dim,8.5);
    ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+80);ctx.lineTo(gx+100,gy+80);ctx.stroke();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=20;i++){const kpa=i;const f2=0.82*(1-Math.exp(-kpa/8));ctx.lineTo(gx+i*5,gy+80-f2*80);}ctx.stroke();
    dot(ctx,gx+pres*100,gy+80-(0.82*(1-Math.exp(-pres*20/8)))*80,4,C.amber);
    lab(ctx,'contact patch spreads 14 mm on fruit; peak stress 4.2 kPa — below bruise threshold',14,h-12,C.mut);
  };

  /* hwf_sea — motor + spring in series; spring compresses at heel-strike, releases at push-off */
  A.hwf_sea=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Series-elastic: spring between motor and load absorbs impulse, measures force from deflection',14,16,C.dim);
    const p=saw(t,2.5);const bounce=Math.abs(Math.sin(p*Math.PI));
    const gy=h*0.74;ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*0.05,gy);ctx.lineTo(w*0.95,gy);ctx.stroke();
    const hx=w*0.42,hipY=gy-40-bounce*55;
    box(ctx,hx-20,hipY-22,40,22,'motor',C.cyan,hexA(C.cyan,0.07));
    const sp0=hipY,sp1=hipY+30+bounce*30;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=12;i++){const yy=sp0+(sp1-sp0)*i/12;const xx=hx+((i%2)?7:-7);ctx.lineTo(xx,yy);}ctx.stroke();
    lab(ctx,'k=800 N/m',hx+12,sp0+(sp1-sp0)*0.5,C.violet,8.5);
    ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hx,sp1);ctx.lineTo(hx,gy);ctx.stroke();
    dot(ctx,hx,gy,5,C.amber);
    const F=Math.round(800*bounce*0.055*100)/100;
    lab(ctx,'F='+(Math.round(F*10)/10)+' N\nfrom deflection',hx+14,sp1+4,C.green,8.5);
    lab(ctx,'spring absorbs 4 J impulse in 35 ms; motor sees smooth ramp, not a spike',14,h-12,C.mut);
  };

  /* hwf_gripper — tendon routing through differential; one motor closes proximal then distal */
  A.hwf_gripper=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Underactuated gripper: one tendon routes through a differential — fingers adapt passively',14,16,C.dim);
    const p=saw(t,3);const close=Math.sin(p*Math.PI)*0.85;
    const mx=w*0.16,my=h*0.5;ring(ctx,mx,my,16,C.cyan);lab(ctx,'1 motor',mx-14,my+24,C.mut,8.5);
    arrow(ctx,mx+16,my,w*0.32,my,C.cyan,1.4);
    rrect(ctx,w*0.32,my-14,w*0.12,28,6,C.amber,hexA(C.amber,0.06));lab(ctx,'diff',w*0.38,my,C.amber,9,'center');
    const cx=w*0.5,cy=h*0.5;
    const fanAngles=[-0.38,0,0.38];
    fanAngles.forEach(function(fa,fi){
      const basex=cx+Math.cos(fa)*30,basey=cy+Math.sin(fa)*30;
      const p1x=basex+Math.cos(fa)*38*close,p1y=basey+Math.sin(fa)*38*close+8*(1-close);
      ctx.strokeStyle=C.violet;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(basex,basey);ctx.lineTo(p1x,p1y);ctx.stroke();
      const fa2=fa+close*0.5;
      const p2x=p1x+Math.cos(fa2)*26*close,p2y=p1y+Math.sin(fa2)*26*close;
      ctx.strokeStyle=C.cyan;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(p1x,p1y);ctx.lineTo(p2x,p2y);ctx.stroke();
      ctx.lineCap='butt';
    });
    const objR=12+8*(1-close);ring(ctx,cx+48,cy,objR,C.green);lab(ctx,'object',cx+60,cy+14,C.mut,8.5);
    lab(ctx,'one motor grasps cylinders to spheres; passive routing adapts without sensors',14,h-12,C.mut);
  };

  /* hwf_underact — passive pendulum walker: leg swings, gravity drives step, no motor pulse needed */
  A.hwf_underact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Passive dynamic walk: pendulum leg swings under gravity — motor fills only what friction takes',14,16,C.dim);
    const gy=h*0.76;ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();
    ctx.strokeStyle=hexA(C.mut,0.18);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,gy+10);ctx.lineTo(w,gy-20);ctx.stroke();
    const p=saw(t,1.8);const phase=p*TAU;
    [[0.35,0],[0.65,Math.PI]].forEach(function(pair){
      const xf=pair[0],ph=pair[1];
      const hipX=w*xf,hipY=gy-70;
      const ang=Math.sin(phase+ph)*0.45;
      const footX=hipX+Math.sin(ang)*95,footY=hipY+Math.cos(ang)*95;
      ctx.strokeStyle=hexA(C.cyan,0.85);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hipX,hipY);ctx.lineTo(footX,footY);ctx.stroke();
      dot(ctx,hipX,hipY,7,C.amber);dot(ctx,footX,gy,5,hexA(C.green,0.8));
    });
    rrect(ctx,w*0.45,gy-105,w*0.1,28,7,C.violet,hexA(C.violet,0.1));lab(ctx,'body',w*0.5,gy-90,C.violet,9,'center');
    lab(ctx,'gravity input: 5.1 N/step on 3° slope',w*0.56,gy-50,C.mut,8.5);
    lab(ctx,'ankle motor: 25 W peak → -21% metabolic cost',w*0.56,gy-34,C.green,8.5);
    lab(ctx,'pendulum natural period 0.9 s — step timing is free with one ankle actuator',14,h-12,C.mut);
  };

  /* hwf_morpho — spring-latch jump: motor charges spring slowly, latch releases fast */
  A.hwf_morpho=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Spring-latch jump: motor stores energy slowly, latch releases in <10 ms — decouples bandwidths',14,16,C.dim);
    const p=saw(t,3);const phase=p*3;
    const gy=h*0.72;ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();
    if(phase<1){
      const compress=(1-phase)*31.6;
      box(ctx,w*0.3,gy-70,60,26,'motor',C.cyan,hexA(C.cyan,0.07));
      ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();
      const sp=gy-44+compress*0.4;for(let i=0;i<=12;i++){const y=gy-44+(sp-(gy-44))*i/12;ctx.lineTo(w*0.42+((i%2)?6:-6),y);}ctx.stroke();
      lab(ctx,'charging spring…\n'+Math.round(compress)+' mm',(w*0.42+14),gy-44+(sp-(gy-44))*0.5,C.violet,8.5);
      dot(ctx,w*0.5,gy,8,C.amber);lab(ctx,'latch holds',w*0.52,gy-10,C.amber,8.5);
    } else if(phase<2){
      lab(ctx,'LATCH RELEASES — 4 ms',w*0.32,h*0.5,C.coral,11);
      for(let i=0;i<8;i++){const a=i/8*TAU;arrow(ctx,w*0.5,gy-30,w*0.5+Math.cos(a)*35,gy-30+Math.sin(a)*35,hexA(C.amber,0.7),1.2);}
    } else {
      const fly=(phase-2)*0.8;const bx=w*0.5,by=gy-fly*120-24;
      rrect(ctx,bx-18,by-18,36,36,8,C.green,hexA(C.green,0.12));lab(ctx,'↑ 52 cm',bx,by+30,C.green,9,'center');
      ctx.strokeStyle=hexA(C.green,0.4);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(bx,gy);ctx.lineTo(bx,by+18);ctx.stroke();ctx.setLineDash([]);
    }
    lab(ctx,'spring 4000 N/m × 31.6 mm stores 2 J; leg exits at 3.2 m/s',14,h-12,C.mut);
  };

  /* hwf_origami — Miura-ori panel folds from compact to deployed span */
  A.hwf_origami=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Miura-Ori fold: crease pattern folds to 1/3.5 the span, springs open with one release force',14,16,C.dim);
    const p=saw(t,3);const deploy=Math.sin(p*Math.PI*0.5)*1.0;
    const ncols=6,nrows=3,cxm=w*0.5,cym=h*0.54;
    const fw=12,fh=9;
    const dw=deploy*(w*0.32),dh=deploy*(h*0.28);
    const W=fw+(dw-fw),H=fh+(dh-fh);
    for(let r=0;r<nrows;r++){for(let c=0;c<ncols;c++){
      const x=cxm-ncols/2*W+c*W,y=cym-nrows/2*H+r*H;
      const shade=((r+c)%2)?hexA(C.cyan,0.28):hexA(C.violet,0.18);
      rrect(ctx,x+1,y+1,W-2,H-2,2,C.line,shade);
    }}
    const totalW=ncols*W,totalH=nrows*H;
    const dispW=Math.round(totalW/w*42);
    lab(ctx,Math.round(totalW)+'px → '+dispW+' cm span',cxm-totalW/2,cym-totalH/2-14,C.amber,8.5);
    lab(ctx,(deploy<0.5?'folded':'deployed')+' (ratio 3.5:1)',cxm,cym+totalH/2+16,C.mut,8.5,'center');
    if(deploy>0.7){dot(ctx,cxm+totalW/2+10,cym,5,C.green);lab(ctx,'released',cxm+totalW/2+16,cym,C.green,8.5);}
    lab(ctx,'0.5 mm fiberglass + Kapton hinge; stiffness 18 N/mm deployed; fits 12 cm gap',14,h-12,C.mut);
  };

  /* hwf_exo — knee polycentric hinge: instant center tracks biological knee shift */
  A.hwf_exo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Polycentric knee hinge: 4-bar linkage matches the shifting instant center of the biological knee',14,16,C.dim);
    const p=saw(t,3.5);const flex=Math.sin(p*TAU)*0.7+0.7;
    const angle=flex*1.2;
    const tx=w*0.42,ty=h*0.22;
    ctx.strokeStyle=C.ink;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,ty+90);ctx.stroke();
    const kx=tx+Math.sin(angle)*6,ky=ty+90+Math.cos(angle)*5;
    dot(ctx,kx,ky,5,C.amber);
    const sh=100;
    const sx=kx+Math.sin(angle)*sh,sy=ky+Math.cos(angle)*sh;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(sx,sy);ctx.stroke();
    const shearF=Math.round((1-flex/1.4)*24+4);
    lab(ctx,'shear: '+shearF+' N',tx+14,kx+38,hexA(shearF>15?C.coral:C.green,0.9),9);
    lab(ctx,'instant center shifts '+Math.round(flex*18/1.4)+' mm → polycentric hinge follows to <3 mm error',14,h-12,C.mut);
  };

  /* hwf_tendon — cable routed to fingertip; stretch shown vs load, hysteresis loop */
  A.hwf_tendon=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tendon drive: motor proximal, cable pulls the tip — but cable stretches 3.7 mm under 5 N',14,16,C.dim);
    const p=saw(t,3);const load=Math.sin(p*TAU)*0.5+0.5;
    const ax=w*0.14,ay=h*0.38,alen=w*0.4;
    ctx.strokeStyle=hexA(C.ink,0.5);ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax+alen,ay);ctx.stroke();
    ring(ctx,ax,ay,14,C.cyan);lab(ctx,'motor',ax-14,ay+24,C.mut,8.5);
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
    const stretch=load*3.7;
    ctx.beginPath();ctx.moveTo(ax+14,ay-4);ctx.lineTo(ax+alen-8+stretch*0.6,ay-4);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,ax+alen,ay,8,C.green);
    const lag=Math.round(load*6.8*10)/10;
    lab(ctx,'lag: '+lag+'°',ax+alen+6,ay-10,hexA(C.coral,0.9),8.5);
    const hx=w*0.66,hy=h*0.5;lab(ctx,'hysteresis loop',hx-20,hy-46,C.dim,8.5);
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy-40);ctx.lineTo(hx,hy+40);ctx.moveTo(hx-30,hy);ctx.lineTo(hx+50,hy);ctx.stroke();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.beginPath();for(let i=0;i<=20;i++){const f2=i/20;ctx.lineTo(hx+f2*44,hy+40-f2*80-Math.sin(f2*Math.PI)*6);}ctx.stroke();
    ctx.strokeStyle=C.violet;ctx.lineWidth=1.8;ctx.beginPath();for(let i=0;i<=20;i++){const f2=i/20;ctx.lineTo(hx+f2*44,hy-40+f2*80+Math.sin(f2*Math.PI)*6);}ctx.stroke();
    lab(ctx,'Bouc-Wen model; distal encoder closes loop → lag drops to <0.5°',14,h-12,C.mut);
  };

  /* hwf_tactile — taxel array detects shear gradient; slip onset caught 80 ms before drop */
  A.hwf_tactile=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tactile skin: 4×4 taxel array detects shear gradient — slip detected 80 ms before wrist F/T',14,16,C.dim);
    const p=saw(t,3);const slipPhase=p;
    const gx=w*0.28,gy=h*0.5;
    rrect(ctx,gx-12,gy-50,24,100,5,C.line,null);
    for(let r=0;r<4;r++){for(let c=0;c<4;c++){
      const ttx=gx-7+c*5,tty=gy-32+r*16;
      const isShear=(r===2&&c>1)&&slipPhase>0.5;
      dot(ctx,ttx,tty,2.5,isShear?C.coral:C.green);
    }}
    lab(ctx,'4×4 taxels\n2.5 mm pitch\n500 Hz',gx+16,gy-20,C.mut,8.5);
    const slipY=slipPhase>0.5?gy+slipPhase*14-7:gy;
    rrect(ctx,gx+28,slipY-28,40,56,6,C.amber,hexA(C.amber,0.12));
    lab(ctx,'200 g\nobject',gx+34,slipY,C.amber,8.5);
    const tx2=w*0.6,ty2=h*0.36;
    lab(ctx,'timeline',tx2,ty2-10,C.dim,8.5);
    ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx2,ty2+6);ctx.lineTo(tx2+120,ty2+6);ctx.stroke();
    dot(ctx,tx2+24,ty2+6,4,C.green);lab(ctx,'tactile\nalert -80 ms',tx2+14,ty2+20,C.green,8);
    dot(ctx,tx2+96,ty2+6,4,C.coral);lab(ctx,'F/T sees\ndrop',tx2+88,ty2+20,C.coral,8);
    lab(ctx,'94% slip caught before drop; wrist F/T alone catches only 61%',14,h-12,C.mut);
  };

  /* hwf_bioinspire — flapping wing resonance: spring stores energy, Q-factor boosts lift */
  A.hwf_bioinspire=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Resonant flapping: spring stores half the stroke energy — Q≈1.75 boosts lift to 110%',14,16,C.dim);
    const p=saw(t,1.0/28);const wingAng=Math.sin(p*TAU)*0.9;
    const bx=w*0.5,by=h*0.52;rrect(ctx,bx-14,by-12,28,24,7,C.amber,hexA(C.amber,0.12));
    ctx.save();ctx.translate(bx-14,by);ctx.rotate(-wingAng);ctx.strokeStyle=C.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-80,0);ctx.lineTo(-70,18);ctx.closePath();ctx.stroke();
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(bx+14,by);ctx.rotate(wingAng);ctx.strokeStyle=C.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(80,0);ctx.lineTo(70,18);ctx.closePath();ctx.stroke();
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.fill();ctx.restore();
    const springE=Math.abs(Math.cos(p*TAU))*0.8;
    lab(ctx,'spring: '+(Math.round(springE*100))+'% charged',bx-30,by+44,C.violet,8.5);
    const lift=0.7+springE*0.55;
    ctx.fillStyle=hexA(C.green,0.8);ctx.fillRect(w*0.76,h*0.4,14,-(lift*60));
    lab(ctx,'lift\n'+(Math.round(lift*100))+'%',w*0.74,h*0.4+10,C.green,8);
    lab(ctx,'28 Hz resonance, Q=1.75; spring charges in 0.4 s; jump-takeoff at 1.2 m/s',14,h-12,C.mut);
  };

  /* hwf_codesign — two param spaces (hull + engine) searched jointly; joint optimum shown */
  A.hwf_codesign=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Co-design: optimize hull and buoyancy engine jointly — joint optimum beats sequential by 29%',14,16,C.dim);
    const ox=w*0.14,oy=h*0.18,gw=w*0.44,gh=h*0.52;
    for(let lv=0;lv<6;lv++){
      ctx.strokeStyle=hexA(C.line,0.5+lv*0.06);ctx.lineWidth=1;ctx.beginPath();
      const a=(lv+1)*gw*0.09,b=(lv+1)*gh*0.07;
      const cx2=ox+gw*0.68,cy2=oy+gh*0.64;
      ctx.ellipse(cx2,cy2,a,b,0.3,0,TAU);ctx.stroke();
    }
    const sx=ox+gw*0.42,sy=oy+gh*0.44;
    dot(ctx,sx,sy,7,C.amber);lab(ctx,'sequential\nCd=0.031',sx+9,sy-8,C.amber,8.5);
    const p=saw(t,4);const pulse=Math.sin(p*TAU)*0.3+0.7;
    const jx=ox+gw*0.68,jy=oy+gh*0.64;
    dot(ctx,jx,jy,7,C.green);ring(ctx,jx,jy,12*pulse,hexA(C.green,0.5));
    lab(ctx,'joint\nCd=0.022',jx+9,jy-8,C.green,8.5);
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox,oy+gh);ctx.lineTo(ox+gw,oy+gh);ctx.moveTo(ox,oy);ctx.lineTo(ox,oy+gh);ctx.stroke();
    lab(ctx,'hull fineness →',ox+gw*0.3,oy+gh+14,C.mut,8.5);lab(ctx,'engine offset',ox-38,oy+gh*0.5,C.mut,8.5);
    lab(ctx,'200 Bayesian evals, 9D space; glide ratio jumps 12.4 → 17.1 at same mass',14,h-12,C.mut);
  };

  /* hwf_simgen — vision pipeline: photo → depth → parts → URDF in 6 s */
  A.hwf_simgen=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sim asset gen: one RGB photo → depth → part graph → URDF in 6 seconds',14,16,C.dim);
    const p=saw(t,4);const step=Math.floor(p*4);
    const stages=['RGB photo','depth + normals','part graph','URDF export'];
    const sx=w*0.08,sy=h*0.38,sW=(w*0.84)/4;
    stages.forEach(function(s,i){
      const x=sx+i*sW,done=i<=step,active=i===step;
      rrect(ctx,x+4,sy,sW-8,44,7,active?C.cyan:done?C.green:C.line,active?hexA(C.cyan,0.08):done?hexA(C.green,0.06):null);
      lab(ctx,s,x+sW/2,sy+22,active?C.cyan:done?C.green:C.dim,9,'center');
      if(i<3)arrow(ctx,x+sW-2,sy+22,x+sW+2,sy+22,C.dim,1.2);
    });
    const details=['640×480 RGB, one view','DPT-Large monocular depth','3 parts: base+jar+lid','mass 0.8 kg, revolute lid joint'];
    lab(ctx,'→ '+details[step],sx,sy+66,C.mut,9);
    const elapsed=Math.round(p*6.2*10)/10;
    lab(ctx,elapsed+' s',w*0.82,sy+22,C.amber,10);
    lab(ctx,'DPT depth + material lookup → URDF + collision mesh in 6.2 s; lid opens correctly in MuJoCo',14,h-12,C.mut);
  };

  /* hwf_physmat — probe force applied, Hertzian fit, stiffness field mapped */
  A.hwf_physmat=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Material estimation: probe force + Hertzian contact fit → stiffness field of the object',14,16,C.dim);
    const p=saw(t,3);const probeI=Math.floor(p*9);
    const ox=w*0.42,oy=h*0.5,oa=80,ob=52;
    ctx.strokeStyle=C.line;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(ox,oy,oa,ob,0,0,TAU);ctx.stroke();
    for(let r=0;r<3;r++){for(let c=0;c<3;c++){
      const idx=r*3+c;const ppx=ox-38+c*38,ppy=oy-24+r*24;
      const E=18+idx*2;
      const probed=idx<=probeI;
      dot(ctx,ppx,ppy,4,probed?C.green:hexA(C.mut,0.4));
      if(probed){lab(ctx,E+'kPa',ppx-8,ppy+12,hexA(C.cyan,0.7),7);}
      if(idx===probeI){
        arrow(ctx,ppx,ppy-40,ppx,ppy-8,C.amber,1.8);lab(ctx,'0.5 N',ppx+4,ppy-28,C.amber,8);}
    }}
    const hx=w*0.72,hy=h*0.34;lab(ctx,'Hertz fit',hx,hy-8,C.dim,8.5);
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx,hy+64);ctx.lineTo(hx+60,hy+64);ctx.stroke();
    ctx.strokeStyle=C.violet;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=20;i++){const f2=i/20;const d=Math.pow(f2,0.667)*50;ctx.lineTo(hx+f2*58,hy+64-d);}ctx.stroke();
    lab(ctx,'δ=1.2 mm → E*=28 kPa; prediction error 0.9 mm RMS vs 8.4 mm baseline',14,h-12,C.mut);
  };

  /* hwf_interact — person opens door, tracker extracts hinge axis, URDF built */
  A.hwf_interact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Interaction priors: watch a person open a door → hinge axis, range 92°, URDF in 30 s',14,16,C.dim);
    const p=saw(t,3);const open=Math.sin(p*Math.PI*0.6)*0.8;
    rrect(ctx,w*0.28,h*0.2,w*0.06,h*0.58,4,C.line,null);
    const dhinge=w*0.34,dhingeY=h*0.2,dw=w*0.2,dh=h*0.58;
    ctx.save();ctx.translate(dhinge,dhingeY);ctx.rotate(open);
    rrect(ctx,0,0,dw,dh,3,C.cyan,hexA(C.cyan,0.1));ctx.restore();
    dot(ctx,dhinge,dhingeY+dh/2,5,C.amber);
    lab(ctx,'range: '+Math.round(open*(92/0.8))+'° (true: 92°)',w*0.56,h*0.42,C.green,8.5);
    const hndx=dhinge+Math.cos(open)*dw*0.7,hndy=dhingeY+dh*0.4+Math.sin(open)*dw*0.5;
    dot(ctx,hndx,hndy,6,C.violet);lab(ctx,'hand tracker',hndx+8,hndy,C.violet,8);
    rrect(ctx,w*0.7,h*0.3,w*0.24,50,7,C.green,hexA(C.green,0.07));
    lab(ctx,'URDF\nrevolute joint\n4° axis error',w*0.82,h*0.44,C.green,8.5,'center');
    lab(ctx,'without interaction priors robot fails 7/10 attempts; with them: first-attempt success',14,h-12,C.mut);
  };

  /* hwf_electric — DC motor: rotor spins fast, 50:1 gearbox slows output, Stribeck friction curve */
  A.hwf_electric=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'DC motor: rotor spins fast & weak → gearbox multiplies torque, friction curve is the sim gap',14,16,C.dim);
    const p=saw(t,2);const motorAng=p*TAU*6;const gearAng=p*TAU*6/50;
    const mx=w*0.22,my=h*0.5;ring(ctx,mx,my,28,C.cyan);
    ctx.save();ctx.translate(mx,my);ctx.rotate(motorAng);ctx.strokeStyle=C.cyan;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(20,0);ctx.stroke();ctx.restore();
    dot(ctx,mx,my,4,C.amber);lab(ctx,'motor\n1000 rpm',mx-18,my+38,C.mut,8.5);
    rrect(ctx,w*0.34,my-18,w*0.16,36,6,C.amber,hexA(C.amber,0.06));
    lab(ctx,'50:1\ngearbox',w*0.34+w*0.08,my,C.amber,8.5,'center');
    arrow(ctx,w*0.31,my,w*0.34,my,C.mut,1.4);
    const ox=w*0.54,oy=my;ctx.save();ctx.translate(ox,oy);ctx.rotate(gearAng);ctx.strokeStyle=C.green;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(22,0);ctx.stroke();ctx.restore();
    dot(ctx,ox,oy,5,C.green);lab(ctx,'output\n20 rpm\n2.5 N·m',ox+8,oy+12,C.green,8.5);
    const fx=w*0.73,fy=h*0.3;lab(ctx,'Stribeck friction',fx-10,fy-10,C.dim,8.5);
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy+68);ctx.lineTo(fx+80,fy+68);ctx.stroke();
    ctx.strokeStyle=hexA(C.coral,0.8);ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=24;i++){const v=i/24;const f2=0.3*Math.exp(-v*8)+0.04*v+0.06;ctx.lineTo(fx+i*3.3,fy+68-f2*160);}ctx.stroke();
    lab(ctx,'static→viscous; model this or position error stays at 8°',14,h-12,C.mut);
  };

  /* hwf_pneumatic — silicone chamber inflates, tip curls, nonlinear pressure-force curve */
  A.hwf_pneumatic=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pneumatic chamber: pressure inflates silicone → tip curls, force is nonlinear — not a spring',14,16,C.dim);
    const p=saw(t,3);const pres=Math.sin(p*TAU)*0.5+0.5;
    const bx=w*0.22,by=h*0.56;dot(ctx,bx,by,5,C.amber);
    ctx.strokeStyle=C.violet;ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bx,by);
    for(let i=1;i<=18;i++){const a=pres*i*0.07;ctx.lineTo(bx+Math.cos(a)*i*4.8,by-Math.sin(a)*i*4.8);}ctx.stroke();ctx.lineCap='butt';
    const kpa=Math.round(pres*20);
    lab(ctx,'silicone\n'+kpa+' kPa',(bx+Math.cos(pres*18*0.07)*18*4.8)+6,by-Math.sin(pres*18*0.07)*18*4.8,C.violet,8.5);
    const gx=w*0.56,gy=h*0.28;lab(ctx,'pressure → force',gx,gy-10,C.dim,8.5);
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+80);ctx.lineTo(gx+100,gy+80);ctx.stroke();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=20;i++){const k=i/20;const f2=0.82*(1-Math.exp(-k*20/8));ctx.lineTo(gx+i*5,gy+80-f2*80);}ctx.stroke();
    dot(ctx,gx+pres*100,gy+80-(0.82*(1-Math.exp(-pres*20/8)))*80,4,C.amber);
    lab(ctx,'contact patch spreads 14 mm on fruit; peak stress 4.2 kPa — below bruise threshold of 25 kPa',14,h-12,C.mut);
  };

  /* hwf_sea — motor + spring in series; spring deflects at heel-strike, force read from deflection */
  A.hwf_sea=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Series-elastic: spring between motor and foot absorbs impulse; force = k × deflection',14,16,C.dim);
    const p=saw(t,2.5);const bounce=Math.abs(Math.sin(p*Math.PI));
    const gy=h*0.76;ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*0.05,gy);ctx.lineTo(w*0.95,gy);ctx.stroke();
    const hx=w*0.42,hipY=gy-42-bounce*54;
    box(ctx,hx-22,hipY-22,44,22,'motor',C.cyan,hexA(C.cyan,0.07));
    const sp0=hipY,sp1=hipY+30+bounce*28;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=12;i++){const yy=sp0+(sp1-sp0)*i/12;const xx=hx+((i%2)?7:-7);ctx.lineTo(xx,yy);}ctx.stroke();
    lab(ctx,'k=800 N/m',hx+12,sp0+(sp1-sp0)*0.5,C.violet,8.5);
    ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hx,sp1);ctx.lineTo(hx,gy);ctx.stroke();
    dot(ctx,hx,gy,5,C.amber);
    const F=Math.round(800*bounce*0.052*100)/100;
    lab(ctx,'F='+Math.round(F)+' N\nread from Δx',hx+14,sp1+4,C.green,8.5);
    lab(ctx,'spring stores 4 J impulse in 35 ms; motor sees a smooth ramp, not a 2 ms spike',14,h-12,C.mut);
  };

  /* hwf_gripper — one tendon through differential; three fingers curl to conform passively */
  A.hwf_gripper=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Underactuated gripper: one tendon routes through a differential — fingers adapt passively',14,16,C.dim);
    const p=saw(t,3);const close=Math.sin(p*Math.PI)*0.85;
    const mx=w*0.15,my=h*0.5;ring(ctx,mx,my,16,C.cyan);lab(ctx,'1 motor',mx-14,my+24,C.mut,8.5);
    arrow(ctx,mx+16,my,w*0.30,my,C.cyan,1.4);
    rrect(ctx,w*0.30,my-14,w*0.12,28,6,C.amber,hexA(C.amber,0.06));lab(ctx,'diff',w*0.36,my,C.amber,9,'center');
    const cx=w*0.52,cy=h*0.5;
    const fanAngles=[-0.38,0,0.38];
    fanAngles.forEach(function(fa){
      const basex=cx+Math.cos(fa)*28,basey=cy+Math.sin(fa)*28;
      const p1x=basex+Math.cos(fa)*38*close,p1y=basey+Math.sin(fa)*38*close+8*(1-close);
      ctx.strokeStyle=C.violet;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(basex,basey);ctx.lineTo(p1x,p1y);ctx.stroke();
      const fa2=fa+close*0.5;
      const p2x=p1x+Math.cos(fa2)*26*close,p2y=p1y+Math.sin(fa2)*26*close;
      ctx.strokeStyle=C.cyan;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(p1x,p1y);ctx.lineTo(p2x,p2y);ctx.stroke();
      ctx.lineCap='butt';
    });
    const objR=12+8*(1-close);ring(ctx,cx+50,cy,objR,C.green);lab(ctx,'object',cx+62,cy+14,C.mut,8.5);
    lab(ctx,'one motor grasps cylinders to spheres; passive routing adapts without sensors',14,h-12,C.mut);
  };

  /* hwf_underact — passive pendulum walker; pendulum swings under gravity, ankle actuator adds 25 W */
  A.hwf_underact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Passive dynamic walk: pendulum leg swings under gravity — motor fills only what friction takes',14,16,C.dim);
    const gy=h*0.76;ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();
    const p=saw(t,1.8);const phase=p*TAU;
    [[0.35,0],[0.65,Math.PI]].forEach(function(pair){
      const xf=pair[0],ph=pair[1];
      const hipX=w*xf,hipY=gy-68;
      const ang=Math.sin(phase+ph)*0.45;
      const footX=hipX+Math.sin(ang)*95,footY=hipY+Math.cos(ang)*95;
      ctx.strokeStyle=hexA(C.cyan,0.85);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hipX,hipY);ctx.lineTo(footX,footY);ctx.stroke();
      dot(ctx,hipX,hipY,7,C.amber);dot(ctx,footX,gy,5,hexA(C.green,0.8));
    });
    rrect(ctx,w*0.45,gy-104,w*0.1,28,7,C.violet,hexA(C.violet,0.1));lab(ctx,'body',w*0.5,gy-89,C.violet,9,'center');
    lab(ctx,'gravity: 5.1 N/step on 3° slope',w*0.56,gy-52,C.mut,8.5);
    lab(ctx,'ankle motor: 25 W peak → -21% metabolic cost',w*0.56,gy-36,C.green,8.5);
    lab(ctx,'pendulum period 0.9 s — step timing is free; one ankle actuator covers the rest',14,h-12,C.mut);
  };

  /* hwf_morpho — spring-latch jump: motor charges spring slowly, latch releases in 4 ms */
  A.hwf_morpho=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Spring-latch jump: motor stores energy slowly; latch releases in 4 ms — bandwidths decoupled',14,16,C.dim);
    const p=saw(t,3);const phase=p*3;
    const gy=h*0.74;ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();
    if(phase<1){
      const compress=(1-phase)*31.6;
      box(ctx,w*0.3,gy-70,60,26,'motor',C.cyan,hexA(C.cyan,0.07));
      const sp=gy-44+compress*0.5;
      ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<=12;i++){const y=gy-44+(sp-(gy-44))*i/12;ctx.lineTo(w*0.42+((i%2)?6:-6),y);}ctx.stroke();
      lab(ctx,'charging\n'+Math.round(compress)+' mm',w*0.44+14,gy-44+(sp-(gy-44))*0.5,C.violet,8.5);
      dot(ctx,w*0.5,gy,8,C.amber);lab(ctx,'latch holds',w*0.52,gy-10,C.amber,8.5);
    } else if(phase<2){
      lab(ctx,'LATCH RELEASES — 4 ms',w*0.32,h*0.5,C.coral,11);
      for(let i=0;i<8;i++){const a=i/8*TAU;arrow(ctx,w*0.5,gy-30,w*0.5+Math.cos(a)*36,gy-30+Math.sin(a)*36,hexA(C.amber,0.7),1.2);}
    } else {
      const fly=(phase-2)*0.8;const bx=w*0.5,by=gy-fly*122-22;
      rrect(ctx,bx-18,by-18,36,36,8,C.green,hexA(C.green,0.12));lab(ctx,'↑ 52 cm',bx,by+30,C.green,9,'center');
      ctx.strokeStyle=hexA(C.green,0.4);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(bx,gy);ctx.lineTo(bx,by+18);ctx.stroke();ctx.setLineDash([]);
    }
    lab(ctx,'spring 4000 N/m × 31.6 mm stores 2 J; leg exits at 3.2 m/s; body lifts 52 cm',14,h-12,C.mut);
  };

  /* hwf_origami — Miura-ori panel grid folds from compact to deployed span over time */
  A.hwf_origami=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Miura-Ori fold: crease pattern collapses to 1/3.5 span, spring-releases to rigid deployed state',14,16,C.dim);
    const p=saw(t,3);const deploy=Math.sin(p*Math.PI*0.5);
    const ncols=6,nrows=3,cx=w*0.5,cy=h*0.54;
    const fw=13,fhf=10;const dw=fw+(w*0.31-fw)*deploy,dh=fhf+(h*0.27-fhf)*deploy;
    for(let r=0;r<nrows;r++){for(let c=0;c<ncols;c++){
      const x=cx-ncols/2*dw+c*dw,y=cy-nrows/2*dh+r*dh;
      const shade=((r+c)%2)?hexA(C.cyan,0.28):hexA(C.violet,0.18);
      rrect(ctx,x+1,y+1,dw-2,dh-2,2,C.line,shade);
    }}
    const totalW=ncols*dw,totalH=nrows*dh;
    lab(ctx,(Math.round(totalW/w*42))+' cm span (ratio 3.5:1)',cx-totalW/2,cy-totalH/2-14,C.amber,8.5);
    lab(ctx,deploy>0.7?'deployed':'folded',cx,cy+totalH/2+16,C.mut,8.5,'center');
    if(deploy>0.7){dot(ctx,cx+totalW/2+10,cy,5,C.green);lab(ctx,'released',cx+totalW/2+16,cy,C.green,8.5);}
    lab(ctx,'0.5 mm fiberglass + Kapton hinge; 18 N/mm stiff when deployed; fits 12 cm gap',14,h-12,C.mut);
  };

  /* hwf_exo — polycentric knee hinge: 4-bar linkage tracks shifting instant center */
  A.hwf_exo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Polycentric knee hinge: 4-bar linkage matches the shifting instant center of the biological knee',14,16,C.dim);
    const p=saw(t,3.5);const flex=Math.sin(p*TAU)*0.7+0.7;
    const angle=flex*1.2;
    const tx=w*0.42,ty=h*0.22;
    ctx.strokeStyle=C.ink;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx,ty+90);ctx.stroke();
    const kx=tx+Math.sin(angle)*6,ky=ty+90+Math.cos(angle)*5;
    dot(ctx,kx,ky,5,C.amber);
    const sh=100;
    const sx=kx+Math.sin(angle)*sh,sy=ky+Math.cos(angle)*sh;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(kx,ky);ctx.lineTo(sx,sy);ctx.stroke();
    const shearF=Math.round((1-flex/1.4)*22+4);
    lab(ctx,'shear: '+shearF+' N',tx+14,ky+18,shearF>14?hexA(C.coral,0.9):hexA(C.green,0.9),9);
    lab(ctx,'instant center shifts '+Math.round(flex*18/1.4)+' mm → polycentric hinge follows within 3 mm',14,h-12,C.mut);
  };

  /* hwf_tendon — cable route to tip; stretch shown vs load; hysteresis loop */
  A.hwf_tendon=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tendon drive: motor stays proximal, cable pulls the tip — but 400 mm of cable stretches 3.7 mm at 5 N',14,16,C.dim);
    const p=saw(t,3);const load=Math.sin(p*TAU)*0.5+0.5;
    const ax=w*0.13,ay=h*0.38,alen=w*0.4;
    ctx.strokeStyle=hexA(C.ink,0.4);ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax+alen,ay);ctx.stroke();
    ring(ctx,ax,ay,14,C.cyan);lab(ctx,'motor',ax-14,ay+24,C.mut,8.5);
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(ax+14,ay-4);ctx.lineTo(ax+alen-8+load*2.2,ay-4);ctx.stroke();ctx.setLineDash([]);
    dot(ctx,ax+alen,ay,8,C.green);
    const lag=Math.round(load*6.8*10)/10;
    lab(ctx,'lag: '+lag+'°',ax+alen+6,ay-10,hexA(C.coral,0.9),8.5);
    const hx=w*0.64,hy=h*0.5;lab(ctx,'hysteresis loop',hx-18,hy-44,C.dim,8.5);
    ctx.strokeStyle=hexA(C.mut,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy-40);ctx.lineTo(hx,hy+40);ctx.moveTo(hx-30,hy);ctx.lineTo(hx+52,hy);ctx.stroke();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=20;i++){const f2=i/20;ctx.lineTo(hx+f2*48,hy+40-f2*80-Math.sin(f2*Math.PI)*6);}ctx.stroke();
    ctx.strokeStyle=C.violet;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=20;i++){const f2=i/20;ctx.lineTo(hx+f2*48,hy-40+f2*80+Math.sin(f2*Math.PI)*6);}ctx.stroke();
    lab(ctx,'Bouc-Wen hysteresis model; distal encoder closes loop → lag drops to <0.5°',14,h-12,C.mut);
  };

  /* hwf_tactile — 4×4 taxel array; shear gradient detects slip 80 ms before wrist F/T */
  A.hwf_tactile=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tactile skin: shear gradient across 4×4 taxels detects slip 80 ms before wrist F/T sensor',14,16,C.dim);
    const p=saw(t,3);const slipPhase=p;
    const gx=w*0.28,gy=h*0.5;
    rrect(ctx,gx-12,gy-50,24,100,5,C.line,null);
    for(let r=0;r<4;r++){for(let c=0;c<4;c++){
      const tx=gx-7+c*5,ty=gy-32+r*16;
      const isShear=(r>=2&&c>=2)&&slipPhase>0.5;
      dot(ctx,tx,ty,2.5,isShear?C.coral:C.green);
    }}
    lab(ctx,'4×4 taxels\n2.5 mm pitch\n500 Hz',gx+16,gy-22,C.mut,8.5);
    const slipY=slipPhase>0.5?gy+slipPhase*12-6:gy;
    rrect(ctx,gx+28,slipY-28,40,56,6,C.amber,hexA(C.amber,0.12));lab(ctx,'200 g\nobject',gx+34,slipY,C.amber,8.5);
    const tx2=w*0.6,ty2=h*0.35;lab(ctx,'timeline',tx2,ty2-10,C.dim,8.5);
    ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx2,ty2+6);ctx.lineTo(tx2+120,ty2+6);ctx.stroke();
    dot(ctx,tx2+24,ty2+6,4,C.green);lab(ctx,'tactile\nalert -80 ms',tx2+14,ty2+18,C.green,8);
    dot(ctx,tx2+96,ty2+6,4,C.coral);lab(ctx,'F/T sees\ndrop t=0',tx2+88,ty2+18,C.coral,8);
    lab(ctx,'94% slip caught before drop; wrist F/T alone catches only 61%',14,h-12,C.mut);
  };

  /* hwf_bioinspire — flapping wing at resonance; spring Q-factor boosts lift to 110% */
  A.hwf_bioinspire=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Resonant flapping: spring stores stroke energy — Q≈1.75 boosts lift 13% over direct drive',14,16,C.dim);
    const wingAng=Math.sin(t*TAU*28/20)*0.9;
    const bx=w*0.5,by=h*0.52;rrect(ctx,bx-14,by-12,28,24,7,C.amber,hexA(C.amber,0.12));
    ctx.save();ctx.translate(bx-14,by);ctx.rotate(-wingAng);ctx.strokeStyle=C.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-80,0);ctx.lineTo(-70,18);ctx.closePath();ctx.stroke();
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(bx+14,by);ctx.rotate(wingAng);ctx.strokeStyle=C.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(80,0);ctx.lineTo(70,18);ctx.closePath();ctx.stroke();
    ctx.fillStyle=hexA(C.cyan,0.12);ctx.fill();ctx.restore();
    const springE=Math.abs(Math.cos(t*TAU*28/20))*0.8;
    lab(ctx,'spring: '+Math.round(springE*100)+'% charged',bx-30,by+44,C.violet,8.5);
    const lift=0.7+springE*0.55;
    ctx.fillStyle=hexA(C.green,0.8);ctx.fillRect(w*0.76,h*0.38,14,-lift*60);
    lab(ctx,'lift\n'+Math.round(lift*100)+'%',w*0.74,h*0.38+10,C.green,8);
    lab(ctx,'28 Hz resonance, k=124 N/m, Q=1.75; spring-latch variant: jump-and-fly at 1.2 m/s',14,h-12,C.mut);
  };

  /* hwf_codesign — contour landscape; sequential optimum vs joint optimum, Bayesian path */
  A.hwf_codesign=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Co-design: optimize hull and buoyancy engine jointly — joint optimum beats sequential by 29%',14,16,C.dim);
    const ox=w*0.13,oy=h*0.18,gw=w*0.44,gh=h*0.54;
    for(let lv=0;lv<6;lv++){
      ctx.strokeStyle=hexA(C.line,0.45+lv*0.07);ctx.lineWidth=1;ctx.beginPath();
      const ca=ox+gw*0.68,cb=oy+gh*0.64,ra=(lv+1)*gw*0.09,rb=(lv+1)*gh*0.07;
      ctx.ellipse(ca,cb,ra,rb,0.3,0,TAU);ctx.stroke();
    }
    const sx=ox+gw*0.42,sy=oy+gh*0.44;
    dot(ctx,sx,sy,7,C.amber);lab(ctx,'sequential\nCd=0.031',sx+9,sy-8,C.amber,8.5);
    const p=saw(t,4);const pulse=Math.sin(p*TAU)*0.3+0.7;
    const jx=ox+gw*0.68,jy=oy+gh*0.64;
    dot(ctx,jx,jy,7,C.green);ring(ctx,jx,jy,12*pulse,hexA(C.green,0.55));
    lab(ctx,'joint\nCd=0.022',jx+9,jy-8,C.green,8.5);
    ctx.strokeStyle=hexA(C.mut,0.45);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox,oy+gh);ctx.lineTo(ox+gw,oy+gh);ctx.moveTo(ox,oy);ctx.lineTo(ox,oy+gh);ctx.stroke();
    lab(ctx,'hull fineness →',ox+gw*0.28,oy+gh+14,C.mut,8.5);lab(ctx,'engine offset',ox-36,oy+gh*0.5,C.mut,8.5);
    lab(ctx,'200 Bayesian evals, 9D space; glide ratio jumps 12.4 → 17.1 at same mass budget',14,h-12,C.mut);
  };

  /* hwf_simgen — pipeline stages: RGB photo → depth → part graph → URDF, 6 s timer */
  A.hwf_simgen=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sim asset gen: one RGB photo → depth → part graph → URDF in 6.2 seconds',14,16,C.dim);
    const p=saw(t,4);const step=Math.floor(p*4);
    const stages=['RGB photo','depth + normals','part graph','URDF export'];
    const sx=w*0.07,sy=h*0.38,sW=(w*0.86)/4;
    stages.forEach(function(s,i){
      const x=sx+i*sW,done=i<=step,active=i===step;
      rrect(ctx,x+4,sy,sW-8,44,7,active?C.cyan:done?C.green:C.line,active?hexA(C.cyan,0.08):done?hexA(C.green,0.06):null);
      lab(ctx,s,x+sW/2,sy+22,active?C.cyan:done?C.green:C.dim,9,'center');
      if(i<3)arrow(ctx,x+sW-2,sy+22,x+sW+2,sy+22,C.dim,1.2);
    });
    const details=['640×480 RGB, one view','DPT-Large monocular depth','base+jar+lid: revolute+fixed','mass 0.8 kg, μ=0.35, URDF'];
    lab(ctx,'→ '+details[step],sx,sy+64,C.mut,9);
    const elapsed=Math.round(p*6.2*10)/10;
    lab(ctx,elapsed+' s',w*0.82,sy+22,C.amber,10);
    lab(ctx,'DPT depth + material lookup → URDF + collision mesh; lid opens correctly in MuJoCo',14,h-12,C.mut);
  };

  /* hwf_physmat — probe force at 3×3 grid, Hertzian curve fit, stiffness field built */
  A.hwf_physmat=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Material estimation: probe force + Hertzian fit → stiffness field; predict 2 N deformation',14,16,C.dim);
    const p=saw(t,3);const probeI=Math.floor(p*9);
    const ox=w*0.42,oy=h*0.5,oa=80,ob=52;
    ctx.strokeStyle=C.line;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(ox,oy,oa,ob,0,0,TAU);ctx.stroke();
    for(let r=0;r<3;r++){for(let c=0;c<3;c++){
      const idx=r*3+c;const px=ox-38+c*38,py=oy-24+r*24;
      const Eval=18+idx*2;const probed=idx<=probeI;
      dot(ctx,px,py,4,probed?C.green:hexA(C.mut,0.4));
      if(probed){lab(ctx,Eval+'kPa',px-8,py+12,hexA(C.cyan,0.7),7);}
      if(idx===probeI){arrow(ctx,px,py-40,px,py-8,C.amber,1.8);lab(ctx,'0.5 N',px+4,py-28,C.amber,8);}
    }}
    const hx=w*0.72,hy=h*0.33;lab(ctx,'Hertz fit',hx,hy-8,C.dim,8.5);
    ctx.strokeStyle=hexA(C.mut,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx,hy+64);ctx.lineTo(hx+60,hy+64);ctx.stroke();
    ctx.strokeStyle=C.violet;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=20;i++){const f2=i/20;const d=Math.pow(f2,0.667)*50;ctx.lineTo(hx+f2*58,hy+64-d);}ctx.stroke();
    lab(ctx,'δ=1.2 mm → E*=28 kPa; prediction error 0.9 mm RMS vs 8.4 mm baseline',14,h-12,C.mut);
  };

  /* hwf_interact — person opens door, hinge axis extracted, URDF built, robot succeeds */
  A.hwf_interact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Interaction priors: watch a person open a door → hinge axis, 92° range, URDF — 30 s video',14,16,C.dim);
    const p=saw(t,3);const open=Math.sin(p*Math.PI*0.6)*0.78;
    rrect(ctx,w*0.28,h*0.2,w*0.06,h*0.58,4,C.line,null);
    const dhinge=w*0.34,dhingeY=h*0.2,dw=w*0.2,dh=h*0.58;
    ctx.save();ctx.translate(dhinge,dhingeY);ctx.rotate(open);
    rrect(ctx,0,0,dw,dh,3,C.cyan,hexA(C.cyan,0.1));ctx.restore();
    dot(ctx,dhinge,dhingeY+dh/2,5,C.amber);
    lab(ctx,'range: '+Math.round(open*(92/0.78))+'° of 92°',w*0.56,h*0.42,C.green,8.5);
    const hx=dhinge+Math.cos(open)*dw*0.7,hy=dhingeY+dh*0.4+Math.sin(open)*dw*0.5;
    dot(ctx,hx,hy,6,C.violet);lab(ctx,'hand tracker',hx+8,hy,C.violet,8);
    rrect(ctx,w*0.7,h*0.3,w*0.24,50,7,C.green,hexA(C.green,0.07));
    lab(ctx,'URDF\nrevolute joint\n4° axis error',w*0.82,h*0.44,C.green,8.5,'center');
    lab(ctx,'without interaction priors robot fails 7/10 attempts; with them: first-attempt success',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.hwanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-hwanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
