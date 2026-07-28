/* viz.js — reusable animated mechanism diagrams for the robotics-2025 site.
   Drop into any page:  <canvas data-viz="NAME" height="280"></canvas>  then load this file.
   Diagrams run only while on-screen and fall back to a static frame under prefers-reduced-motion.
   Registry (A) is extensible — add one function per mechanism, keyed by the data-viz name. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              green:'#5FD08A', ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440', panel:'#0D131A' };
  function fit(cv){
    const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth, h=parseInt(cv.getAttribute('height'))||280;
    cv.width=w*dpr; cv.height=h*dpr; const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }
  function txt(ctx,s,x,y,col,size,align){ctx.save();ctx.font=size+'px ui-monospace,Menlo,monospace';
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
  function node(ctx,x,y,r,label,active){
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);
    ctx.fillStyle=active?'rgba(56,225,207,.14)':'rgba(139,155,162,.06)';ctx.fill();
    ctx.lineWidth=1.6;ctx.strokeStyle=active?C.cyan:C.line;
    if(active){ctx.shadowColor=C.cyan;ctx.shadowBlur=16;}ctx.stroke();ctx.restore();
    txt(ctx,label,x,y,active?C.ink:C.mut,12,'center');
  }
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w||1.4;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);
    ctx.lineTo(x2-9*Math.cos(a-.4),y2-9*Math.sin(a-.4));ctx.lineTo(x2-9*Math.cos(a+.4),y2-9*Math.sin(a+.4));
    ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.restore();}
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

  const A={};

  /* WORLD MODELS — TWO STAGED BEATS: (1) imagine the next frames, then (2) plan by trying rollouts */
  A.worldmodel=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const T=11, ph=(t%T)/T, beatB=ph>0.5;
    const n=6, obs=2, m=24, gap=10;
    const fw=(w-m*2-(n-1)*gap)/n, fh=fw*0.6, cy=h*0.28, y=cy-fh/2;
    const rev = beatB ? n : obs + (ph/0.5)*(n-obs);         // frames revealed in beat A
    function frame(i,fx,accent,dashed,alpha){
      ctx.save();ctx.globalAlpha=alpha;
      ctx.fillStyle='rgba(255,255,255,.03)';roundRect(ctx,fx,y,fw,fh,5);ctx.fill();
      ctx.lineWidth=1.4;ctx.strokeStyle=accent;if(dashed)ctx.setLineDash([3,3]);
      roundRect(ctx,fx,y,fw,fh,5);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='rgba(139,155,162,.32)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(fx+5,y+fh*0.7);ctx.lineTo(fx+fw-5,y+fh*0.7);ctx.stroke();
      const p=i/(n-1);ctx.fillStyle=accent;ctx.beginPath();ctx.arc(fx+6+p*(fw-12),y+fh*0.7-3-p*7,2.6,0,7);ctx.fill();
      ctx.restore();
    }
    for(let i=0;i<n;i++){
      const fx=m+i*(fw+gap), observed=i<obs;
      if(i>0) arrow(ctx,fx-gap+2,cy,fx-2,cy, i<=obs?C.cyan:'rgba(245,166,91,.5)',1.2);
      frame(i,fx, observed?C.cyan:C.amber, !observed, observed?1:(i<rev?0.92:0.12));
    }
    txt(ctx, beatB?'② plan by imagining':'① imagine the next frame', w-m, 15, beatB?C.amber:C.cyan, 11,'right');
    if(!beatB){
      txt(ctx,'observed', m+(fw+gap)*0.5, y+fh+13, C.cyan,9.5,'center');
      txt(ctx,'imagined forward', m+(fw+gap)*(obs+1.6), y+fh+13, C.amber,9.5,'center');
      txt(ctx,'the model continues the video on its own', w/2, h-12, C.mut,10,'center');
    } else {
      const bp=(ph-0.5)/0.5;
      const ry0=y+fh+18, mfw=(w-m*2-70)/3, rh=Math.min(30,(h-24-ry0)/3);
      txt(ctx,'plan: imagine 3 futures, keep the one that ends well', m, ry0-6, C.mut,10,'left');
      [['✓',C.cyan,true],['✗',C.coral,false],['✗',C.coral,false]].forEach((r,ri)=>{
        if(bp<=ri*0.14) return;
        const yy=ry0+ri*(rh+3)+6, best=r[2];
        ctx.save();ctx.globalAlpha=best?1:0.5;
        for(let k=0;k<3;k++){
          const xx=m+k*(mfw+8);
          ctx.strokeStyle=best?C.cyan:C.dim;ctx.lineWidth=best?1.4:1;
          if(best){ctx.shadowColor=C.cyan;ctx.shadowBlur=6;}
          roundRect(ctx,xx,yy,mfw,rh-6,4);ctx.stroke();ctx.shadowBlur=0;
          if(k<2) arrow(ctx,xx+mfw+1,yy+(rh-6)/2, xx+mfw+7,yy+(rh-6)/2, best?C.cyan:C.dim,1);
        }
        if(bp>0.5) txt(ctx, r[0], m+3*(mfw+8)+3, yy+(rh-6)/2, best?C.cyan:C.coral, 13,'left');
        ctx.restore();
      });
    }
  };

  /* VLA — the ACTION is caused by the WORDS: instruction cycles, gripper does what it says */
  A.vla=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const instr=[['pick up the cup','grasp',true],['put the cup down','release',false]];
    const T=9, idx=Math.floor((t%T)/(T/2))%2, cur=instr[idx], local=(t%(T/2))/(T/2);
    const boxX=w*0.44, boxW=w*0.15, boxY=h*0.18, boxH=h*0.58;
    ctx.save();ctx.fillStyle='rgba(56,225,207,.06)';ctx.strokeStyle=C.cyan2;ctx.lineWidth=1.4;
    roundRect(ctx,boxX,boxY,boxW,boxH,9);ctx.fill();ctx.stroke();ctx.restore();
    txt(ctx,'TRANSFORMER',boxX+boxW/2,boxY+boxH/2-6,C.ink,9.5,'center');
    txt(ctx,'one token stream',boxX+boxW/2,boxY+boxH/2+8,C.dim,8,'center');
    // image patches
    const ix=w*0.06, iy=h*0.2, ig=Math.min(w*0.11,46), cell=ig/3;
    for(let r=0;r<3;r++)for(let c=0;c<3;c++){ctx.fillStyle='rgba(56,225,207,'+(0.10+0.08*Math.sin(t+r+c))+')';
      ctx.fillRect(ix+c*cell,iy+r*cell,cell-1,cell-1);}
    ctx.strokeStyle='rgba(139,155,162,.3)';ctx.lineWidth=1;ctx.strokeRect(ix,iy,ig,ig);
    txt(ctx,'image',ix+ig/2,iy-8,C.cyan,9,'center');
    // instruction word chips (the verb drives the action)
    const words=cur[0].split(' '); const wy=h*0.64; let cx=ix;
    words.forEach((wd,i)=>{
      const active=i<2, cw=wd.length*6.0+9;      // "pick up" / "put ... down" verb region
      ctx.fillStyle=active?'rgba(245,166,91,.18)':'rgba(156,140,255,.12)';
      ctx.strokeStyle=active?C.amber:C.violet;ctx.lineWidth=1;
      roundRect(ctx,cx,wy,cw,15,4);ctx.fill();ctx.stroke();
      txt(ctx,wd,cx+cw/2,wy+8,active?'#F6CDA0':'#C9C2FF',8.5,'center');
      cx+=cw+4;
    });
    txt(ctx,'instruction',ix,wy-8,C.amber,9,'left');
    // flows into box
    [[ix+ig,iy+ig/2,C.cyan],[ix,wy+7,C.amber]].forEach(([sx,sy,col])=>{
      arrow(ctx,sx+3,sy,boxX-3,boxY+boxH*0.5,'rgba(139,155,162,.25)',1);
      for(let k=0;k<2;k++){const u=((t*0.5+k/2)%1);ctx.fillStyle=col;
        ctx.beginPath();ctx.arc(sx+3+u*(boxX-6-sx),sy+u*(boxY+boxH*0.5-sy),2.2,0,7);ctx.fill();}
    });
    // action token travels out to the gripper; the gripper acts as it ARRIVES
    const gx=w*0.84, gcy=h*0.46;
    arrow(ctx,boxX+boxW+4,boxY+boxH*0.5,gx-26,gcy,'rgba(245,166,91,.45)',1.2);
    const u=Math.min(1,local/0.55), arrived=local>0.55;
    const px=boxX+boxW+4+u*(gx-28-boxX-boxW-4), py=boxY+boxH*0.5+u*(gcy-boxY-boxH*0.5);
    ctx.save();ctx.fillStyle=C.amber;ctx.shadowColor=C.amber;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(px,py,3.6,0,7);ctx.fill();ctx.restore();
    txt(ctx,'action token',(boxX+boxW+gx)/2-4,gcy-13,C.amber,8.5,'center');
    // gripper: closes for "pick up", opens for "put down" — only after the token arrives
    const wantClosed=cur[2]; let open=11;
    if(arrived){const a=(local-0.55)/0.45; open = wantClosed? 11-9*a : 2+9*a;}
    // object (cup) held between fingers when closed
    const cupHeld = arrived && wantClosed && (local-0.55)/0.45>0.5;
    ctx.save();ctx.fillStyle='rgba(139,155,162,.5)';
    const cupY = cupHeld? gcy : gcy+ (arrived&&!wantClosed? ((local-0.55)/0.45)*30:0);
    ctx.fillRect(gx+7,cupY-5,9,11);ctx.restore();
    ctx.save();ctx.strokeStyle=C.amber;ctx.lineWidth=2.4;ctx.shadowColor=C.amber;ctx.shadowBlur=8;
    ctx.beginPath();ctx.moveTo(gx,gcy-16);ctx.lineTo(gx,gcy+16);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gx,gcy-open);ctx.lineTo(gx+16,gcy-open);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gx,gcy+open);ctx.lineTo(gx+16,gcy+open);ctx.stroke();ctx.restore();
    // causal caption
    txt(ctx,'“'+cur[0]+'”', w/2, h-24, C.ink, 11.5,'center');
    ctx.save();arrow(ctx,w/2-24,h-12,w/2-8,h-12, arrived?C.amber:C.dim,1.3);ctx.restore();
    txt(ctx, arrived?('the gripper '+cur[1]+'s'):'…', w/2+40, h-12, arrived?C.amber:C.mut, 11,'center');
  };

  /* SIM-TO-REAL — randomization CAUSES transfer: survive many random worlds -> robust -> works for real */
  A.sim2real=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const T=10, ph=(t%T)/T, nvar=6;
    const simX=w*0.05, simY=h*0.14, simW=w*0.44, simH=h*0.46;
    const vi=Math.min(nvar-1, Math.floor(ph/0.62*nvar));
    function rnd(k){const x=Math.sin((vi+1)*12.9+k*78.23)*43758.5;return x-Math.floor(x);}
    // sim frame
    ctx.save();ctx.strokeStyle=C.line;ctx.lineWidth=1.4;ctx.fillStyle='rgba(255,255,255,.02)';
    roundRect(ctx,simX,simY,simW,simH,9);ctx.fill();ctx.stroke();ctx.restore();
    txt(ctx,'RANDOMIZED SIM',simX+simW/2,simY-8,C.amber,10,'center');
    // randomized ground + walking robot + gravity, all varying per world
    const gyb=simY+simH-20, tilt=(rnd(1)-0.5)*22;
    ctx.strokeStyle='rgba(139,155,162,.5)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(simX+14,gyb-tilt);ctx.lineTo(simX+simW-14,gyb+tilt);ctx.stroke();
    const rx=simX+simW*0.42, rry=gyb-18-tilt*0.3, sz=8+rnd(3)*5, lp=t*6;
    ctx.save();ctx.strokeStyle=C.cyan;ctx.fillStyle='rgba(56,225,207,.15)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(rx,rry,sz,0,7);ctx.fill();ctx.stroke();
    for(let l=0;l<2;l++){const ang=Math.sin(lp+l*Math.PI)*0.6;
      ctx.beginPath();ctx.moveTo(rx,rry+sz-1);ctx.lineTo(rx+Math.sin(ang)*9,rry+sz+11);ctx.stroke();}
    ctx.restore();
    const gl=12+rnd(2)*20;
    arrow(ctx,simX+simW-20,simY+14,simX+simW-20,simY+14+gl,'rgba(245,166,91,.7)',1.4);
    txt(ctx,'g',simX+simW-30,simY+18,C.amber,9,'left');
    txt(ctx,'world #'+(vi+1)+'/'+nvar+' — mass·friction·gravity randomized',simX+8,simY+simH-7,C.dim,8.5,'left');
    // robustness meter fills as more worlds are survived
    const meterY=simY+simH+16, fill=Math.min(1,(vi+1)/nvar);
    ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.strokeRect(simX,meterY,simW,11);
    ctx.fillStyle=C.amber;ctx.fillRect(simX,meterY,simW*fill,11);
    txt(ctx,'robustness — survived '+(vi+1)+' worlds',simX,meterY+24,C.mut,9.5,'left');
    // transfer fires ONLY after the meter is (near) full
    const realX=w*0.83, realY=h*0.38, r=32, ready=ph>0.66;
    if(ph>0.66){
      const a=Math.min(1,(ph-0.66)/0.12);
      ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.shadowColor=C.cyan;ctx.shadowBlur=6;
      arrow(ctx,simX+simW+6,simY+simH/2, simX+simW+8+a*(realX-r-simX-simW-14),simY+simH/2, C.cyan,2);
      ctx.restore();
      txt(ctx,'transfer',(simX+simW+realX)/2,simY+simH/2-11,C.cyan,10,'center');
    }
    const done=ph>0.8;
    node(ctx,realX,realY,r, 'REAL', ready);
    txt(ctx, done?'✓ works first try':'the real robot', realX, realY+r+15, done?C.green:C.dim,10,'center');
    txt(ctx,'randomize the sim  →  one policy survives all of it  →  reality is just another variation', w/2, h-11, C.mut,10,'center');
  };

  // ---- runner ----
  const running=new Map();
  function start(cv){
    if(running.has(cv))return;
    const anim=A[cv.dataset.viz]; if(!anim)return;
    let dims=fit(cv), t0=performance.now(), raf;
    function frame(now){anim(dims.ctx,dims.w,dims.h,(now-t0)/1000);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));
    cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};
  }
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){
    const cvs=[...document.querySelectorAll('canvas[data-viz]')];
    const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?start(e.target):stop(e.target)),{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
