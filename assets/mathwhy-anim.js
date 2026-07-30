/* mathwhy-anim.js — theme-specific first-principles diagrams for the-math-why.html.
   A[name]=fn(ctx,w,h,t); canvases carry data-mwanim="name". Self-contained boot. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              green:'#6FCf7f', ink:'#E7EFF1', mut:'#8B9BA2', dim:'#7C89B0', line:'#243250', blue:'#7A88D6' };
  const TAU=Math.PI*2;
  function fit(cv){const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=parseInt(cv.getAttribute('height'))||280;
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


A.mw_gen=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'Denoising: noise → data mode',14,16,C.dim);
  var p=saw(t,2);
  var cy=h/2;
  rrect(ctx,50,cy-50,60,100,3,hexA(C.cyan,0.3),hexA(C.cyan,0.08));
  for(var i=0;i<8;i++){
    var a=(i/8)*TAU;
    dot(ctx,50+30+25*Math.cos(a),cy+25*Math.sin(a),2,hexA(C.cyan,0.6));
  }
  rrect(ctx,300,cy-45,50,40,2,hexA(C.green,0.3),hexA(C.green,0.08));
  rrect(ctx,300,cy+30,50,40,2,hexA(C.green,0.3),hexA(C.green,0.08));
  for(var i=0;i<3;i++){
    arrow(ctx,130,cy+(i-1)*35,260,cy+(i-1)*35,hexA(C.amber,0.7),1.5);
  }
  dot(ctx,150+p*150,cy+(Math.sin(p*TAU)-0.5)*20,5,C.coral);
  lab(ctx,'follow score &nabla;log p, land in one mode',14,h-12,C.mut);
};

A.mw_ctl=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'MPC feedback: track and correct',14,16,C.dim);
  var p=saw(t,2), decay=Math.pow(0.85,p*12), cy=h/2;
  ctx.strokeStyle=hexA(C.green,0.8);ctx.lineWidth=2.5;ctx.beginPath();
  for(var i=0;i<50;i++){
    var x=100+i*3;
    if(i===0)ctx.moveTo(x,cy-20);else ctx.lineTo(x,cy-20);
  }ctx.stroke();
  ctx.strokeStyle=hexA(C.coral,0.8);ctx.beginPath();
  for(var i=0;i<50;i++){
    var x=100+i*3;
    if(i===0)ctx.moveTo(x,cy+20+30*decay*Math.cos(i*0.3));else ctx.lineTo(x,cy+20+30*decay*Math.cos(i*0.3));
  }ctx.stroke();
  arrow(ctx,150+p*250,cy+20*decay+15,150+p*250,cy+20*decay+5,hexA(C.blue,0.8),2);
  lab(ctx,'re-solve each tick, feed back state',14,h-12,C.mut);
};

A.mw_saf=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'Safety filter: keep state in safe set',14,16,C.dim);
  var p=saw(t,3), cx=w/2, cy=h/2, ang=p*TAU, rad=75+15*Math.sin(p*TAU*2);
  ring(ctx,cx,cy,80,hexA(C.green,0.5));
  dot(ctx,cx+130,cy-80,6,hexA(C.coral,0.9));
  var dx=Math.cos(ang), dy=Math.sin(ang);
  dot(ctx,cx+rad*dx,cy+rad*dy,5,C.blue);
  arrow(ctx,cx+rad*dx+20*dx,cy+rad*dy+20*dy,cx+rad*dx-10*dx,cy+rad*dy-10*dy,hexA(C.amber,0.8),2);
  lab(ctx,'boundary forbids outward velocity ḣ≥0',14,h-12,C.mut);
};

A.mw_fnd=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'Foundation model: one brain, many jobs',14,16,C.dim);
  var p=saw(t,2), seed=123;
  for(var i=0;i<20;i++){
    var cols=[C.cyan,C.amber,C.violet];
    var col_idx=Math.floor((seed*i)%3);
    dot(ctx,40+((seed*i)%200),30+((seed*i*2)%220),1.5,hexA(cols[col_idx],0.5));
  }
  var cx=w/2, cy=h/2;
  rrect(ctx,cx-25,cy-30,50,60,3,hexA(C.blue,0.6),hexA(C.blue,0.1));
  arrow(ctx,120,cy,cx-30,cy,hexA(C.cyan,0.7),1.5);
  var jobs=['plan','see','read'];
  var colors=[C.green,C.amber,C.coral];
  for(var i=0;i<3;i++){
    var jy=cy-40+i*40;
    rrect(ctx,550,jy-15,60,30,2,hexA(colors[i],0.4),hexA(colors[i],0.08));
    arrow(ctx,cx+25,cy,545,jy,hexA(colors[i],0.6),1.3);
  }
  lab(ctx,'compress world structure, reuse for tasks',14,h-12,C.mut);
};

A.mw_gs=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'render is differentiable',14,16,C.dim);
  var p=saw(t,2);
  var rings=[];
  for(var i=0;i<6;i++) rings.push({x:80+i*15,y:80+Math.sin(i*0.7)*20,r:8+Math.random()*4});
  rings.forEach(function(r){ring(ctx,r.x,r.y,r.r,hexA(C.coral,0.4))});
  var px=280,py=120;
  box(ctx,px-30,py-40,60,80,'pixels',C.ink,hexA(C.amber,0.15));
  arrow(ctx,140,90,px-30,py,C.green,1.6);
  var fade=Math.max(0,Math.min(1,(p-0.5)*2));
  arrow(ctx,px,py,150,100,hexA(C.green,fade*0.8),1.6);
  var dotx=80+p*200,doty=120;
  dot(ctx,dotx,doty,3,C.coral);
  var psnr=Math.floor(12+p*23);
  lab(ctx,'PSNR '+psnr+' dB → error backprop shapes the geometry',14,h-12,C.mut);
};

A.mw_pe=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'two rays meet = triangulate',14,16,C.dim);
  var p=saw(t,2);
  dot(ctx,80,80,4,C.blue);
  dot(ctx,100,140,4,C.blue);
  var x3d=200+p*100,y3d=110;
  dot(ctx,x3d,y3d,5,C.coral);
  arrow(ctx,80,80,x3d,y3d,C.cyan,1.4);
  arrow(ctx,100,140,x3d,y3d,C.cyan,1.4);
  var reproject_err=Math.max(0.1,2.1-p*1.4);
  var np=Math.round(500*(1-p*0.3));
  lab(ctx,'2 views × 500 points → reprojection error '+reproject_err.toFixed(1)+' px',14,h-12,C.mut);
};

A.mw_ov=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'image & text in one space',14,16,C.dim);
  var p=saw(t,2);
  var angle=p*Math.PI*2;
  var img_x=200+80*Math.cos(angle),img_y=140+40*Math.sin(angle);
  dot(ctx,img_x,img_y,5,C.amber);
  var txt_x=200+78*Math.cos(angle+0.1),txt_y=140+38*Math.sin(angle+0.1);
  dot(ctx,txt_x,txt_y,4,C.violet);
  ring(ctx,200,140,95,hexA(C.cyan,0.2));
  var sim=Math.max(0.08,0.31-p*0.23);
  arrow(ctx,150,200,250,200,C.green,1.2);
  lab(ctx,'similarity '+sim.toFixed(2)+' → rank text by one metric',14,h-12,C.mut);
};

A.mw_wm=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'latent rollout: compress, then roll forward',14,16,C.dim);
  var p=saw(t,2);
  box(ctx,30,80,60,40,'obs\n64x64',C.ink,C.cyan2);
  arrow(ctx,90,100,130,100,C.amber);
  box(ctx,130,85,50,30,'z_t\n32-d',C.ink,C.violet);
  for(var i=0;i<5;i++){
    var x=180+i*40;
    var s=Math.max(0.3,1-p*0.4);
    ring(ctx,x,100,s*8,C.green);
  }
  arrow(ctx,480,100,520,100,C.amber);
  box(ctx,520,85,50,30,'pred',C.ink,C.coral);
  lab(ctx,'roll is ms per step, render is 33 ms per frame',14,h-12,C.mut);
};

A.mw_vla=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'vision-language-action: tokens in, tokens out',14,16,C.dim);
  var p=saw(t,2.5);
  box(ctx,20,80,70,40,'image\n196 patches',C.ink,C.cyan);
  box(ctx,95,80,70,40,'language\n4 tokens',C.ink,C.violet);
  arrow(ctx,70,120,130,160,C.amber);
  arrow(ctx,145,120,140,160,C.amber);
  rrect(ctx,110,160,80,40,4,C.line,hexA(C.ink,0.1));
  lab(ctx,'transform',70,180,C.dim,9);
  arrow(ctx,150,200,180,220,C.amber);
  var ax=[40,120,200,280,360];
  for(var i=0;i<5;i++){
    var idx=Math.min(ax.length-1,Math.floor(p*ax.length));
    if(i===idx){dot(ctx,ax[i],240,6,C.coral);}
    else{dot(ctx,ax[i],240,3,C.line);}
  }
  lab(ctx,'each joint becomes a token (0-255), like words',14,h-12,C.mut);
};

A.mw_dp=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'DDIM: skip noise levels, keep quality',14,16,C.dim);
  var p=saw(t,2);
  var sigmas=[7.0,6.3,5.6,4.9,4.2,3.5,2.8,2.1,1.4,0.7,0.001];
  for(var i=0;i<Math.min(11,sigmas.length);i++){
    var x=50+i*60;
    var h_bar=30+(10-i)*16;
    var isFull=(i%2===0);
    var col=(p*10<i)?C.dim:C.coral;
    rrect(ctx,x-8,h_bar,16,16,2,col,isFull?hexA(col,0.3):'none');
  }
  var step=Math.floor(p*10);
  var x_now=50+step*60;
  dot(ctx,x_now,180,8,C.amber);
  lab(ctx,'100 steps become 10 by skipping; same quality',14,h-12,C.mut);
};

A.mw_gr=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Force closure: three contacts',14,16,C.dim);
    var cx=w/2, cy=h/2, r=60, ang=saw(t,2)*TAU;
    dot(ctx,cx,cy,8,C.ink); // object center
    var n=3, contacts=[{a:0},{a:2.094},{a:4.189}];
    var i=Math.min(2,Math.floor(saw(t,2)*3));
    for(var j=0;j<n;j++){
      var a=contacts[j].a;
      var px=cx+r*Math.cos(a), py=cy+r*Math.sin(a);
      dot(ctx,px,py,5,j===i?C.coral:C.cyan);
      var fx=50*Math.cos(a+0.5), fy=50*Math.sin(a+0.5);
      arrow(ctx,px,py,px+fx*0.4,py+fy*0.4,j===i?C.coral:C.cyan,2);
    }
    lab(ctx,'forces span all directions = stable',14,h-12,C.mut);
  };

  A.mw_ta=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Gel tactile: marker shifts → force',14,16,C.dim);
    var gx=w/2-80, gy=h/2, gs=15, phase=saw(t,2);
    box(ctx,gx-40,gy-30,80,60,'gel',C.dim,C.ink);
    var grid=[];
    for(var y=0;y<3;y++){for(var x=0;x<3;x++){
      var dx=(phase-0.5)*8, dy=-phase*6;
      var px=gx-20+x*gs+dx, py=gy-20+y*gs+dy;
      dot(ctx,px,py,2,C.amber);
      grid.push({x:px,y:py});
    }}
    var cx=w/2+60, cy=h/2;
    arrow(ctx,gx+50,gy,cx-20,cy,C.coral,1.6);
    lab(ctx,'0.5 N',cx-15,cy-10,C.coral,9);
    var idx=Math.min(grid.length-1,Math.floor(phase*grid.length));
    var p=grid[idx];
    arrow(ctx,p.x,p.y,cx+40,cy,C.green,2);
    lab(ctx,'deformation inverts to pressure field',14,h-12,C.mut);
  };

  A.mw_lo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Capture point: where CoM must land',14,16,C.dim);
    var phase=saw(t,3.5), footx=w/4+phase*100, comy=h/2-40;
    var comx=footx-30+phase*20, comt=phase*TAU;
    // inverted pendulum stick
    rrect(ctx,comx-2,comy-60,4,60,1,C.ink,C.ink);
    dot(ctx,comx,comy,6,C.coral); // CoM
    var cpx=comx+76*phase; // capture point ahead
    dot(ctx,cpx,comy+30,5,C.green); // capture point
    // foot support
    box(ctx,footx-25,comy+30,50,8,'foot',C.dim,C.line);
    arrow(ctx,comx-5,comy+5,cpx-5,comy+25,C.amber,1.6);
    lab(ctx,'0.076 m ahead',cpx-30,comy+45,C.amber,9);
    lab(ctx,'land foot under capture point = stable',14,h-12,C.mut);
  };

  A.mw_hw=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Series-elastic: spring absorbs impact',14,16,C.dim);
    var phase=saw(t,2.5);
    // rigid (top), spring (middle), load (bottom)
    box(ctx,w/4-30,40,60,20,'motor',C.dim,C.line);
    var spring_compress=phase*30;
    rrect(ctx,w/4-15,60+spring_compress,30,40-spring_compress,3,C.amber,hexA(C.amber,0.2));
    box(ctx,w/4-20,100+spring_compress,40,20,'load',C.dim,C.line);
    // force signal on right
    var rigid_idx=Math.min(100,Math.floor(phase*100));
    var impact=[3500,3200,2800,2100,1400,700,300];
    var imp_idx=Math.min(impact.length-1,Math.floor(phase*impact.length));
    var fy=h/2-60+saw(phase,1)*50;
    arrow(ctx,w/2+20,fy,w/2+60,fy,phase<0.4?C.coral:C.green,2);
    lab(ctx,phase<0.4?'3500 N spike':'300 N smooth pulse',w/2+20,fy-15,phase<0.4?C.coral:C.green,9);
    lab(ctx,'spring filters impact: 2 ms → 40 ms',14,h-12,C.mut);
  };

// Theme diagram animators for nv, mr, dr, md

A.mw_nv=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'RRT path planning',14,16,C.dim);
  // scattered samples connected into a tree; highlight shortest path
  var phase=saw(t,2)*100;
  var samples=[{x:60,y:120},{x:150,y:80},{x:280,y:140},{x:180,y:200},{x:320,y:160}];
  for(var i=0;i<samples.length;i++){
    dot(ctx,samples[i].x,samples[i].y,3,C.ink);
  }
  // tree edges
  arrow(ctx,60,120,150,80,C.line,1);
  arrow(ctx,150,80,180,200,C.line,1);
  arrow(ctx,180,200,280,140,C.line,1);
  arrow(ctx,280,140,320,160,C.line,1);
  // path from start to goal
  var pathIdx=Math.min(samples.length-1,Math.floor(phase/20));
  dot(ctx,60,120,5,C.coral); dot(ctx,samples[pathIdx].x,samples[pathIdx].y,5,C.green);
  lab(ctx,'search explores, path threads the free corridor',14,h-12,C.mut);
};

A.mw_mr=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'MAPF: decompose joint→local',14,16,C.dim);
  // 4 agents on a grid, each planning; predicted paths shown as dashed
  var agents=[{x:80,y:100,goal:300},{x:180,y:80,goal:300},{x:280,y:140,goal:300},{x:380,y:200,goal:200}];
  var phase=saw(t,2.5);
  for(var i=0;i<agents.length;i++){
    var ag=agents[i];
    dot(ctx,ag.x,ag.y,6,C.cyan);
    // dashed predicted path toward goal
    var steps=Math.floor(phase*5);
    for(var s=1;s<=Math.min(steps,3);s++){
      var px=ag.x+s*30;
      dot(ctx,Math.min(px,ag.goal),ag.y+Math.random()*20-10,2,hexA(C.cyan,0.4));
    }
  }
  // one collision arrow between 1 and 2
  if(phase>0.3&&phase<0.8){
    arrow(ctx,130,90,230,85,C.coral,1.5);
  }
  lab(ctx,'split into local subproblems, exchange predicted paths',14,h-12,C.mut);
};

A.mw_dr=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'BEV fuse→predict→plan',14,16,C.dim);
  // BEV grid, sensor fusion arrows, agents, plan trajectory
  rrect(ctx,50,60,200,150,2,C.line,hexA(C.ink,0.1));
  lab(ctx,'BEV 200×200',60,120,C.dim,9);
  // 4 agent dots in BEV
  dot(ctx,100,90,5,C.cyan); dot(ctx,140,100,5,C.cyan);
  dot(ctx,170,130,5,C.cyan); dot(ctx,110,140,5,C.cyan);
  // predicted trajectories (dashed)
  var phase=saw(t,2);
  for(var i=0;i<4;i++){
    var step=Math.min(Math.floor(phase*6),5);
    if(step>0) arrow(ctx,Math.random()*30+100,Math.random()*40+80,
      Math.random()*30+140,Math.random()*40+100,hexA(C.amber,0.5),1);
  }
  // ego plan (solid green path)
  arrow(ctx,250,100,350,120,C.green,2);
  lab(ctx,'fuse cameras/LiDAR, predict agents, plan ego trajectory at 10 Hz',14,h-12,C.mut);
};

A.mw_md=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'ICP registration: align clouds',14,16,C.dim);
  // live scan shape on left, preop scan on right; animate them sliding into alignment
  var phase=saw(t,2.2);
  var offset=phase*60;
  // live scan (left): irregular blob
  for(var i=0;i<4;i++){
    var angle=i*TAU/4+Math.random();
    var r=30+Math.random()*10;
    dot(ctx,100+Math.cos(angle)*r-offset,120+Math.sin(angle)*r+10,3,C.coral);
  }
  // preop scan (right): reference blob
  for(var i=0;i<4;i++){
    var angle=i*TAU/4-0.2;
    var r=30+Math.random()*8;
    dot(ctx,300+Math.cos(angle)*r+offset,120+Math.sin(angle)*r-10,3,C.green);
  }
  lab(ctx,'Live and preop clouds slide into alignment via iterative matching',14,h-12,C.mut);
};

A.mw_se=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'domain randomization: cover the real coefficient',14,16,C.dim);
  var phase=saw(t,4);
  var simX=150, realX=580, cy=140;
  var simSigma=80, realSigma=20;
  var realMu=0.55, simMin=0.4, simMax=1.2;
  var sampleCount=Math.floor(phase*8)+1;
  var samples=[0.42,0.58,0.71,0.89,1.05,1.18,0.51,0.76];
  for(var i=0;i<Math.min(sampleCount,samples.length);i++){
    var s=samples[i];
    var px=simX+((s-simMin)/(simMax-simMin))*200-100;
    dot(ctx,px,cy+(Math.random()-0.5)*40,3,C.cyan);
  }
  ring(ctx,simX,cy,simSigma,hexA(C.cyan,0.3));
  lab(ctx,'sim U[0.4,1.2]',simX-50,cy+80,C.dim,9);
  dot(ctx,realX,cy,4,C.coral);
  ring(ctx,realX,cy,realSigma,hexA(C.coral,0.3));
  lab(ctx,'real μ=0.55',realX-45,cy+80,C.dim,9);
  if(phase>0.5){
    arrow(ctx,simX+60,cy-20,realX-60,cy-20,C.amber,1.2);
    lab(ctx,'inside',320,cy-30,C.amber,9);
  }
  lab(ctx,'randomize so real is already in training',14,h-12,C.mut);
};

A.mw_rl=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'policy gradient: weight by return',14,16,C.dim);
  var phase=saw(t,4);
  var cx=100, cy=140, radius=100;
  var returns=[42,18,-5,-12,35,8,-8,25];
  var maxR=42, minR=-12;
  for(var i=0;i<returns.length;i++){
    var angle=(i/returns.length)*Math.PI*2;
    var x=cx+Math.cos(angle)*radius;
    var y=cy+Math.sin(angle)*radius;
    var r=returns[i];
    var normalized=(r-minR)/(maxR-minR);
    var sz=2+normalized*6;
    var col=(r>20)?C.green:(r<0)?C.coral:C.amber;
    dot(ctx,x,y,sz,col);
  }
  lab(ctx,'returns',cx-30,cy+130,C.dim,9);
  var arrowPhase=phase*1.5;
  if(arrowPhase<1){
    var idx=Math.floor(arrowPhase*returns.length);
    idx=Math.min(idx,returns.length-1);
    var angle=(idx/returns.length)*Math.PI*2;
    var x=cx+Math.cos(angle)*radius;
    var y=cy+Math.sin(angle)*radius;
    arrow(ctx,x,y,cx+80,cy-50,C.violet,1.4);
  }
  rrect(ctx,400,80,220,120,8,C.line,hexA(C.ink,0.05));
  lab(ctx,'∇θ J ∝ Σ log π·G',410,120,C.dim,10);
  lab(ctx,'high-return actions get\nupweighted',410,150,C.dim,9);
  lab(ctx,'climb expected return through action weights',14,h-12,C.mut);
};

A.mw_vt=function(ctx,w,h,t){clear(ctx,w,h);
  lab(ctx,'tracking: carry belief forward, correct per frame',14,16,C.dim);
  var phase=saw(t,4);
  var frameStep=60, frameY=140;
  var frames=[
    {label:'frame 0',x:80,det:true},
    {label:'frame 1',x:180,det:true},
    {label:'frame 2',x:280,det:false},
    {label:'frame 3',x:380,det:false},
    {label:'frame 4',x:480,det:false},
    {label:'frame 5',x:580,det:true}
  ];
  for(var f=0;f<frames.length;f++){
    var frame=frames[f];
    if(phase*frames.length>=f){
      rrect(ctx,frame.x-25,frameY-15,50,40,3,C.dim,hexA(C.ink,0.1));
      lab(ctx,frame.label,frame.x-18,frameY+35,C.dim,8);
      if(frame.det){
        dot(ctx,frame.x,frameY,5,C.green);
        lab(ctx,'detect',frame.x-15,frameY-25,C.green,8);
      }else{
        ring(ctx,frame.x,frameY,5,C.coral);
        lab(ctx,'occ',frame.x-10,frameY-25,C.coral,8);
      }
    }
  }
  var trackPhase=Math.max(0,phase-0.3);
  if(trackPhase>0){
    var fromF=Math.floor(trackPhase*(frames.length-1));
    fromF=Math.min(fromF,frames.length-2);
    var from=frames[fromF];
    var to=frames[fromF+1];
    arrow(ctx,from.x+20,frameY,to.x-20,frameY,C.blue,1.2);
    lab(ctx,'predict',130+(fromF*50),frameY-40,C.blue,8);
  }
  lab(ctx,'predict, match, update in a loop across frames',14,h-12,C.mut);
};


  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.mwanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-mwanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'280'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
