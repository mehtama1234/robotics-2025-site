
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440', panel:'#0D131A' };
  function fit(cv){
    const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth, h=parseInt(cv.getAttribute('height'))||300;
    cv.width=w*dpr; cv.height=h*dpr; const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }
  function glowText(ctx,s,x,y,col,size,font,align){ctx.save();ctx.font=(size)+'px '+(font||'ui-monospace,Menlo,monospace');
    ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.restore();}
  function node(ctx,x,y,r,label,active){
    ctx.save();
    ctx.beginPath();ctx.arc(x,y,r,0,7);
    ctx.fillStyle=active?'rgba(56,225,207,.14)':'rgba(139,155,162,.06)';ctx.fill();
    ctx.lineWidth=1.6;ctx.strokeStyle=active?C.cyan:C.line;
    if(active){ctx.shadowColor=C.cyan;ctx.shadowBlur=16;}ctx.stroke();
    ctx.restore();
    glowText(ctx,label,x,y,active?C.ink:C.mut,12.5,'ui-monospace,Menlo,monospace','center');
  }
  function arrow(ctx,x1,y1,x2,y2,col,w){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w||1.4;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);
    ctx.lineTo(x2-9*Math.cos(a-.4),y2-9*Math.sin(a-.4));ctx.lineTo(x2-9*Math.cos(a+.4),y2-9*Math.sin(a+.4));
    ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.restore();}

  const A={};

  A.loop=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const cy=h/2, xs=[w*0.2,w*0.5,w*0.8], names=['SENSE','DECIDE','MOVE'], r=Math.min(46,w*0.09);
    for(let i=0;i<2;i++) arrow(ctx,xs[i]+r,cy,xs[i+1]-r,cy,C.line,1.4);
    ctx.save();ctx.strokeStyle=C.line;ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(xs[2],cy+r);ctx.bezierCurveTo(xs[2],cy+r+70,xs[0],cy+r+70,xs[0],cy+r);ctx.stroke();
    arrow(ctx,xs[0]+2,cy+r+2,xs[0]-1,cy+r-1,C.line,1.4);ctx.restore();
    const T=(t*0.28)%1; let px,py; const seg=1/3;
    if(T<seg){const u=T/seg;px=xs[0]+u*(xs[1]-xs[0]);py=cy;}
    else if(T<2*seg){const u=(T-seg)/seg;px=xs[1]+u*(xs[2]-xs[1]);py=cy;}
    else{const u=(T-2*seg)/seg;const b=1-u;
      px=b*b*b*xs[2]+3*b*b*u*xs[2]+3*b*u*u*xs[0]+u*u*u*xs[0];
      py=b*b*b*(cy+r)+3*b*b*u*(cy+r+70)+3*b*u*u*(cy+r+70)+u*u*u*(cy+r);}
    const active=T<seg?0:T<2*seg?1:2;
    for(let i=0;i<3;i++) node(ctx,xs[i],cy,r,names[i],i===active);
    ctx.save();ctx.shadowColor=C.cyan;ctx.shadowBlur=18;ctx.fillStyle=C.cyan;
    ctx.beginPath();ctx.arc(px,py,5,0,7);ctx.fill();ctx.restore();
    glowText(ctx,'raw pixels · lidar · touch',xs[0],cy+r+92,C.dim,10.5,null,'center');
    glowText(ctx,'a plan',xs[1],cy-r-16,C.dim,10.5,null,'center');
    glowText(ctx,'motors',xs[2],cy-r-16,C.dim,10.5,null,'center');
  };

  A.stereo=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const camY=h-34, lx=w*0.34, rx=w*0.66;
    const dn=0.5+0.5*Math.sin(t*0.7);
    const oy=h*0.16 + dn*(h*0.42);
    const ox=w*0.5 + Math.sin(t*0.5)*w*0.06;
    const depth = (camY-oy);
    const f=h*0.9;
    const planeY=camY-30;
    [['L',lx],['R',rx]].forEach(([lab,cxp])=>{
      ctx.strokeStyle=C.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cxp-34,planeY);ctx.lineTo(cxp+34,planeY);ctx.stroke();
    });
    const uL=f*(ox-lx)/depth, uR=f*(ox-rx)/depth;
    const pLx=lx+Math.max(-30,Math.min(30,uL)), pRx=rx+Math.max(-30,Math.min(30,uR));
    ctx.save();ctx.strokeStyle='rgba(56,225,207,.28)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(lx,camY);ctx.lineTo(ox,oy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(rx,camY);ctx.lineTo(ox,oy);ctx.stroke();ctx.restore();
    [['L',lx],['R',rx]].forEach(([lab,cxp])=>{
      ctx.save();ctx.fillStyle=C.panel;ctx.strokeStyle=C.mut;ctx.lineWidth=1.4;
      ctx.beginPath();ctx.rect(cxp-14,camY-9,28,18);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(cxp+14,camY-6);ctx.lineTo(cxp+22,camY-11);ctx.lineTo(cxp+22,camY+11);ctx.lineTo(cxp+14,camY+6);ctx.closePath();ctx.fillStyle='rgba(139,155,162,.25)';ctx.fill();
      glowText(ctx,lab,cxp,camY+22,C.dim,10,'ui-monospace,Menlo,monospace','center');ctx.restore();
    });
    ctx.strokeStyle='rgba(139,155,162,.35)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(lx,camY);ctx.lineTo(rx,camY);ctx.stroke();ctx.setLineDash([]);
    glowText(ctx,'baseline',(lx+rx)/2,camY+16,C.dim,10,null,'center');
    ctx.save();ctx.fillStyle=C.cyan;ctx.beginPath();ctx.arc(pLx,planeY,3.5,0,7);ctx.fill();ctx.beginPath();ctx.arc(pRx,planeY,3.5,0,7);ctx.fill();ctx.restore();
    const warm = dn>0.5;
    ctx.save();ctx.shadowColor=warm?C.amber:C.cyan;ctx.shadowBlur=14;ctx.fillStyle=warm?C.amber:C.cyan;
    ctx.beginPath();ctx.arc(ox,oy,7,0,7);ctx.fill();ctx.restore();
    glowText(ctx,'object',ox,oy-16,C.mut,10.5,null,'center');
    const disp=Math.abs(uL-uR);
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w*0.5-disp*0.5, 22);ctx.lineTo(w*0.5+disp*0.5,22);ctx.stroke();
    glowText(ctx,'disparity',w*0.5,10,C.amber,10,null,'center');
    // live depth straight from the inverse law
    const depthM = (140/Math.max(disp,2));
    ctx.save();ctx.strokeStyle='rgba(56,225,207,.5)';ctx.setLineDash([2,3]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(ox,oy+9);ctx.lineTo(ox,camY-2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    glowText(ctx,'≈ '+depthM.toFixed(1)+' m',ox+7,(oy+camY)/2,C.cyan,10.5,null,'left');
    glowText(ctx,'depth = f·B ÷ disparity',w*0.5,36,C.dim,9.5,null,'center');
    const el=document.getElementById('st-d'), ep=document.getElementById('st-p');
    if(el){el.textContent=depthM.toFixed(1)+' m ('+(dn>0.66?'near':dn<0.33?'far':'mid')+')';}
    if(ep){ep.textContent=disp.toFixed(0)+' px → '+(disp>18?'large = near':disp<7?'tiny = far':'mid');}
  };

  A.splat=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const cx=w*0.5;
    function target(n){const pts=[];for(let i=0;i<n;i++){
      const a=i/n; let x,y;
      if(a<0.7){const u=a/0.7;x=cx-70+u*140;y=h*0.62-Math.sin(u*Math.PI)*70;}
      else{const u=(a-0.7)/0.3;x=cx-8+u*16;y=h*0.55+u*50;}
      pts.push([x+ (Math.random()-.5)*10,y+(Math.random()-.5)*10]);}return pts;}
    const N=Math.min(120, 30+Math.floor(t*18));
    if(!A._spT || A._spN!==N){A._spT=target(N);A._spN=N;
      A._spB=A._spB||[];
      while(A._spB.length<N){A._spB.push({x:cx+ (Math.random()-.5)*w*0.5,y:h*0.5+(Math.random()-.5)*h*0.5});}
      A._spB.length=N;
    }
    const B=A._spB,Tg=A._spT;
    // the faint TARGET photo the blobs are being fit to
    ctx.save();for(let i=0;i<N;i++){ctx.fillStyle='rgba(139,155,162,.22)';ctx.beginPath();ctx.arc(Tg[i][0],Tg[i][1],2,0,7);ctx.fill();}ctx.restore();
    glowText(ctx,'target photo',cx,h*0.15,C.dim,9.5,null,'center');
    for(let i=0;i<N;i++){const b=B[i],g=Tg[i];b.x+=(g[0]-b.x)*0.06;b.y+=(g[1]-b.y)*0.06;
      const done=Math.hypot(g[0]-b.x,g[1]-b.y)<3;
      const col = g[1]<h*0.5 ? '86,225,207' : (g[1]<h*0.6?'245,166,91':'156,140,110');
      ctx.save();ctx.globalAlpha=done?0.9:0.5;ctx.fillStyle='rgba('+col+',1)';
      if(done){ctx.shadowColor='rgba('+col+',1)';ctx.shadowBlur=8;}
      ctx.beginPath();ctx.ellipse(b.x,b.y,6,4,i,0,7);ctx.fill();ctx.restore();}
    glowText(ctx,'render → compare to the photo → nudge every blob',cx,h-16,C.dim,10.5,null,'center');
    const en=document.getElementById('sp-n');if(en)en.textContent=N+(N>=120?'  (densified)':'  (growing)');
  };

  A.sparse=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const midX=w*0.5;
    ctx.strokeStyle=C.line;ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(midX,20);ctx.lineTo(midX,h-20);ctx.stroke();ctx.setLineDash([]);
    const gx0=24,gy0=40,gw=midX-48,gh=h-80, cols=22, rows=12;
    const cw=gw/cols, ch=gh/rows, sweep=(t*0.5)%1;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const x=gx0+c*cw,y=gy0+r*ch;const lit=Math.abs(c/cols-sweep)<0.05;
      ctx.fillStyle=lit?'rgba(245,166,91,.5)':'rgba(139,155,162,.10)';
      ctx.fillRect(x+0.5,y+0.5,cw-1.5,ch-1.5);}
    glowText(ctx,'DENSE GRID — scan every cell',gx0+gw/2,gy0-14,C.amber,10.5,'ui-monospace,Menlo,monospace','center');
    const rx0=midX+24, rw=w-24-rx0;
    const objs=[[0.2,0.35,0.16,0.14],[0.55,0.25,0.2,0.12],[0.4,0.7,0.14,0.12],[0.72,0.62,0.13,0.1]];
    objs.forEach((o,i)=>{const x=rx0+o[0]*rw,y=gy0+o[1]*gh,ww=o[2]*rw,hh=o[3]*gh;
      ctx.strokeStyle='rgba(139,155,162,.3)';ctx.lineWidth=1;ctx.strokeRect(x,y,ww,hh);
      const pulse=0.6+0.4*Math.sin(t*2+i);
      ctx.save();ctx.shadowColor=C.cyan;ctx.shadowBlur=12*pulse;ctx.fillStyle='rgba(56,225,207,'+(0.5+0.4*pulse)+')';
      ctx.beginPath();ctx.arc(x+ww/2,y+hh/2,4.5,0,7);ctx.fill();ctx.restore();});
    glowText(ctx,'SPARSE TOKENS — one per object',rx0+rw/2,gy0-14,C.cyan,10.5,'ui-monospace,Menlo,monospace','center');
    // explicit cost contrast: dense keeps scanning, sparse is already done
    const dots='.'.repeat(1+Math.floor((t*3)%3));
    glowText(ctx,'~100,000 ops · scanning'+dots,gx0+gw/2,h-15,C.amber,10,'ui-monospace,Menlo,monospace','center');
    glowText(ctx,'~100 ops · done ✓',rx0+rw/2,h-15,C.cyan,10,'ui-monospace,Menlo,monospace','center');
  };

  A.track=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const objs=[
      (x)=>[0.08+x*0.84, 0.28+0.44*x],        // descends
      (x)=>[0.08+x*0.84, 0.72-0.44*x],        // ascends — crosses the first near x=0.5
      (x)=>[0.90-x*0.5, 0.5+0.17*Math.sin(x*6)],
    ];
    const cols=[C.cyan,C.amber,C.violet];
    const phase=(t*0.12)%1;
    objs.forEach((f,i)=>{ctx.save();ctx.strokeStyle=cols[i];ctx.lineWidth=2;ctx.globalAlpha=.9;
      ctx.beginPath();for(let s=0;s<=phase;s+=0.02){const p=f(s);ctx.lineTo(p[0]*w,p[1]*h);}ctx.stroke();
      ctx.restore();
      const p=f(phase);
      const pg=f(Math.min(1,phase+0.03));
      ctx.save();ctx.strokeStyle=cols[i];ctx.globalAlpha=.5;ctx.setLineDash([2,3]);
      ctx.beginPath();ctx.arc(pg[0]*w,pg[1]*h,9,0,7);ctx.stroke();ctx.setLineDash([]);ctx.restore();
      const nx=p[0]*w+(Math.random()-.5)*10, ny=p[1]*h+(Math.random()-.5)*10;
      ctx.save();ctx.strokeStyle=cols[i];ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(pg[0]*w,pg[1]*h);ctx.lineTo(nx,ny);ctx.stroke();ctx.restore();
      ctx.fillStyle='rgba(139,155,162,.85)';ctx.beginPath();ctx.arc(nx,ny,2.4,0,7);ctx.fill();
      ctx.save();ctx.shadowColor=cols[i];ctx.shadowBlur=12;ctx.fillStyle=cols[i];
      ctx.beginPath();ctx.arc(p[0]*w,p[1]*h,5,0,7);ctx.fill();ctx.restore();
      glowText(ctx,'ID '+(i+1),p[0]*w,p[1]*h-13,cols[i],10,'ui-monospace,Menlo,monospace','center');
    });
    for(let k=0;k<3;k++){const cx=(Math.sin(t*0.9+k*2.1)*0.5+0.5)*w, cy=(Math.cos(t*0.7+k)*0.5+0.5)*h;
      ctx.fillStyle='rgba(139,155,162,.28)';ctx.beginPath();ctx.arc(cx,cy,2,0,7);ctx.fill();
      ctx.strokeStyle='rgba(255,107,92,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-4,cy-4);ctx.lineTo(cx+4,cy+4);ctx.moveTo(cx+4,cy-4);ctx.lineTo(cx-4,cy+4);ctx.stroke();}
    if(Math.abs(phase-0.5)<0.08){glowText(ctx,'the two tracks cross — and keep their IDs',w*0.5,18,C.ink,10.5,null,'center');}
    glowText(ctx,'grey = detection · ✕ = clutter rejected · ring = prediction · colour = stable ID',w/2,h-14,C.dim,9.5,null,'center');
  };

  A.slam=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const ax=w*0.28,bx=w*0.72,cy=h*0.4,r=Math.min(52,w*0.11);
    ctx.save();ctx.strokeStyle=C.line;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc((ax+bx)/2,cy,(bx-ax)/2, -0.9, -2.24,true);ctx.stroke();
    ctx.beginPath();ctx.arc((ax+bx)/2,cy,(bx-ax)/2, 0.9, 2.24);ctx.stroke();ctx.restore();
    const flow=(t*0.5)%1;
    function onArc(cx,cyy,rr,a0,a1,u){const a=a0+(a1-a0)*u;return [cx+rr*Math.cos(a),cyy+rr*Math.sin(a)];}
    let p1=onArc((ax+bx)/2,cy,(bx-ax)/2,-2.24,-0.9,flow);
    let p2=onArc((ax+bx)/2,cy,(bx-ax)/2,0.9,2.24,flow);
    [p1,p2].forEach(p=>{ctx.save();ctx.shadowColor=C.cyan;ctx.shadowBlur=14;ctx.fillStyle=C.cyan;ctx.beginPath();ctx.arc(p[0],p[1],4,0,7);ctx.fill();ctx.restore();});
    node(ctx,ax,cy,r,'POSE',flow<0.5);node(ctx,bx,cy,r,'MAP',flow>=0.5);
    glowText(ctx,'where am I?',ax,cy+r+16,C.dim,10.5,null,'center');
    glowText(ctx,'what is around me?',bx,cy+r+16,C.dim,10.5,null,'center');
    glowText(ctx,'map → localize',(ax+bx)/2,cy-(bx-ax)/2-8,C.mut,10,'ui-monospace,Menlo,monospace','center');
    glowText(ctx,'pose → extend map',(ax+bx)/2,cy+(bx-ax)/2+10,C.mut,10,'ui-monospace,Menlo,monospace','center');
    const ty=h-30, prog=(t*0.16)%1;
    ctx.strokeStyle='rgba(139,155,162,.25)';ctx.beginPath();ctx.moveTo(w*0.12,ty);ctx.bezierCurveTo(w*0.4,ty-26,w*0.6,ty+18,w*0.88,ty);ctx.stroke();
    function traj(u){const b=1-u;return [b*b*b*w*0.12+3*b*b*u*w*0.4+3*b*u*u*w*0.6+u*u*u*w*0.88,
      b*b*b*ty+3*b*b*u*(ty-26)+3*b*u*u*(ty+18)+u*u*u*ty];}
    for(let u=0;u<prog;u+=0.06){const p=traj(u);ctx.fillStyle='rgba(56,225,207,.5)';ctx.beginPath();ctx.arc(p[0],p[1]+ (Math.sin(u*30)*6),1.7,0,7);ctx.fill();}
    const cp=traj(prog);ctx.save();ctx.fillStyle=C.panel;ctx.strokeStyle=C.cyan;ctx.lineWidth=1.4;
    ctx.beginPath();ctx.rect(cp[0]-9,cp[1]-6,18,12);ctx.fill();ctx.stroke();ctx.restore();
  };

  A.medium=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const pad=24, bw=(w-pad*4)/3, bh=h-70, by=44;
    const breathe=0.5+0.5*Math.sin(t*0.8);
    const labels=['TRUE COLOR','× medium (by depth)','RECOVERED'];
    for(let k=0;k<3;k++){
      const bx=pad+k*(bw+pad);
      const img=ctx.createLinearGradient(bx,0,bx+bw,0);
      img.addColorStop(0,'#C56A3A');img.addColorStop(0.5,'#B08A4A');img.addColorStop(1,'#7C8A5A');
      ctx.fillStyle=img;ctx.fillRect(bx,by,bw,bh);
      ctx.save();ctx.strokeStyle='rgba(30,20,10,.35)';ctx.lineWidth=2;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(bx+bw*(0.2+i*0.22),by+bh*0.8,14+i*3,Math.PI,2*Math.PI);ctx.stroke();}
      ctx.restore();
      if(k===1){
        const at=ctx.createLinearGradient(bx,0,bx+bw,0);
        const s=0.35+0.5*breathe;
        at.addColorStop(0,'rgba(20,60,90,'+(s*0.15)+')');at.addColorStop(1,'rgba(20,70,110,'+(s*0.9)+')');
        ctx.fillStyle=at;ctx.fillRect(bx,by,bw,bh);
        const hz=ctx.createLinearGradient(bx,0,bx+bw,0);
        hz.addColorStop(0,'rgba(90,150,175,'+(0.05*s)+')');hz.addColorStop(1,'rgba(120,180,200,'+(0.5*s)+')');
        ctx.fillStyle=hz;ctx.fillRect(bx,by,bw,bh);
      }
      ctx.strokeStyle=k===2?C.cyan:C.line;ctx.lineWidth=k===2?1.6:1;ctx.strokeRect(bx,by,bw,bh);
      glowText(ctx,labels[k],bx+bw/2,by-12,k===2?C.cyan:(k===1?C.amber:C.mut),10.5,'ui-monospace,Menlo,monospace','center');
      if(k<2){arrow(ctx,bx+bw+3,by+bh/2,bx+bw+pad-3,by+bh/2,k===1?C.cyan:C.amber,1.6);
        glowText(ctx,k===0?'apply':'÷ invert',bx+bw+pad/2,by+bh/2-10,k===0?C.amber:C.cyan,9,'ui-monospace,Menlo,monospace','center');}
    }
    glowText(ctx,'red dies first with distance — blue survives, haze builds',w/2,h-14,C.dim,10.5,null,'center');
  };

  A.stack=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const rows=[['SENSE','depth · reconstruction · scene-vs-medium',C.cyan],
                ['DECIDE','tracking · sparse tokens · planning',C.amber],
                ['MOVE','control · SLAM keeps the map live',C.violet]];
    const x=28,wd=w*0.52,y0=28,rh=(h-56-30)/3,gap=10;
    rows.forEach((r,i)=>{const y=y0+i*(rh+gap);
      ctx.fillStyle='rgba(255,255,255,.02)';ctx.strokeStyle=r[2];ctx.lineWidth=1.3;
      ctx.beginPath();ctx.roundRect(x,y,wd,rh,8);ctx.fill();ctx.stroke();
      const fw=wd*(0.4+0.3*(0.5+0.5*Math.sin(t*0.9+i)));
      const g=ctx.createLinearGradient(x,0,x+fw,0);g.addColorStop(0,r[2]+'22');g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,fw,rh,8);ctx.fill();
      glowText(ctx,r[0],x+14,y+rh/2-8,r[2],13,'ui-monospace,Menlo,monospace','left');
      glowText(ctx,r[1],x+14,y+rh/2+11,C.mut,11,'ui-monospace,Menlo,monospace','left');
    });
    const bx=x+wd+24;
    ctx.strokeStyle=C.coral;ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(bx+14,y0);ctx.lineTo(bx,y0);ctx.lineTo(bx,y0+3*(rh+gap)-gap);ctx.lineTo(bx+14,y0+3*(rh+gap)-gap);ctx.stroke();
    glowText(ctx,'SAFETY',bx+8,(y0+3*(rh+gap)-gap)/2+y0/2,C.coral,11,'ui-monospace,Menlo,monospace','left');
    glowText(ctx,'watches every layer',bx+8,(y0+3*(rh+gap)-gap)/2+y0/2+16,C.dim,9.5,'ui-monospace,Menlo,monospace','left');
    const forces=['learning replaces hand-engineering','foundation models arrive','bottleneck = cheap data + reality','efficiency is first-class','capability outran trust'];
    glowText(ctx,'five forces, every theme:',x,h-16,C.dim,10,'ui-monospace,Menlo,monospace','left');
    const idx=Math.floor(t*0.5)%forces.length;
    glowText(ctx,'› '+forces[idx],x+160,h-16,C.cyan,10.5,'ui-monospace,Menlo,monospace','left');
  };

  const running=new Map();
  function start(cv){
    if(running.has(cv))return;
    const anim=A[cv.dataset.anim]; if(!anim)return;
    let dims=fit(cv), t0=performance.now(), raf;
    function frame(now){const t=(now-t0)/1000; anim(dims.ctx,dims.w,dims.h,t); raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);} else {raf=requestAnimationFrame(frame);}
    running.set(cv,()=>{cancelAnimationFrame(raf);});
    cv._refit=()=>{dims=fit(cv); if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};
  }
  function stop(cv){const s=running.get(cv); if(s){s();running.delete(cv);}}
  function init(){
  const cvs=[...document.querySelectorAll('canvas[data-anim]')];
  cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)start(e.target);else stop(e.target);});},{threshold:0.12});
  cvs.forEach(cv=>io.observe(cv));
  let rt; addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
