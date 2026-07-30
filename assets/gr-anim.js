/* gr-anim.js — first-principles mechanism animators for the Manipulation & Grasping explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-granim="name". Self-contained boot. */
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

  /* 01 — WHY: manipulation is controlling the world through contact — and contact is where it's hard. */
  A.gr_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'To move an object you must touch it — and control only exists while you are touching',14,16,C.dim);
    const p=saw(t,4);
    // hand (gripper) descends, grabs a block, lifts it
    const bx=w*0.5,floor=h*0.74;const grab=p<0.4?0:(p<0.7?1:1);
    const lift=p<0.4?0:(p<0.7?(p-0.4)/0.3:1);
    const by=floor-14-lift*60;
    // block
    rrect(ctx,bx-22,by-16,44,30,4,hexA(C.amber,0.9),hexA(C.amber,0.18));
    // gripper fingers
    const open=p<0.35?18:8;const gy=by-16;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(bx,gy-34-((p<0.35)?(0.35-p)*120:0));ctx.lineTo(bx,gy-14);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-open,gy-14);ctx.lineTo(bx-open,gy+8);ctx.moveTo(bx+open,gy-14);ctx.lineTo(bx+open,gy+8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-open,gy-14);ctx.lineTo(bx+open,gy-14);ctx.stroke();
    // floor
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.beginPath();ctx.moveTo(w*0.2,floor+14);ctx.lineTo(w*0.8,floor+14);ctx.stroke();
    // contact stars when grabbing
    if(p>=0.35&&p<0.75){dot(ctx,bx-8,by-2,3,C.coral);dot(ctx,bx+8,by-2,3,C.coral);lab(ctx,'contact = the only handle you have',bx+30,by,C.coral,9);}
    lab(ctx,'no contact → no control · wrong contact → it slips or breaks',14,h-12,C.mut);
  };

  /* 02 — GRASP = FORCE CLOSURE: place contacts whose friction cones can resist any push. */
  A.gr_grasp=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A grasp holds if the finger friction cones can resist a push from any direction',14,16,C.dim);
    const cx=w*0.42,cy=h*0.54,r=48;
    ring(ctx,cx,cy,r,hexA(C.amber,0.9));lab(ctx,'object',cx,cy,C.amber,9,'center');
    // three contact points with friction cones pointing inward
    const angs=[-0.4,2.3,3.8];
    angs.forEach(a=>{const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;dot(ctx,px,py,4,C.cyan);
      // friction cone: two lines from contact toward center +/- spread
      const inx=cx-px,iny=cy-py,il=Math.hypot(inx,iny),ux=inx/il,uy=iny/il;const sp=0.5;
      [sp,-sp].forEach(s=>{const rx=ux*Math.cos(s)-uy*Math.sin(s),ry=ux*Math.sin(s)+uy*Math.cos(s);
        ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+rx*34,py+ry*34);ctx.stroke();});
    });
    lab(ctx,'friction\ncones',cx+r+14,cy-r*0.4,C.green,9);
    // a test push arrow that gets resisted
    const p=saw(t,3);const pa=p*TAU;const ex=cx+Math.cos(pa)*(r+40),ey=cy+Math.sin(pa)*(r+40);
    arrow(ctx,ex,ey,cx+Math.cos(pa)*r,cy+Math.sin(pa)*r,C.coral,1.6);lab(ctx,'any push',ex+6,ey,C.coral,8.5);
    lab(ctx,'force closure: the cones together can cancel any wrench — the object cannot escape',14,h-12,C.mut);
  };

  /* 03 — CONTACT-RICH: physics flips between stick/slip/separate — non-smooth, no gradient through contact. */
  A.gr_contact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Peg-in-hole: the physics jumps between distinct contact modes',14,16,C.dim);
    const p=saw(t,5);
    // hole block on right
    const hx=w*0.62,hy=h*0.5,hw=90,hh=90;
    ctx.fillStyle=hexA(C.mut,0.25);ctx.fillRect(hx,hy-hh/2,hw,hh);
    const slotW=26;ctx.clearRect(hx,hy-hh/2,hw,(hh-slotW)/2);ctx.fillStyle=hexA(C.mut,0.25);ctx.fillRect(hx,hy-hh/2,hw,(hh-slotW)/2);
    ctx.fillStyle='#0C1218';ctx.fillRect(hx-1,hy-slotW/2,hw+2,slotW);
    // peg: approach, touch edge (stick), slide, insert
    const stages=['free','one-point contact','two-point / jammed','sliding in','seated'];
    const si=Math.min(4,Math.floor(p*5));
    const pegX=hx-90+si*22, pegY=hy+ (si===1?-8: si===2?4:0);
    rrect(ctx,pegX-40,pegY-11,44,22,3,C.cyan,hexA(C.cyan,0.15));
    // contact markers
    if(si===1)dot(ctx,hx-1,pegY-11,3.5,C.coral);
    if(si===2){dot(ctx,hx-1,pegY-11,3.5,C.coral);dot(ctx,hx-1,pegY+11,3.5,C.coral);}
    lab(ctx,'mode: '+stages[si],w*0.06,h*0.30,C.amber,10);
    lab(ctx,'each mode has different, non-smooth dynamics — you can\'t just follow a gradient through contact',14,h-12,C.mut);
  };

  /* 04 — DEXTEROUS: reorient in-hand with many joints — finger gaiting / regrasp without dropping. */
  A.gr_dexterous=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'In-hand reorientation: turn the object without ever dropping it',14,16,C.dim);
    const cx=w*0.5,cy=h*0.52,r=34;const p=saw(t,6);
    // rotating object (square)
    ctx.save();ctx.translate(cx,cy);ctx.rotate(p*TAU);
    rrect(ctx,-r*0.7,-r*0.7,r*1.4,r*1.4,5,C.amber,hexA(C.amber,0.15));
    // a marked corner to show rotation
    dot(ctx,r*0.5,r*0.5,4,C.coral);ctx.restore();
    // fingers around it, gaiting: 4 fingers, one lifts and repositions in turn
    for(let i=0;i<4;i++){const a=i*TAU/4 + Math.PI/4;
      const lifted=(Math.floor(p*4)%4===i);
      const rr=r+ (lifted? 26 + Math.sin(p*TAU*4)*4 : 12);
      const fx=cx+Math.cos(a)*rr,fy=cy+Math.sin(a)*rr;
      ctx.strokeStyle=lifted?hexA(C.mut,0.6):C.cyan;ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+40),cy+Math.sin(a)*(r+40));ctx.lineTo(fx,fy);ctx.stroke();
      dot(ctx,fx,fy,4,lifted?hexA(C.mut,0.7):C.green);}
    lab(ctx,'one finger lifts &\nre-places while the\nothers keep the grip',w*0.02,h*0.34,C.mut,8.5);
    lab(ctx,'finger gaiting: many joints + making/breaking contact re-orient the object step by step',14,h-12,C.mut);
  };

  /* 05 — LEARN: many valid grasps; copy a few demos → a policy that commits to one. */
  A.gr_learn=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A mug has many good grasps — a policy learns the distribution, then commits to one',14,16,C.dim);
    // object left with several candidate grasp arrows
    const ox=w*0.24,oy=h*0.52;ring(ctx,ox,oy,26,hexA(C.amber,0.9));lab(ctx,'mug',ox,oy,C.amber,9,'center');
    const cand=[-1.9,-1.1,-0.2,0.6,1.5];
    cand.forEach((a,i)=>{const px=ox+Math.cos(a)*26,py=oy+Math.sin(a)*26;
      ctx.strokeStyle=hexA(C.cyan,0.4);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(px+Math.cos(a)*24,py+Math.sin(a)*24);ctx.lineTo(px,py);ctx.stroke();});
    lab(ctx,'many valid grasps',ox-34,oy+40,C.mut,9);
    // demos -> policy box -> chosen grasp
    box(ctx,w*0.44,oy-14,w*0.16,28,'policy\n(from demos)',C.violet,hexA(C.violet,0.08));
    arrow(ctx,ox+52,oy,w*0.44,oy,C.cyan,1.4);
    const p=saw(t,3);const pick=cand[Math.floor(p*cand.length)];
    const gx=w*0.82,gy=oy;ring(ctx,gx,gy,26,hexA(C.amber,0.6));
    const px=gx+Math.cos(pick)*26,py=gy+Math.sin(pick)*26;
    ctx.strokeStyle=C.green;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(px+Math.cos(pick)*22,py+Math.sin(pick)*22);ctx.lineTo(px,py);ctx.stroke();dot(ctx,px,py,4,C.green);
    arrow(ctx,w*0.6,oy,gx-30,gy,C.violet,1.4);lab(ctx,'commit to one',w*0.63,oy-14,C.green,9);
    lab(ctx,'imitation learning copies a handful of human tries; the hard part is not averaging good grasps into a bad one',14,h-12,C.mut);
  };

  /* grf_synth — Grasp synthesis: score candidate contact pairs on a shape; QD filter keeps diverse ones */
  A.grf_synth=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Force-closure test: do the contact wrenches span all directions?',14,16,C.dim);
    const ox=w*0.28,oy=h*0.52,or_=36;
    ring(ctx,ox,oy,or_,C.amber);lab(ctx,'object',ox,oy,C.amber,9,'center');
    const p=saw(t,4);const nc=8;
    for(let i=0;i<nc;i++){const a1=(i/nc)*TAU,a2=a1+Math.PI+0.4;
      const x1=ox+Math.cos(a1)*or_,y1=oy+Math.sin(a1)*or_;
      const x2=ox+Math.cos(a2)*or_,y2=oy+Math.sin(a2)*or_;
      const active=(Math.floor(p*nc)===i);const passes=(i%3!==2);
      ctx.strokeStyle=hexA(active?(passes?C.green:C.coral):C.line,active?0.9:0.3);ctx.lineWidth=active?1.8:0.8;
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      if(active){dot(ctx,x1,y1,3.5,passes?C.green:C.coral);dot(ctx,x2,y2,3.5,passes?C.green:C.coral);
        lab(ctx,passes?'PASS':'FAIL',ox+or_+10,oy,passes?C.green:C.coral,9);}}
    const kx=w*0.63,ky=oy,kr=40;
    lab(ctx,'5 diverse kept',kx-28,ky-kr-14,C.mut,9);
    const kept=[[0.2,C.cyan],[1.3,C.violet],[2.7,C.green],[4.1,C.amber],[5.3,C.cyan2]];
    kept.forEach(function(a){const px=kx+Math.cos(a[0])*kr,py=ky+Math.sin(a[0])*kr;dot(ctx,px,py,4,a[1]);
      ctx.strokeStyle=hexA(a[1],0.5);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(kx,ky);ctx.stroke();});
    lab(ctx,'512 candidates sampled; force-closure test keeps 47; quality-diversity filter selects 5 diverse grasps',14,h-12,C.mut);
  };

  /* grf_detect — Grasp detection: depth frame → neural surface → 6-DoF grasp candidates → best pick */
  A.grf_detect=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'6-DoF grasp from one depth frame, even on transparent glass',14,16,C.dim);
    const p=saw(t,5);
    const dx=w*0.08,dy=h*0.22,dw=w*0.28,dh=h*0.52;
    rrect(ctx,dx,dy,dw,dh,8,C.line,hexA(C.cyan2,0.06));
    lab(ctx,'depth frame',dx+4,dy-10,C.mut,9);
    const gx=dx+dw*0.5,gy=dy+dh*0.5;
    ctx.strokeStyle=hexA(C.amber,0.5);ctx.lineWidth=1.2;ctx.save();ctx.setLineDash([3,4]);
    ctx.beginPath();ctx.arc(gx,gy-8,18,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    lab(ctx,'transparent\n(no depth)',gx-20,gy+24,C.coral,8.5);
    arrow(ctx,dx+dw+8,dy+dh*0.5,w*0.44,dy+dh*0.5,C.cyan,1.6);
    lab(ctx,'neural surface\nreconstruct',dx+dw+10,dy+dh*0.5-20,C.cyan,9);
    const rx=w*0.46,ry=dy,rw=w*0.22,rhh=dh;
    rrect(ctx,rx,ry,rw,rhh,8,C.cyan,hexA(C.cyan,0.06));
    ring(ctx,rx+rw*0.5,ry+rhh*0.5,20,C.cyan);
    lab(ctx,'completed\nshape',rx+4,ry+rhh+14,C.cyan,8.5);
    const cands=[[0.3,0.4],[0.6,0.6],[0.8,0.35],[0.5,0.78]];
    const best=Math.floor(p*4)%4;
    cands.forEach(function(c,i){const gx2=rx+rw*c[0]-rw*0.35,gy2=ry+rhh*c[1];
      const isBest=(i===best);const col=isBest?C.green:hexA(C.mut,0.5);
      arrow(ctx,gx2-10,gy2,gx2+10,gy2,col,isBest?2:1);
      if(isBest)lab(ctx,'best 6-DoF\np=0.87',gx2+12,gy2-8,C.green,8.5);});
    lab(ctx,'1,024 poses from completed surface; score + 20-step gradient refinement; 0.87 predicted success',14,h-12,C.mut);
  };

  /* grf_dext — Dexterous manipulation: 4-finger gait; one finger lifts & repositions each turn */
  A.grf_dext=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'In-hand rotation: one finger lifts & re-plants while the other three hold',14,16,C.dim);
    const cx=w*0.47,cy=h*0.5,r=32;
    const p=saw(t,5);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(p*TAU*0.5);
    rrect(ctx,-r*0.7,-r*0.7,r*1.4,r*1.4,4,C.amber,hexA(C.amber,0.12));
    dot(ctx,r*0.5,r*0.5,4,C.coral);
    ctx.restore();
    for(var i=0;i<4;i++){var a=i*TAU/4+Math.PI/4;
      var gait=Math.floor(p*4)%4;var lifted=(gait===i);
      var dist=r+(lifted?28+Math.sin(p*TAU*4)*5:10);
      var fx=cx+Math.cos(a)*dist,fy=cy+Math.sin(a)*dist;
      ctx.strokeStyle=lifted?hexA(C.mut,0.6):C.cyan;ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r+42),cy+Math.sin(a)*(r+42));ctx.lineTo(fx,fy);ctx.stroke();
      dot(ctx,fx,fy,4.5,lifted?hexA(C.coral,0.7):C.green);
      if(lifted)lab(ctx,'lift',fx+6,fy,C.coral,8.5);}
    lab(ctx,'gait '+(Math.floor(p*4)%4+1)+'/4',w*0.06,h*0.36,C.amber,9);
    lab(ctx,'AnyRotate: 256-pt tactile sim; 500M RL steps; 78% real success on cylinder; 83% with hierarchical policy',14,h-12,C.mut);
  };

  /* grf_bimanual — Two arms share a cloth; state diffusion coordinates joint future state */
  A.grf_bimanual=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bimanual cloth folding: diffuse joint 12-D future state; both arms act from it simultaneously',14,16,C.dim);
    const p=saw(t,5);
    const ox=w*0.5,oy=h*0.54,ow=110,oh=32;
    const fold=p>0.5?Math.sin((p-0.5)*Math.PI*2)*12:0;
    rrect(ctx,ox-ow/2,oy-oh/2-fold,ow,oh+fold,4,C.amber,hexA(C.amber,0.12));
    lab(ctx,'cloth',ox,oy,C.amber,9,'center');
    const lax=ox-ow/2-6,lay=oy-oh/2;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(w*0.08,h*0.18);ctx.lineTo(lax,lay);ctx.stroke();
    dot(ctx,lax,lay,5,C.cyan);lab(ctx,'arm L',w*0.06,h*0.15,C.cyan,9);
    const rax=ox+ow/2+6,ray=oy-oh/2;
    ctx.strokeStyle=C.violet;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(w*0.88,h*0.18);ctx.lineTo(rax,ray);ctx.stroke();
    dot(ctx,rax,ray,5,C.violet);lab(ctx,'arm R',w*0.83,h*0.15,C.violet,9);
    box(ctx,ox-46,h*0.07,92,28,'state diffusion\n12-D joint state',C.green,hexA(C.green,0.07));
    arrow(ctx,lax,lay-10,ox-22,h*0.07+28,hexA(C.cyan,0.5),1.2);
    arrow(ctx,rax,ray-10,ox+22,h*0.07+28,hexA(C.violet,0.5),1.2);
    arrow(ctx,ox-22,h*0.07+28,lax,lay-10,hexA(C.green,0.5),1.2);
    arrow(ctx,ox+22,h*0.07+28,rax,ray-10,hexA(C.green,0.5),1.2);
    lab(ctx,'79% bimanual vs 38% single-arm; 50 DDPM steps at 20 Hz; inverse dynamics to joint torques',14,h-12,C.mut);
  };

  /* grf_force — Force-controlled insertion: mode detection + compliance switch in <20 ms */
  A.grf_force=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'USB insertion: detect jam vs slide; switch compliance in <20 ms',14,16,C.dim);
    const p=saw(t,4);
    const modes=['free','jammed','sliding','seated'];
    const si=Math.min(3,Math.floor(p*4));
    const portX=w*0.68,portY=h*0.5,portW=80,portH=30;
    ctx.fillStyle=hexA(C.mut,0.22);ctx.fillRect(portX,portY-portH/2,portW,portH);
    ctx.fillStyle='#0C1218';ctx.fillRect(portX,portY-10,portW,20);
    const travels=[0.32,0.52,0.64,0.86];
    const travelFrac=travels[si];
    const pxP=w*0.10+travelFrac*(portX-w*0.10-40);
    const jitterY=(si===1)?6:0;
    rrect(ctx,pxP,portY-9+jitterY,44,18,3,C.cyan,hexA(C.cyan,0.15));
    if(si===1){arrow(ctx,pxP+22,portY+32,pxP+22,portY+16,C.coral,2);lab(ctx,'Fz>8N\njam!',pxP+26,portY+40,C.coral,9);}
    if(si===2){dot(ctx,pxP+43,portY,3,C.green);lab(ctx,'Fxy<μFz\nsliding',pxP+8,portY-22,C.green,8.5);}
    const modeColors=[C.mut,C.coral,C.green,C.cyan];
    lab(ctx,'mode: '+modes[si],w*0.06,h*0.27,modeColors[si],10);
    const Kz=[800,200,400,800][si];
    const barW=(Kz/800)*90;
    rrect(ctx,w*0.06,h*0.68,barW,12,3,null,hexA(C.cyan,0.6));
    lab(ctx,'Kz='+Kz+' N/m',w*0.06,h*0.83,C.cyan,9);
    lab(ctx,'91% success with force control vs 12% position-only; jam→Kz 800→200 N/m within 20ms',14,h-12,C.mut);
  };

  /* grf_deform — Deformable cloth: GNN dynamics + CEM over 256 action candidates */
  A.grf_deform=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Flatten cloth: GNN predicts next shape from pick-place; CEM optimises 256 candidates',14,16,C.dim);
    const p=saw(t,5);
    const cx=w*0.24,cy=h*0.52,cw=100;
    for(var i=0;i<12;i++){var x=cx-cw/2+i*(cw/11);var bump=(p<0.5?Math.sin(i*1.1)*10:Math.sin(i*1.1)*3);
      dot(ctx,x,cy+bump,3.5,hexA(C.amber,0.4+Math.abs(bump)/20));}
    lab(ctx,p<0.5?'crumpled':'flatter',cx-20,cy+42,C.amber,9);
    const midX=w*0.46;
    arrow(ctx,cx+cw/2+8,cy,midX,cy,C.violet,1.6);
    box(ctx,midX,cy-16,w*0.14,32,'GNN\ndynamics',C.violet,hexA(C.violet,0.07));
    arrow(ctx,midX+w*0.14,cy,w*0.68,cy,C.green,1.6);
    const rx=w*0.72,ry=cy;
    for(var j=0;j<12;j++){var x2=rx-46+j*(92/11);var bump2=(p<0.5?Math.sin(j*1.1)*3:Math.sin(j*1.1)*1.4);dot(ctx,x2,ry+bump2,3,hexA(C.green,0.6));}
    lab(ctx,'predicted\nnext shape',rx-28,ry+36,C.green,8.5);
    for(var k=0;k<5;k++){var ang=-0.8+k*0.4;var best=(k===2);
      arrow(ctx,cx-30+k*12,cy-38,cx-30+k*12+Math.cos(ang)*18,cy-38+Math.sin(ang)*18,best?C.green:hexA(C.mut,0.4),best?1.8:0.8);}
    lab(ctx,'GNN trained on 40k rollouts; CEM 256×5 iters; cost=cloth area >5mm high; 74% vs 22% random',14,h-12,C.mut);
  };

  /* grf_nonpreh — Non-prehensile pushing: limit-surface model + A* finds 3-push path around wall */
  A.grf_nonpreh=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Push planning: quasi-static friction + A* on grid; 3 pushes route box past an obstacle',14,16,C.dim);
    const p=saw(t,5);
    ctx.fillStyle=hexA(C.mut,0.07);ctx.fillRect(w*0.08,h*0.2,w*0.84,h*0.62);
    ctx.fillStyle=hexA(C.coral,0.22);ctx.fillRect(w*0.44,h*0.26,w*0.06,h*0.36);
    lab(ctx,'wall',w*0.46,h*0.18,C.coral,9);
    const wp=[[w*0.18,h*0.7],[w*0.35,h*0.36],[w*0.58,h*0.36],[w*0.77,h*0.56]];
    const curPush=Math.min(3,Math.floor(p*3+0.05));
    for(var i=0;i<curPush;i++){arrow(ctx,wp[i][0],wp[i][1],wp[i+1][0],wp[i+1][1],C.cyan,1.8);
      lab(ctx,'push '+(i+1),wp[i][0]+6,wp[i][1]-12,C.cyan,8.5);}
    const bprog=p*3,bseg=Math.min(2,Math.floor(bprog)),bf=Math.min(1,bprog-bseg);
    const bx=wp[bseg][0]+(wp[bseg+1][0]-wp[bseg][0])*bf;
    const by=wp[bseg][1]+(wp[bseg+1][1]-wp[bseg][1])*bf;
    rrect(ctx,bx-14,by-14,28,28,4,C.amber,hexA(C.amber,0.25));
    rrect(ctx,wp[3][0]-14,wp[3][1]-14,28,28,4,hexA(C.green,0.5),hexA(C.green,0.08));
    lab(ctx,'target',wp[3][0]+16,wp[3][1],C.green,9);
    lab(ctx,'μ=0.35 limit-surface model; A* on 4cm grid; MPPI corrects ±0.8cm lateral drift; 2.1cm final error',14,h-12,C.mut);
  };

  /* grf_tool — Tool use: peeler moves along cucumber; admittance controller holds 1.2 N contact force */
  A.grf_tool=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tool use: copy the contact force profile (1.2 N), not the trajectory',14,16,C.dim);
    const p=saw(t,5);
    const vegy=h*0.58;
    rrect(ctx,w*0.10,vegy-13,w*0.80,26,13,C.green,hexA(C.green,0.12));
    lab(ctx,'cucumber',w*0.5,vegy,hexA(C.green,0.8),9,'center');
    const strokeX=w*0.14+p*w*0.68;const gy=vegy-42;
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(strokeX,h*0.14);ctx.lineTo(strokeX,gy);ctx.stroke();
    rrect(ctx,strokeX-11,gy-8,22,18,3,C.cyan,hexA(C.cyan,0.2));
    dot(ctx,strokeX,vegy-13,4,C.coral);
    const forceN=1.2+Math.sin(p*TAU*3)*0.14;
    const barH=forceN*26;
    ctx.fillStyle=hexA(C.cyan,0.6);ctx.fillRect(w*0.04,h*0.68-barH,12,barH);
    ctx.strokeStyle=hexA(C.amber,0.8);ctx.lineWidth=1.2;ctx.save();ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(w*0.02,h*0.68-1.2*26);ctx.lineTo(w*0.20,h*0.68-1.2*26);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
    lab(ctx,'Fz',w*0.02,h*0.68+10,C.cyan,9);lab(ctx,'1.2N target',w*0.20,h*0.68-1.2*26-2,C.amber,8.5);
    lab(ctx,'optical tactile captures contact map; admittance control at 1.2N; 12 strokes peel in 28s',14,h-12,C.mut);
  };

  /* grf_pickplace — Pick-and-place rearrangement: dependency graph → clear blockers first */
  A.grf_pickplace=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Rearrangement: build a dependency graph, clear blockers first; ORLA* is 25% faster',14,16,C.dim);
    const p=saw(t,5);
    const shelfY=h*0.22,shelfX=w*0.60,shelfW=w*0.32;
    rrect(ctx,shelfX,shelfY,shelfW,h*0.56,5,hexA(C.mut,0.35),null);
    lab(ctx,'shelf',shelfX+4,shelfY-12,C.mut,8.5);
    for(var si=0;si<3;si++){rrect(ctx,shelfX+10+si*34,shelfY+10,28,22,3,hexA(C.green,0.5),hexA(C.green,0.07));
      lab(ctx,String.fromCharCode(65+si),shelfX+24+si*34,shelfY+21,C.green,8.5,'center');}
    const binX=w*0.06,binY=h*0.22,binW=w*0.40;
    rrect(ctx,binX,binY,binW,h*0.56,5,hexA(C.mut,0.35),null);
    lab(ctx,'bin',binX+4,binY-12,C.mut,8.5);
    var objs=[['A',0.22,0.42,C.amber],['B',0.52,0.56,C.violet],['C',0.78,0.42,C.cyan],
              ['x',0.22,0.72,hexA(C.mut,0.7)],['y',0.58,0.72,hexA(C.mut,0.7)]];
    var pickSeq=['x','y','A','B','C'];
    var curPick=Math.min(pickSeq.length,Math.floor(p*pickSeq.length+0.1));
    objs.forEach(function(o){var pickedIdx=pickSeq.indexOf(o[0]);var picked=pickedIdx<curPick;
      if(!picked){var ox2=binX+binW*o[1],oy2=binY+h*0.56*o[2];rrect(ctx,ox2-12,oy2-10,24,20,3,o[3],hexA(o[3],0.2));
        lab(ctx,o[0],ox2,oy2,o[3],9,'center');}});
    var stepLbl=curPick>0?'pick '+pickSeq[Math.min(curPick-1,4)]:'plan';
    lab(ctx,'step: '+stepLbl,w*0.06,h*0.84,C.amber,9);
    lab(ctx,'15 picks vs 18 naive; 25% faster; Match Policy registers actions to demos in 80ms',14,h-12,C.mut);
  };

  /* grf_afford — Affordance grasping: VLM reasons from task → part → contact points */
  A.grf_afford=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'"Hand the scissors over" → grip the blade, not the handle (88% correct vs 43%)',14,16,C.dim);
    const p=saw(t,4);
    const sx=w*0.48,sy=h*0.5;
    rrect(ctx,sx-10,sy+8,20,48,6,hexA(C.amber,0.9),hexA(C.amber,0.15));
    lab(ctx,'handle',sx-28,sy+54,C.amber,8.5);
    rrect(ctx,sx-8,sy-50,16,54,3,hexA(C.cyan,0.9),hexA(C.cyan,0.12));
    lab(ctx,'blade',sx-25,sy-55,C.cyan,8.5);
    box(ctx,w*0.06,h*0.32,w*0.24,40,'VLM: grip blade\nfor safe handover',C.violet,hexA(C.violet,0.07));
    arrow(ctx,w*0.06+w*0.24,h*0.32+20,sx-10,sy-24,hexA(C.violet,0.6),1.4);
    const showCorrect=(p>0.3);
    if(showCorrect){dot(ctx,sx-9,sy-30,4.5,C.green);dot(ctx,sx+8,sy-30,4.5,C.green);
      lab(ctx,'correct grip',sx+12,sy-30,C.green,9);}
    ctx.strokeStyle=hexA(C.coral,0.7);ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(sx-12,sy+18);ctx.lineTo(sx+12,sy+48);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+12,sy+18);ctx.lineTo(sx-12,sy+48);ctx.stroke();
    lab(ctx,'wrong',sx+14,sy+34,C.coral,9);
    lab(ctx,'OWL-ViT masks the blade (84% IoU); 256 GraspNet poses filtered to blade contact; 88% correct part',14,h-12,C.mut);
  };

  /* grf_clutter — Cluttered bin: shape completion + obstruction graph → clear-first sequence */
  A.grf_clutter=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bin clutter: complete occluded shapes, find what blocks the target, clear it first',14,16,C.dim);
    const p=saw(t,5);
    rrect(ctx,w*0.06,h*0.2,w*0.42,h*0.64,6,hexA(C.mut,0.35),null);
    lab(ctx,'bin',w*0.07,h*0.17,C.mut,8.5);
    const spray=[w*0.20,h*0.70];const blkA=[w*0.15,h*0.44];const blkB=[w*0.33,h*0.48];
    rrect(ctx,spray[0]-8,spray[1]-16,16,28,3,hexA(C.cyan,0.6),hexA(C.cyan,0.12));
    lab(ctx,'target',spray[0]+10,spray[1],C.cyan,8.5);
    rrect(ctx,blkA[0]-14,blkA[1]-14,28,28,4,hexA(C.amber,0.7),hexA(C.amber,0.15));
    lab(ctx,'A',blkA[0],blkA[1],C.amber,9,'center');
    rrect(ctx,blkB[0]-14,blkB[1]-14,28,28,4,hexA(C.violet,0.7),hexA(C.violet,0.15));
    lab(ctx,'B',blkB[0],blkB[1],C.violet,9,'center');
    const cpx=w*0.54,cpy=h*0.2,cpw=w*0.38,cph=h*0.38;
    rrect(ctx,cpx,cpy,cpw,cph,6,hexA(C.cyan,0.35),hexA(C.cyan,0.04));
    lab(ctx,'shape completion',cpx+4,cpy-12,C.cyan,8.5);
    for(var i=0;i<8;i++){var a=i*TAU/8;var partial=(i%3!==1);if(partial){dot(ctx,cpx+cpw*0.32+Math.cos(a)*20,cpy+cph*0.5+Math.sin(a)*16,2.5,C.cyan);}}
    for(var j=0;j<16;j++){var a2=j*TAU/16;dot(ctx,cpx+cpw*0.74+Math.cos(a2)*16,cpy+cph*0.5+Math.sin(a2)*12,2,hexA(C.cyan,0.45));}
    var stage=Math.floor(p*3);
    if(stage>=1){rrect(ctx,blkA[0]-14,blkA[1]-14,28,28,4,C.green,hexA(C.green,0.15));lab(ctx,'1st',blkA[0],blkA[1]-18,C.green,8.5,'center');}
    if(stage>=2){rrect(ctx,blkB[0]-14,blkB[1]-14,28,28,4,C.green,hexA(C.green,0.15));lab(ctx,'2nd',blkB[0],blkB[1]-18,C.green,8.5,'center');}
    if(stage>=3){rrect(ctx,spray[0]-8,spray[1]-16,16,28,3,C.green,hexA(C.green,0.2));lab(ctx,'pick!',spray[0]+10,spray[1]-10,C.green,8.5);}
    lab(ctx,'82% success vs 54% (no amodal); boundary refinement + per-point shape-completion uncertainty',14,h-12,C.mut);
  };

  /* grf_policy — Diffusion policy: multimodal action distribution → commit to one mode */
  A.grf_policy=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Diffusion policy: hold all valid action modes, then commit to one without averaging',14,16,C.dim);
    const p=saw(t,5);
    const mx=w*0.50,my=h*0.56;
    ring(ctx,mx,my,22,hexA(C.amber,0.85));lab(ctx,'mug',mx,my,C.amber,9,'center');
    var modes=[[-0.55,-0.68],[-0.35,-0.76],[0,-0.80],[0.35,-0.76],[0.55,-0.68]];
    modes.forEach(function(m){var tx=mx+m[0]*58,ty=my+m[1]*38;
      var ang=Math.atan2(m[1],m[0]);
      ctx.strokeStyle=hexA(C.cyan,0.28);ctx.lineWidth=1;ctx.save();ctx.setLineDash([2,4]);
      ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(mx+Math.cos(ang)*22,my+Math.sin(ang)*22);
      ctx.stroke();ctx.setLineDash([]);ctx.restore();dot(ctx,tx,ty,2.5,hexA(C.cyan,0.28));});
    var avg_x=mx,avg_y=my-64;
    dot(ctx,avg_x,avg_y,4,C.coral);lab(ctx,'mean =\nempty air',avg_x+8,avg_y-4,C.coral,8.5);
    var mi=Math.floor(p*5)%5;var chosen=modes[mi];
    var chx=mx+chosen[0]*58,chy=my+chosen[1]*38;
    var chang=Math.atan2(chosen[1],chosen[0]);
    ctx.strokeStyle=C.green;ctx.lineWidth=2.4;
    ctx.beginPath();ctx.moveTo(chx,chy);ctx.lineTo(mx+Math.cos(chang)*22,my+Math.sin(chang)*22);ctx.stroke();
    dot(ctx,chx,chy,5,C.green);lab(ctx,'committed',chx+8,chy-6,C.green,8.5);
    box(ctx,w*0.06,h*0.76,w*0.22,26,'noise→denoise\n100 DDPM steps',C.violet,hexA(C.violet,0.07));
    arrow(ctx,w*0.06+w*0.22,h*0.76+13,mx-22,my-10,hexA(C.violet,0.4),1.2);
    lab(ctx,'DiT-B; 50 demos; 84% seen mugs; REACH recovery on OOD (cosine dist >0.7 from train)',14,h-12,C.mut);
  };

  /* grf_articulated — Articulated object: infer joint axis from RGB; plan screw-motion along it */
  A.grf_articulated=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Articulated objects: infer joint type + axis from one image; plan along the inferred axis',14,16,C.dim);
    const p=saw(t,5);
    const bx=w*0.28,by=h*0.64,bw=110,bh=16;
    rrect(ctx,bx,by,bw,bh,4,C.mut,hexA(C.mut,0.15));
    const maxAng=-1.30;const ang=p*maxAng;
    const hx=bx+bw*0.5,hy=by;
    ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);
    rrect(ctx,-bw*0.5,-bh-66,bw,66,4,C.cyan,hexA(C.cyan,0.12));
    lab(ctx,'screen',0,-bh-34,C.cyan,9,'center');
    ctx.restore();
    dot(ctx,hx,hy,5,C.amber);
    ctx.strokeStyle=hexA(C.amber,0.7);ctx.lineWidth=1.4;ctx.save();ctx.setLineDash([3,4]);
    ctx.beginPath();ctx.moveTo(bx-10,by);ctx.lineTo(bx+bw+10,by);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    lab(ctx,'hinge axis',bx+bw+12,by-6,C.amber,8.5);
    box(ctx,w*0.04,h*0.20,w*0.20,38,'VLM: revolute\naxis at hinge\n0°–135°',C.violet,hexA(C.violet,0.07));
    arrow(ctx,w*0.04+w*0.20,h*0.20+19,bx-12,by,hexA(C.violet,0.5),1.2);
    var degOpen=Math.round(-ang*180/Math.PI);
    lab(ctx,'open: '+degOpen+'°',bx+bw+12,by+14,C.cyan,8.5);
    lab(ctx,'SPARK: VLM→URDF in 50 Adam steps; axis error 3.2°; 74% door-open on real robot',14,h-12,C.mut);
  };

  /* grf_hoi — Hand-object reconstruction: noisy per-frame pose + physics refine removes penetration */
  A.grf_hoi=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'HOI reconstruction: noisy HaMeR pose + MLLM contact + PAD-Hand physics → plausible grip',14,16,C.dim);
    const p=saw(t,5);
    const ox=w*0.50,oy=h*0.52;
    ring(ctx,ox,oy,26,hexA(C.amber,0.85));lab(ctx,'mug',ox,oy,C.amber,9,'center');
    const wx=ox+50,wy=oy+38;
    var fingers=[[-35,-58],[-18,-66],[2,-68],[22,-62],[40,-50]];
    var refined=(p>0.5);
    fingers.forEach(function(fd,i){var jitter=refined?0:(((i*7+3)%5)-2)*8;
      var fx=wx+fd[0]+jitter,fy=wy+fd[1];
      var col=refined?C.cyan:hexA(C.coral,0.7);
      ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(fx,fy);ctx.stroke();
      dot(ctx,fx,fy,3.5,col);
      if(refined&&Math.hypot(fx-ox,fy-oy)<32)dot(ctx,fx,fy,4.5,C.green);});
    dot(ctx,wx,wy,5.5,C.ink);
    if(!refined){lab(ctx,'noisy (HaMeR)\n14.1mm avg error',ox-72,h*0.24,C.coral,8.5);}
    else{lab(ctx,'physics-refined\n8.3mm avg error',ox-72,h*0.24,C.green,8.5);}
    lab(ctx,'frame '+(Math.round(p*90))+'/90',w*0.06,h*0.86,C.mut,9);
    lab(ctx,'ArtHOI: MLLM contact labels per finger; PAD-Hand Euler-Lagrange; zero penetrations after refine',14,h-12,C.mut);
  };

  /* grf_sim2real — Sim-to-real: domain randomisation + teacher-student; real success bars */
  A.grf_sim2real=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sim-to-real: randomise sim + teacher-student distillation → 83% real, zero fine-tune',14,16,C.dim);
    const p=saw(t,5);
    const simX=w*0.06,simY=h*0.22,simW=w*0.36,simH=h*0.50;
    rrect(ctx,simX,simY,simW,simH,8,C.violet,hexA(C.violet,0.06));
    lab(ctx,'SIM (100M steps)',simX+4,simY-12,C.violet,9);
    const dsx=simX+simW*0.62,dsy=simY+simH*0.5;
    rrect(ctx,dsx-8,simY+10,16,simH-20,4,hexA(C.mut,0.4),hexA(C.mut,0.12));
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(simX+simW*0.22,simY+10);ctx.lineTo(dsx-8,dsy);ctx.stroke();
    lab(ctx,'μ∈[0.3,1.2]\ndelay∈[0,20ms]\nlighting±40%',simX+4,simY+simH*0.56,hexA(C.violet,0.8),8.5);
    arrow(ctx,simX+simW+8,simY+simH*0.35,w*0.52,simY+simH*0.35,C.green,1.6);
    box(ctx,w*0.44,simY+simH*0.20,w*0.12,30,'teacher\n→student',C.green,hexA(C.green,0.07));
    const realX=w*0.58,realY=simY,realW=w*0.35;
    rrect(ctx,realX,realY,realW,simH,8,C.cyan,hexA(C.cyan,0.06));
    lab(ctx,'REAL (zero fine-tune)',realX+4,realY-12,C.cyan,9);
    var bars2=[[0.83,C.green,'83%\nwith DR'],[0.41,C.coral,'41%\nno DR']];
    bars2.forEach(function(b,i){var bx=realX+12+i*56,bh2=b[0]*simH*0.68;
      rrect(ctx,bx,realY+simH-bh2-10,44,bh2,3,null,hexA(b[1],0.7));
      lab(ctx,b[2],bx+4,realY+simH+6,b[1],8.5);});
    lab(ctx,'stage-reset GRPO + delta-action teacher-student; lever-handle variant drops to 61%; 5 demos→79%',14,h-12,C.mut);
  };


  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.granim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-granim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
