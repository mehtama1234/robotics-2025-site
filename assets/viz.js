/* viz.js — reusable animated mechanism diagrams for the robotics-2025 site.
   Drop into any page:  <canvas data-viz="NAME" height="280"></canvas>  then load this file.
   Diagrams run only while on-screen and fall back to a static frame under prefers-reduced-motion.
   Registry (A) is extensible — add one function per mechanism, keyed by the data-viz name. */
(function(){
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { cyan:'#38E1CF', cyan2:'#12A79A', amber:'#F5A65B', coral:'#FF6B5C', violet:'#9C8CFF',
              ink:'#E7EFF1', mut:'#8B9BA2', dim:'#586770', line:'#243440', panel:'#0D131A' };
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

  /* WORLD MODELS — observe a few frames, imagine the future forward, pick the best rollout */
  A.worldmodel=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const n=6, obs=2, m=26, gap=12, fw=(w-m*2-(n-1)*gap)/n, fh=fw*0.72, cy=h*0.42, y=cy-fh/2;
    const head=(t*0.6)%(n+0.6);
    function frame(i,fx,fy,fyh,alpha,dashed,accent){
      ctx.save();ctx.globalAlpha=alpha;
      ctx.fillStyle='rgba(255,255,255,.03)';roundRect(ctx,fx,fy,fw,fyh,6);ctx.fill();
      ctx.lineWidth=1.4;ctx.strokeStyle=accent;if(dashed)ctx.setLineDash([3,3]);
      if(!dashed){ctx.shadowColor=accent;ctx.shadowBlur=Math.abs(head-i)<0.6?14:0;}
      roundRect(ctx,fx,fy,fw,fyh,6);ctx.stroke();ctx.setLineDash([]);
      // tiny scene: horizon + a state dot advancing with i
      ctx.strokeStyle='rgba(139,155,162,.4)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(fx+6,fy+fyh*0.68);ctx.lineTo(fx+fw-6,fy+fyh*0.68);ctx.stroke();
      const p=i/(n-1), dx=fx+8+p*(fw-16);
      ctx.fillStyle=accent;ctx.beginPath();ctx.arc(dx,fy+fyh*0.68-6-p*6,3,0,7);ctx.fill();
      ctx.restore();
    }
    for(let i=0;i<n;i++){
      const fx=m+i*(fw+gap);
      if(i>0) arrow(ctx,fx-gap+2,cy,fx-2,cy, i<=obs?C.cyan:'rgba(245,166,91,.6)',1.3);
      const observed=i<obs;
      frame(i,fx,y,fh, observed?1:0.5+0.4*(i<=head?1:0.3), !observed, observed?C.cyan:C.amber);
    }
    txt(ctx,'observed',m+ (fw+gap)*0.5, y+fh+16, C.cyan,10,'center');
    txt(ctx,'imagined forward →', m+(fw+gap)*(obs+1.5), y+fh+16, C.amber,10,'center');
    // branch rollouts from last observed frame
    const bx=m+(obs-1)*(fw+gap)+fw, by=cy;
    [['up',-1,'✓'],['dn',1,'']].forEach(([k,dir,mark],bi)=>{
      let px=bx, py=by;
      for(let j=0;j<2;j++){
        const nx=bx+ (j+1)*(fw*0.7+gap), ny=by+dir*(fh*0.62)*(j+1)/2;
        ctx.save();ctx.globalAlpha=0.32+ (mark?0.25:0);ctx.strokeStyle=mark?C.cyan:C.mut;ctx.lineWidth=1;ctx.setLineDash([2,3]);
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();ctx.setLineDash([]);
        ctx.strokeStyle=mark?C.cyan:'rgba(139,155,162,.5)';roundRect(ctx,nx,ny-fh*0.28,fw*0.6,fh*0.56,5);ctx.stroke();
        ctx.restore();px=nx+fw*0.6;py=ny;
      }
      if(mark){ctx.save();ctx.fillStyle=C.cyan;txt(ctx,'✓ best rollout',px+6,py,C.cyan,10,'left');ctx.restore();}
    });
  };

  /* VLA — pixels + words become one stream of tokens that comes out as actions */
  A.vla=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const boxX=w*0.42, boxW=w*0.16, boxY=h*0.16, boxH=h*0.68;
    // transformer box
    ctx.save();ctx.fillStyle='rgba(56,225,207,.06)';ctx.strokeStyle=C.cyan2;ctx.lineWidth=1.4;
    roundRect(ctx,boxX,boxY,boxW,boxH,10);ctx.fill();ctx.stroke();ctx.restore();
    txt(ctx,'TRANSFORMER',boxX+boxW/2,boxY+boxH/2,C.ink,11,'center');
    txt(ctx,'one token stream',boxX+boxW/2,boxY+boxH/2+16,C.dim,9,'center');
    // left: image patch grid
    const ix=w*0.08, iy=h*0.2, ig=Math.min(w*0.12,54), cell=ig/3;
    ctx.strokeStyle='rgba(139,155,162,.4)';ctx.lineWidth=1;
    for(let r=0;r<3;r++)for(let c=0;c<3;c++){ctx.fillStyle='rgba(56,225,207,'+(0.10+0.10*Math.sin(t+r+c))+')';
      ctx.fillRect(ix+c*cell,iy+r*cell,cell-1,cell-1);ctx.strokeRect(ix+c*cell,iy+r*cell,cell-1,cell-1);}
    txt(ctx,'image patches',ix+ig/2,iy-10,C.cyan,9.5,'center');
    // left: word chips
    const words=['pick','up','the','cup']; const wy=h*0.66;
    words.forEach((wd,i)=>{const cx=ix+ (i%2)*(ig*0.62)+2, cyy=wy+Math.floor(i/2)*20;
      ctx.fillStyle='rgba(156,140,255,.14)';ctx.strokeStyle=C.violet;ctx.lineWidth=1;
      roundRect(ctx,cx,cyy,ig*0.58,16,4);ctx.fill();ctx.stroke();
      txt(ctx,wd,cx+ig*0.29,cyy+8,'#C9C2FF',9,'center');});
    txt(ctx,'words',ix+ig/2,wy-10,C.violet,9.5,'center');
    // flowing tokens into the box
    const srcs=[[ix+ig, iy+ig*0.5, C.cyan],[ix+ig, wy+10, C.violet]];
    srcs.forEach(([sx,sy,col])=>{ arrow(ctx,sx+4,sy,boxX-4,boxY+boxH*0.5,'rgba(139,155,162,.3)',1);
      for(let k=0;k<3;k++){const u=((t*0.4+k/3)%1);const px=sx+4+u*(boxX-8-sx),py=sy+u*(boxY+boxH*0.5-sy);
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(px,py,2.4,0,7);ctx.fill();}});
    // right: action tokens out to a gripper
    const gx=w*0.82, gcy=h*0.5;
    arrow(ctx,boxX+boxW+4,boxY+boxH*0.5,gx-30,gcy,'rgba(245,166,91,.5)',1.2);
    for(let k=0;k<3;k++){const u=((t*0.5+k/3)%1);const px=boxX+boxW+4+u*(gx-30-boxX-boxW-4),py=boxY+boxH*0.5+u*(gcy-boxY-boxH*0.5);
      ctx.fillStyle=C.amber;ctx.beginPath();ctx.arc(px,py,2.6,0,7);ctx.fill();}
    txt(ctx,'action tokens',(boxX+boxW+gx)/2-10,gcy-16,C.amber,9.5,'center');
    // gripper glyph opening/closing
    const open=6+5*Math.abs(Math.sin(t*0.9));
    ctx.save();ctx.strokeStyle=C.amber;ctx.lineWidth=2.2;ctx.shadowColor=C.amber;ctx.shadowBlur=8;
    ctx.beginPath();ctx.moveTo(gx,gcy-14);ctx.lineTo(gx,gcy+14);ctx.stroke(); // wrist
    ctx.beginPath();ctx.moveTo(gx,gcy-open);ctx.lineTo(gx+16,gcy-open);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gx,gcy+open);ctx.lineTo(gx+16,gcy+open);ctx.stroke();ctx.restore();
    txt(ctx,'act',gx+8,gcy+26,C.dim,9.5,'center');
  };

  /* SIM-TO-REAL — train a policy in a randomized simulator, transfer to the real robot */
  A.sim2real=function(ctx,w,h,t){
    ctx.clearRect(0,0,w,h);
    const px=w*0.16, py=h*0.30, sx=w*0.40, sy=h*0.52, rx=w*0.16, ry=h*0.74, r=Math.min(38,w*0.075);
    const flow=(t*0.5)%1;
    // loop arrows POLICY -> SIM -> REWARD -> POLICY
    arrow(ctx,px+r*0.7,py+r*0.7, sx-r,sy-r*0.6, C.line,1.4);
    arrow(ctx,sx-r*0.7,sy+r*0.7, rx+r*0.7,ry-r*0.7, C.line,1.4);
    arrow(ctx,rx,ry-r, px,py+r, C.line,1.4);
    // travelling pulse around the triangle
    const pts=[[px,py],[sx,sy],[rx,ry]]; const seg=Math.floor(flow*3), u=(flow*3)%1;
    const a=pts[seg], b=pts[(seg+1)%3]; const gx=a[0]+(b[0]-a[0])*u, gy=a[1]+(b[1]-a[1])*u;
    ctx.save();ctx.shadowColor=C.cyan;ctx.shadowBlur=14;ctx.fillStyle=C.cyan;ctx.beginPath();ctx.arc(gx,gy,4,0,7);ctx.fill();ctx.restore();
    // domain-randomization sparkles around SIM
    for(let k=0;k<10;k++){const ang=k/10*6.28+t*0.6, rr=r+10+ (k%3)*6;
      const qx=sx+Math.cos(ang)*rr, qy=sy+Math.sin(ang)*rr, s=2+2*Math.abs(Math.sin(t*2+k));
      const cols=['rgba(245,166,91,',' rgba(56,225,207,','rgba(156,140,255,'];
      ctx.fillStyle=cols[k%3]+(0.35+0.3*Math.sin(t*3+k))+')';ctx.fillRect(qx-s/2,qy-s/2,s,s);}
    node(ctx,px,py,r,'POLICY',seg===2);
    node(ctx,sx,sy,r,'SIM',seg===0);
    node(ctx,rx,ry,r,'REWARD',seg===1);
    txt(ctx,'domain randomization',sx,sy+r+16,C.amber,9.5,'center');
    // transfer arrow to REAL robot
    const realX=w*0.80, realY=h*0.5;
    ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.shadowColor=C.cyan;ctx.shadowBlur=6;
    arrow(ctx,sx+r,sy, realX-r-4,realY, C.cyan,2);ctx.restore();
    txt(ctx,'transfer',(sx+realX)/2,(sy+realY)/2-12,C.cyan,10,'center');
    node(ctx,realX,realY,r,'REAL',true);
    txt(ctx,'the actual robot',realX,realY+r+16,C.dim,9.5,'center');
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
