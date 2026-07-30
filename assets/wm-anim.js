/* wm-anim.js — first-principles mechanism animators for the World-Models explainer.
   Same harness contract as gs-anim.js: A[name]=fn(ctx,w,h,t); canvases carry data-wmanim="name".
   Self-contained boot so it can't disturb other animator files. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              green:'#6FCf7f', ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440' };
  const TAU=Math.PI*2;
  function fit(cv){ const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth, h=parseInt(cv.getAttribute('height'))||300;
    cv.width=w*dpr; cv.height=h*dpr; const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return {ctx,w,h}; }
  function clear(ctx,w,h){ctx.clearRect(0,0,w,h);}
  function lab(ctx,s,x,y,col,size,align){ctx.save();ctx.font=(size||10.5)+'px ui-monospace,Menlo,monospace';
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
  function hexA(hex,a){const n=parseInt(hex.slice(1),16);return'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
  function rrect(ctx,x,y,w,h,r,stroke,fill){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath(); if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke();}}
  // labelled box centered text
  function box(ctx,x,y,w,h,text,col,fill){rrect(ctx,x,y,w,h,7,col,fill||null);lab(ctx,text,x+w/2,y+h/2,col,11,'center');}
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||1.6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),s=6;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-0.4),y2-s*Math.sin(a-0.4));ctx.lineTo(x2-s*Math.cos(a+0.4),y2-s*Math.sin(a+0.4));ctx.closePath();ctx.fill();ctx.restore();}
  function dot(ctx,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  // a spark travelling a segment at phase p (0..1)
  function spark(ctx,x1,y1,x2,y2,p,col){const x=x1+(x2-x1)*p,y=y1+(y2-y1)*p;dot(ctx,x,y,3,col);}
  const saw=(t,p)=>((t%p)/p), ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

  const A={};

  /* 01 — WHAT A WORLD MODEL IS: a policy maps state->action; a world model maps (state,action)->next state. */
  A.wm_core=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A world model learns to answer one question: “what happens next if I do this?”',14,16,C.dim);
    const p=saw(t,3);
    // policy row (muted)
    const py=h*0.34;
    box(ctx,w*0.06,py-16,w*0.16,32,'state',C.mut);
    arrow(ctx,w*0.23,py,w*0.36,py,hexA(C.mut,0.7));
    box(ctx,w*0.37,py-16,w*0.16,32,'action',C.mut);
    lab(ctx,'a POLICY just reacts:  state → action',w*0.56,py,C.mut,11);
    // world-model row (highlighted)
    const wy=h*0.60;
    box(ctx,w*0.06,wy-30,w*0.16,26,'state',C.cyan);
    box(ctx,w*0.06,wy+4,w*0.16,26,'action',C.amber);
    arrow(ctx,w*0.23,wy,w*0.40,wy,C.cyan,1.8); spark(ctx,w*0.23,wy,w*0.40,wy,p,C.ink);
    box(ctx,w*0.41,wy-16,w*0.30,32,'next state (predicted)',C.green,hexA(C.green,0.06));
    lab(ctx,'a WORLD MODEL predicts:  (state, action) → next state',14,wy+52,C.ink,11);
    lab(ctx,'learn this, and you can rehearse the future before taking a single real step',14,wy+70,C.dim,10.5);
  };

  /* 02 — ENCODE TO A LATENT: a big noisy observation becomes a small state you can predict in. */
  A.wm_encode=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Pixels are huge and noisy — first compress the world to a small state',14,16,C.dim);
    // pixel grid
    const gx=w*0.08,gy=h*0.32,cs=Math.min(18,(w*0.24)/6);
    for(let i=0;i<6;i++)for(let j=0;j<6;j++){const hue=((i*40+j*20+ (Math.sin(t)*20))%360);
      ctx.fillStyle='hsl('+hue+',45%,55%)';ctx.fillRect(gx+i*cs,gy+j*cs,cs-1,cs-1);}
    lab(ctx,'observation (pixels)',gx,gy+6*cs+14,C.mut);
    // encoder
    arrow(ctx,gx+6*cs+6,gy+3*cs,gx+6*cs+40,gy+3*cs,C.cyan,1.6);
    box(ctx,gx+6*cs+42,gy+3*cs-16,64,32,'encoder',C.cyan);
    arrow(ctx,gx+6*cs+108,gy+3*cs,gx+6*cs+146,gy+3*cs,C.cyan,1.6);
    // latent z (a few dots + short code bars)
    const zx=gx+6*cs+150,zy=gy+3*cs;
    rrect(ctx,zx,zy-24,84,48,8,C.green,hexA(C.green,0.06));
    for(let k=0;k<5;k++){const v=0.4+0.5*Math.abs(Math.sin(t*0.8+k));ctx.fillStyle=C.green;ctx.fillRect(zx+10+k*13,zy+12-v*22,7,v*22);}
    lab(ctx,'latent state z',zx,zy+34,C.green);
    lab(ctx,'a few numbers, not a million pixels',zx-4,zy+50,C.dim,10);
    lab(ctx,'predict the FUTURE in this small space → fast, and it ignores irrelevant detail',14,h-12,C.mut);
  };

  /* 03 — ROLLOUT / IMAGINE: from z0, roll the dynamics forward under chosen actions; branch alternative futures. */
  A.wm_rollout=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Imagine: roll the dynamics forward in your head — no real steps taken',14,16,C.dim);
    const x0=w*0.08,yy=h*0.44,dx=(w*0.84)/4;
    // main branch z0..z3
    const p=saw(t,4)*4;
    for(let k=0;k<4;k++){const x=x0+dx*k;
      if(k<3){arrow(ctx,x+12,yy,x+dx-12,yy,C.cyan,1.6);lab(ctx,'a'+k,x+dx/2,yy-12,C.amber,10,'center');}
      dot(ctx,x,yy,7,k===0?C.ink:C.cyan);lab(ctx,'z'+k,x,yy+18,k===0?C.ink:C.cyan,10,'center');
      if(k<3){const seg=Math.max(0,Math.min(1,p-k));spark(ctx,x+12,yy,x+dx-12,yy,seg,C.amber);}
    }
    lab(ctx,'dynamics: zₖ, aₖ → zₖ₊₁',x0,yy-30,C.dim,10);
    // alternative branch from z1
    const bx=x0+dx, by=h*0.78;
    arrow(ctx,bx+8,yy+6,bx+dx-12,by,hexA(C.violet,0.9),1.4);lab(ctx,"a1'",bx+dx*0.5,yy+40,C.violet,10);
    dot(ctx,bx+dx,by,6,C.violet);lab(ctx,"z2'",bx+dx,by+16,C.violet,10,'center');
    arrow(ctx,bx+dx+10,by,bx+2*dx-12,by,hexA(C.violet,0.9),1.4);dot(ctx,bx+2*dx,by,6,C.violet);lab(ctx,"z3'",bx+2*dx,by+16,C.violet,10,'center');
    lab(ctx,'try a different action → a different imagined future',bx+8,by-14,C.violet,10);
  };

  /* 04 — PLAN / LEARN IN IMAGINATION: score dreamed rollouts by predicted reward; pick the best (or train on them). */
  A.wm_plan=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Now use the dream: score imagined rollouts, keep the best plan',14,16,C.dim);
    const rows=[['+2',C.mut],['+8',C.green],['-1',C.coral]];
    const best=1; const hi=Math.floor(saw(t,4)*3)%3;
    rows.forEach((r,i)=>{const y=h*0.32+i*h*0.22, on=(i===best);
      for(let k=0;k<4;k++){const x=w*0.1+k*(w*0.5/4);
        if(k<3)arrow(ctx,x+9,y,x+w*0.5/4-9,y,on?C.green:hexA(C.mut,0.6),on?1.6:1);
        dot(ctx,x,y,5,on?C.green:C.mut);}
      lab(ctx,'reward '+r[0],w*0.64,y,on?C.green:r[1],12);
      if(on){lab(ctx,'▸ pick this action sequence',w*0.64,y+15,C.green,10);}
      if(i===hi&&!on){ctx.strokeStyle=hexA(C.amber,0.4);ctx.strokeRect(w*0.08,y-12,w*0.54,24);}
    });
    lab(ctx,'planning: choose the best imagined sequence.   or — TRAIN a policy on this dreamed experience (free data).',14,h-12,C.mut);
  };

  /* 05 — TWO SCHOOLS: predict the next FRAME (video world model) vs the next STATE (latent dynamics). */
  A.wm_schools=function(ctx,w,h,t){clear(ctx,w,h);
    const midY=h*0.5;ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(0,midY);ctx.lineTo(w,midY);ctx.stroke();
    // top: video world model — predict frames
    lab(ctx,'VIDEO world model — predict the next FRAME',14,16,C.cyan);
    const fy=h*0.30,fw=Math.min(64,w*0.14),fh=fw*0.6,p=saw(t,3)*3;
    for(let k=0;k<4;k++){const x=w*0.08+k*(w*0.2);
      // little frame
      const g=ctx.createLinearGradient(x,fy,x+fw,fy+fh);g.addColorStop(0,hexA(C.cyan,0.5));g.addColorStop(1,hexA(C.violet,0.4));
      rrect(ctx,x,fy-fh/2,fw,fh,4,C.cyan,g);
      if(k<3){arrow(ctx,x+fw+3,fy,x+w*0.2-3,fy,hexA(C.cyan,0.8),1.4);const seg=Math.max(0,Math.min(1,p-k));spark(ctx,x+fw+3,fy,x+w*0.2-3,fy,seg,C.ink);}
    }
    lab(ctx,'photoreal, heavy — you can watch the future; great for driving sims & data',14,fy+fh/2+16,C.mut);
    // bottom: latent dynamics — predict states
    lab(ctx,'LATENT dynamics — predict the next STATE',14,midY+22,C.green);
    const zy=h*0.78;
    for(let k=0;k<6;k++){const x=w*0.08+k*(w*0.14);dot(ctx,x,zy,6,C.green);
      if(k<5)arrow(ctx,x+9,zy,x+w*0.14-9,zy,hexA(C.green,0.8),1.4);}
    lab(ctx,'compact, fast — for control & planning; you cannot “watch” it, but it’s cheap to roll far ahead',14,zy+20,C.mut);
  };

  // ===== per-family diagrams (wave 2a: families 1-8) =====

  // F1 DREAMER — learn mostly in imagination; touch reality rarely.
  A.wmf_dreamer=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Dreamer: practise in the dream, touch reality only to stay honest',14,16,C.dim);
    // real world (small, left)
    box(ctx,w*0.05,h*0.42,w*0.18,h*0.2,'real world',C.mut);
    lab(ctx,'act occasionally',w*0.05,h*0.68,C.mut,10);
    // world model (center)
    box(ctx,w*0.34,h*0.40,w*0.2,h*0.24,'world model',C.cyan,hexA(C.cyan,0.06));
    arrow(ctx,w*0.235,h*0.5,w*0.335,h*0.5,C.mut,1); lab(ctx,'a little data',w*0.235,h*0.4,C.mut,9.5);
    // big imagination loop (right)
    const cx=w*0.78,cy=h*0.5,r=Math.min(w,h)*0.26,a=saw(t,3)*TAU;
    ctx.strokeStyle=hexA(C.violet,0.8);ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    dot(ctx,cx+Math.cos(a)*r,cy+Math.sin(a)*r,5,C.ink);
    arrow(ctx,w*0.545,h*0.5,cx-r-4,cy,C.violet,1.8);
    lab(ctx,'imagine',cx-16,cy-8,C.violet,10);lab(ctx,'rollouts',cx-16,cy+6,C.violet,10);
    lab(ctx,'train the policy',cx-30,cy-r-8,C.violet,10);lab(ctx,'on dreamed data',cx-30,cy+r+12,C.violet,10);
    // thin arrow back to real
    arrow(ctx,cx,cy+r+4,w*0.14,h*0.62,hexA(C.mut,0.5),1);
    lab(ctx,'millions of imagined steps for the price of GPU time; a few real ones to calibrate',14,h-12,C.mut);
  };

  // F2 MPC — plan H steps, take one, replan (receding horizon).
  A.wmf_mpc=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Model-predictive control: fan out plans, score them, take one step, replan',14,16,C.dim);
    const x0=w*0.1,yy=h*0.5,H=w*0.5;
    dot(ctx,x0,yy,6,C.ink);lab(ctx,'now',x0-6,yy+18,C.ink,10);
    // candidate rollouts fanning out
    const cands=[[-0.16,'+2',C.mut],[0.02,'+9',C.green],[0.16,'-1',C.coral]];
    cands.forEach((c,i)=>{const ey=yy+c[0]*h; const on=(c[1]==='+9');
      ctx.strokeStyle=on?C.green:hexA(c[2],0.7);ctx.lineWidth=on?2:1.2;
      ctx.beginPath();ctx.moveTo(x0,yy);ctx.bezierCurveTo(x0+H*0.4,yy,x0+H*0.6,ey,x0+H,ey);ctx.stroke();
      lab(ctx,'reward '+c[1],x0+H+8,ey,on?C.green:c[2],11);
      if(on)lab(ctx,'▸ best plan',x0+H+8,ey+15,C.green,10);});
    // execute step 1
    const sp=saw(t,3);dot(ctx,x0+ (H*0.14)*Math.min(1,sp*2),yy - 0.16*h* (0)*0,4,C.amber);
    arrow(ctx,x0,yy,x0+H*0.14,yy+0.02*h,C.amber,2);lab(ctx,'execute step 1',x0,yy-14,C.amber,10);
    lab(ctx,'roll ~1000 action sequences through the learned model · keep the best · take one step · shift the window',14,h-12,C.mut);
  };

  // F3 VIDEO DIFFUSION SIM — noise -> denoise -> future frames, steered by an action.
  A.wmf_viddiff=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Video diffusion as a simulator: denoise noise into the future, steered by an action',14,16,C.dim);
    const fy=h*0.5,fw=Math.min(66,w*0.14),fh=fw*0.62,p=saw(t,3);
    for(let k=0;k<4;k++){const x=w*0.08+k*(w*0.22);
      // noisiness decreases along the row and with time
      const noise=Math.max(0,1-(p*4-k));
      const g=ctx.createLinearGradient(x,fy,x+fw,fy+fh);g.addColorStop(0,hexA(C.cyan,0.5*(1-noise)+0.1));g.addColorStop(1,hexA(C.violet,0.4*(1-noise)+0.1));
      rrect(ctx,x,fy-fh/2,fw,fh,4,C.cyan,g);
      if(noise>0.15){ctx.fillStyle=hexA(C.ink,noise*0.5);for(let n=0;n<30;n++){const rx=x+((n*37)%fw),ry=fy-fh/2+((n*53)%fh);ctx.fillRect(rx,ry,1.5,1.5);}}
      if(k<3)arrow(ctx,x+fw+3,fy,x+w*0.22-3,fy,hexA(C.cyan,0.8),1.4);}
    lab(ctx,'noise → clean',w*0.08,fy+fh/2+16,C.mut);
    // action condition feeding in
    box(ctx,w*0.4,h*0.18,w*0.2,26,'action / prompt',C.amber);arrow(ctx,w*0.5,h*0.28,w*0.5,fy-fh/2-4,hexA(C.amber,0.8),1.4);
    lab(ctx,'a photoreal, watchable guess at what that action produces — a scenario or free training data',14,h-12,C.mut);
  };

  // F4 CONTROLLABLE VIDEO — you draw a path; the generated future obeys.
  A.wmf_control=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Playable video: you steer (a path, a joystick) and the future obeys',14,16,C.dim);
    // a frame
    rrect(ctx,w*0.06,h*0.28,w*0.5,h*0.5,8,C.line,hexA(C.cyan,0.04));
    // drawn trajectory
    const p=saw(t,4);const ax=w*0.12,ay=h*0.68;
    ctx.strokeStyle=hexA(C.amber,0.9);ctx.lineWidth=2;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.bezierCurveTo(w*0.2,h*0.35,w*0.4,h*0.7,w*0.5,h*0.38);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'you draw this path',ax,ay+16,C.amber,10);
    // object following it
    const bez=(t0,p0,p1,p2,p3)=>{const u=1-t0;return u*u*u*p0+3*u*u*t0*p1+3*u*t0*t0*p2+t0*t0*t0*p3;};
    const ox=bez(p,ax,w*0.2,w*0.4,w*0.5),oy=bez(p,ay,h*0.35,h*0.7,h*0.38);
    dot(ctx,ox,oy,8,C.cyan);
    // generated frames strip on the right echoing the motion
    for(let k=0;k<3;k++){const x=w*0.62,y=h*0.3+k*h*0.16;rrect(ctx,x,y,w*0.3,h*0.12,4,C.line,hexA(C.cyan,0.05));
      const fp=(k+1)/4;dot(ctx,x+w*0.3*fp,y+h*0.06,4,C.cyan);}
    lab(ctx,'the model treats your path as a condition → generates frames where the object follows it',14,h-12,C.mut);
  };

  // F5 DRIVING OCCUPANCY FORECAST — top-down grid; forecast which cells fill, into the future.
  A.wmf_occ=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Driving world model: forecast which cells will be filled, into the future',14,16,C.dim);
    const gx=w*0.08,gy=h*0.3,cell=Math.min(20,(h*0.5)/6),cols=6,rows=6;
    const step=Math.floor(saw(t,3)*3); // t, t+1, t+2
    for(let s=0;s<3;s++){const ox=gx+s*(cols*cell+w*0.06);
      // grid
      ctx.strokeStyle=hexA(C.mut,0.25);for(let i=0;i<=cols;i++){ctx.beginPath();ctx.moveTo(ox+i*cell,gy);ctx.lineTo(ox+i*cell,gy+rows*cell);ctx.stroke();}
      for(let j=0;j<=rows;j++){ctx.beginPath();ctx.moveTo(ox,gy+j*cell);ctx.lineTo(ox+cols*cell,gy+j*cell);ctx.stroke();}
      // ego (center bottom)
      ctx.fillStyle=C.cyan;ctx.fillRect(ox+2*cell+2,gy+5*cell+2,cell-4,cell-4);
      // an other-car occupancy moving up over time
      const carRow=4-s;ctx.fillStyle=hexA(s<=step?C.coral:C.coral,s<=step?0.85:0.25);ctx.fillRect(ox+3*cell+2,gy+carRow*cell+2,cell-4,cell-4);
      lab(ctx,s===0?'now':'t+'+s,ox,gy-8,s===step?C.ink:C.dim,10);
    }
    lab(ctx,'ego (cyan) plans a path through cells forecast to stay free; the other car (red) is predicted to move up',14,h-12,C.mut);
  };

  // F6 DEFORMABLE DYNAMICS — a particle/graph cloth; action -> predicted next shape.
  A.wmf_deform=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Manipulation world model: predict how the STUFF moves, not just the robot',14,16,C.dim);
    const p=0.5-0.5*Math.cos(saw(t,3)*TAU);
    function cloth(ox,oy,pull,col,lbl){const N=5,sp=Math.min(24,(w*0.3)/5);
      const pts=[];for(let i=0;i<N;i++){const row=[];for(let j=0;j<N;j++){
        // pull the top-right corner down-right by 'pull'
        const wgt=(i/(N-1))*(j/(N-1));
        row.push([ox+j*sp+pull*22*wgt, oy+i*sp+pull*16*wgt*0.6]);}pts.push(row);}
      ctx.strokeStyle=hexA(col,0.6);ctx.lineWidth=1;
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){if(j<N-1){ctx.beginPath();ctx.moveTo(...pts[i][j]);ctx.lineTo(...pts[i][j+1]);ctx.stroke();}
        if(i<N-1){ctx.beginPath();ctx.moveTo(...pts[i][j]);ctx.lineTo(...pts[i+1][j]);ctx.stroke();}}
      for(let i=0;i<N;i++)for(let j=0;j<N;j++)dot(ctx,pts[i][j][0],pts[i][j][1],2,col);
      lab(ctx,lbl,ox,oy+N*sp+14,C.mut,10);return pts;}
    cloth(w*0.08,h*0.32,0,C.mut,'state now');
    const pr=cloth(w*0.56,h*0.32,p,C.cyan,'predicted next state');
    // action arrow
    arrow(ctx,w*0.4,h*0.4,w*0.52,h*0.4,C.amber,1.6);lab(ctx,'action: pull corner',w*0.38,h*0.32,C.amber,10);
    lab(ctx,'a graph of particles + springs; the learned dynamics predicts the deformed shape for planning',14,h-12,C.mut);
  };

  // F7 3DGS WORLD MODEL — blobs + physics particles; predict, render, correct by visual mismatch.
  A.wmf_splatwm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Gaussian-splat world model: the splat is the state, the renderer, AND the physics body',14,16,C.dim);
    const p=saw(t,3);
    // particles (physics) with blobs on them, drifting under an action
    const cx=w*0.26,cy=h*0.5;
    for(let i=0;i<6;i++){const a=i*1.05,r=40;const px=cx+Math.cos(a)*r+p*40,py=cy+Math.sin(a)*r*0.7;
      // blob
      const g=ctx.createRadialGradient(px,py,0,px,py,16);g.addColorStop(0,hexA(i%2?C.cyan:C.violet,0.7));g.addColorStop(1,hexA(i%2?C.cyan:C.violet,0));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,16,0,TAU);ctx.fill();
      dot(ctx,px,py,2,C.ink);}
    lab(ctx,'blobs render · particles do physics',cx-50,cy+70,C.mut,10);
    arrow(ctx,w*0.44,cy,w*0.56,cy,C.cyan,1.6);lab(ctx,'render',w*0.44,cy-10,C.dim,10);
    // predicted render vs camera
    rrect(ctx,w*0.58,h*0.34,w*0.16,h*0.3,6,C.cyan,hexA(C.cyan,0.05));lab(ctx,'predicted',w*0.6,h*0.3,C.cyan,10);
    rrect(ctx,w*0.78,h*0.34,w*0.16,h*0.3,6,C.amber,hexA(C.amber,0.05));lab(ctx,'real camera',w*0.79,h*0.3,C.amber,10);
    // visual force correction arrow
    arrow(ctx,w*0.78,h*0.7,w*0.5,h*0.62,hexA(C.coral,0.9),1.6);lab(ctx,'mismatch = a “visual force” nudging the particles back',w*0.3,h-12,C.mut);
  };

  // F8 TOKENIZED DYNAMICS — compress a scene to a few discrete tokens; predict tokens, not pixels.
  A.wmf_tokens=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Tokenized dynamics: keep the meaning, drop the pixels',14,16,C.dim);
    // pixel scene
    const gx=w*0.06,gy=h*0.34,cs=Math.min(15,(w*0.18)/6);
    for(let i=0;i<6;i++)for(let j=0;j<6;j++){ctx.fillStyle='hsl('+((i*40+j*18)%360)+',42%,55%)';ctx.fillRect(gx+i*cs,gy+j*cs,cs-1,cs-1);}
    lab(ctx,'scene',gx,gy+6*cs+14,C.mut,10);
    arrow(ctx,gx+6*cs+6,gy+3*cs,gx+6*cs+34,gy+3*cs,C.cyan,1.4);lab(ctx,'encode',gx+6*cs+2,gy+3*cs-12,C.dim,9);
    // 8 tokens now
    const tx=gx+6*cs+40,ty=gy+3*cs;
    for(let k=0;k<8;k++){ctx.fillStyle=C.green;ctx.fillRect(tx+(k%4)*16,ty-14+Math.floor(k/4)*16,13,13);}
    lab(ctx,'8 tokens',tx,ty+26,C.green,10);
    // predict next tokens
    arrow(ctx,tx+70,ty,tx+108,ty,C.violet,1.6);lab(ctx,'predict',tx+70,ty-14,C.violet,9);lab(ctx,'+ action',tx+70,ty+14,C.amber,9);
    const nx=tx+114;for(let k=0;k<8;k++){ctx.fillStyle=hexA(C.violet,0.85);ctx.fillRect(nx+(k%4)*16,ty-14+Math.floor(k/4)*16,13,13);}
    lab(ctx,'next 8 tokens',nx-6,ty+26,C.violet,10);
    lab(ctx,'roll tokens far ahead for ~100× cheaper planning; only decode to pixels if a human needs to look',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){ if(running.has(cv))return; const anim=A[cv.dataset.wmanim]; if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;
    function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf)); cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-wmanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
