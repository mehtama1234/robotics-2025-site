/* nv-anim.js — first-principles mechanism animators for the Navigation & Motion Planning explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-nvanim="name". Self-contained boot. */
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

  function obst(ctx,x,y,w,h){ctx.fillStyle=hexA(C.mut,0.3);ctx.fillRect(x,y,w,h);ctx.strokeStyle=hexA(C.mut,0.5);ctx.strokeRect(x,y,w,h);}

  /* 01 — WHY: get from start to goal without hitting anything, in a world you only partly know. */
  A.nv_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Navigation: find a collision-free path from here to the goal',14,16,C.dim);
    const sx=w*0.1,sy=h*0.5,gx=w*0.9,gy=h*0.5;
    dot(ctx,sx,sy,7,C.cyan);lab(ctx,'start',sx-6,sy+20,C.cyan,9);
    ring(ctx,gx,gy,9,C.green);lab(ctx,'goal',gx-6,gy+22,C.green,9);
    // obstacles between
    obst(ctx,w*0.34,h*0.2,26,90);obst(ctx,w*0.55,h*0.45,30,80);obst(ctx,w*0.44,h*0.62,60,20);
    // straight line (blocked) vs a path that curves around
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(gx,gy);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'straight line hits things ✗',w*0.30,h*0.4,C.coral,8.5);
    // curved free path with a moving robot
    const px=[sx,w*0.3,w*0.42,w*0.5,w*0.68,gx],py=[sy,h*0.72,h*0.8,h*0.3,h*0.28,gy];
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px[0],py[0]);for(let i=1;i<px.length;i++)ctx.lineTo(px[i],py[i]);ctx.stroke();
    const p=saw(t,4)*(px.length-1);const i=Math.floor(p),f=p-i,j=Math.min(i+1,px.length-1);
    dot(ctx,px[i]+(px[j]-px[i])*f,py[i]+(py[j]-py[i])*f,6,C.amber);
    lab(ctx,'a free path weaves around obstacles — and the map may be wrong or changing',14,h-12,C.mut);
  };

  /* 02 — PLAN: sampling grows a tree of collision-free motions; optimization smooths a guess. */
  A.nv_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Two ways to plan: sample a tree of motions, or smooth an initial guess',14,16,C.dim);
    // left: RRT tree growing
    const lx=w*0.05,ly=h*0.26,lw=w*0.42,lh=h*0.56;rrect(ctx,lx,ly,lw,lh,6,C.line,null);lab(ctx,'sampling (RRT): grow a tree',lx+4,ly-8,C.cyan,9);
    const sx=lx+16,sy=ly+lh-16;dot(ctx,sx,sy,4,C.cyan);
    const p=saw(t,5);const nodes=[[sx,sy]];const seed=[[30,-30],[60,-20],[50,-60],[90,-50],[70,-90],[120,-70],[100,-110],[150,-95]];
    const nn=Math.floor(p*seed.length)+1;
    for(let k=0;k<Math.min(nn,seed.length);k++){const nx=sx+seed[k][0],ny=sy+seed[k][1];const par=nodes[Math.max(0,k-1>=0?Math.floor(k/1.6):0)];
      ctx.strokeStyle=hexA(C.cyan,0.6);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(par[0],par[1]);ctx.lineTo(nx,ny);ctx.stroke();dot(ctx,nx,ny,2.5,C.cyan);nodes.push([nx,ny]);}
    ring(ctx,lx+lw-24,ly+18,8,C.green);
    // right: trajectory optimization smoothing
    const rx=w*0.53,ry=ly,rw=w*0.42,rh=lh;rrect(ctx,rx,ry,rw,rh,6,C.line,null);lab(ctx,'optimization: smooth a guess',rx+4,ry-8,C.violet,9);
    const a=[[rx+16,ry+rh-16],[rx+rw*0.4,ry+16],[rx+rw-16,ry+rh*0.5]];
    // jagged initial
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(a[0][0],a[0][1]);ctx.lineTo(a[1][0]+Math.sin(t*3)*8,a[1][1]);ctx.lineTo(a[2][0],a[2][1]);ctx.stroke();ctx.setLineDash([]);
    // smoothed curve
    const s=Math.min(1,saw(t,5)+0.1);ctx.strokeStyle=C.violet;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0][0],a[0][1]);ctx.quadraticCurveTo(a[1][0],a[1][1]+ (1-s)*0,a[2][0],a[2][1]);ctx.stroke();
    lab(ctx,'both search the free space — one by trying many motions, one by bending one until it fits',14,h-12,C.mut);
  };

  /* 03 — NAV STACK: a map to plan on + a costmap to dodge; a global plan + a local reactive loop. */
  A.nv_map=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The stack: a global plan on a map, a local loop to dodge what shows up',14,16,C.dim);
    // occupancy grid
    const gx=w*0.06,gy=h*0.28,cell=16,cols=Math.floor((w*0.55)/cell),rows=6;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const occ=((i===4&&j<4)||(i===8&&j>1)||(i===11&&j<3));
      ctx.fillStyle=occ?hexA(C.mut,0.5):hexA(C.cyan,0.05);ctx.fillRect(gx+i*cell,gy+j*cell,cell-1,cell-1);}
    lab(ctx,'occupancy + cost map',gx,gy-8,C.mut,9);
    // global plan (green) through free cells
    const sx=gx+cell*0.5,sy=gy+cell*5.5,ggx=gx+cell*(cols-0.5),ggy=gy+cell*0.5;
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(gx+cell*3,gy+cell*5);ctx.lineTo(gx+cell*6,gy+cell*1.5);ctx.lineTo(gx+cell*9.5,gy+cell*1);ctx.lineTo(ggx,ggy);ctx.stroke();
    dot(ctx,sx,sy,4,C.cyan);ring(ctx,ggx,ggy,7,C.green);lab(ctx,'global plan',gx+cell*3,gy+cell*6+8,C.green,8.5);
    // local reactive: a sudden obstacle + a dodge
    const p=saw(t,3);const ox=gx+cell*6,oy=gy+cell*2.5;if(p>0.3){dot(ctx,ox,oy,5,C.coral);lab(ctx,'new obstacle',ox+8,oy-8,C.coral,8);
      ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=1.6;ctx.setLineDash([2,2]);ctx.beginPath();ctx.moveTo(ox-20,oy+8);ctx.quadraticCurveTo(ox,oy+22,ox+20,oy+6);ctx.stroke();ctx.setLineDash([]);
      lab(ctx,'local loop dodges it',ox-24,oy+30,C.amber,8);}
    lab(ctx,'plan globally on the map you have; react locally to whatever the sensors see right now',14,h-12,C.mut);
  };

  /* 04 — SOCIAL: the world moves back — predict people and weave, or freeze forever. */
  A.nv_social=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Crowds move too: predict where people go, then weave through',14,16,C.dim);
    const p=saw(t,5);
    // robot bottom-left to top-right
    const rx=w*0.12+p*w*0.7,ry=h*0.8-p*h*0.45;dot(ctx,rx,ry,7,C.cyan);lab(ctx,'robot',rx-6,ry+18,C.cyan,8.5);
    ring(ctx,w*0.86,h*0.32,8,C.green);
    // two pedestrians with predicted cones
    const peds=[[w*0.4,h*0.3,1,0.6],[w*0.62,h*0.7,-0.6,-0.8]];
    peds.forEach((pd,k)=>{const px=pd[0]+pd[2]*p*60,py=pd[1]+pd[3]*p*40;dot(ctx,px,py,6,C.violet);
      // prediction cone
      ctx.fillStyle=hexA(C.violet,0.12);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+pd[2]*70-14,py+pd[3]*50);ctx.lineTo(px+pd[2]*70+14,py+pd[3]*50+8);ctx.closePath();ctx.fill();});
    lab(ctx,'predicted paths',w*0.36,h*0.22,C.violet,8.5);
    lab(ctx,'the freezing-robot problem: predict badly and every path looks blocked — so it just stops',14,h-12,C.mut);
  };

  /* 05 — LEARN / LANGUAGE: pixels → action, or follow an instruction with no map given. */
  A.nv_learn=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Learned navigation: "go to the kitchen" — from pixels, no map handed over',14,16,C.dim);
    // first-person view (left)
    const vx=w*0.06,vy=h*0.3,vw=w*0.34,vh=h*0.44;rrect(ctx,vx,vy,vw,vh,6,C.cyan,hexA(C.cyan,0.05));lab(ctx,'what it sees',vx+4,vy-8,C.cyan,9);
    // hallway perspective
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx+vw*0.5,vy+vh*0.4);ctx.moveTo(vx+vw,vy);ctx.lineTo(vx+vw*0.5,vy+vh*0.4);ctx.moveTo(vx,vy+vh);ctx.lineTo(vx+vw*0.5,vy+vh*0.6);ctx.moveTo(vx+vw,vy+vh);ctx.lineTo(vx+vw*0.5,vy+vh*0.6);ctx.stroke();
    // policy box
    box(ctx,w*0.46,h*0.46,w*0.16,30,'policy /\nVLM',C.violet,hexA(C.violet,0.08));
    arrow(ctx,vx+vw+4,h*0.52,w*0.46,h*0.52,C.cyan,1.4);
    // instruction
    rrect(ctx,w*0.44,h*0.24,w*0.2,20,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"find the kitchen"',w*0.54,h*0.24+10,C.amber,8.5,'center');
    arrow(ctx,w*0.54,h*0.24+20,w*0.54,h*0.46,C.amber,1.2);
    // action out
    const p=saw(t,3);const acts=['turn left','forward','forward','turn right','stop'];
    box(ctx,w*0.72,h*0.46,w*0.2,30,acts[Math.floor(p*acts.length)],C.green,hexA(C.green,0.08));
    arrow(ctx,w*0.62,h*0.52,w*0.72,h*0.52,C.violet,1.4);
    lab(ctx,'a network maps view + goal straight to the next move — generalizing to buildings it never mapped',14,h-12,C.mut);
  };

  // ---- family animators (wave 2) ----

  /* nvf_rrt — RRT tree growing toward a goal in 2D free space */
  A.nvf_rrt=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sampling-based planning: scatter random nodes, connect collision-free ones into a tree',14,16,C.dim);
    var sx=w*0.1,sy=h*0.55,gx=w*0.88,gy=h*0.28;
    // obstacles
    obst(ctx,w*0.32,h*0.18,22,80); obst(ctx,w*0.54,h*0.42,20,75); obst(ctx,w*0.70,h*0.18,20,50);
    // pre-defined node positions that weave around obstacles
    var nodes=[[sx,sy],[w*0.22,h*0.68],[w*0.28,h*0.72],[w*0.40,h*0.76],[w*0.46,h*0.60],
               [w*0.50,h*0.44],[w*0.60,h*0.36],[w*0.66,h*0.30],[w*0.78,h*0.25],[gx,gy]];
    var parents=[null,0,1,2,3,4,5,6,7,8];
    var p=saw(t,6);var nshow=Math.max(1,Math.min(nodes.length,Math.floor(p*nodes.length)+1));
    // draw edges
    ctx.strokeStyle=hexA(C.cyan,0.45);ctx.lineWidth=1.3;
    for(var k=1;k<nshow;k++){var par=parents[k];ctx.beginPath();ctx.moveTo(nodes[par][0],nodes[par][1]);ctx.lineTo(nodes[k][0],nodes[k][1]);ctx.stroke();}
    // draw nodes
    for(var k=0;k<nshow;k++){dot(ctx,nodes[k][0],nodes[k][1],k===0?5:2.8,k===0?C.cyan:hexA(C.cyan,0.8));}
    // start / goal
    dot(ctx,sx,sy,6,C.cyan);lab(ctx,'start',sx-6,sy+16,C.cyan,9);
    ring(ctx,gx,gy,8,C.green);lab(ctx,'goal',gx-6,gy+18,C.green,9);
    // highlight the found path when done
    if(nshow===nodes.length){ctx.strokeStyle=C.green;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(sx,sy);for(var k=1;k<nodes.length;k++)ctx.lineTo(nodes[k][0],nodes[k][1]);ctx.stroke();}
    lab(ctx,'each new node samples the free space and steers the nearest tree node toward it',14,h-12,C.mut);
  };

  /* nvf_traj — trajectory optimization: jagged guess → smooth arc around obstacle */
  A.nvf_traj=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Trajectory optimization: bend a rough guess until it is smooth and obstacle-free',14,16,C.dim);
    var iter=saw(t,5); // 0→1 represents optimization progress
    var sx=w*0.1,sy=h*0.55,ex=w*0.88,ey=h*0.45;
    // obstacle
    obst(ctx,w*0.44,h*0.25,32,70);
    // midpoint moves from "blocked" to "clear" as iter grows
    var mx1=w*0.38+iter*(-w*0.06);  // left anchor
    var my1=h*0.50-iter*(h*0.22);   // goes up, clearing obstacle
    var mx2=w*0.62+iter*(w*0.02);
    var my2=h*0.46-iter*(h*0.10);
    // initial guess (straight line, dashed)
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([4,4]);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'initial guess (blocked)',w*0.38,h*0.67,C.coral,8.5);
    // current trajectory (optimizing)
    var col=iter>0.85?C.green:C.amber;
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(sx,sy);ctx.bezierCurveTo(mx1,my1,mx2,my2,ex,ey);ctx.stroke();
    // start/end
    dot(ctx,sx,sy,5,C.cyan);ring(ctx,ex,ey,7,C.green);
    // cost label
    var cost=Math.round(840*(1-iter)+12*iter);
    lab(ctx,'cost: '+cost,w*0.60,h*0.78,iter>0.85?C.green:C.amber,10);
    lab(ctx,'gradient steps push waypoints out of the obstacle; MPC re-solves every 50 ms',14,h-12,C.mut);
  };

  /* nvf_cbf — Control Barrier Function: safety margin monitored at each step */
  A.nvf_cbf=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Control-barrier functions: a formal guarantee the robot never enters the obstacle',14,16,C.dim);
    // obstacle circle
    var ox=w*0.56,oy=h*0.5,or_=52;
    ctx.fillStyle=hexA(C.coral,0.18);ctx.beginPath();ctx.arc(ox,oy,or_,0,TAU);ctx.fill();
    ctx.strokeStyle=C.coral;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(ox,oy,or_,0,TAU);ctx.stroke();
    // safety margin ring
    ctx.strokeStyle=hexA(C.amber,0.5);ctx.lineWidth=1.2;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.arc(ox,oy,or_+28,0,TAU);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'obstacle',ox-22,oy-4,C.coral,9,'center');
    lab(ctx,'safety\nmargin',ox+or_+8,oy-8,C.amber,9);
    // robot approaching and being deflected
    var p=saw(t,5);
    var rx=w*0.1+p*w*0.56,ry=h*0.55;
    // distance to obstacle edge
    var dist=Math.hypot(rx-ox,ry-oy)-or_-28;
    var safe=dist>0;
    // nominal path (straight)
    ctx.strokeStyle=hexA(C.cyan,0.3);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(w*0.1,h*0.55);ctx.lineTo(w*0.86,h*0.55);ctx.stroke();ctx.setLineDash([]);
    // corrected path curves upward near the margin
    var cx_ctrl=w*0.5,cy_ctrl=h*(0.55-0.32*Math.max(0,1-(dist/80)));
    var curve_x=w*0.1+(p)*w*0.76; // conceptually shows arc
    var curve_y=h*0.55-Math.max(0,40-Math.max(0,dist))*Math.sin(Math.PI*p);
    dot(ctx,curve_x,curve_y,safe?6:5,safe?C.cyan:C.amber);
    // cbf h bar
    var hval=Math.max(0,dist);
    rrect(ctx,w*0.06,h*0.82,100,14,4,C.line,hexA(C.dim,0.15));
    ctx.fillStyle=safe?C.green:C.amber;ctx.fillRect(w*0.06+1,h*0.82+1,Math.min(98,hval*0.8),12);
    lab(ctx,'h(x)='+(hval>0?Math.round(hval)+'px>0 safe':'0 filter active'),w*0.06+104,h*0.82+7,safe?C.green:C.amber,9.5);
    ring(ctx,w*0.86,h*0.55,7,C.green);
    lab(ctx,'QP-corrected control keeps h ≥ 0 at every step — the robot curves, never crashes',14,h-12,C.mut);
  };

  /* nvf_e2e — end-to-end navigation: pixels → action via a learned network */
  A.nvf_e2e=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'End-to-end learned navigation: camera frames flow straight to a velocity command',14,16,C.dim);
    // camera frame (left)
    var fx=w*0.05,fy=h*0.3,fw=w*0.22,fh=h*0.42;
    rrect(ctx,fx,fy,fw,fh,6,C.cyan,hexA(C.cyan,0.06));lab(ctx,'camera',fx+4,fy-9,C.cyan,9);
    // corridor lines inside
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+fw*0.5,fy+fh*0.35);ctx.moveTo(fx+fw,fy);ctx.lineTo(fx+fw*0.5,fy+fh*0.35);ctx.moveTo(fx,fy+fh);ctx.lineTo(fx+fw*0.5,fy+fh*0.65);ctx.moveTo(fx+fw,fy+fh);ctx.lineTo(fx+fw*0.5,fy+fh*0.65);ctx.stroke();
    // arrow: frames → network
    arrow(ctx,fx+fw+4,fy+fh*0.5,w*0.38,fy+fh*0.5,C.cyan,1.4);
    // network box
    box(ctx,w*0.38,h*0.42,w*0.22,36,'ResNet\n+ GRU',C.violet,hexA(C.violet,0.08));
    // arrow: network → action
    arrow(ctx,w*0.60,h*0.51,w*0.72,h*0.51,C.violet,1.4);
    // output action, cycling
    var p=saw(t,4);var acts=['v=0.5 m/s\nω=0.0','v=0.5\nω=+0.3','v=0.4\nω=-0.2','v=0.5\nω=0.0'];
    box(ctx,w*0.72,h*0.42,w*0.20,36,acts[Math.floor(p*acts.length)],C.green,hexA(C.green,0.07));
    // success/fail indicator
    var inDist=p<0.72;
    rrect(ctx,w*0.06,h*0.82,w*0.45,18,5,C.line,hexA(inDist?C.green:C.amber,0.15));
    lab(ctx,inDist?'training env: 87% success':'new building: 41% (distribution shift)',w*0.08,h*0.82+9,inDist?C.green:C.amber,9.5);
    lab(ctx,'one forward pass, 30 ms: no map, no planner, no cost — but distribution shift is the price',14,h-12,C.mut);
  };

  /* nvf_vln — vision-and-language navigation: phrase attention over view patches */
  A.nvf_vln=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'VLN: ground each phrase of the instruction against the live panoramic view',14,16,C.dim);
    // instruction strip at top
    var instr=['"walk past','the plant,','turn left','at the','painting"'];
    var p=saw(t,6);var active=Math.floor(p*instr.length);
    for(var i=0;i<instr.length;i++){var col=i===active?C.amber:hexA(C.ink,0.35);rrect(ctx,w*0.05+i*w*0.17,h*0.14,w*0.15,20,4,col,i===active?hexA(C.amber,0.1):null);lab(ctx,instr[i],w*0.05+i*w*0.17+w*0.075,h*0.14+10,col,8.5,'center');}
    // panoramic view patches
    var patches=['fwd','R45','R90','left','L45','bk'];
    var highlights=[0,0,0,1,0,0]; // "turn left at painting" lights patch 3
    if(active<2)highlights=[0,0,0,0,0,0];
    if(active>=3)highlights=[0,0,0,1,0,0];
    for(var i=0;i<patches.length;i++){var x=w*0.06+i*w*0.145,y=h*0.42,on=highlights[i]&&active>=3;
      rrect(ctx,x,y,w*0.12,44,5,on?C.violet:C.line,on?hexA(C.violet,0.15):null);lab(ctx,patches[i],x+w*0.06,y+22,on?C.violet:C.dim,8.5,'center');}
    lab(ctx,'view patches',w*0.06,h*0.38,C.mut,9);
    // cross-attention arrow
    arrow(ctx,w*0.45,h*0.36,w*0.45,h*0.42,C.amber,1.3);lab(ctx,'cross-\nattend',w*0.47,h*0.36,C.amber,8.5);
    // action selection
    var picked=active>=3?'turn left 285°':'move forward';
    box(ctx,w*0.34,h*0.63,w*0.28,28,picked,C.green,hexA(C.green,0.08));
    lab(ctx,'selected action',w*0.34+w*0.14,h*0.61,C.green,8.5,'center');
    lab(ctx,'phrase-by-phrase grounding: each token attends to the matching view patch, then picks the move',14,h-12,C.mut);
  };

  /* nvf_objgoal — object-goal nav: frontier scoring drives exploration toward the target */
  A.nvf_objgoal=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Object-goal navigation: score frontiers by semantic similarity to the goal, explore smartest first',14,16,C.dim);
    // occupancy sketch — visited cells (explored)
    var gx=w*0.08,gy=h*0.22,cell=14,cols=18,rows=9;
    var explored=[[1,0],[2,0],[3,0],[4,0],[5,0],[1,1],[2,1],[3,1],[4,1],[2,2],[3,2],[4,2],[5,2],[3,3],[4,3],[5,3],[5,4],[5,5],[6,5],[7,5]];
    for(var i=0;i<explored.length;i++){ctx.fillStyle=hexA(C.cyan,0.12);ctx.fillRect(gx+explored[i][0]*cell,gy+explored[i][1]*cell,cell-1,cell-1);}
    // frontier cells (borders of explored)
    var frontiers=[[6,0,'kitchen +0.68'],[5,1,'kitchen +0.63'],[6,2,'hallway +0.31'],[4,4,'bedroom +0.23']];
    var p=saw(t,5);var active=Math.floor(p*frontiers.length);
    for(var i=0;i<frontiers.length;i++){var on=i===0||i<=active;var col=i===0?C.green:i<=active?C.amber:C.dim;
      ctx.fillStyle=hexA(col,0.25);ctx.fillRect(gx+frontiers[i][0]*cell,gy+frontiers[i][1]*cell,cell-1,cell-1);
      lab(ctx,frontiers[i][2],gx+frontiers[i][0]*cell+cell+2,gy+frontiers[i][1]*cell+7,col,8.5);}
    lab(ctx,'frontier scores (cos sim to "fridge")',gx+cols*cell*0.5-40,gy-10,C.mut,8.5);
    // robot
    var rx=gx+explored[Math.min(explored.length-1,Math.floor(p*explored.length))][0]*cell+7;
    var ry=gy+explored[Math.min(explored.length-1,Math.floor(p*explored.length))][1]*cell+7;
    dot(ctx,rx,ry,5,C.cyan);
    // goal
    ring(ctx,gx+frontiers[0][0]*cell+7,gy+frontiers[0][1]*cell+7,7,C.green);
    lab(ctx,'CLIP similarity scores each frontier: the kitchen scores 0.68 — go there first',14,h-12,C.mut);
  };

  /* nvf_semmap — semantic map: features accumulate on voxels, query by word */
  A.nvf_semmap=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Semantic map: CLIP features on every voxel — query by word, no class list needed',14,16,C.dim);
    // grid of voxels (simplified 2D)
    var gx=w*0.08,gy=h*0.24,cell=20,cols=10,rows=6;
    // pre-assigned cluster labels: 0=wall, 1=table/mug, 2=sink, 3=couch, 4=floor
    var labels=[[0,0,0,0,0,0,0,0,0,0],[0,3,3,3,0,2,0,1,1,0],[0,3,3,3,0,2,0,1,1,0],[0,0,4,4,4,4,4,0,0,0],[0,4,4,4,4,4,4,4,0,0],[0,0,0,0,0,0,0,0,0,0]];
    var colmap=[hexA(C.mut,0.4),hexA(C.amber,0.5),hexA(C.cyan,0.55),hexA(C.violet,0.45),hexA(C.dim,0.2)];
    for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){ctx.fillStyle=colmap[labels[j][i]];ctx.fillRect(gx+i*cell,gy+j*cell,cell-1,cell-1);}
    // query word
    var p=saw(t,5);var queries=['sink','coffee mug','couch'];var qi=Math.floor(p*queries.length)%queries.length;
    var targets=[[1,5],[1,7],[1,1]]; // col,row of best match for each query
    rrect(ctx,w*0.06,h*0.82,w*0.22,20,5,C.amber,hexA(C.amber,0.1));lab(ctx,'"'+queries[qi]+'"',w*0.06+w*0.11,h*0.82+10,C.amber,9.5,'center');
    // highlight matching voxels
    var tc=targets[qi];ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.strokeRect(gx+tc[0]*cell-1,gy+tc[1]*cell-1,cell+1,cell+1);
    // sim bar
    var sim=0.81-qi*0.08;lab(ctx,'sim: '+sim.toFixed(2),gx+cols*cell+8,gy+rows*cell*0.5,C.amber,10);
    lab(ctx,'nearest-feature lookup in the CLIP-painted map: open-vocabulary, zero class list needed',14,h-12,C.mut);
  };

  /* nvf_topo — topological navigation: room-graph, A* hop, local metric for each hop */
  A.nvf_topo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Topological navigation: rooms as nodes, doorways as edges — cheap A* across the building',14,16,C.dim);
    // room nodes
    var rooms=[{x:w*0.14,y:h*0.42,name:'office'},{x:w*0.34,y:h*0.30,name:'hall'},{x:w*0.54,y:h*0.42,name:'kitchen'},{x:w*0.74,y:h*0.30,name:'lounge'},{x:w*0.54,y:h*0.66,name:'lab'},{x:w*0.34,y:h*0.66,name:'store'}];
    var edges=[[0,1],[1,2],[1,5],[2,3],[2,4],[3,4]];
    // path: office → hall → kitchen (indices 0,1,2)
    var p=saw(t,5);var pathLen=2;var pathIdx=[0,1,2];var stepF=Math.min(pathLen,Math.floor(p*pathLen+0.01));
    edges.forEach(function(e){ctx.strokeStyle=hexA(C.line,0.8);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rooms[e[0]].x,rooms[e[0]].y);ctx.lineTo(rooms[e[1]].x,rooms[e[1]].y);ctx.stroke();});
    // highlight path edges
    for(var k=0;k<stepF;k++){ctx.strokeStyle=C.green;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(rooms[pathIdx[k]].x,rooms[pathIdx[k]].y);ctx.lineTo(rooms[pathIdx[k+1]].x,rooms[pathIdx[k+1]].y);ctx.stroke();}
    rooms.forEach(function(r,i){var onpath=pathIdx.indexOf(i)!==-1&&pathIdx.indexOf(i)<=stepF;dot(ctx,r.x,r.y,7,onpath?C.green:hexA(C.cyan,0.6));lab(ctx,r.name,r.x,r.y-14,onpath?C.green:C.dim,9,'center');});
    // robot travels along path
    var rx,ry;if(stepF<pathLen){var frac=p*pathLen-stepF;rx=rooms[pathIdx[stepF]].x+(rooms[pathIdx[stepF+1]].x-rooms[pathIdx[stepF]].x)*frac;ry=rooms[pathIdx[stepF]].y+(rooms[pathIdx[stepF+1]].y-rooms[pathIdx[stepF]].y)*frac;}else{rx=rooms[pathIdx[pathLen]].x;ry=rooms[pathIdx[pathLen]].y;}
    dot(ctx,rx,ry,5,C.amber);
    lab(ctx,'a moved chair only re-plans the local hop; the topological route stays unchanged',14,h-12,C.mut);
  };

  /* nvf_social — social navigation: prediction cones + cost field around pedestrians */
  A.nvf_social=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Social navigation: predict where people go, plan through the gaps that will exist',14,16,C.dim);
    var p=saw(t,5);
    // goal
    ring(ctx,w*0.86,h*0.28,8,C.green);lab(ctx,'goal',w*0.86,h*0.20,C.green,9,'center');
    // robot
    var rx=w*0.12+p*w*0.70,ry=h*0.78-p*h*0.44;dot(ctx,rx,ry,7,C.cyan);lab(ctx,'robot',rx,ry+18,C.cyan,8.5,'center');
    // two pedestrians with prediction cones
    var peds=[{x:w*0.42,y:h*0.50,dx:0,dy:-0.7},{x:w*0.64,y:h*0.62,dx:-0.5,dy:-0.4}];
    peds.forEach(function(pd){var px=pd.x+pd.dx*p*50,py=pd.y+pd.dy*p*50;
      dot(ctx,px,py,6,C.violet);
      // prediction cone
      ctx.fillStyle=hexA(C.violet,0.14);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+pd.dx*80-12,py+pd.dy*80);ctx.lineTo(px+pd.dx*80+12,py+pd.dy*80+8);ctx.closePath();ctx.fill();});
    // personal space cost rings
    peds.forEach(function(pd){var px=pd.x+pd.dx*p*50,py=pd.y+pd.dy*p*50;
      ctx.strokeStyle=hexA(C.coral,0.25);ctx.lineWidth=1;for(var r=18;r<=48;r+=15){ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.stroke();}});
    lab(ctx,'predicted future',w*0.44,h*0.28,C.violet,8.5);
    lab(ctx,'personal space',w*0.44,h*0.38,C.coral,8.5);
    lab(ctx,'plan threads the gaps that will exist — not the gaps that exist now',14,h-12,C.mut);
  };

  /* nvf_terrain — terrain-aware navigation: traversability cost map + VLM annotation */
  A.nvf_terrain=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Terrain-aware navigation: every cell has a traversability cost estimated from vision + feel',14,16,C.dim);
    var gx=w*0.06,gy=h*0.22,cell=16,cols=14,rows=7;
    // terrain cost field (manually assigned)
    var costs=[[0.1,0.1,0.1,0.1,0.2,0.2,0.3,0.5,0.8,0.85,0.85,0.8,0.5,0.3],
               [0.1,0.1,0.1,0.2,0.2,0.3,0.4,0.6,0.85,0.9,0.82,0.7,0.5,0.3],
               [0.1,0.1,0.2,0.3,0.3,0.4,0.55,0.72,0.8,0.8,0.6,0.5,0.4,0.2],
               [0.1,0.1,0.2,0.3,0.5,0.55,0.65,0.65,0.6,0.5,0.4,0.3,0.2,0.1],
               [0.1,0.1,0.15,0.2,0.35,0.4,0.4,0.45,0.4,0.35,0.3,0.2,0.1,0.1],
               [0.1,0.1,0.1,0.1,0.2,0.2,0.25,0.25,0.2,0.2,0.1,0.1,0.1,0.1],
               [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]];
    for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){var c=costs[j][i];ctx.fillStyle='rgba('+Math.round(c*220)+','+Math.round((1-c)*180)+',60,0.7)';ctx.fillRect(gx+i*cell,gy+j*cell,cell-1,cell-1);}
    // path skirting high-cost region
    var path=[[0,6],[1,6],[2,5],[3,5],[4,4],[5,4],[6,4],[7,3],[8,2],[9,1],[10,1],[11,1],[12,1],[13,1]];
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();path.forEach(function(p,k){k===0?ctx.moveTo(gx+p[0]*cell+8,gy+p[1]*cell+8):ctx.lineTo(gx+p[0]*cell+8,gy+p[1]*cell+8);});ctx.stroke();
    // start and goal
    dot(ctx,gx+8,gy+rows*cell-8,5,C.cyan);ring(ctx,gx+cols*cell-8,gy+8,7,C.green);
    // VLM label
    rrect(ctx,w*0.60,h*0.50,w*0.28,22,5,C.amber,hexA(C.amber,0.1));lab(ctx,'"wet clay — avoid"',w*0.60+w*0.14,h*0.50+11,C.amber,8.5,'center');
    lab(ctx,'VLM labels unseen terrain types; path adds 8m but cuts slip risk from 0.6 → 0.12',14,h-12,C.mut);
  };

  /* nvf_kinodyn — kinodynamic planning: state space (x,y,theta,v), smooth arc */
  A.nvf_kinodyn=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Kinodynamic planning: the path must respect turning radius, speed, and momentum',14,16,C.dim);
    // show car body + heading arrow
    var p=saw(t,6);
    // arc path a car would take: from bottom-left, smooth 90° turn to top-right
    var N=40;var pts=[];
    for(var k=0;k<=N;k++){var u=k/N;var ang=-Math.PI/2+u*Math.PI*0.55;var cx_=w*0.6,cy_=h*0.55,r_=h*0.34;pts.push([cx_+Math.cos(ang)*r_,cy_+Math.sin(ang)*r_]);}
    // draw smooth path
    ctx.strokeStyle=C.green;ctx.lineWidth=2.2;ctx.beginPath();pts.forEach(function(pt,k){k===0?ctx.moveTo(pt[0],pt[1]):ctx.lineTo(pt[0],pt[1]);});ctx.stroke();
    // ghost straight line (infeasible)
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[N][0],pts[N][1]);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'infeasible\n(sharp turn)',pts[N][0]+8,pts[0][1]+4,C.coral,8.5);
    // moving car along the arc
    var idx=Math.floor(p*N);var car=pts[Math.min(idx,N)];var nxt=pts[Math.min(idx+1,N)];
    var ang2=Math.atan2(nxt[1]-car[1],nxt[0]-car[0]);
    ctx.save();ctx.translate(car[0],car[1]);ctx.rotate(ang2);ctx.fillStyle=hexA(C.amber,0.85);ctx.fillRect(-10,-5,20,10);ctx.restore();
    // state readout
    var vel=Math.round((0.5+0.3*Math.sin(p*TAU))*10)/10;
    rrect(ctx,w*0.06,h*0.70,w*0.32,40,6,C.line,hexA(C.dim,0.08));
    lab(ctx,'v: '+vel+' m/s',w*0.10,h*0.76,C.cyan,9.5);
    lab(ctx,'δ: '+Math.round(15*Math.sin(p*TAU*2))+'°  (steering)',w*0.10,h*0.76+14,C.amber,9.5);
    dot(ctx,pts[0][0],pts[0][1],5,C.cyan);ring(ctx,pts[N][0],pts[N][1],7,C.green);
    lab(ctx,'integrating dynamics during search ensures every waypoint is physically reachable',14,h-12,C.mut);
  };

  /* nvf_reactive — mapless reactive: sensor → action, wall-follow, dead-end escape */
  A.nvf_reactive=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reactive navigation: act on raw sensor readings right now, no map built or consulted',14,16,C.dim);
    var p=saw(t,7);
    // U-shaped room — walls as filled rects with visible color
    ctx.fillStyle=hexA(C.mut,0.35);
    // top wall
    ctx.fillRect(w*0.20,h*0.24,w*0.62,h*0.08);
    // left wall
    ctx.fillRect(w*0.20,h*0.24,w*0.06,h*0.54);
    // right wall
    ctx.fillRect(w*0.76,h*0.24,w*0.06,h*0.54);
    // bottom-left stub (U bottom left)
    ctx.fillRect(w*0.20,h*0.70,w*0.24,h*0.08);
    // bottom-right stub (U bottom right)
    ctx.fillRect(w*0.58,h*0.70,w*0.24,h*0.08);
    // interior of U - slightly lighter than background so it's visible
    ctx.fillStyle=hexA(C.cyan,0.03);ctx.fillRect(w*0.26,h*0.32,w*0.50,h*0.38);
    // LIDAR rays (fan)
    var rx=w*0.38+p*w*0.26,ry=h*0.62;var nrays=18;
    for(var k=0;k<nrays;k++){var a=-Math.PI+k*(Math.PI/nrays);
      var ex2=rx+Math.cos(a)*55,ey2=ry+Math.sin(a)*55;
      ctx.strokeStyle=hexA(C.cyan,0.28);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(ex2,ey2);ctx.stroke();}
    dot(ctx,rx,ry,6,C.cyan);
    // goal outside (past right wall)
    ring(ctx,w*0.88,h*0.40,7,C.green);lab(ctx,'goal',w*0.88,h*0.32,C.green,8.5,'center');
    // wall-follow arrow
    if(p<0.55){arrow(ctx,rx,ry,rx+28,ry-14,C.amber,1.6);lab(ctx,'wall-follow',rx+30,ry-8,C.amber,8.5);}
    else{arrow(ctx,rx,ry,rx-16,ry+24,C.coral,1.6);lab(ctx,'escape:\nback up!',rx-50,ry+14,C.coral,8.5);}
    // congestion indicator
    var cong=p>0.5?'local min detected':'exploring';
    rrect(ctx,w*0.06,h*0.82,w*0.35,18,5,C.line,p>0.5?hexA(C.coral,0.15):null);lab(ctx,cong,w*0.08,h*0.82+9,p>0.5?C.coral:C.dim,9.5);
    lab(ctx,'congestion detector: 8s in 1m radius → declare local min, back up, try second-best gap',14,h-12,C.mut);
  };

  /* nvf_worldmodel — navigation world model: imagine action consequences, pick best */
  A.nvf_worldmodel=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Navigation world model: imagine what happens before acting — zero-shot in new buildings',14,16,C.dim);
    var p=saw(t,5);
    // current observation box
    rrect(ctx,w*0.05,h*0.32,w*0.22,h*0.38,6,C.cyan,hexA(C.cyan,0.06));lab(ctx,'current\nview',w*0.05+w*0.11,h*0.51,C.cyan,9.5,'center');
    // candidate actions
    var acts=['forward','left 30°','right 30°'];var sims=[0.71,0.28,0.34];
    for(var i=0;i<acts.length;i++){var y=h*0.30+i*h*0.18;var on=i===0;
      rrect(ctx,w*0.38,y,w*0.18,28,5,on?C.green:C.line,on?hexA(C.green,0.1):null);lab(ctx,acts[i],w*0.38+w*0.09,y+14,on?C.green:C.dim,9,'center');
      // imagined future box
      rrect(ctx,w*0.60,y,w*0.16,28,5,C.line,hexA(C.amber,on?0.12:0.04));lab(ctx,'sim: '+sims[i].toFixed(2),w*0.60+w*0.08,y+14,on?C.amber:C.dim,9,'center');
      arrow(ctx,w*0.56,y+14,w*0.60,y+14,on?C.green:hexA(C.dim,0.4),1.2);}
    // world model box
    rrect(ctx,w*0.32,h*0.50,w*0.14,24,5,C.violet,hexA(C.violet,0.1));lab(ctx,'world\nmodel',w*0.32+w*0.07,h*0.50+12,C.violet,9,'center');
    arrow(ctx,w*0.27,h*0.51,w*0.32,h*0.51,C.cyan,1.3);
    // hallucination warning flashes
    if(p>0.75){rrect(ctx,w*0.55,h*0.77,w*0.36,20,5,C.coral,hexA(C.coral,0.15));lab(ctx,'hallucination: wall misplaced — depth stop triggered',w*0.57,h*0.77+10,C.coral,8.5);}
    lab(ctx,'5 imagined rollouts per real step; pick highest CLIP similarity to goal — no map, zero-shot',14,h-12,C.mut);
  };

  /* nvf_localize — place recognition: descriptor match → geometric verification → pose */
  A.nvf_localize=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Place recognition: match the current view to a reference database, refine the pose',14,16,C.dim);
    var p=saw(t,5);
    // database thumbnails (left column)
    var refs=[{y:h*0.28,label:'#845 sim:0.62'},{y:h*0.43,label:'#847 sim:0.91'},{y:h*0.58,label:'#853 sim:0.44'}];
    var best=Math.floor(p*refs.length+0.01)%refs.length===0?1:Math.floor(p*2)%3;
    refs.forEach(function(r,i){var on=i===best&&p>0.35;rrect(ctx,w*0.06,r.y,w*0.20,28,5,on?C.green:C.line,on?hexA(C.green,0.12):null);lab(ctx,r.label,w*0.06+w*0.10,r.y+14,on?C.green:C.dim,9,'center');});
    lab(ctx,'database',w*0.06+w*0.10,h*0.22,C.mut,9,'center');
    // arrow → query
    arrow(ctx,w*0.28,h*0.48,w*0.40,h*0.48,C.cyan,1.3);
    // keypoint match box
    rrect(ctx,w*0.40,h*0.39,w*0.24,50,6,C.violet,hexA(C.violet,0.08));lab(ctx,'SIFT keypoints\n64 inliers / RANSAC\nPnP refinement',w*0.40+w*0.12,h*0.39+25,C.violet,8.5,'center');
    // pose output
    arrow(ctx,w*0.64,h*0.48,w*0.72,h*0.48,C.violet,1.3);
    rrect(ctx,w*0.72,h*0.39,w*0.20,50,6,C.green,hexA(C.green,0.1));lab(ctx,'pose:\n(14.27, 3.08)\n91.4°',w*0.72+w*0.10,h*0.39+25,C.green,9,'center');
    lab(ctx,'error: 0.08 m  0.6°',w*0.72+w*0.10,h*0.55,C.green,8.5,'center');
    // error bar
    var err=Math.max(2,Math.round((1-Math.min(1,p*1.6))*80));
    lab(ctx,'lookup: 12 ms | inlier ratio: 0.71',w*0.06,h*0.78,C.dim,9);
    lab(ctx,'nearest-descriptor lookup + PnP gives centimeter pose without GPS',14,h-12,C.mut);
  };

  /* nvf_simtoreal — sim-to-real: splat sim + randomization → real deploy */
  A.nvf_simtoreal=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sim-to-real: train on photorealistic splat renders, deploy to the real robot first day',14,16,C.dim);
    var p=saw(t,6);
    // pipeline stages
    var stages=[['scan\nreal room','4 min','cyan'],['splat\nreconstruct','4 min','cyan'],['domain\nrandom.','train 6h','amber'],['deploy\nreal robot','day 1','green']];
    var active=Math.min(stages.length-1,Math.floor(p*stages.length));
    for(var i=0;i<stages.length;i++){var x=w*0.08+i*w*0.22,on=i<=active;
      var col=on?C[stages[i][2]]||C.cyan:C.dim;
      rrect(ctx,x,h*0.38,w*0.17,52,7,on?col:C.line,on?hexA(col,0.10):null);
      lab(ctx,stages[i][0],x+w*0.085,h*0.38+20,on?col:C.dim,9.5,'center');
      lab(ctx,stages[i][1],x+w*0.085,h*0.38+38,on?hexA(col,0.8):C.dim,8.5,'center');
      if(i<stages.length-1)arrow(ctx,x+w*0.17+2,h*0.38+26,x+w*0.22-2,h*0.38+26,on&&i<active?col:hexA(C.dim,0.4),1.3);}
    // success rate bars
    var rates=[{label:'sim (benchmark)',val:0.90,col:C.cyan},{label:'real (first day)',val:0.74,col:C.green},{label:'new apartment',val:0.61,col:C.amber}];
    rates.forEach(function(r,i){var y=h*0.68+i*h*0.07;lab(ctx,r.label,w*0.06,y+5,r.col,8.5);var bw=w*0.55;ctx.fillStyle=hexA(r.col,0.2);ctx.fillRect(w*0.30,y,bw,10);ctx.fillStyle=r.col;ctx.fillRect(w*0.30,y,bw*r.val,10);lab(ctx,Math.round(r.val*100)+'%',w*0.30+bw*r.val+4,y+5,r.col,8.5);});
    lab(ctx,'photorealistic splat sim + randomization: 74% first-day success vs 58% without',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.nvanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-nvanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
