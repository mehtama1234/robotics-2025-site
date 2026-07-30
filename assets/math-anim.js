/* math-anim.js — first-principles mechanism animators for the Mathematical Foundations explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-mathanim="name". Self-contained boot.
   FP animators: mf_*  ·  per-family animators: mff_*  (appended before boot). */
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

  /* 01 — OPTIMIZATION: define a loss, follow its slope downhill. The master recipe. */
  A.mf_optimize=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Almost every method is one recipe: write down what\'s wrong, then walk downhill',14,16,C.dim);
    const gx=w*0.08,gw=w*0.84,base=h*0.78,top=h*0.30;
    // a wiggly loss curve with a shallow local dip and a deep global min
    const L=(fx)=>{return Math.exp(-((fx-0.32)**2)/0.02)*0.35 + Math.exp(-((fx-0.72)**2)/0.03)*1.0;};
    ctx.strokeStyle=hexA(C.mut,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const fx=i/gw;const y=base-(1-L(fx))* (base-top);ctx.lineTo(gx+i,base-(0)+ (L(fx))*0 - ( (base-top)*(1-L(fx))) + (base-top) );}
    // simpler: recompute cleanly
    ctx.beginPath();for(let i=0;i<=gw;i++){const fx=i/gw;const val=1-L(fx);const y=top+val*(base-top);if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}ctx.stroke();
    lab(ctx,'loss surface (lower = better)',gx,top-8,C.mut,9);
    // a ball descending via gradient steps toward the global min at fx≈0.72
    const p=saw(t,4);const fx=0.1+p*0.62;const val=1-L(fx);const bx=gx+fx*gw,by=top+val*(base-top);
    dot(ctx,bx,by,6,C.amber);
    // gradient (tangent) arrow
    const d=0.01;const slope=((1-L(fx+d))-(1-L(fx-d)))/(2*d);
    arrow(ctx,bx,by,bx-24,by-24*Math.max(-3,Math.min(3,slope))*0.15,C.cyan,1.6);
    lab(ctx,'−gradient: the steepest way down',bx-40,by-30,C.cyan,8.5);
    lab(ctx,'local dip',gx+0.30*gw-20,base-8,C.mut,8);lab(ctx,'global min',gx+0.72*gw-20,base-8,C.green,8.5);
    lab(ctx,'the loss says what "good" means; the gradient says which way to move — repeat until it stops improving',14,h-12,C.mut);
  };

  /* 02 — BAYES: prior belief × new evidence → sharper posterior. */
  A.mf_bayes_fp=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Reasoning under uncertainty: start with a belief, let evidence sharpen it',14,16,C.dim);
    const gx=w*0.08,gw=w*0.84,base=h*0.74,amp=h*0.34;
    const gauss=(fx,mu,s)=>Math.exp(-((fx-mu)**2)/(2*s*s));
    function curve(mu,s,col,lw,lbl,lx){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();
      for(let i=0;i<=gw;i++){const fx=i/gw;const y=base-gauss(fx,mu,s)*amp;if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}ctx.stroke();
      if(lbl)lab(ctx,lbl,gx+lx*gw,base-gauss(lx,mu,s)*amp-10,col,9);}
    // prior (wide), likelihood (evidence, a bump), posterior (product: narrower, shifted between)
    const evShift=0.55+Math.sin(t*0.8)*0.06;
    curve(0.4,0.16,hexA(C.violet,0.9),2,'prior belief',0.22);
    curve(evShift,0.10,hexA(C.amber,0.9),2,null);
    lab(ctx,'evidence',gx+(evShift+0.12)*gw,base-amp*0.5,hexA(C.amber,0.95),9);
    // posterior mean ~ precision-weighted; narrower
    const pm=(0.4/(0.16*0.16)+evShift/(0.10*0.10))/(1/(0.16*0.16)+1/(0.10*0.10));
    const ps=Math.sqrt(1/(1/(0.16*0.16)+1/(0.10*0.10)));
    curve(pm,ps,C.green,2.6,null);
    lab(ctx,'posterior',gx+(pm-0.16)*gw,base-amp-6,C.green,9,'right');
    lab(ctx,'posterior ∝ prior × likelihood — sharper and pulled toward the evidence',14,h-12,C.mut);
  };

  /* 03 — GEOMETRY / LINEAR ALGEBRA: points are vectors, motion is a matrix, SVD finds the axes. */
  A.mf_geometry=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The language of space: points are vectors, a transform is a matrix',14,16,C.dim);
    const cx=w*0.3,cy=h*0.54;
    // a small point cloud (elongated) + its principal axes (SVD), rotating rigidly
    const ang=saw(t,8)*TAU*0.15+0.3;
    const pts=[];for(let i=0;i<24;i++){const u=(i/24-0.5);const a=u*2.2, b=(((i*7)%5)-2)/2*0.5;pts.push([a,b]);}
    ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);
    pts.forEach(p=>dot(ctx,p[0]*34,p[1]*34,2.6,C.cyan));
    // principal axes (major = spread direction, minor)
    arrow(ctx,0,0,80,0,C.amber,2);arrow(ctx,0,0,0,-30,C.green,2);
    ctx.restore();
    lab(ctx,'point cloud + its principal axes (SVD)',cx-50,cy+56,C.mut,8.5);
    lab(ctx,'major axis',cx+70,cy-20,C.amber,8);
    // right: a rigid transform box R,t
    box(ctx,w*0.66,h*0.34,w*0.26,26,'apply R (rotate) + t (shift)',C.violet,hexA(C.violet,0.08));
    lab(ctx,'a matrix moves every point the same way;\nSVD splits any matrix into rotate · scale · rotate',w*0.62,h*0.56,C.mut,8.5);
    lab(ctx,'vectors, matrices, and their axes are the substrate under pose, features, and geometry',14,h-12,C.mut);
  };

  /* 04 — ATTENTION: similarity → softmax weights → weighted mixture. */
  A.mf_attention_fp=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Attention: each item gathers from all others, weighted by relevance',14,16,C.dim);
    const qx=w*0.12,qy=h*0.5;dot(ctx,qx,qy,8,C.amber);lab(ctx,'query',qx-12,qy+22,C.amber,9);
    // keys with similarity to the query -> softmax bars -> weighted sum
    const keys=[[0.9],[0.3],[0.6],[0.15]];const p=saw(t,4);
    // similarity wobbles a touch
    const sims=keys.map((k,i)=>k[0]*(0.85+0.15*Math.sin(t+i)));
    const ex=sims.map(s=>Math.exp(s*3));const Z=ex.reduce((a,b)=>a+b,0);const wts=ex.map(e=>e/Z);
    const ky=[h*0.28,h*0.44,h*0.6,h*0.76];
    keys.forEach((k,i)=>{const kx=w*0.42;dot(ctx,kx,ky[i],6,C.cyan);
      ctx.strokeStyle=hexA(C.cyan,0.3+wts[i]);ctx.lineWidth=1+wts[i]*4;ctx.beginPath();ctx.moveTo(qx+8,qy);ctx.lineTo(kx-6,ky[i]);ctx.stroke();
      // weight bar
      ctx.fillStyle=hexA(C.green,0.8);ctx.fillRect(w*0.56,ky[i]-5,wts[i]*w*0.18,10);lab(ctx,'w='+wts[i].toFixed(2),w*0.56+wts[i]*w*0.18+4,ky[i],C.mut,8);});
    lab(ctx,'keys',w*0.42-10,h*0.2,C.cyan,9);lab(ctx,'softmax weights',w*0.56,h*0.2,C.green,9);
    // output = weighted sum
    box(ctx,w*0.82,qy-13,w*0.14,26,'weighted\nmix',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.74,qy,w*0.82,qy,C.violet,1.4);
    lab(ctx,'softmax(query · keys) turns similarities into weights; the output is their weighted average of values',14,h-12,C.mut);
  };

  /* 05 — SCORE / DIFFUSION: sample a hard distribution by following the gradient of log-density. */
  A.mf_score_fp=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sampling a distribution you can\'t write down: follow the slope toward where data is dense',14,16,C.dim);
    // two density blobs (modes) with a vector field pointing toward them; a particle climbing
    const modes=[[w*0.36,h*0.44],[w*0.64,h*0.62]];
    // faint density
    modes.forEach(m=>{for(let r=40;r>0;r-=10){ctx.strokeStyle=hexA(C.violet,0.06);ctx.beginPath();ctx.arc(m[0],m[1],r,0,TAU);ctx.stroke();}});
    // score field (arrows point uphill toward nearest mode)
    for(let ix=0;ix<8;ix++)for(let iy=0;iy<4;iy++){const x=w*0.14+ix*w*0.1,y=h*0.3+iy*h*0.13;
      let bm=modes[0],bd=1e9;modes.forEach(m=>{const d=(m[0]-x)**2+(m[1]-y)**2;if(d<bd){bd=d;bm=m;}});
      const dx=bm[0]-x,dy=bm[1]-y,l=Math.hypot(dx,dy)||1;arrow(ctx,x,y,x+dx/l*10,y+dy/l*10,hexA(C.cyan,0.4),1);}
    // a particle starting from noise, climbing the score to a mode
    const p=saw(t,4);const sx=w*0.12+p* (w*0.36-w*0.12),sy=h*0.24+p*(h*0.44-h*0.24);
    dot(ctx,sx,sy,5,C.amber);lab(ctx,'sample climbs the score',sx+6,sy-8,C.amber,8.5);
    modes.forEach(m=>dot(ctx,m[0],m[1],4,C.green));
    lab(ctx,'the "score" is the gradient of log-density; start from noise and follow it to where real data lives',14,h-12,C.mut);
  };

  // ==== per-family animators (mff_*) are appended here, before the boot section ====

  /* mff_gradient — loss curve + ball taking discrete downhill steps */
  A.mff_gradient=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Gradient Descent: θ ← θ − η∇L   (walk downhill on the loss surface)',w/2,14,C.ink,10.5,'center');
    const gx=w*0.09,gw=w*0.82,base=h*0.78,top=h*0.22;
    const L=function(fx){return 0.8*Math.exp(-((fx-0.75)**2)/0.03)+0.3*Math.exp(-((fx-0.35)**2)/0.06);};
    // draw loss curve
    ctx.strokeStyle=hexA(C.mut,0.85);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const fx=i/gw;const val=1-L(fx);const y=top+val*(base-top);if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}ctx.stroke();
    lab(ctx,'loss L(θ)',gx,top-8,C.mut,9);
    // discrete steps: 6 positions from θ=0.12 toward min ~0.75
    const steps=[0.12,0.24,0.38,0.52,0.63,0.71,0.75];
    const p=saw(t,5);const nVisible=1+Math.floor(p*(steps.length-1));
    for(let i=0;i<nVisible&&i<steps.length;i++){
      const fx=steps[i];const val=1-L(fx);const bx=gx+fx*gw,by=top+val*(base-top);
      if(i<nVisible-1){
        const fx2=steps[i+1];const val2=1-L(fx2);const bx2=gx+fx2*gw,by2=top+val2*(base-top);
        arrow(ctx,bx,by,bx2,by2,hexA(C.cyan,0.7),1.4);
      }
      dot(ctx,bx,by,i===nVisible-1?6:3.5,i===nVisible-1?C.amber:hexA(C.amber,0.45));
      if(i===nVisible-1&&i<steps.length-1){
        const d=0.015;const slope=((1-L(fx+d))-(1-L(fx-d)))/(2*d);
        const sc=Math.max(-4,Math.min(4,slope));
        arrow(ctx,bx,by,bx-22,by-22*sc*0.25,C.cyan,1.5);
        lab(ctx,'-∇L',bx-28,by-28,C.cyan,9,'center');
      }
    }
    lab(ctx,'global min',gx+0.74*gw,base-6,C.green,8.5);dot(ctx,gx+0.75*gw,top+(1-L(0.75))*(base-top),4,C.green);
    lab(ctx,'steps shrink near the minimum as the gradient → 0; learning rate η sets how far each step jumps',14,h-12,C.mut);
  };

  /* mff_leastsq — scattered points + best-fit line + residuals */
  A.mff_leastsq=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Least Squares: find the line that minimises Σ(yᵢ − ŷᵢ)²   (sum of squared residuals)',w/2,14,C.ink,10.5,'center');
    const pts=[[0.10,0.60],[0.18,0.48],[0.27,0.54],[0.38,0.34],[0.44,0.46],[0.55,0.28],[0.64,0.32],[0.72,0.18],[0.82,0.24],[0.92,0.10]];
    const ox=w*0.1,ow=w*0.82,oy=h*0.78,oh=h*0.54;
    // slight tilt animation for best-fit line
    const wobble=Math.sin(t*0.6)*0.04;
    const slope=-0.52+wobble,intercept=0.62;
    const px=function(fx){return ox+fx*ow;};
    const py=function(fy){return oy-fy*oh;};
    // draw best-fit line
    ctx.strokeStyle=hexA(C.cyan,0.8);ctx.lineWidth=1.8;ctx.beginPath();
    ctx.moveTo(px(0.05),py(intercept+slope*0.05));ctx.lineTo(px(0.97),py(intercept+slope*0.97));ctx.stroke();
    lab(ctx,'fit',px(0.97)+2,py(intercept+slope*0.97),C.cyan,8.5);
    // draw points + residuals
    pts.forEach(function(p){
      const fx=p[0],fy=p[1];const predicted=intercept+slope*fx;
      ctx.strokeStyle=hexA(C.coral,0.55);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px(fx),py(fy));ctx.lineTo(px(fx),py(predicted));ctx.stroke();
      dot(ctx,px(fx),py(fy),4,C.amber);
    });
    lab(ctx,'residual',px(0.44)+4,py(0.46)-4,C.coral,8.5);
    // axis
    ctx.strokeStyle=hexA(C.line,0.9);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox,py(0));ctx.lineTo(ox+ow,py(0));ctx.stroke();
    ctx.beginPath();ctx.moveTo(ox,py(0));ctx.lineTo(ox,py(1.05));ctx.stroke();
    lab(ctx,'minimise Σ residual²   →   closed-form solution: θ = (XᵀX)⁻¹Xᵀy',14,h-12,C.mut);
  };

  /* mff_bayes — prior × likelihood → posterior (stacked bars) */
  A.mff_bayes=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bayes Rule: P(θ|data) ∝ P(data|θ) · P(θ)   — evidence sharpens belief',w/2,14,C.ink,10.5,'center');
    const gx=w*0.09,gw=w*0.82,amp=h*0.22;
    const gauss=function(fx,mu,s){return Math.exp(-((fx-mu)**2)/(2*s*s));};
    const rowY=[h*0.32,h*0.56,h*0.78];const labels=['prior  P(θ)','likelihood  P(data|θ)','posterior  P(θ|data)'];
    const colors=[C.violet,C.amber,C.green];
    const evMu=0.58+Math.sin(t*0.7)*0.05;
    const priorMu=0.40,priorS=0.14,likeS=0.09;
    const postPrec=1/(priorS*priorS)+1/(likeS*likeS);
    const postMu=(priorMu/(priorS*priorS)+evMu/(likeS*likeS))/postPrec;
    const postS=Math.sqrt(1/postPrec);
    const params=[[priorMu,priorS],[evMu,likeS],[postMu,postS]];
    params.forEach(function(pm,ri){
      const mu=pm[0],s=pm[1];const col=colors[ri];const by=rowY[ri];
      // fill region
      ctx.fillStyle=hexA(col,0.12);ctx.beginPath();
      ctx.moveTo(gx,by);
      for(let i=0;i<=gw;i++){const fx=i/gw;ctx.lineTo(gx+i,by-gauss(fx,mu,s)*amp);}
      ctx.lineTo(gx+gw,by);ctx.closePath();ctx.fill();
      ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<=gw;i++){const fx=i/gw;const y=by-gauss(fx,mu,s)*amp;if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}ctx.stroke();
      lab(ctx,labels[ri],gx,by-amp-12,col,9);
    });
    // arrows between rows
    arrow(ctx,w*0.5,rowY[0]+6,w*0.5,rowY[1]-6,hexA(C.mut,0.5),1.2);
    arrow(ctx,w*0.5,rowY[1]+6,w*0.5,rowY[2]-6,hexA(C.mut,0.5),1.2);
    lab(ctx,'posterior is narrower and shifted toward the evidence — we know more after observing data',14,h-12,C.mut);
  };

  /* mff_filter — Kalman-style predict→update cycle */
  A.mff_filter=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Kalman Filter: predict (uncertainty grows) then correct with measurement (uncertainty shrinks)',w/2,14,C.ink,10.5,'center');
    const p=saw(t,4);
    const track=[[w*0.18,h*0.5],[w*0.38,h*0.42],[w*0.58,h*0.38],[w*0.78,h*0.46]];
    // true path (faint)
    ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=1.2;ctx.beginPath();
    track.forEach(function(pt,i){if(i===0)ctx.moveTo(pt[0],pt[1]);else ctx.lineTo(pt[0],pt[1]);});ctx.stroke();
    // states
    track.forEach(function(pt,i){
      const frac=i/3;const phase=p*3;
      if(frac>phase)return;
      // at predict step: wide ellipse
      const postPhase=(phase-frac)*3;const predRx=18+postPhase*12,predRy=12+postPhase*6;
      ctx.strokeStyle=hexA(C.amber,0.35);ctx.lineWidth=1.2;
      ctx.beginPath();ctx.ellipse(pt[0],pt[1],Math.min(predRx,28),Math.min(predRy,20),0,0,TAU);ctx.stroke();
      // after update: narrower
      ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=1.5;
      ctx.beginPath();ctx.ellipse(pt[0],pt[1],8,5,0,0,TAU);ctx.stroke();
      // estimate dot
      dot(ctx,pt[0],pt[1],3.5,C.cyan);
      if(i<3){
        arrow(ctx,pt[0],pt[1],track[i+1][0]-4,track[i+1][1],hexA(C.cyan,0.5),1.2);
      }
      if(i===0){lab(ctx,'predict\n(widens)',pt[0]-26,pt[1]-34,C.amber,8);}
      if(i===1){lab(ctx,'update\n(shrinks)',pt[0]+4,pt[1]-28,C.cyan,8);}
    });
    // measurement dots (noisy)
    const measY=[h*0.56,h*0.34,h*0.44,h*0.38];
    track.forEach(function(pt,i){dot(ctx,pt[0]+(i%2?8:-6),measY[i],3,C.coral);});
    lab(ctx,'z (meas.)',track[1][0]+10,measY[1]-8,C.coral,8.5);
    lab(ctx,'predict with motion model, correct with sensor — recursive; each cycle sharpens the state estimate',14,h-12,C.mut);
  };

  /* mff_svd — point cloud with principal axes */
  A.mff_svd=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'SVD: any matrix M = U Σ Vᵀ — rotate · scale · rotate; axes reveal the data\'s structure',w/2,14,C.ink,10.5,'center');
    const cx=w*0.38,cy=h*0.52;
    const ang=saw(t,8)*0.4+0.3;
    // generate elongated point cloud
    const pts=[];for(let i=0;i<28;i++){const u=(i/28-0.5)*2;const v=((i*7+3)%11-5)/5*0.4;pts.push([u*1.0,v*0.35]);}
    // rotate by ang
    const ca=Math.cos(ang),sa=Math.sin(ang);
    ctx.save();ctx.translate(cx,cy);
    pts.forEach(function(p){const rx=p[0]*ca-p[1]*sa,ry=p[0]*sa+p[1]*ca;dot(ctx,rx*80,ry*80,2.8,C.cyan);});
    // principal axes: U·sigma
    const s1=80,s2=28;
    arrow(ctx,0,0,s1*ca,s1*sa,C.amber,2);
    arrow(ctx,0,0,-s2*sa,s2*ca,C.green,2);
    ctx.restore();
    lab(ctx,'σ₁ (large)',cx+ca*s1+6,cy+sa*s1,C.amber,8.5);
    lab(ctx,'σ₂ (small)',cx-sa*s2+4,cy+ca*s2+4,C.green,8.5);
    // right panel: SVD schematic
    const rx=w*0.64,ry=h*0.42;
    box(ctx,rx,ry,28,22,'U',C.violet,hexA(C.violet,0.1));
    box(ctx,rx+33,ry,28,22,'Σ',C.amber,hexA(C.amber,0.1));
    box(ctx,rx+66,ry,28,22,'Vᵀ',C.cyan,hexA(C.cyan,0.1));
    lab(ctx,'M  =',rx-32,ry+11,C.mut,9.5);
    lab(ctx,'axes with\nmax variance',cx-44,cy+64,C.mut,8.5);
    lab(ctx,'Σ scales the axes; rank-k truncation keeps only the top k — best low-rank approximation',14,h-12,C.mut);
  };

  /* mff_se3 — coordinate frame rotating+translating, Lie-algebra tangent step */
  A.mff_se3=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'SE(3): rigid transforms live on a curved manifold; updates use the Lie algebra (tangent space)',w/2,14,C.ink,10.5,'center');
    const cx=w*0.28,cy=h*0.50;
    const ang=saw(t,6)*TAU*0.28+0.2;
    const tx=Math.sin(ang*0.7)*26,ty=Math.cos(ang*0.5)*14;
    // frame axes
    ctx.save();ctx.translate(cx+tx,cy+ty);ctx.rotate(ang);
    arrow(ctx,0,0,46,0,C.coral,2.2);
    arrow(ctx,0,0,0,-36,C.green,2.2);
    dot(ctx,0,0,4,C.amber);
    ctx.restore();
    lab(ctx,'x',cx+tx+48,cy+ty,C.coral,9);lab(ctx,'y',cx+tx,cy+ty-38,C.green,9);
    // manifold circle (SE3 is a manifold)
    const mr=62;ring(ctx,w*0.46,cy,mr,hexA(C.violet,0.45));
    lab(ctx,'SE(3)\nmanifold',w*0.46-18,cy+mr+6,C.violet,8.5);
    // current pose on manifold
    const mang=ang*0.6+0.8;
    const mx=w*0.46+mr*Math.cos(mang),my=cy+mr*Math.sin(mang);
    dot(ctx,mx,my,5,C.amber);
    // tangent (lie algebra) update arrow — tangent to circle
    const tx2=-Math.sin(mang)*18,ty2=Math.cos(mang)*18;
    arrow(ctx,mx,my,mx+tx2,my+ty2,C.cyan,1.8);
    lab(ctx,'exp(ξ)·T\ntangent step',mx+tx2+2,my+ty2-4,C.cyan,8.5);
    lab(ctx,'rotations + translations compose non-linearly; the Lie algebra linearises updates for optimisation',14,h-12,C.mut);
  };

  /* mff_attention — query × keys → softmax bars → weighted sum */
  A.mff_attention=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Attention: score(Q,K) → softmax → weighted sum of Values',w/2,14,C.ink,10.5,'center');
    const qx=w*0.10,qy=h*0.50;
    dot(ctx,qx,qy,8,C.amber);lab(ctx,'Q',qx-2,qy+18,C.amber,9,'center');
    const nK=4;const ky=[];for(let i=0;i<nK;i++)ky.push(h*0.28+i*(h*0.46/(nK-1)));
    const rawSims=[0.85,0.30,0.65,0.18];
    const sims=rawSims.map(function(s,i){return s*(0.9+0.1*Math.sin(t*0.8+i));});
    const ex=sims.map(function(s){return Math.exp(s*3.2);});const Z=ex.reduce(function(a,b){return a+b;},0);
    const wts=ex.map(function(e){return e/Z;});
    const kx=w*0.38;
    for(let i=0;i<nK;i++){
      // key dot + edge from Q
      dot(ctx,kx,ky[i],5,C.cyan);
      ctx.strokeStyle=hexA(C.cyan,0.25+wts[i]*0.65);ctx.lineWidth=0.8+wts[i]*3.5;
      ctx.beginPath();ctx.moveTo(qx+9,qy);ctx.lineTo(kx-6,ky[i]);ctx.stroke();
      // softmax bar
      const bw=wts[i]*w*0.20;
      ctx.fillStyle=hexA(C.green,0.75);ctx.fillRect(w*0.50,ky[i]-5,bw,10);
      lab(ctx,wts[i].toFixed(2),w*0.50+bw+4,ky[i],C.mut,8.5);
    }
    lab(ctx,'K',kx,h*0.20,C.cyan,9,'center');lab(ctx,'softmax\nweights',w*0.56,h*0.20,C.green,9);
    // output
    const ox=w*0.83,oy=qy;
    box(ctx,ox-22,oy-14,44,28,'out',C.violet,hexA(C.violet,0.12));
    arrow(ctx,w*0.76,qy,ox-22,qy,C.violet,1.4);
    lab(ctx,'output = Σ wᵢ·Vᵢ   (weighted value mix)',w*0.50,h*0.86,C.mut,9);
    lab(ctx,'softmax sharpens with temperature; high similarity → almost all weight on one key',14,h-12,C.mut);
  };

  /* mff_fourier — wave decomposed into sine components */
  A.mff_fourier=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Fourier: any signal = sum of sinusoids at different frequencies and amplitudes',w/2,14,C.ink,10.5,'center');
    const gx=w*0.08,gw=w*0.84;
    const rows=3;const rowH=(h*0.62)/rows;const rowY0=h*0.20;
    const freqs=[1,2,3];const amps=[1.0,0.5,0.25];const colors=[C.cyan,C.amber,C.green];
    // component rows
    for(let r=0;r<rows;r++){
      const by=rowY0+r*rowH+rowH*0.5;const f=freqs[r],a=amps[r],col=colors[r];
      ctx.strokeStyle=hexA(col,0.8);ctx.lineWidth=1.5;ctx.beginPath();
      for(let i=0;i<=gw;i++){const x=i/gw;const y=by-a*Math.sin(TAU*f*x+t*0.5)*rowH*0.38;if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}
      ctx.stroke();lab(ctx,'f='+f,gx-26,by,col,8.5,'center');lab(ctx,'A='+a,gx-26,by+12,col,8,'center');
    }
    // divider
    ctx.strokeStyle=hexA(C.line,0.7);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,rowY0+rows*rowH+4);ctx.lineTo(gx+gw,rowY0+rows*rowH+4);ctx.stroke();
    // sum row
    const sumY=rowY0+rows*rowH+rowH*0.5;
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const x=i/gw;let y=sumY;for(let r=0;r<rows;r++)y-=amps[r]*Math.sin(TAU*freqs[r]*x+t*0.5)*rowH*0.38;if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}
    ctx.stroke();lab(ctx,'sum',gx-26,sumY,C.ink,8.5,'center');
    lab(ctx,'each frequency is a basis function; convolution in space = multiplication in frequency domain',14,h-12,C.mut);
  };

  /* mff_entropy — two distributions, KL shading, entropy bar */
  A.mff_entropy=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Entropy & KL Divergence: measure uncertainty and distance between distributions',w/2,14,C.ink,10.5,'center');
    const gx=w*0.08,gw=w*0.84,base=h*0.72,amp=h*0.38;
    const gauss=function(fx,mu,s){return Math.exp(-((fx-mu)**2)/(2*s*s));};
    const pMu=0.38,pS=0.10,qMu=0.55+Math.sin(t*0.5)*0.05,qS=0.14;
    // fill P
    ctx.fillStyle=hexA(C.cyan,0.15);ctx.beginPath();ctx.moveTo(gx,base);
    for(let i=0;i<=gw;i++){const fx=i/gw;ctx.lineTo(gx+i,base-gauss(fx,pMu,pS)*amp);}ctx.lineTo(gx+gw,base);ctx.closePath();ctx.fill();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const fx=i/gw;const y=base-gauss(fx,pMu,pS)*amp;if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}ctx.stroke();
    lab(ctx,'P',gx+pMu*gw-4,base-amp-10,C.cyan,9,'center');
    // fill Q
    ctx.fillStyle=hexA(C.amber,0.12);ctx.beginPath();ctx.moveTo(gx,base);
    for(let i=0;i<=gw;i++){const fx=i/gw;ctx.lineTo(gx+i,base-gauss(fx,qMu,qS)*amp);}ctx.lineTo(gx+gw,base);ctx.closePath();ctx.fill();
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const fx=i/gw;const y=base-gauss(fx,qMu,qS)*amp;if(i===0)ctx.moveTo(gx+i,y);else ctx.lineTo(gx+i,y);}ctx.stroke();
    lab(ctx,'Q',gx+qMu*gw,base-gauss(qMu,qMu,qS)*amp-12,C.amber,9,'center');
    // KL shading gap
    ctx.fillStyle=hexA(C.coral,0.18);ctx.beginPath();ctx.moveTo(gx,base);
    for(let i=0;i<=gw;i++){const fx=i/gw;const p=gauss(fx,pMu,pS),q=gauss(fx,qMu,qS);if(p>q)ctx.lineTo(gx+i,base-p*amp);else ctx.lineTo(gx+i,base-q*amp);}
    ctx.lineTo(gx+gw,base);ctx.closePath();ctx.fill();
    lab(ctx,'KL(P||Q)\ngap',gx+0.62*gw,base-amp*0.55,C.coral,8.5);
    // entropy bar for P
    const H=0.5*Math.log(2*Math.PI*Math.E*pS*pS);const Hbar=Math.max(0,Math.min(1,(H+2)/4));
    ctx.fillStyle=hexA(C.green,0.7);ctx.fillRect(gx,base+12,Hbar*gw,8);
    lab(ctx,'H(P) entropy',gx+Hbar*gw+4,base+16,C.green,8.5);
    lab(ctx,'KL(P||Q) = 0 iff P=Q; H(P) = expected surprise = −Σ p log p',14,h-12,C.mut);
  };

  /* mff_score — 2D density modes + score vector field + climbing particle */
  A.mff_score=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Score Function: ∇ₜ log p(x) points toward high-density regions — used in diffusion sampling',w/2,14,C.ink,10.5,'center');
    const modes=[[w*0.35,h*0.46],[w*0.65,h*0.60]];
    // density rings
    modes.forEach(function(m){
      for(let r=52;r>4;r-=12){ctx.strokeStyle=hexA(C.violet,0.04+0.02*(52-r)/52);ctx.lineWidth=r/8;ctx.beginPath();ctx.arc(m[0],m[1],r,0,TAU);ctx.stroke();}
    });
    // score arrow field
    for(let ix=0;ix<9;ix++)for(let iy=0;iy<5;iy++){
      const x=w*0.10+ix*w*0.088,y=h*0.26+iy*h*0.12;
      let bm=modes[0],bd=1e9;modes.forEach(function(m){const d=(m[0]-x)**2+(m[1]-y)**2;if(d<bd){bd=d;bm=m;}});
      const dx=bm[0]-x,dy=bm[1]-y,l=Math.hypot(dx,dy)||1;
      if(l>14)arrow(ctx,x,y,x+dx/l*11,y+dy/l*11,hexA(C.cyan,0.38),1.1);
    }
    // particle climbing from noise
    const p=saw(t,5);
    const sx=w*0.15+p*(modes[0][0]-w*0.15),sy=h*0.20+p*(modes[0][1]-h*0.20);
    dot(ctx,sx,sy,5.5,C.amber);
    if(p<0.96)lab(ctx,'xₜ',sx+6,sy-8,C.amber,9);
    modes.forEach(function(m){dot(ctx,m[0],m[1],5,C.green);});
    lab(ctx,'modes',modes[1][0]+6,modes[1][1]-8,C.green,8.5);
    lab(ctx,'score = gradient of log-density; Langevin/DDPM: add noise + follow score to sample from p(x)',14,h-12,C.mut);
  };

  /* mff_ot — optimal transport: least-cost mass matching */
  A.mff_ot=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Optimal Transport: move a pile of mass to a target at minimum total cost (Wasserstein distance)',w/2,14,C.ink,10.5,'center');
    const srcX=w*0.22,tgtX=w*0.78;
    const srcY=[h*0.28,h*0.44,h*0.60,h*0.76];
    const tgtY=[h*0.30,h*0.46,h*0.58,h*0.74];
    const pairs=[0,1,2,3];
    const p=saw(t,4);
    // draw source dots
    srcY.forEach(function(y,i){dot(ctx,srcX,y,7,C.cyan);lab(ctx,'s'+i,srcX-18,y,C.cyan,8.5,'center');});
    // draw target dots
    tgtY.forEach(function(y,i){dot(ctx,tgtX,y,7,C.amber);lab(ctx,'t'+i,tgtX+12,y,C.amber,8.5);});
    // matching lines (animate as flowing particles)
    pairs.forEach(function(i){
      const sy=srcY[i],ty=tgtY[i];
      ctx.strokeStyle=hexA(C.green,0.45);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(srcX+8,sy);ctx.lineTo(tgtX-8,ty);ctx.stroke();
      // travelling dot
      const px=srcX+8+(tgtX-8-(srcX+8))*((p+i*0.25)%1);const py=sy+(ty-sy)*((p+i*0.25)%1);
      dot(ctx,px,py,3.5,C.green);
    });
    lab(ctx,'source\ndistrib.',srcX,h*0.86,C.cyan,8.5,'center');lab(ctx,'target\ndistrib.',tgtX,h*0.86,C.amber,8.5,'center');
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*0.50,h*0.22);ctx.lineTo(w*0.50,h*0.83);ctx.stroke();
    lab(ctx,'0 ≤ cost = Σ cᵢⱼ Tᵢⱼ; Wasserstein = earth-mover\'s distance between two distributions',14,h-12,C.mut);
  };

  /* mff_graph — GNN message passing */
  A.mff_graph=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Graph Neural Networks: nodes aggregate messages from neighbours — information propagates',w/2,14,C.ink,10.5,'center');
    // node positions
    const nodes={c:[w*0.50,h*0.50],n:[w*0.50,h*0.24],e:[w*0.75,h*0.58],s:[w*0.50,h*0.76],ww:[w*0.25,h*0.58]};
    const edges=[['c','n'],['c','e'],['c','s'],['c','ww'],['n','e']];
    // draw edges
    edges.forEach(function(ed){
      const a=nodes[ed[0]],b=nodes[ed[1]];
      ctx.strokeStyle=hexA(C.line,0.9);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
    });
    // pulse animation: messages from neighbours travel to centre node
    const p=saw(t,3);
    ['n','e','s','ww'].forEach(function(key,i){
      const src=nodes[key],dst=nodes.c;
      const off=(p+(i*0.25))%1;
      const px=src[0]+(dst[0]-src[0])*off,py=src[1]+(dst[1]-src[1])*off;
      dot(ctx,px,py,4,C.cyan);
    });
    // draw nodes
    Object.keys(nodes).forEach(function(key){
      const n=nodes[key];const isC=key==='c';
      ring(ctx,n[0],n[1],isC?13:9,isC?C.amber:C.cyan);
      const lbl=isC?'Σ agg':key;lab(ctx,lbl,n[0],n[1],isC?C.amber:C.cyan,isC?8.5:8,'center');
    });
    lab(ctx,'message',nodes.n[0]+14,nodes.n[1]-14,C.cyan,8.5);
    lab(ctx,'hᵥ = σ(W · Σ_{u∈N(v)} hᵤ)   — aggregate then transform',w*0.50,h*0.88,C.mut,8.5,'center');
    lab(ctx,'k rounds of message passing = k-hop neighbourhood; learns structure-aware representations',14,h-12,C.mut);
  };

  /* mff_mdp — states, actions, value backup */
  A.mff_mdp=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'MDP: states + actions + rewards; value V(s) = max_a [R + γ V(s\')] (Bellman)',w/2,14,C.ink,10.5,'center');
    const states=[[w*0.18,h*0.50],[w*0.45,h*0.32],[w*0.45,h*0.68],[w*0.74,h*0.50]];
    const slabels=['s₀','s₁','s₂','s*'];
    const vals=[2.1,4.8,1.4,8.0];const maxVal=8.0;
    const p=saw(t,4);
    // edges with action labels
    const edges=[[0,1,'a₀'],[0,2,'a₁'],[1,3,'a₂'],[2,3,'a₃']];
    edges.forEach(function(ed){
      const a=states[ed[0]],b=states[ed[1]];
      ctx.strokeStyle=hexA(C.mut,0.55);ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
      const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;lab(ctx,ed[2],mx+5,my-8,C.amber,8.5);
    });
    // highlight best action (0→1) with policy arrow
    arrow(ctx,states[0][0]+12,states[0][1],states[1][0]-12,states[1][1],C.cyan,2);
    lab(ctx,'π*',states[0][0]+22,states[0][1]-20,C.cyan,9);
    // draw state circles with value fill
    states.forEach(function(s,i){
      const v=vals[i]/maxVal;ctx.fillStyle=hexA(C.green,v*0.35);ctx.beginPath();ctx.arc(s[0],s[1],18,0,TAU);ctx.fill();
      ring(ctx,s[0],s[1],18,i===3?C.amber:C.cyan);
      lab(ctx,slabels[i],s[0],s[1]-4,i===3?C.amber:C.ink,8.5,'center');
      lab(ctx,'V='+vals[i].toFixed(1),s[0],s[1]+8,C.green,8,'center');
    });
    // backup arrow animation
    const bx=states[3][0]+(states[0][0]-states[3][0])*p,by=states[3][1]+(states[0][1]-states[3][1])*p;
    dot(ctx,bx,by,4,C.violet);
    lab(ctx,'V backup',bx+6,by-10,hexA(C.violet,0.8),8);
    lab(ctx,'reward +\ndiscount γ',states[1][0]+16,states[1][1]+28,C.mut,8);
    lab(ctx,'solve via dynamic programming or TD learning; optimal policy = greedy w.r.t. optimal V',14,h-12,C.mut);
  };

  /* mff_lyapunov — bowl energy function + spiralling trajectory */
  A.mff_lyapunov=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Lyapunov Stability: find V(x)>0 with dV/dt<0 — energy always decreasing → system is stable',w/2,14,C.ink,10.5,'center');
    const cx=w*0.50,cy=h*0.52,rx=w*0.32,ry=h*0.26;
    // bowl contours (ellipses)
    for(let k=1;k<=5;k++){
      ctx.strokeStyle=hexA(C.violet,0.08+k*0.04);ctx.lineWidth=1.2;
      ctx.beginPath();ctx.ellipse(cx,cy,rx*(k/5),ry*(k/5),0,0,TAU);ctx.stroke();
    }
    // safe-set boundary
    ctx.strokeStyle=hexA(C.green,0.45);ctx.lineWidth=1.6;
    ctx.beginPath();ctx.ellipse(cx,cy,rx*0.8,ry*0.8,0,0,TAU);ctx.stroke();
    lab(ctx,'safe set',cx+rx*0.8+4,cy,C.green,8.5);
    // spiralling trajectory
    const nSteps=48;
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.8;ctx.beginPath();
    for(let i=0;i<=nSteps;i++){
      const frac=i/nSteps;const phase=frac*TAU*2.5+t*0.5;
      const r=Math.max(0,1-frac)*0.9;
      const x=cx+r*rx*Math.cos(phase),y=cy+r*ry*Math.sin(phase);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }ctx.stroke();
    // current position dot
    const tFrac=saw(t,6);const phase2=tFrac*TAU*2.5+t*0.5;const r2=Math.max(0,1-tFrac)*0.9;
    const curX=cx+r2*rx*Math.cos(phase2),curY=cy+r2*ry*Math.sin(phase2);
    dot(ctx,curX,curY,5.5,C.amber);lab(ctx,'x(t)',curX+6,curY-8,C.amber,8.5);
    dot(ctx,cx,cy,4,C.green);lab(ctx,'x*',cx+5,cy-8,C.green,8.5);
    lab(ctx,'if V(x*) = 0 and V̇ < 0 along all trajectories, x* is globally asymptotically stable',14,h-12,C.mut);
  };

  /* mff_contact — complementarity: gap>0 ↔ force=0, gap=0 ↔ force≥0 */
  A.mff_contact=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Contact / Complementarity: gap · force = 0  — either separated or touching, never both',w/2,14,C.ink,10.5,'center');
    const p=saw(t,4);
    // two phases: separated (p<0.5) and touching (p>=0.5)
    const separated=p<0.5;const phase=separated?(p*2):(p*2-1);
    const groundY=h*0.70;const blockH=36,blockW=60;
    // ground
    ctx.fillStyle=hexA(C.mut,0.18);ctx.fillRect(w*0.10,groundY,w*0.80,8);
    ctx.strokeStyle=hexA(C.mut,0.45);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(w*0.10,groundY);ctx.lineTo(w*0.90,groundY);ctx.stroke();
    lab(ctx,'ground',w*0.50,groundY+18,C.mut,9,'center');
    // block position
    const gap=separated?28*(1-phase):0;
    const blockY=groundY-gap-blockH;const blockX=w*0.50-blockW/2;
    rrect(ctx,blockX,blockY,blockW,blockH,5,C.cyan,hexA(C.cyan,0.12));
    lab(ctx,'block',blockX+blockW/2,blockY+blockH/2,C.cyan,9,'center');
    // gap annotation
    if(gap>2){
      ctx.strokeStyle=hexA(C.amber,0.7);ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(blockX+blockW+8,blockY+blockH);ctx.lineTo(blockX+blockW+8,groundY);ctx.stroke();
      dot(ctx,blockX+blockW+8,blockY+blockH,2.5,C.amber);dot(ctx,blockX+blockW+8,groundY,2.5,C.amber);
      lab(ctx,'gap>0',blockX+blockW+12,(blockY+blockH+groundY)/2,C.amber,9);
    }
    // force arrow
    const forceOn=!separated;
    if(forceOn){
      arrow(ctx,w*0.50,groundY-4,w*0.50,blockY+blockH+2,C.green,2.2);
      lab(ctx,'f>0',w*0.50+8,blockY+blockH-12,C.green,9);
    }
    // right panel — complementarity diagram
    const rx=w*0.72,ry=h*0.30;
    lab(ctx,'state:',rx,ry,C.ink,9);
    lab(ctx,separated?'gap='+gap.toFixed(0)+' > 0':'gap = 0',rx,ry+16,C.amber,9);
    lab(ctx,forceOn?'force > 0':'force = 0',rx,ry+30,C.green,9);
    lab(ctx,separated?'→ no contact force':'→ contact active',rx,ry+44,C.mut,9);
    // formula
    lab(ctx,'0 ≤ f ⊥ gap ≥ 0',rx,ry+62,C.violet,9.5);
    lab(ctx,'complementarity: the contact force switches on exactly as the gap closes — enables physics simulation',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.mathanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-mathanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
