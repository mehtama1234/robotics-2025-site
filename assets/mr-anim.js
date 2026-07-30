/* mr-anim.js — first-principles mechanism animators for the Multi-Robot Systems explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-mranim="name". Self-contained boot. */
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

  /* 01 — WHY TEAMS: one robot is slow & fragile; many cover faster and survive a failure — but must coordinate. */
  A.mr_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One robot is slow and fragile; a team covers faster and survives a failure',14,16,C.dim);
    const p=saw(t,4);
    // left: one robot, small coverage
    const lx=w*0.08,ly=h*0.3,gw=w*0.32,gh=h*0.44;rrect(ctx,lx,ly,gw,gh,6,C.line,null);lab(ctx,'one robot',lx,ly-8,C.mut,10);
    ctx.fillStyle=hexA(C.cyan,0.18);ctx.fillRect(lx,ly,gw*0.35*p,gh);
    const rx1=lx+gw*0.35*p;dot(ctx,rx1,ly+gh*0.5,5,C.cyan);lab(ctx,'slow, single point of failure',lx,ly+gh+14,C.mut,9.5);
    // right: 4 robots, big coverage, one failed
    const mx=w*0.56,my=ly;rrect(ctx,mx,my,gw,gh,6,C.line,null);lab(ctx,'a team',mx,my-8,C.green,10);
    const cols=['#6FCf7f','#38E1CF','#9C8CFF','#F5A65B'];
    for(let k=0;k<4;k++){const fy=my+gh*(k+0.5)/4;const failed=(k===2);
      ctx.fillStyle=hexA(failed?C.coral:cols[k],failed?0.06:0.18);ctx.fillRect(mx,my+gh*k/4,failed?gw*0.15:gw*(0.55+0.3*p),gh/4);
      dot(ctx,mx+(failed?gw*0.15:gw*(0.55+0.3*p)),fy,4,failed?hexA(C.coral,0.6):cols[k]);
      if(failed)lab(ctx,'✗ failed — others cover',mx+gw*0.18,fy,C.coral,8.5);}
    lab(ctx,'coverage · parallel speed · redundancy — the cost is coordination',14,h-12,C.mut);
  };

  /* 02 — MAPF: plan N collision-free paths through shared space; cost explodes with N. */
  A.mr_mapf=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Multi-agent path finding: N robots, shared space, zero collisions',14,16,C.dim);
    const cx=w*0.5,cy=h*0.54,S=Math.min(w*0.5,h*0.7)*0.58,d=S*0.13;
    // grid
    ctx.strokeStyle=hexA(C.mut,0.25);for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx+i*S/3,cy-S);ctx.lineTo(cx+i*S/3,cy+S);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-S,cy+i*S/3);ctx.lineTo(cx+S,cy+i*S/3);ctx.stroke();}
    // 4 agents crossing; each lane offset off-center + staggered in time so paths never share a cell
    const ag=[[cx-S,cy-d,cx+S,cy-d,C.cyan],[cx+S,cy+d,cx-S,cy+d,C.violet],[cx-d,cy-S,cx-d,cy+S,C.amber],[cx+d,cy+S,cx+d,cy-S,C.green]];
    const p=saw(t,4);
    ag.forEach((a,i)=>{ring(ctx,a[2],a[3],7,hexA(a[4],0.6));// goal
      const ph=(p + i*0.25)%1;const x=a[0]+(a[2]-a[0])*ph,y=a[1]+(a[3]-a[1])*ph;
      ctx.strokeStyle=hexA(a[4],0.35);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(a[2],a[3]);ctx.stroke();
      dot(ctx,x,y,6,a[4]);});
    lab(ctx,'each ○ is a goal · each ● a robot',14,32,C.mut,9.5);
    lab(ctx,'the search space grows exponentially with the number of robots — the core hardness',14,h-12,C.mut);
  };

  /* 03 — CENTRALIZED vs DECENTRALIZED: one brain (optimal, fragile) vs local decisions + comms (scalable). */
  A.mr_central=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Who decides? One central brain, or every robot from local info',14,16,C.dim);
    // centralized (top): star from a planner
    const px=w*0.5,py=h*0.34,bw=w*0.15;box(ctx,px-bw/2,py-14,bw,28,'central planner',C.coral);
    for(let k=0;k<6;k++){const a=(k/6)*TAU - Math.PI/2;const x=px+Math.cos(a)*w*0.26,y=py+Math.sin(a)*52;arrow(ctx,px+Math.cos(a)*bw*0.5,py+Math.sin(a)*16,x,y,hexA(C.coral,0.55),1.2);dot(ctx,x,y,5,C.coral);}
    lab(ctx,'centralized: optimal, but a single point of failure & doesn\'t scale',w*0.02,py+64,C.mut,9.5);
    // decentralized (bottom): peer robots with local sensing + comms links
    const dy=h*0.78;const xs=[w*0.16,w*0.34,w*0.52,w*0.7,w*0.86];
    xs.forEach((x,i)=>{ring(ctx,x,dy,18,hexA(C.green,0.3));dot(ctx,x,dy,5,C.green);if(i<xs.length-1){ctx.strokeStyle=hexA(C.cyan,0.7);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(x+6,dy);ctx.lineTo(xs[i+1]-6,dy);ctx.stroke();ctx.setLineDash([]);}});
    lab(ctx,'decentralized: each robot decides from its own view + messages to neighbors',w*0.02,dy-30,C.green,9.5);
    lab(ctx,'scales to many and survives failures — at some cost in global optimality',14,h-12,C.mut);
  };

  /* 04 — COOPERATIVE PERCEPTION: B sees what A can't; sharing beats occlusion & range. */
  A.mr_coop=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Cooperative perception: share what you see to see past occlusions',14,16,C.dim);
    const ax=w*0.16,ay=h*0.5;dot(ctx,ax,ay,7,C.cyan);lab(ctx,'robot A',ax-16,ay+20,C.cyan,9.5);
    // occluder
    const ox=w*0.44;ctx.fillStyle=hexA(C.mut,0.35);ctx.fillRect(ox-10,ay-40,20,80);lab(ctx,'wall',ox-10,ay-48,C.mut,9);
    // hidden target
    const tx=w*0.62,ty=ay+18;dot(ctx,tx,ty,7,C.amber);lab(ctx,'target (hidden from A)',tx-30,ty+20,C.amber,9.5);
    // A's blocked line of sight
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ox-12,ay-6);ctx.stroke();ctx.setLineDash([]);lab(ctx,'blocked ✗',ox-70,ay-24,C.coral,9);
    // robot B sees it and shares
    const bx=w*0.7,by=h*0.24;dot(ctx,bx,by,7,C.violet);lab(ctx,'robot B',bx+8,by,C.violet,9.5);
    ctx.strokeStyle=hexA(C.violet,0.6);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(tx,ty);ctx.stroke();
    const p=saw(t,2);const mx=bx+(ax-bx)*p,my=by+(ay-by)*p;dot(ctx,mx,my,3,C.green);
    arrow(ctx,bx-6,by+6,ax+8,ay-8,hexA(C.green,0.7),1.4);lab(ctx,'shares what it sees →',w*0.32,by+2,C.green,9.5);
    lab(ctx,'one sensor is limited by occlusion & range; a team fuses views into one complete scene',14,h-12,C.mut);
  };

  /* 05 — SWARM: simple local rules -> emergent global flock; scales to hundreds. */
  A.mr_swarm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Swarms: simple local rules → emergent global behavior, at massive scale',14,16,C.dim);
    // a flock moving right, aligned
    const N=40;const base=w*0.15+saw(t,6)*w*0.5;
    for(let i=0;i<N;i++){const a=(i*2.399963);const r=Math.min(w,h)*0.22*Math.sqrt((i%N)/N);
      const x=base+Math.cos(a)*r,y=h*0.52+Math.sin(a)*r*0.7 + Math.sin(t*2+i)*2;
      const col=[C.cyan,C.violet,C.green,C.amber][i%4];
      // little arrow pointing right (aligned)
      ctx.save();ctx.translate(x,y);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(5,0);ctx.lineTo(-4,3);ctx.closePath();ctx.fill();ctx.restore();}
    // rule chips
    ['separation: don\'t crowd','alignment: match heading','cohesion: stay together'].forEach((s,i)=>lab(ctx,'• '+s,14,h*0.32+i*16,C.mut,9.5));
    lab(ctx,'no leader, no central plan — global flocking emerges from three local rules per robot',14,h-12,C.mut);
  };

  /* ---- per-family animators (wave 2) ---- */

  /* mrf_mapf — CBS conflict tree: two robots collide at a cell, CBS branches by constraining one, re-plans cheaply */
  A.mrf_mapf=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'CBS: plan freely, detect the first collision, branch to resolve it',14,16,C.dim);
    const COLS=7,ROWS=5,cw=Math.floor((w*0.55)/COLS),ch=Math.floor((h*0.62)/ROWS);
    const ox=Math.floor(w*0.05),oy=Math.floor(h*0.2);
    // draw grid
    ctx.strokeStyle=hexA(C.line,0.8);ctx.lineWidth=1;
    for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(ox,oy+r*ch);ctx.lineTo(ox+COLS*cw,oy+r*ch);ctx.stroke();}
    for(let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(ox+c*cw,oy);ctx.lineTo(ox+c*cw,oy+ROWS*ch);ctx.stroke();}
    // robot A: moves right across row 2
    const p=saw(t,4);
    const axc=p*6,ayc=1.5;
    // robot B: moves up across col 4
    const bxc=4.5,byc=4-p*3.5;
    const ax=ox+axc*cw,ay=oy+ayc*ch;
    const bx=ox+bxc*cw,by=oy+byc*ch;
    // paths
    ctx.strokeStyle=hexA(C.cyan,0.35);ctx.lineWidth=2;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(ox,oy+ayc*ch);ctx.lineTo(ox+COLS*cw,oy+ayc*ch);ctx.stroke();
    ctx.strokeStyle=hexA(C.violet,0.35);
    ctx.beginPath();ctx.moveTo(ox+bxc*cw,oy+ROWS*ch);ctx.lineTo(ox+bxc*cw,oy);ctx.stroke();
    ctx.setLineDash([]);
    // goals
    ring(ctx,ox+COLS*cw-cw*0.5,oy+ayc*ch,7,hexA(C.cyan,0.7));
    ring(ctx,ox+bxc*cw,oy+ch*0.5,7,hexA(C.violet,0.7));
    // conflict cell highlight — they share cell (4,1) roughly when p~0.6
    const conflict=Math.abs(axc-4.5)<0.9&&Math.abs(byc-1.5)<0.9;
    if(conflict){ctx.fillStyle=hexA(C.coral,0.28);ctx.fillRect(ox+4*cw,oy+1*ch,cw,ch);
      lab(ctx,'conflict!',ox+4*cw+2,oy+1*ch-10,C.coral,9.5);}
    dot(ctx,ax,ay,7,C.cyan);
    dot(ctx,bx,by,7,C.violet);
    lab(ctx,'● A (cyan) · ● B (violet) · paths cross at cell (4,1)',ox,oy+ROWS*ch+14,C.mut,9.5);
    // CBS tree on the right — keep within canvas
    const tx=w*0.62,ty=h*0.28,tbw=w*0.24;
    lab(ctx,'CBS conflict tree',tx,ty-12,C.dim,9.5);
    box(ctx,tx,ty,tbw,24,'joint plan (free)',C.mut,hexA(C.mut,0.06));
    // two branches — each half of tbw, side by side
    const cbw=tbw*0.47,bty=ty+50;
    const bl=tx,br=tx+tbw-cbw;
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(tx+tbw*0.5,ty+24);ctx.lineTo(bl+cbw*0.5,bty);ctx.stroke();
    ctx.beginPath();ctx.moveTo(tx+tbw*0.5,ty+24);ctx.lineTo(br+cbw*0.5,bty);ctx.stroke();
    box(ctx,bl,bty,cbw,22,'constrain A',C.cyan,hexA(C.cyan,0.06));
    box(ctx,br,bty,cbw,22,'constrain B',C.violet,hexA(C.violet,0.06));
    // animate highlight of cheaper branch
    const blink=Math.sin(t*2)>0;
    if(blink)rrect(ctx,bl,bty,cbw,22,5,C.green,hexA(C.green,0.1));
    lab(ctx,'pick cheapest',bl+cbw*0.5,bty+34,C.green,9,'center');
    lab(ctx,'only the conflict is resolved — not the whole joint space',14,h-12,C.mut);
  };

  /* mrf_task_alloc — auction: auctioneer broadcasts job, robots bid their cost, winner is assigned */
  A.mrf_task_alloc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Task auction: jobs broadcast, robots bid their cost, cheapest wins',14,16,C.dim);
    const phase=saw(t,5);
    // robots on left
    const robots=[{x:w*0.1,y:h*0.28,col:C.cyan,lbl:'R1',bid:'18s'},{x:w*0.1,y:h*0.5,col:C.violet,lbl:'R2',bid:'24s'},
                  {x:w*0.1,y:h*0.72,col:C.amber,lbl:'R3',bid:'31s'}];
    robots.forEach(r=>{dot(ctx,r.x,r.y,8,r.col);lab(ctx,r.lbl,r.x+12,r.y,r.col,10.5);});
    // jobs on right
    const jobs=[{x:w*0.78,y:h*0.28,col:C.green,lbl:'Job A'},{x:w*0.78,y:h*0.5,col:C.mut,lbl:'Job B'},
                {x:w*0.78,y:h*0.72,col:C.mut,lbl:'Job C'}];
    jobs.forEach(j=>{rrect(ctx,j.x-24,j.y-12,48,24,5,j.col,hexA(j.col,0.08));lab(ctx,j.lbl,j.x,j.y,j.col,10,'center');});
    // auctioneer in middle
    const ax=w*0.45,ay=h*0.28;
    box(ctx,ax-28,ay-14,56,28,'auctioneer',C.ink,hexA(C.ink,0.08));
    // phase 0-0.3: broadcast
    if(phase<0.35){ctx.strokeStyle=hexA(C.green,0.6);ctx.setLineDash([3,3]);
      robots.forEach(r=>{ctx.beginPath();ctx.moveTo(ax-28,ay);ctx.lineTo(r.x+10,r.y);ctx.stroke();});
      ctx.setLineDash([]);lab(ctx,'"Job A available"',ax-40,ay-24,C.green,9);}
    // phase 0.35-0.65: bids flying in
    else if(phase<0.65){const bp=(phase-0.35)/0.3;
      robots.forEach((r,i)=>{const bx=r.x+10+(ax-28-r.x-10)*bp,by=r.y+(ay-r.y)*bp;
        dot(ctx,bx,by,3,r.col);lab(ctx,r.bid,r.x+26,r.y-12,r.col,9);});
      lab(ctx,'bids incoming...',ax-36,ay+22,C.mut,9);}
    // phase 0.65-1: winner assigned
    else{arrow(ctx,ax+28,ay,jobs[0].x-24,jobs[0].y,C.cyan,2);
      lab(ctx,'R1 wins (18s)',ax-20,ay+22,C.cyan,9);
      rrect(ctx,jobs[0].x-24,jobs[0].y-12,48,24,5,C.cyan,hexA(C.cyan,0.15));}
    lab(ctx,'decentralized market: no central dispatcher needed; scales with team size',14,h-12,C.mut);
  };

  /* mrf_consensus — iterative nearest-neighbor averaging drives N values to a single agreement */
  A.mrf_consensus=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Consensus: each node averages with neighbors — all values converge',14,16,C.dim);
    // 5 nodes in a line, values converging
    const n=5,xs=[w*0.1,w*0.25,w*0.42,w*0.6,w*0.78];
    const init=[48,51,45,53,47],target=48.8;
    const p=Math.min(1,saw(t,5)*1.8);
    const vals=init.map(v=>v+(target-v)*p);
    // links
    ctx.strokeStyle=hexA(C.cyan,0.4);ctx.lineWidth=1.4;
    for(let i=0;i<n-1;i++){ctx.beginPath();ctx.moveTo(xs[i],h*0.5);ctx.lineTo(xs[i+1],h*0.5);ctx.stroke();}
    // value bars above (height proportional to val in range 44-56)
    const bh=h*0.3,by=h*0.5-bh;
    xs.forEach((x,i)=>{const frac=(vals[i]-44)/12;const barH=bh*frac;
      const col=[C.cyan,C.violet,C.amber,C.coral,C.green][i];
      ctx.fillStyle=hexA(col,0.7);ctx.fillRect(x-10,by+bh-barH,20,barH);
      lab(ctx,vals[i].toFixed(1)+' m',x-12,by+bh-barH-10,col,9);
      dot(ctx,x,h*0.5,6,col);lab(ctx,'UAV '+(i+1),x-12,h*0.5+18,C.mut,9);});
    // consensus target line
    const cy=by+bh-(bh*(target-44)/12);
    ctx.strokeStyle=hexA(C.ink,0.3);ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(xs[0]-14,cy);ctx.lineTo(xs[n-1]+14,cy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'consensus: '+target.toFixed(1)+' m',xs[n-1]+18,cy,C.ink,9);
    lab(ctx,'only neighbor messages needed — no robot sees the global average directly',14,h-12,C.mut);
  };

  /* mrf_marl — CTDE: shared critic trains credit assignment; actors run independently at test time */
  A.mrf_marl=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'CTDE: train with a shared critic, run each policy independently',14,16,C.dim);
    const trainX=w*0.22,testX=w*0.68;
    // training side
    lab(ctx,'TRAINING',trainX,h*0.19,C.amber,9.5,'center');
    const agents=['A','B','C'];const ay=h*0.3,gap=h*0.18;
    agents.forEach((lbl,i)=>{const y=ay+i*gap;
      box(ctx,trainX-w*0.14,y-14,w*0.12,28,'policy '+lbl,C.cyan,hexA(C.cyan,0.06));
      arrow(ctx,trainX-w*0.02,y,trainX+w*0.04,y,hexA(C.ink,0.4),1.2);
      lab(ctx,'obs '+lbl,trainX-w*0.14-30,y,C.mut,9);});
    // shared critic
    const cy=ay+gap;
    box(ctx,trainX+w*0.04,cy-18,w*0.16,36,'shared critic\n(sees all)',C.amber,hexA(C.amber,0.08));
    agents.forEach((lbl,i)=>{const y=ay+i*gap;
      ctx.strokeStyle=hexA(C.amber,0.35);ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(trainX+w*0.04,cy+(i-1)*14);ctx.lineTo(trainX+w*0.04-2,y);ctx.stroke();});
    ctx.setLineDash([]);
    // credit arrows
    const blink=Math.sin(t*1.8)>0;
    agents.forEach((lbl,i)=>{const y=ay+i*gap;
      if(blink)arrow(ctx,trainX+w*0.04,cy+(i-1)*14,trainX-w*0.02+2,y,hexA(C.green,0.7),1.2);});
    lab(ctx,'credit',trainX+w*0.12,cy-24,C.green,9);
    // divider
    const mid=w*0.5;ctx.strokeStyle=hexA(C.line,0.8);ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(mid,h*0.24);ctx.lineTo(mid,h*0.88);ctx.stroke();ctx.setLineDash([]);
    // test side — policies run alone
    lab(ctx,'TEST TIME',testX,h*0.19,C.cyan,9.5,'center');
    agents.forEach((lbl,i)=>{const y=ay+i*gap;
      box(ctx,testX-w*0.1,y-14,w*0.12,28,'policy '+lbl,C.cyan,hexA(C.cyan,0.06));
      arrow(ctx,testX+w*0.02,y,testX+w*0.1,y,C.cyan,1.4);
      lab(ctx,'act',testX+w*0.1+4,y,C.mut,9);});
    lab(ctx,'no critic at test time — each policy acts from its own observation only',14,h-12,C.mut);
  };

  /* mrf_formation — attraction-repulsion potential keeps robots in shape; shape persists despite a dropout */
  A.mrf_formation=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Formation: attraction + repulsion local forces hold a shape without a leader',14,16,C.dim);
    const cx=w*0.5,cy=h*0.5,R=Math.min(w,h)*0.3;
    const N=8;const failed=3;
    // target positions (diamond ring)
    const targets=[];for(let i=0;i<N;i++)targets.push({tx:cx+R*Math.cos(i*TAU/N-Math.PI/2),ty:cy+R*Math.sin(i*TAU/N-Math.PI/2)});
    const p=saw(t,6);
    // robot positions: oscillate slightly, failed one drifts
    targets.forEach((tg,i)=>{
      if(i===failed){dot(ctx,tg.tx+40*p,tg.ty+20*p,5,hexA(C.coral,0.3));
        lab(ctx,'✗',tg.tx+40*p-4,tg.ty+20*p,C.coral,12);return;}
      const jitter=Math.sin(t*1.2+i*1.4)*3;
      const x=tg.tx+jitter,y=tg.ty+Math.cos(t+i)*2;
      dot(ctx,x,y,6,[C.cyan,C.violet,C.amber,C.coral,C.green,C.cyan,C.violet][i%7]);
      // attraction arrow toward center of neighbors (subtle)
      if(i%3===0)arrow(ctx,x,y,cx+(x-cx)*0.55,cy+(y-cy)*0.55,hexA(C.ink,0.18),1);});
    // repulsion zone for one pair
    ring(ctx,targets[1].tx,targets[1].ty,24,hexA(C.coral,0.15));
    // labels
    lab(ctx,'separation',w*0.06,h*0.2,C.coral,9.5);lab(ctx,'↑ repel if too close',w*0.06,h*0.27,C.mut,9);
    lab(ctx,'cohesion',w*0.06,h*0.42,C.cyan,9.5);lab(ctx,'↓ drift toward neighbors',w*0.06,h*0.49,C.mut,9);
    lab(ctx,'alignment',w*0.06,h*0.64,C.green,9.5);lab(ctx,'→ match heading',w*0.06,h*0.71,C.mut,9);
    lab(ctx,'shape holds from local rules — no robot knows its index; failure self-heals',14,h-12,C.mut);
  };

  /* mrf_coop_perc — V2X: car A blocked by van; car B sees around and sends compressed feature to A */
  A.mrf_coop_perc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Cooperative perception: share sensor features to see past occlusion',14,16,C.dim);
    // road layout
    const ry=h*0.55;ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,ry+30);ctx.lineTo(w,ry+30);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,ry-30);ctx.lineTo(w,ry-30);ctx.stroke();
    ctx.setLineDash([6,5]);ctx.strokeStyle=hexA(C.mut,0.2);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,ry);ctx.lineTo(w,ry);ctx.stroke();ctx.setLineDash([]);
    // van occluder
    const vx=w*0.44;ctx.fillStyle=hexA(C.mut,0.5);ctx.fillRect(vx-14,ry-44,28,76);lab(ctx,'van',vx-10,ry-52,C.mut,9);
    // car A (ego)
    dot(ctx,w*0.14,ry,8,C.cyan);lab(ctx,'car A',w*0.14-14,ry+22,C.cyan,9.5);
    // cyclist (hidden from A)
    const cyc=w*0.62;dot(ctx,cyc,ry-44,5,C.amber);lab(ctx,'cyclist',cyc-14,ry-56,C.amber,9);
    // blocked line
    ctx.strokeStyle=hexA(C.coral,0.5);ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(w*0.14,ry);ctx.lineTo(vx-14,ry-18);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'✗ blocked',w*0.26,ry-22,C.coral,8.5);
    // car B (sender) — above road
    const bx=w*0.7,by=h*0.18;dot(ctx,bx,by,8,C.violet);lab(ctx,'car B',bx+10,by,C.violet,9.5);
    // B sees cyclist
    ctx.strokeStyle=hexA(C.violet,0.5);
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(cyc,ry-44);ctx.stroke();
    // packet moving from B to A
    const pp=saw(t,3);const px=bx+(w*0.14-bx)*pp,py=by+(ry-by)*pp;
    dot(ctx,px,py,4,C.green);
    const psize=Math.round(128*(1-pp)+20*pp);
    lab(ctx,psize+'B feature packet',px+6,py-8,C.green,8.5);
    lab(ctx,'128-byte compressed BEV feature; A fuses it to detect the hidden cyclist',14,h-12,C.mut);
  };

  /* mrf_comm_eff — foreground mask: raw cloud vs sparse feature; same accuracy at 1/75 the data */
  A.mrf_comm_eff=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Smart sparsity: send only the bits that change the receiver\'s estimate',14,16,C.dim);
    const lx=w*0.1,rx=w*0.58,bw=w*0.32,bh=h*0.52,by=h*0.24;
    // left: raw dense cloud
    rrect(ctx,lx,by,bw,bh,7,C.line,hexA(C.line,0.15));
    lab(ctx,'RAW lidar cloud',lx+bw*0.5,by-10,C.mut,9.5,'center');
    const N=220;for(let i=0;i<N;i++){const px=lx+6+Math.random()*(bw-12),py=by+6+Math.random()*(bh-12);
      const fg=py<by+bh*0.5&&px>lx+bw*0.3;dot(ctx,px,py,fg?1.5:0.9,fg?hexA(C.cyan,0.7):hexA(C.mut,0.25));}
    lab(ctx,'1.3M pts · 15 MB',lx,by+bh+14,C.coral,9.5);
    // arrow
    arrow(ctx,lx+bw+8,by+bh*0.5,rx-8,by+bh*0.5,C.green,2);
    lab(ctx,'mask +\ncompress',lx+bw+14,by+bh*0.5-14,C.green,9);
    // right: sparse feature
    rrect(ctx,rx,by,bw,bh,7,C.cyan,hexA(C.cyan,0.05));
    lab(ctx,'foreground features only',rx+bw*0.5,by-10,C.cyan,9.5,'center');
    const M=28;for(let i=0;i<M;i++){const px=rx+bw*0.2+i*(bw*0.6/M),py=by+bh*0.2+Math.sin(i*0.8)*bh*0.2;
      dot(ctx,px,py,3,C.cyan);}
    lab(ctx,'18 KB · 75× smaller',rx,by+bh+14,C.green,9.5);
    // accuracy bar comparison
    const aby=h*0.84;ctx.fillStyle=hexA(C.coral,0.7);ctx.fillRect(lx,aby,bw*0.61,10);
    ctx.fillStyle=hexA(C.green,0.8);ctx.fillRect(rx,aby,bw*0.75,10);
    lab(ctx,'AP: 61.2 (solo)',lx,aby+20,C.mut,9.5);lab(ctx,'AP: 74.8 (with B\'s features)',rx,aby+20,C.mut,9.5);
    lab(ctx,'75× less data; detection accuracy improves because B sees what A cannot',14,h-12,C.mut);
  };

  /* mrf_robustness — adaptive weight: lidar degrades in rain, radar stays strong; fusion tracks the balance */
  A.mrf_robustness=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Adaptive fusion: weight each sensor by its current reliability',14,16,C.dim);
    // time axis
    const tx0=w*0.1,tx1=w*0.88,ty=h*0.75;
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(tx0,ty);ctx.lineTo(tx1,ty);ctx.stroke();
    lab(ctx,'time →',tx1+4,ty,C.dim,9.5);
    // rain event marker
    const rx=w*0.42;ctx.strokeStyle=hexA(C.cyan,0.4);ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(rx,h*0.15);ctx.lineTo(rx,ty);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'rain starts',rx-18,h*0.12,C.cyan,9);
    // lidar AP curve (drops at rain)
    const lidarPts=[[tx0,h*0.26],[rx-20,h*0.26],[rx+20,h*0.52],[tx1,h*0.52]];
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();
    lidarPts.forEach((p,i)=>i===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]));ctx.stroke();
    lab(ctx,'lidar AP',tx0,h*0.2,C.amber,9.5);
    // radar AP curve (stable)
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(tx0,h*0.34);ctx.lineTo(tx1,h*0.34);ctx.stroke();
    lab(ctx,'radar AP',tx0,h*0.28,C.cyan,9.5);
    // fused curve (adaptive — stays higher than either alone in rain)
    ctx.strokeStyle=C.green;ctx.lineWidth=2.4;ctx.beginPath();
    ctx.moveTo(tx0,h*0.22);ctx.lineTo(rx-20,h*0.22);ctx.lineTo(rx+20,h*0.38);ctx.lineTo(tx1,h*0.38);ctx.stroke();
    lab(ctx,'fused (adaptive w)',tx1-80,h*0.33,C.green,9.5);
    // animated weight indicator
    const wp=saw(t,5);const wx=tx0+wp*(tx1-tx0);
    const inRain=wx>rx;
    const lidarW=inRain?0.2:0.6,radarW=inRain?0.8:0.4;
    const wy=h*0.62;
    lab(ctx,'lidar w='+lidarW.toFixed(1),wx-36,wy-12,C.amber,9);
    lab(ctx,'radar w='+radarW.toFixed(1),wx-36,wy+6,C.cyan,9);
    ctx.strokeStyle=hexA(C.green,0.6);ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(wx,h*0.15);ctx.lineTo(wx,ty-2);ctx.stroke();
    lab(ctx,'uncertainty rises → weight shifts to healthier sensor automatically',14,h-12,C.mut);
  };

  /* mrf_security — Bayesian trust: one lying agent; repeated mis-match drops its P(honest) below threshold */
  A.mrf_security=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bayesian trust: each vehicle tracks P(neighbor honest) from temporal consistency',14,16,C.dim);
    const N=6;const liars=[2];const xs=[];
    for(let i=0;i<N;i++)xs.push(w*0.1+i*(w*0.78/(N-1)));
    const vy=h*0.38;
    // prior bar (initial trust = 0.5)
    lab(ctx,'P(honest)',w*0.04,h*0.28,C.mut,9.5,'left');
    const frame=Math.floor(saw(t,7)*9);// 0..8 frames
    xs.forEach((x,i)=>{const liar=liars.includes(i);
      // trust decays for liar each frame
      const trust=liar?Math.max(0.03,0.5-frame*0.07):Math.min(0.97,0.5+frame*0.05);
      const bh=h*0.42*trust;const col=liar?C.coral:C.green;
      ctx.fillStyle=hexA(col,0.7);ctx.fillRect(x-12,vy-bh,24,bh);
      dot(ctx,x,vy+14,7,liar?hexA(C.coral,0.8):hexA(C.green,0.8));
      lab(ctx,'V'+(i+1),x-6,vy+28,liar?C.coral:C.mut,9.5);
      lab(ctx,trust.toFixed(2),x-10,vy-bh-10,col,8.5);});
    // quarantine label
    if(frame>=7){const lx=xs[2];rrect(ctx,lx-30,vy-h*0.42*0.06-16,60,14,4,C.coral,hexA(C.coral,0.12));
      lab(ctx,'quarantined',lx,vy-h*0.42*0.06-9,C.coral,8.5,'center');}
    lab(ctx,'frame '+frame,w*0.04,h*0.18,C.dim,9.5);
    // phantom detection from liar (flickers)
    if(Math.sin(t*3)>0){dot(ctx,xs[2]+40,h*0.65,8,hexA(C.coral,0.35));
      lab(ctx,'phantom detection (V3 only)',xs[2]+52,h*0.65,C.coral,9);}
    lab(ctx,'liar identified in ~7 frames — legitimate detections preserved for honest peers',14,h-12,C.mut);
  };

  /* mrf_manip — two-arm panel lift: internal force balance constraint links both arms */
  A.mrf_manip=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Cooperative manipulation: two arms must balance forces through the shared object',14,16,C.dim);
    const p=saw(t,4);
    // panel
    const panelW=w*0.44,panelH=18;const panelX=w*0.28,panelY=h*0.38+Math.sin(t*0.6)*8;
    ctx.fillStyle=hexA(C.line,0.7);ctx.fillRect(panelX,panelY,panelW,panelH);
    ctx.strokeStyle=C.ink;ctx.lineWidth=1.2;ctx.strokeRect(panelX,panelY,panelW,panelH);
    lab(ctx,'1.2 m glass panel',panelX+panelW*0.5-46,panelY+panelH+12,C.mut,9.5);
    // left arm
    const lax=w*0.12,lay=h*0.72;
    ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(lax,lay);ctx.lineTo(panelX+12,panelY+panelH);ctx.stroke();
    dot(ctx,panelX+12,panelY+panelH,6,C.cyan);
    lab(ctx,'arm L',lax-16,lay+12,C.cyan,9.5);
    // right arm
    const rax=w*0.88,ray=h*0.72;
    ctx.strokeStyle=hexA(C.violet,0.7);ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(rax,ray);ctx.lineTo(panelX+panelW-12,panelY+panelH);ctx.stroke();
    dot(ctx,panelX+panelW-12,panelY+panelH,6,C.violet);
    lab(ctx,'arm R',rax+4,ray+12,C.violet,9.5);
    // force arrows — must balance
    const fup=18+Math.sin(t)*2;
    arrow(ctx,panelX+12,panelY,panelX+12,panelY-32,C.cyan,2);
    lab(ctx,fup.toFixed(0)+'N',panelX-26,panelY-16,C.cyan,9.5);
    arrow(ctx,panelX+panelW-12,panelY,panelX+panelW-12,panelY-32,C.violet,2);
    lab(ctx,fup.toFixed(0)+'N',panelX+panelW+4,panelY-16,C.violet,9.5);
    // constraint label
    box(ctx,w*0.35,h*0.14,w*0.3,28,'force balance\nconstraint',C.amber,hexA(C.amber,0.08));
    ctx.strokeStyle=hexA(C.amber,0.4);ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(w*0.5,h*0.14+28);ctx.lineTo(panelX+panelW*0.5,panelY);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'each arm\'s torque is solved jointly — one can\'t plan without knowing the other\'s force',14,h-12,C.mut);
  };

  /* mrf_hetero — drone + ground: drone surveys top-down, sends map, ground navigates detail */
  A.mrf_hetero=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Heterogeneous teams: each platform contributes what the others cannot',14,16,C.dim);
    // ground level
    const gy=h*0.7;ctx.fillStyle=hexA(C.mut,0.18);ctx.fillRect(0,gy,w,h-gy);
    // debris blocks ground robot
    ctx.fillStyle=hexA(C.mut,0.4);ctx.fillRect(w*0.36,gy-28,30,28);ctx.fillRect(w*0.52,gy-18,20,18);
    // ground robot
    const gp=saw(t,6);const gx=w*0.1+gp*w*0.28;
    dot(ctx,gx,gy-8,8,C.green);lab(ctx,'ground R1',gx-14,gy+12,C.green,9.5);
    // drone overhead
    const dx=w*0.5+Math.sin(t*0.8)*w*0.12,dy=h*0.2;
    dot(ctx,dx,dy,8,C.cyan);ring(ctx,dx,dy,22,hexA(C.cyan,0.3));
    lab(ctx,'drone',dx+12,dy-2,C.cyan,9.5);
    // drone FoV cone on ground
    ctx.fillStyle=hexA(C.cyan,0.06);ctx.beginPath();
    ctx.moveTo(dx,dy);ctx.lineTo(dx-60,gy);ctx.lineTo(dx+60,gy);ctx.closePath();ctx.fill();
    ctx.strokeStyle=hexA(C.cyan,0.2);ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(dx,dy);ctx.lineTo(dx-60,gy);ctx.moveTo(dx,dy);ctx.lineTo(dx+60,gy);ctx.stroke();
    // data arrow: drone sends map to ground
    const pp=saw(t,2.5);const px=dx+(gx-dx)*pp,py=dy+(gy-dy)*pp;
    dot(ctx,px,py,3,C.amber);lab(ctx,'map update',px+6,py-6,C.amber,8.5);
    // capability table
    lab(ctx,'drone: wide view, short battery',w*0.62,h*0.3,C.cyan,9.5);
    lab(ctx,'ground: payload, precise nav',w*0.62,h*0.42,C.green,9.5);
    lab(ctx,'together: see + reach',w*0.62,h*0.54,C.ink,9.5);
    lab(ctx,'elevated view fills ground robot\'s blind spots; complementary capabilities multiply coverage',14,h-12,C.mut);
  };

  /* mrf_explore — frontier splitting: 4 robots pick distinct frontiers, no redundant visits */
  A.mrf_explore=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Frontier exploration: split the unknown edge so no two robots cover the same ground',14,16,C.dim);
    const mx=w*0.12,my=h*0.18,mw=w*0.56,mh=h*0.62;
    // unknown space (dark)
    ctx.fillStyle=hexA(C.line,0.6);ctx.fillRect(mx,my,mw,mh);
    // explored areas (revealed as t advances)
    const p=saw(t,7);
    const zones=[{x:mx,y:my,w:mw*0.45*Math.min(1,p*2.5),h:mh*0.45,col:C.cyan},
                 {x:mx+mw*0.55,y:my,w:mw*0.45*Math.min(1,p*2),h:mh*0.45,col:C.violet},
                 {x:mx,y:my+mh*0.55,w:mw*0.4*Math.min(1,p*1.8),h:mh*0.45,col:C.amber},
                 {x:mx+mw*0.6,y:my+mh*0.55,w:mw*0.4*Math.min(1,p*2.2),h:mh*0.45,col:C.green}];
    zones.forEach(z=>{ctx.fillStyle=hexA(z.col,0.18);ctx.fillRect(z.x,z.y,z.w,z.h);});
    // robots at frontier edges
    zones.forEach((z,i)=>{const rx=z.x+z.w,ry=z.y+z.h*0.5;
      dot(ctx,rx,ry,6,[C.cyan,C.violet,C.amber,C.green][i]);
      lab(ctx,'R'+(i+1),rx+4,ry,C.mut,9);});
    // map border
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1.2;ctx.strokeRect(mx,my,mw,mh);
    lab(ctx,'unknown',mx+mw*0.5-20,my+mh*0.5,C.dim,10,'center');
    // coverage stat
    const covered=Math.min(98,Math.round(p*120));
    lab(ctx,covered+'% mapped',mx,my+mh+14,C.green,10);
    // right panel: frontier list
    const fx=w*0.75,fy=h*0.22;
    lab(ctx,'frontier queue',fx,fy-10,C.mut,9.5);
    ['F1 → R1 (north)','F2 → R2 (east)','F3 → R3 (south-w)','F4 → R4 (south-e)'].forEach((s,i)=>{
      lab(ctx,s,fx,fy+14+i*18,[C.cyan,C.violet,C.amber,C.green][i],9.5);});
    lab(ctx,'each frontier assigned once — splitting the edge halves exploration time',14,h-12,C.mut);
  };

  /* mrf_dslam — two robots meet, match a landmark, merge pose graphs, drift corrects */
  A.mrf_dslam=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Decentralized SLAM: two maps merge when robots recognize a shared landmark',14,16,C.dim);
    const p=saw(t,5);
    // robot A trajectory (left arc)
    const ax0=w*0.1,ay0=h*0.35;
    ctx.strokeStyle=hexA(C.cyan,0.5);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=20;i++){const u=i/20;ctx.lineTo(ax0+u*w*0.35,ay0+Math.sin(u*Math.PI)*h*0.25);}ctx.stroke();
    lab(ctx,'robot A trajectory',ax0,ay0-14,C.cyan,9.5);
    // robot B trajectory (right arc)
    const bx0=w*0.9,by0=h*0.35;
    ctx.strokeStyle=hexA(C.violet,0.5);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=20;i++){const u=i/20;ctx.lineTo(bx0-u*w*0.35,by0+Math.sin(u*Math.PI)*h*0.25);}ctx.stroke();
    lab(ctx,'robot B trajectory',bx0-70,by0-14,C.violet,9.5);
    // shared landmark at meeting point
    const lx=w*0.5,ly=h*0.45+Math.sin(p*Math.PI)*h*0.1;
    ring(ctx,lx,ly,12,hexA(C.amber,0.8));dot(ctx,lx,ly,4,C.amber);
    lab(ctx,'shared landmark',lx-36,ly-20,C.amber,9.5);
    // A robot head
    const arx=ax0+p*w*0.35,ary=ay0+Math.sin(p*Math.PI)*h*0.25;
    dot(ctx,arx,ary,7,C.cyan);
    // B robot head
    const brx=bx0-p*w*0.35,bry=by0+Math.sin(p*Math.PI)*h*0.25;
    dot(ctx,brx,bry,7,C.violet);
    // when close: match + merge arrow
    if(p>0.75){ctx.strokeStyle=hexA(C.green,0.7);ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(arx,ary);ctx.lineTo(brx,bry);ctx.stroke();ctx.setLineDash([]);
      lab(ctx,'match! merge maps',lx-28,h*0.72,C.green,9.5);
      const drift=0.8*(1-(p-0.75)/0.25);
      lab(ctx,'drift: '+drift.toFixed(2)+' m → 0',lx-28,h*0.8,C.green,9);}
    lab(ctx,'pose-graph merge distributes the loop closure correction to all 2320 keyframes',14,h-12,C.mut);
  };

  /* mrf_game — payoff matrix at junction; Stackelberg order resolves who goes */
  A.mrf_game=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Game theory: predict the other agent\'s move, then pick your best response',14,16,C.dim);
    // payoff matrix
    const mx=w*0.32,my=h*0.2,cw=w*0.2,ch=h*0.18;
    // headers
    lab(ctx,'B goes','   B goes',mx+cw*0.5,my-12,C.violet,9.5,'center');
    lab(ctx,'B waits',mx+cw*1.5,my-12,C.violet,9.5,'center');
    lab(ctx,'A goes',mx-48,my+ch*0.5,C.cyan,9.5);
    lab(ctx,'A waits',mx-50,my+ch*1.5,C.cyan,9.5);
    // cells
    const cells=[['−8,−8',C.coral,C.coral],['+8,+2',C.cyan,C.green],
                 ['+2,+8',C.green,C.violet],['−3,−3',C.mut,C.mut]];
    [[0,0],[0,1],[1,0],[1,1]].forEach((pos,i)=>{
      const x=mx+pos[1]*cw,y=my+pos[0]*ch;
      const isNash=(i===1||i===2);
      rrect(ctx,x,y,cw,ch,4,cells[i][1],isNash?hexA(cells[i][1],0.12):hexA(C.line,0.2));
      lab(ctx,cells[i][0],x+cw*0.5,y+ch*0.5,cells[i][2],10,'center');
      if(isNash)lab(ctx,'Nash',x+cw*0.5,y+ch+6,C.mut,8,'center');});
    // Stackelberg solution highlight
    const blink=Math.sin(t*2)>0;
    if(blink){rrect(ctx,mx+cw,my,cw,ch,4,C.cyan,hexA(C.cyan,0.18));
      lab(ctx,'← Stackelberg: A commits first, B best-responds',mx+cw*2+8,my+ch*0.5,C.cyan,9);}
    // collision zone (road)
    const rx=w*0.08,ry=h*0.56;ctx.fillStyle=hexA(C.mut,0.18);ctx.fillRect(rx,ry,w*0.18,h*0.3);
    dot(ctx,rx+w*0.09,ry-8,6,C.cyan);lab(ctx,'A',rx+w*0.09+8,ry-8,C.cyan,9);
    dot(ctx,rx+w*0.02,ry+h*0.15,6,C.violet);lab(ctx,'B',rx+w*0.02-14,ry+h*0.15,C.violet,9);
    // decision outcome
    if(blink){arrow(ctx,rx+w*0.09,ry-8,rx+w*0.09,ry+h*0.3,hexA(C.cyan,0.6),2);
      lab(ctx,'A goes → B waits',rx-2,ry+h*0.32+6,C.green,9);}
    lab(ctx,'compute who plays first — deadlock drops from 12% to 0.4% of episodes',14,h-12,C.mut);
  };

  /* mrf_llm — LLM decomposes mission into task tree; robots execute with constraint propagation */
  A.mrf_llm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'LLM coordination: natural language → task tree → robot assignments',14,16,C.dim);
    // operator text box
    const ox=w*0.04,oy=h*0.12;
    rrect(ctx,ox,oy,w*0.38,36,6,C.mut,hexA(C.mut,0.06));
    lab(ctx,'"clear B+C, check offices,',ox+8,oy+10,C.ink,9.5);
    lab(ctx,' avoid east stairwell"',ox+8,oy+24,C.ink,9.5);
    // arrow to LLM
    const llmx=w*0.54,llmy=h*0.18;
    arrow(ctx,ox+w*0.38,oy+18,llmx-28,llmy,C.amber,1.6);
    box(ctx,llmx-28,llmy-14,56,28,'LLM',C.amber,hexA(C.amber,0.08));
    // task tree
    const tx=w*0.56,ty=h*0.38;
    lab(ctx,'task tree',tx-10,ty-10,C.dim,9.5);
    rrect(ctx,tx-20,ty,40,22,4,C.cyan,hexA(C.cyan,0.08));lab(ctx,'root',tx,ty+11,C.cyan,9,'center');
    const tasks=[{lbl:'ClearB',x:tx-60,col:C.green},{lbl:'ClearC',x:tx,col:C.green},{lbl:'Overwatch',x:tx+60,col:C.violet}];
    tasks.forEach(tk=>{const ny=ty+46;
      ctx.strokeStyle=hexA(C.mut,0.4);ctx.beginPath();ctx.moveTo(tx,ty+22);ctx.lineTo(tk.x,ny);ctx.stroke();
      rrect(ctx,tk.x-24,ny,48,20,4,tk.col,hexA(tk.col,0.08));lab(ctx,tk.lbl,tk.x,ny+10,tk.col,8.5,'center');});
    // robot assignments
    const ry2=ty+92;
    [{lbl:'R1 (arm)',col:C.green,note:'SearchB2\n(door)'},{lbl:'R2',col:C.cyan,note:'B3,C'},
     {lbl:'drone',col:C.violet,note:'overwatch'}].forEach((r,i)=>{
      const rx=w*0.3+i*w*0.22;dot(ctx,rx,ry2,6,r.col);lab(ctx,r.lbl,rx-16,ry2+14,r.col,9);
      lab(ctx,r.note.split('\n')[0],rx-16,ry2+26,C.mut,8.5);});
    // constraint forbidden zone
    rrect(ctx,w*0.04,h*0.6,w*0.18,22,4,C.coral,hexA(C.coral,0.08));
    lab(ctx,'⛔ east stairwell (forbidden)',w*0.04+4,h*0.6+11,C.coral,9);
    // animated alert
    const ap=saw(t,4);if(ap>0.7){dot(ctx,w*0.48,h*0.72,6,C.amber);lab(ctx,'heat sig! → R1 re-routes',w*0.5,h*0.72,C.amber,9.5);}
    lab(ctx,'LLM parses intent; constraint propagation keeps robots out of the forbidden zone',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.mranim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-mranim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
