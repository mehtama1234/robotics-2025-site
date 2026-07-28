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

  /* PLANNING — an LLM turns a sentence into a grounded, self-correcting checklist */
  A.planning=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const T=11, ph=(t%T)/T, gx=w/2;
    const gy=h*0.11, gw=Math.min(250,w*0.62);
    ctx.save();ctx.fillStyle='rgba(56,225,207,.10)';roundRect(ctx,gx-gw/2,gy-12,gw,24,12);ctx.fill();
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.2;roundRect(ctx,gx-gw/2,gy-12,gw,24,12);ctx.stroke();ctx.restore();
    txt(ctx,'“put the mug in the sink”',gx,gy,C.ink,10,'center');
    const ly=h*0.30;
    arrow(ctx,gx,gy+13,gx,ly-15,C.line,1.2);
    ctx.save();ctx.fillStyle='rgba(156,140,255,.10)';roundRect(ctx,gx-38,ly-14,76,28,7);ctx.fill();
    ctx.strokeStyle=C.violet;ctx.lineWidth=1.3;roundRect(ctx,gx-38,ly-14,76,28,7);ctx.stroke();ctx.restore();
    txt(ctx,'LLM',gx,ly-2,C.ink,10.5,'center');txt(ctx,'decompose + ground',gx,ly+8,C.dim,7.5,'center');
    const steps=['find mug','grasp','carry','place'], n=4, m=26, sy=h*0.66, sw=(w-m*2-(n-1)*14)/n, fail=1;
    const prog=ph*(n+1.4);
    arrow(ctx,gx,ly+14,gx,sy-22,C.line,1.2);
    for(let i=0;i<n;i++){
      const sx=m+i*(sw+14);
      if(i>0) arrow(ctx,sx-14+2,sy,sx-2,sy,C.line,1.1);
      const failing=(i===fail && prog>=fail+0.4 && prog<fail+1.2);
      const done=(prog>i+1) && !failing;
      const active=Math.floor(prog)===i && !failing;
      ctx.save();
      ctx.fillStyle=done?'rgba(95,208,138,.14)':active?'rgba(56,225,207,.12)':'rgba(255,255,255,.03)';
      roundRect(ctx,sx,sy-15,sw,30,6);ctx.fill();
      ctx.strokeStyle=failing?C.coral:done?C.green:active?C.cyan:C.line;ctx.lineWidth=1.4;
      if(active||failing){ctx.shadowColor=failing?C.coral:C.cyan;ctx.shadowBlur=9;}
      roundRect(ctx,sx,sy-15,sw,30,6);ctx.stroke();ctx.restore();
      txt(ctx,steps[i],sx+sw/2,sy-1,done?C.green:active?C.ink:C.mut,9,'center');
      if(done) txt(ctx,'✓',sx+sw-9,sy-8,C.green,10,'center');
      if(failing) txt(ctx,'✗',sx+sw-9,sy-8,C.coral,11,'center');
    }
    if(prog>=fail+0.4 && prog<fail+1.4){
      txt(ctx,'precondition failed → the LLM re-plans',w/2,h-12,C.coral,10,'center');
    } else txt(ctx,'language → an executable, self-correcting checklist',w/2,h-12,C.mut,10,'center');
  };

  /* MULTI-ROBOT — coordinate by bidding: each task goes to the cheapest robot, no central boss */
  A.multirobot=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const T=8, ph=(t%T)/T, cols=[C.cyan,C.amber,C.violet];
    const rob=[[w*0.15,h*0.30],[w*0.15,h*0.52],[w*0.15,h*0.74]];
    const task=[[w*0.82,h*0.26],[w*0.82,h*0.52],[w*0.82,h*0.78]], assign=[1,2,0];
    if(ph<0.5){
      for(let r=0;r<3;r++)for(let k=0;k<3;k++){
        ctx.save();ctx.globalAlpha=0.22+0.18*Math.sin(t*3+r*2+k);ctx.strokeStyle=C.mut;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(rob[r][0]+15,rob[r][1]);ctx.lineTo(task[k][0]-12,task[k][1]);ctx.stroke();ctx.restore();}
      txt(ctx,'bidding — every robot prices every task',w/2,h-12,C.mut,10,'center');
    } else {
      const u=Math.min(1,(ph-0.5)/0.4);
      for(let k=0;k<3;k++){const r=assign[k];
        ctx.save();ctx.strokeStyle=cols[r];ctx.lineWidth=1.8;
        ctx.beginPath();ctx.moveTo(rob[r][0]+15,rob[r][1]);ctx.lineTo(task[k][0]-12,task[k][1]);ctx.stroke();ctx.restore();
        const px=rob[r][0]+15+u*(task[k][0]-12-rob[r][0]-15), py=rob[r][1]+u*(task[k][1]-rob[r][1]);
        ctx.save();ctx.fillStyle=cols[r];ctx.shadowColor=cols[r];ctx.shadowBlur=8;ctx.beginPath();ctx.arc(px,py,3.4,0,7);ctx.fill();ctx.restore();}
      txt(ctx,'assigned to the cheapest bidder — coordination with no central boss',w/2,h-12,C.cyan,10,'center');
    }
    rob.forEach((p,r)=>{ctx.save();ctx.fillStyle='rgba(255,255,255,.03)';roundRect(ctx,p[0]-15,p[1]-11,30,22,5);ctx.fill();
      ctx.strokeStyle=cols[r];ctx.lineWidth=1.6;roundRect(ctx,p[0]-15,p[1]-11,30,22,5);ctx.stroke();ctx.restore();
      txt(ctx,'R'+(r+1),p[0],p[1],cols[r],10,'center');});
    txt(ctx,'robots',w*0.15,h*0.15,C.dim,9,'center');
    task.forEach((p,k)=>{const won=ph>=0.5, col=won?cols[assign[k]]:C.mut;
      ctx.save();ctx.globalAlpha=won?0.15:0.08;ctx.fillStyle=won?col:C.mut;ctx.beginPath();ctx.arc(p[0],p[1],13,0,7);ctx.fill();ctx.restore();
      ctx.save();ctx.strokeStyle=won?col:C.line;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(p[0],p[1],13,0,7);ctx.stroke();ctx.restore();
      txt(ctx,'T'+(k+1),p[0],p[1],col,10,'center');});
    txt(ctx,'tasks',w*0.82,h*0.12,C.dim,9,'center');
  };

  /* CHEAP DATA — a few human demos are multiplied into a mountain of varied training data */
  A.cheapdata=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const T=9, ph=(t%T)/T, dx=w*0.07, dy=h*0.5, ts=Math.min(32,w*0.055);
    for(let i=0;i<3;i++){const yy=dy-46+i*36;
      ctx.save();ctx.fillStyle='rgba(56,225,207,.18)';roundRect(ctx,dx,yy,ts,ts,4);ctx.fill();
      ctx.strokeStyle=C.cyan;ctx.lineWidth=1.4;roundRect(ctx,dx,yy,ts,ts,4);ctx.stroke();ctx.restore();}
    txt(ctx,'3 human demos',dx+ts/2,dy-58,C.cyan,9,'center');
    const bx=w*0.33, bw=w*0.15, by=h*0.36, bh=h*0.28;
    ctx.save();ctx.fillStyle='rgba(245,166,91,.08)';roundRect(ctx,bx,by,bw,bh,8);ctx.fill();
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.3;roundRect(ctx,bx,by,bw,bh,8);ctx.stroke();ctx.restore();
    txt(ctx,'augment',bx+bw/2,by+bh/2-6,C.ink,10,'center');txt(ctx,'sim + generative',bx+bw/2,by+bh/2+8,C.dim,7.5,'center');
    arrow(ctx,dx+ts+4,dy,bx-4,by+bh/2,'rgba(139,155,162,.4)',1.2);
    const gx0=w*0.57, gcols=6, grows=4, gs=Math.min(22,(w*0.38)/gcols-4), total=gcols*grows, shown=Math.floor(ph*total*1.15);
    arrow(ctx,bx+bw+4,by+bh/2,gx0-6,by+bh/2,'rgba(245,166,91,.5)',1.2);
    for(let i=0;i<Math.min(shown,total);i++){
      const c=i%gcols, r=Math.floor(i/gcols), xx=gx0+c*(gs+4), yy=h*0.28+r*(gs+4);
      const hue=['86,225,207','245,166,91','156,140,255'][i%3];
      ctx.save();ctx.translate(xx+gs/2,yy+gs/2);ctx.rotate(Math.sin(i*1.7)*0.32);
      ctx.fillStyle='rgba('+hue+',0.5)';ctx.fillRect(-gs/2,-gs/2,gs-1,gs-1);ctx.restore();}
    txt(ctx,'→ hundreds of varied examples',gx0+w*0.18,h*0.15,C.amber,9.5,'center');
    txt(ctx,'a few demonstrations → a mountain of training data, no extra human effort',w/2,h-11,C.mut,9.5,'center');
  };

  /* SAFETY — two opposite tools: attacks that find the breaking input, guarantees that shield */
  A.safety=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h*0.44, bw=84, bh=50;
    ctx.save();ctx.fillStyle='rgba(255,255,255,.03)';roundRect(ctx,cx-bw/2,cy-bh/2,bw,bh,8);ctx.fill();
    ctx.strokeStyle=C.mut;ctx.lineWidth=1.4;roundRect(ctx,cx-bw/2,cy-bh/2,bw,bh,8);ctx.stroke();ctx.restore();
    txt(ctx,'POLICY',cx,cy,C.ink,11,'center');
    // LEFT — attack probes, one finds the gap
    txt(ctx,'ATTACK',w*0.15,h*0.13,C.coral,10,'center');
    txt(ctx,'find the one input that breaks it',w*0.15,h*0.86,C.coral,8,'center');
    const gapY=cy+7;
    ctx.save();ctx.strokeStyle=C.coral;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(cx-bw/2,gapY-4);ctx.lineTo(cx-bw/2,gapY+4);ctx.stroke();ctx.restore();
    for(let i=0;i<4;i++){const hit=(i===2), u=(t*0.55+i*0.23)%1;
      const sx=w*0.05, ex=hit?cx-6:cx-bw/2-3, x=sx+u*(ex-sx), yy=hit?gapY:(cy-20+i*13);
      ctx.save();ctx.fillStyle=hit?C.coral:'rgba(255,107,92,.4)';if(hit){ctx.shadowColor=C.coral;ctx.shadowBlur=8;}
      ctx.beginPath();ctx.arc(x,yy,hit?3.2:2,0,7);ctx.fill();ctx.restore();}
    // RIGHT — certified shield blocks an unsafe action
    txt(ctx,'GUARANTEE',w*0.85,h*0.13,C.green,10,'center');
    txt(ctx,'prove unsafe actions can’t happen',w*0.85,h*0.86,C.green,8,'center');
    const sx=cx+bw/2+40;
    ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.shadowColor=C.green;ctx.shadowBlur=5;
    ctx.beginPath();ctx.arc(cx,cy,sx-cx,-0.95,0.95);ctx.stroke();ctx.restore();
    txt(ctx,'certified boundary',sx+8,cy-38,C.green,8,'left');
    const u2=(t*0.5)%1, ux=cx+bw/2+2+u2*(sx-cx-bw/2-4), blocked=ux>sx-8;
    ctx.save();ctx.fillStyle=blocked?C.dim:C.coral;ctx.beginPath();ctx.arc(Math.min(ux,sx-8),cy,3,0,7);ctx.fill();ctx.restore();
    if(blocked) txt(ctx,'✗',sx-2,cy-12,C.green,12,'center');
    txt(ctx,'either you FIND the hole (attack)  ·  or you PROVE there is none (shield)',w/2,h-11,C.mut,9.5,'center');
  };

  /* TACTILE — touch feels contact and the onset of slip, and grips harder before the object drops */
  A.tactile=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const T=8, ph=(t%T)/T;
    const regime = ph<0.2?'approach':ph<0.45?'contact':ph<0.7?'slip':'regrip';
    const ox=w*0.2, oy=h*0.58;
    ctx.save();ctx.fillStyle='rgba(139,155,162,.16)';roundRect(ctx,ox-36,oy,72,38,8);ctx.fill();
    ctx.strokeStyle=C.mut;ctx.lineWidth=1.2;roundRect(ctx,ox-36,oy,72,38,8);ctx.stroke();ctx.restore();
    const press = regime==='approach'?(ph/0.2)*10 : regime==='regrip'?16:12;
    const wob = regime==='slip'?Math.sin(t*30)*4:0;
    ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(ox,oy-58);ctx.lineTo(ox,oy-30+press);ctx.stroke();
    ctx.fillStyle=C.cyan;ctx.beginPath();ctx.arc(ox+wob,oy-24+press,6,0,7);ctx.fill();ctx.restore();
    if(regime!=='approach'){ctx.save();ctx.fillStyle='rgba(245,166,91,'+(regime==='slip'?0.6:0.35)+')';
      ctx.beginPath();ctx.arc(ox+wob,oy+2,7,0,7);ctx.fill();ctx.restore();}
    txt(ctx,'fingertip',ox,h*0.12,C.dim,9,'center');
    const wx0=w*0.44, wx1=w*0.96, wy=h*0.5, amp=25;
    ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(wx0,wy+amp);ctx.lineTo(wx1,wy+amp);ctx.stroke();
    ctx.save();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=110;i++){const p=i/110, x=wx0+p*(wx1-wx0);let v;
      if(p<0.2)v=2;else if(p<0.45)v=amp*0.7;else if(p<0.7)v=amp*0.7+Math.sin(p*130)*7;else v=amp*0.92;
      i===0?ctx.moveTo(x,wy+amp-v):ctx.lineTo(x,wy+amp-v);}
    ctx.stroke();ctx.restore();
    const phx=wx0+ph*(wx1-wx0);
    ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(phx,wy-amp);ctx.lineTo(phx,wy+amp);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    txt(ctx,'contact force',wx0,wy-amp-6,C.amber,9,'left');
    txt(ctx,'approach',wx0+0.1*(wx1-wx0),wy+amp+11,C.dim,7.5,'center');
    txt(ctx,'contact',wx0+0.32*(wx1-wx0),wy+amp+11,C.amber,7.5,'center');
    txt(ctx,'slip!',wx0+0.57*(wx1-wx0),wy+amp+11,C.coral,8,'center');
    txt(ctx,'grip↑',wx0+0.85*(wx1-wx0),wy+amp+11,C.cyan,8,'center');
    txt(ctx,'touch feels the slip the instant it starts — and grips harder',w/2,h-11,C.mut,10,'center');
  };

  /* SOFT — a soft body conforms to what it grabs; its shape does part of the control */
  A.soft=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const press=0.5+0.5*Math.sin(t*0.9), ox=w*0.6, oy=h*0.55, R=Math.min(w,h)*0.17;
    ctx.save();ctx.fillStyle='rgba(139,155,162,.16)';ctx.strokeStyle=C.mut;ctx.lineWidth=1.4;ctx.beginPath();
    for(let a=0;a<=6.3;a+=0.2){const rr=R*(1+0.18*Math.sin(a*3)+0.1*Math.cos(a*2));
      const x=ox+Math.cos(a)*rr,y=oy+Math.sin(a)*rr;a===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    txt(ctx,'irregular object',ox,oy+R+20,C.dim,9,'center');
    const baseX=w*0.18, baseY=h*0.22, tipX=ox-R*0.85, tipY=oy+ (press-0.5)*8;
    ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=6;ctx.lineCap='round';ctx.shadowColor=C.cyan;ctx.shadowBlur=6;
    ctx.beginPath();ctx.moveTo(baseX,baseY);
    ctx.bezierCurveTo(baseX+60,baseY+40, ox-R*(1.6-press*0.6), oy-R*0.3, tipX,tipY);ctx.stroke();ctx.restore();
    txt(ctx,'soft finger',baseX+6,h*0.14,C.cyan,9,'center');
    if(press>0.55){for(let i=0;i<4;i++){const a=Math.PI*(0.72+i*0.11), rr=R*(1+0.18*Math.sin(a*3)+0.1*Math.cos(a*2));
      const x=ox+Math.cos(a)*rr,y=oy+Math.sin(a)*rr;
      ctx.save();ctx.fillStyle=C.amber;ctx.shadowColor=C.amber;ctx.shadowBlur=6;ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();ctx.restore();}}
    const rgx=w*0.87, rgy=h*0.19;
    ctx.save();ctx.strokeStyle=C.dim;ctx.lineWidth=2;ctx.strokeRect(rgx-9,rgy-13,18,4);
    ctx.strokeStyle='rgba(139,155,162,.4)';ctx.beginPath();ctx.arc(rgx,rgy+7,8,0,7);ctx.stroke();
    ctx.fillStyle=C.coral;ctx.beginPath();ctx.arc(rgx-6,rgy-2,1.5,0,7);ctx.arc(rgx+6,rgy-2,1.5,0,7);ctx.fill();ctx.restore();
    txt(ctx,'rigid: gaps',rgx,rgy+22,C.dim,7.5,'center');
    txt(ctx,'the soft body conforms — its shape does part of the control',w/2,h-11,C.mut,10,'center');
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
