/* md-anim.js — first-principles mechanism animators for the Medical & Surgical Robotics explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-mdanim="name". Self-contained boot. */
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

  /* 01 — WHY: inside the body — no room for error, tissue moves, the view is tiny. */
  A.md_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Inside the body is the hardest workspace: tiny, moving, and unforgiving',14,16,C.dim);
    // a body outline with a narrow port; constraints listed
    const bx=w*0.5,by=h*0.55;ctx.strokeStyle=hexA(C.coral,0.6);ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(bx,by,w*0.3,h*0.3,0,0,TAU);ctx.stroke();
    // small incision port
    dot(ctx,bx-w*0.3,by,4,C.amber);lab(ctx,'one small port',bx-w*0.3-10,by-16,C.amber,8.5);
    // deforming tissue (wavy) inside
    ctx.strokeStyle=hexA(C.violet,0.6);ctx.beginPath();for(let i=-40;i<40;i++){ctx.lineTo(bx+i,by+Math.sin(i*0.15+t*2)*8);}ctx.stroke();
    lab(ctx,'tissue shifts & breathes',bx-30,by+30,C.violet,8.5);
    // constraints
    ['no room for error','deformable, wet, specular','narrow field of view','must stay sterile'].forEach((s,i)=>lab(ctx,'• '+s,w*0.04,h*0.32+i*15,C.mut,9));
    lab(ctx,'the stakes and the constraints are what make medical robotics its own discipline',14,h-12,C.mut);
  };

  /* 02 — ENDO: a camera down a tube — narrow view, deformable, specular. */
  A.md_endo=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Endoscopy: see and map through a camera at the tip of a tube',14,16,C.dim);
    // tube from left with camera at tip, narrow FoV cone into a lumen
    const tx=w*0.1,ty=h*0.5;ctx.strokeStyle=hexA(C.mut,0.7);ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(tx-20,ty);ctx.lineTo(w*0.4,ty);ctx.stroke();
    dot(ctx,w*0.4,ty,5,C.cyan);lab(ctx,'camera + light',tx-6,ty-16,C.cyan,8.5);
    // narrow FoV cone
    ctx.fillStyle=hexA(C.amber,0.1);ctx.beginPath();ctx.moveTo(w*0.4,ty);ctx.lineTo(w*0.8,ty-h*0.2);ctx.lineTo(w*0.8,ty+h*0.2);ctx.closePath();ctx.fill();
    lab(ctx,'narrow field of view',w*0.5,ty-h*0.2-6,C.amber,8.5);
    // lumen walls (deforming) + specular highlights
    ctx.strokeStyle=hexA(C.coral,0.5);ctx.beginPath();for(let i=0;i<h*0.4;i++){const y=ty-h*0.2+i;ctx.lineTo(w*0.82+Math.sin(y*0.1+t*2)*6,y);}ctx.stroke();
    const p=saw(t,3);dot(ctx,w*0.6+p*w*0.15,ty-10+Math.sin(t*3)*6,3,C.ink);lab(ctx,'specular glare',w*0.58,ty+40,C.mut,8);
    lab(ctx,'building a stable 3D map inside a wet, shiny, deforming lumen is SLAM on hard mode',14,h-12,C.mut);
  };

  /* 03 — TELEOP: scale and steady the surgeon's motion. */
  A.md_teleop=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Teleoperation: the surgeon\'s hand, scaled down and steadied',14,16,C.dim);
    // left: surgeon's hand motion (large + tremor); right: instrument (small + smooth)
    const lx=w*0.24,ly=h*0.5,rx=w*0.74,ry=h*0.5;
    lab(ctx,'surgeon console',lx-34,h*0.3,C.cyan,9);lab(ctx,'instrument in patient',rx-40,h*0.3,C.green,9);
    const p=saw(t,4);const base=Math.sin(p*TAU)*40;const tremor=Math.sin(t*30)*6;
    dot(ctx,lx+base+tremor,ly,7,C.cyan);
    ctx.strokeStyle=hexA(C.cyan,0.3);ctx.beginPath();ctx.ellipse(lx,ly,40,10,0,0,TAU);ctx.stroke();
    // scaled + filtered motion
    dot(ctx,rx+base*0.3,ry,6,C.green);
    ctx.strokeStyle=hexA(C.green,0.3);ctx.beginPath();ctx.ellipse(rx,ry,12,4,0,0,TAU);ctx.stroke();
    arrow(ctx,lx+50,ly,rx-30,ry,hexA(C.violet,0.7),1.4);lab(ctx,'× scale down\n× filter tremor',w*0.46,ly-24,C.violet,8.5);
    lab(ctx,'motion scaling + tremor filtering turn a shaky human hand into sub-millimetre precision',14,h-12,C.mut);
  };

  /* 04 — SOFT/CONTINUUM: robots that bend to follow a path through the body. */
  A.md_soft=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Continuum & steerable robots bend to follow the body\'s own channels',14,16,C.dim);
    // a curved lumen path + a continuum robot snaking along it
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=18;ctx.beginPath();
    const path=[];for(let i=0;i<=100;i++){const fx=i/100;const x=w*0.1+fx*w*0.8;const y=h*0.5+Math.sin(fx*6)*h*0.16;path.push([x,y]);}
    ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);path.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();
    lab(ctx,'winding vessel / lumen',w*0.1,h*0.3,C.mut,9);
    // robot tip advances along path
    const p=saw(t,5);const n=Math.floor(p*path.length);
    ctx.strokeStyle=C.green;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(path[0][0],path[0][1]);
    for(let i=0;i<=n;i++)ctx.lineTo(path[i][0],path[i][1]);ctx.stroke();
    if(n<path.length)dot(ctx,path[n][0],path[n][1],5,C.amber);
    lab(ctx,'no rigid links — the body itself is the guide; steer the tip and the shaft follows',14,h-12,C.mut);
  };

  /* 05 — AUTONOMY: from assisting to acting, under image guidance and hard safety limits. */
  A.md_autonomy=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Toward autonomy: assist, then act — always inside hard safety limits',14,16,C.dim);
    // a ladder of autonomy levels
    const levels=['surgeon does all','robot steadies','robot does a subtask','robot does the task, supervised'];
    const p=saw(t,6);const active=Math.min(3,Math.floor(p*4));
    levels.forEach((s,i)=>{const y=h*0.30+i*h*0.14;const on=(i===active);
      rrect(ctx,w*0.06,y,w*0.6,h*0.1,5,on?C.green:hexA(C.mut,0.4),on?hexA(C.green,0.1):null);
      lab(ctx,'L'+i+': '+s,w*0.08,y+h*0.05,on?C.green:C.mut,9.5);});
    // a "safety envelope" gate on the right
    box(ctx,w*0.72,h*0.44,w*0.22,30,'safety envelope\n(image-guided)',C.coral,hexA(C.coral,0.06));
    lab(ctx,'every autonomous action is checked against imaging + a no-go boundary before it moves',14,h-12,C.mut);
  };

  /* F01 — mdf_teleop_scale: console hand motion → scaled instrument tip, RCM pivot */
  A.mdf_teleop_scale=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Teleoperation: hand motion ÷5 → instrument tip  |  RCM keeps port fixed',14,16,C.dim,10.5);
    var lx=w*0.22,ly=h*0.52,rx=w*0.72,ry=h*0.52;
    var p=saw(t,4),base=Math.sin(p*TAU)*30,tremor=Math.sin(t*28)*5;
    // surgeon hand — large motion + tremor
    ctx.strokeStyle=hexA(C.cyan,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(lx,ly,30,8,0,0,TAU);ctx.stroke();
    dot(ctx,lx+base+tremor,ly,7,C.cyan);
    lab(ctx,'surgeon hand\n±30 mm + tremor',lx-28,ly+22,C.cyan,9);
    // arrow with scale label
    arrow(ctx,lx+44,ly,rx-44,ry,hexA(C.violet,0.8),1.5);
    lab(ctx,'÷5 scale\n+ tremor filter',w*0.47,ly-20,C.violet,9,'center');
    // instrument tip — small clean motion
    ctx.strokeStyle=hexA(C.green,0.35);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(rx,ry,6,2,0,0,TAU);ctx.stroke();
    dot(ctx,rx+base*0.2,ry,5,C.green);
    lab(ctx,'instrument tip\n±6 mm smooth',rx-28,ry+22,C.green,9);
    // RCM pivot point — shaft line + fixed dot
    var rcmx=w*0.58,rcmy=h*0.68;
    ctx.strokeStyle=hexA(C.amber,0.6);ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(rx+base*0.2,ry);ctx.lineTo(rcmx,rcmy);ctx.stroke();
    dot(ctx,rcmx,rcmy,5,C.amber);ring(ctx,rcmx,rcmy,10,hexA(C.amber,0.5));
    lab(ctx,'RCM (fixed\nport pivot)',rcmx+13,rcmy-6,C.amber,8.5);
    lab(ctx,'scale + filter turn a shaky hand into sub-mm precision; RCM keeps the wound closed',14,h-12,C.mut,10);
  };

  /* F02 — mdf_endo_slam: tube cross-section, tracked features, partial 3D map building */
  A.mdf_endo_slam=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Endoscopic SLAM: track features in wet, deforming lumen → build 3D map',14,16,C.dim,10.5);
    var cx=w*0.32,cy=h*0.50,rx2=w*0.18,ry2=h*0.24;
    // lumen cross-section (deforming ellipse)
    var def=Math.sin(t*1.4)*6;
    ctx.strokeStyle=hexA(C.coral,0.55);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,rx2+def,ry2-def*0.4,0,0,TAU);ctx.stroke();
    lab(ctx,'lumen wall\n(deforming)',cx-rx2-38,cy-10,C.coral,8.5);
    // camera at center
    dot(ctx,cx,cy,4,C.cyan);lab(ctx,'camera',cx+6,cy-12,C.cyan,8.5);
    // feature points — some tracked, some specular/lost
    var feats=[[cx-50,cy-40],[cx+40,cy-55],[cx-30,cy+50],[cx+55,cy+30],[cx-60,cy+10],[cx+20,cy+60]];
    var p=saw(t,3);
    feats.forEach(function(f,i){
      var alive=(i+Math.floor(p*3))%3!==0;
      dot(ctx,f[0]+Math.sin(t*1.2+i)*3,f[1]+Math.cos(t*0.9+i)*2,alive?3:2,alive?C.green:hexA(C.mut,0.4));
      if(!alive)lab(ctx,'specular',f[0]+4,f[1]-8,hexA(C.amber,0.6),7);
    });
    // camera pose updating arrow
    var ang=saw(t,5)*0.6-0.3;arrow(ctx,cx,cy,cx+Math.cos(ang)*40,cy+Math.sin(ang)*20,hexA(C.violet,0.7),1.3);
    lab(ctx,'pose update',cx+20,cy+36,C.violet,8);
    // partial 3D map building on right
    var mx=w*0.68,my=h*0.50;
    lab(ctx,'3D map (building)',mx-28,my-70,C.ink,9);
    var pts=[[mx-30,my-40],[mx,my-55],[mx+30,my-35],[mx-20,my-10],[mx+25,my-5],[mx-10,my+30],[mx+35,my+20]];
    pts.forEach(function(pp,i){
      var frac=saw(t+i*0.3,6);if(frac>0.15){
        dot(ctx,pp[0],pp[1],2.5,hexA(C.cyan2,frac));
      }
    });
    // connect some map points
    ctx.strokeStyle=hexA(C.cyan,0.25);ctx.lineWidth=1;
    if(saw(t,6)>0.3){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);pts.slice(1,4).forEach(function(pp){ctx.lineTo(pp[0],pp[1]);});ctx.stroke();}
    lab(ctx,'map a deforming lumen: mask specular pixels, track features, splat Gaussians per frame',14,h-12,C.mut,10);
  };

  /* F03 — mdf_needle_steer: bevel tip curves in tissue, steers around vessel obstacle to target */
  A.mdf_needle_steer=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Steerable needle: bevel tip bends → steer around vessel to deep target',14,16,C.dim,10.5);
    // tissue block
    rrect(ctx,w*0.08,h*0.25,w*0.84,h*0.55,10,hexA(C.mut,0.2),hexA(C.mut,0.07));
    lab(ctx,'tissue',w*0.10,h*0.27,C.mut,8.5);
    // target (deep)
    var tx2=w*0.82,ty2=h*0.52;dot(ctx,tx2,ty2,7,C.green);ring(ctx,tx2,ty2,12,hexA(C.green,0.5));lab(ctx,'target',tx2+10,ty2-4,C.green,8.5);
    // vessel obstacle
    var vx=w*0.55,vy=h*0.50;dot(ctx,vx,vy,8,C.coral);lab(ctx,'vessel',vx+10,vy-4,C.coral,8.5);
    // needle path — enters from left, curves around vessel
    var p=saw(t,5);var steps=80;
    ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.beginPath();
    var sx=w*0.08,sy=h*0.52;ctx.moveTo(sx,sy);
    for(var i=1;i<=Math.floor(p*steps);i++){
      var fi=i/steps;var nx=sx+fi*(tx2-sx);
      // arc around vessel: curve up before vessel, then back
      var bend=Math.exp(-Math.pow((fi-0.52)/0.15,2))*30;
      var ny=sy+(ty2-sy)*fi - bend;
      ctx.lineTo(nx,ny);
    }
    ctx.stroke();
    // bevel tip indicator at current position
    if(p>0.05){
      var cp=Math.floor(p*steps)/steps;
      var tipx=sx+cp*(tx2-sx);var tipy=sy+(ty2-sy)*cp-Math.exp(-Math.pow((cp-0.52)/0.15,2))*30;
      dot(ctx,tipx,tipy,4,C.amber);
    }
    // entry arrow from left
    arrow(ctx,w*0.01,sy,w*0.08,sy,hexA(C.amber,0.6),1.3);lab(ctx,'bevel entry',w*0.01,sy-12,C.amber,8.5);
    lab(ctx,'bevel offset generates ~50 mm curvature radius; duty-cycle spin straightens or bends path',14,h-12,C.mut,10);
  };

  /* F04 — mdf_continuum_shape: cable tensions at base, Cosserat rod curve, tip vs desired */
  A.mdf_continuum_shape=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Continuum robot: 3 cable tensions → Cosserat rod bends → tip reaches target',14,16,C.dim,10.5);
    // base block
    var bx=w*0.12,by=h*0.55;rrect(ctx,bx-18,by-22,36,44,6,hexA(C.mut,0.5),hexA(C.mut,0.12));
    lab(ctx,'base',bx-14,by+28,C.mut,8.5);
    // cable tension labels T1 T2 T3
    var ts=saw(t,4);
    var tensions=['T1','T2','T3'];var tcols=[C.cyan,C.amber,C.violet];
    tensions.forEach(function(tn,i){
      var ty3=by-14+i*14;var val=0.4+0.3*Math.sin(t*1.2+i*2.1+ts*TAU);
      lab(ctx,tn+'='+(val).toFixed(2)+'N',bx+24,ty3,tcols[i],9);
    });
    // Cosserat rod curve — arc parameterized by t
    var rodBend=0.6+0.3*Math.sin(t*0.7);
    var L=h*0.52;ctx.strokeStyle=C.green;ctx.lineWidth=4;ctx.beginPath();
    var startx=bx,starty=by;ctx.moveTo(startx,starty);
    for(var s=0;s<=60;s++){
      var fs=s/60;var ang=-Math.PI/2+rodBend*fs*1.4;
      var rx3=startx+Math.cos(ang)*L*fs;var ry3=starty+Math.sin(ang)*L*fs;
      ctx.lineTo(rx3,ry3);
    }
    ctx.stroke();
    // tip position
    var tipAng=-Math.PI/2+rodBend*1.4;
    var tipx=startx+Math.cos(tipAng)*L;var tipy=starty+Math.sin(tipAng)*L;
    dot(ctx,tipx,tipy,5,C.green);lab(ctx,'actual tip',tipx+8,tipy,C.green,8.5);
    // desired tip (target)
    var desX=tipx+Math.sin(t*0.5)*18,desY=tipy-12;
    ring(ctx,desX,desY,7,hexA(C.amber,0.8));lab(ctx,'desired',desX+10,desY,C.amber,8.5);
    // error arrow
    arrow(ctx,tipx,tipy,desX,desY,hexA(C.coral,0.7),1.2);
    // hysteresis annotation
    lab(ctx,'hysteresis:\nPrandtl-Ishlinskii\n12 operators',w*0.65,h*0.35,C.violet,8.5);
    lab(ctx,'Cosserat rod maps cable tensions to tip position; hysteresis model corrects the gap',14,h-12,C.mut,10);
  };

  /* F05 — mdf_catheter_nav: branching vessel tree, catheter tip advancing, fluoroscopy grid */
  A.mdf_catheter_nav=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Catheter navigation: fluoroscopy map → RL policy steers through branching vessels',14,16,C.dim,10.5);
    // fluoroscopy grid overlay (faint)
    ctx.strokeStyle=hexA(C.mut,0.12);ctx.lineWidth=0.8;
    for(var gx=0;gx<w;gx+=24){ctx.beginPath();ctx.moveTo(gx,24);ctx.lineTo(gx,h-18);ctx.stroke();}
    for(var gy=24;gy<h-18;gy+=24){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();}
    lab(ctx,'X-ray / fluoroscopy',14,22,hexA(C.mut,0.5),8.5);
    // vessel tree: trunk then 2 branches then sub-branches
    var V1=[w*0.15,h*0.52,w*0.38,h*0.52]; // main trunk
    var V2=[w*0.38,h*0.52,w*0.55,h*0.35]; // left branch
    var V3=[w*0.38,h*0.52,w*0.55,h*0.68]; // right branch
    var V4=[w*0.55,h*0.35,w*0.75,h*0.28]; // left-left
    var V5=[w*0.55,h*0.35,w*0.75,h*0.42]; // left-right (target)
    var segs=[V1,V2,V3,V4,V5];
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=8;
    segs.forEach(function(s){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.stroke();});
    // target
    dot(ctx,w*0.75,h*0.42,6,C.green);ring(ctx,w*0.75,h*0.42,11,hexA(C.green,0.6));lab(ctx,'target',w*0.76,h*0.42-4,C.green,8.5);
    // catheter tip animating along correct path
    var p=saw(t,6);
    // path: trunk → V2 → V5
    var fullpath=[[w*0.15,h*0.52],[w*0.38,h*0.52],[w*0.55,h*0.35],[w*0.75,h*0.42]];
    var nsegs=fullpath.length-1;var pidx=p*nsegs;var si=Math.min(Math.floor(pidx),nsegs-1);var sf=pidx-si;
    var cpx=fullpath[si][0]+(fullpath[si+1][0]-fullpath[si][0])*sf;
    var cpy=fullpath[si][1]+(fullpath[si+1][1]-fullpath[si][1])*sf;
    // heartbeat deflection
    var hb=Math.sin(t*6.3)*2.3;
    dot(ctx,cpx,cpy+hb,5,C.amber);lab(ctx,'catheter tip',cpx+6,cpy+hb-10,C.amber,8.5);
    lab(ctx,'pulsatile flow deflects tip ~2.3 mm/cycle; RL policy trained on 1,000 phantom vessels',14,h-12,C.mut,10);
  };

  /* F06 — mdf_phase_recog: surgical phase timeline, sliding classifier window, probability bars */
  A.mdf_phase_recog=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Surgical phase recognition: TCN classifier over video → current phase + anticipation',14,16,C.dim,10.5);
    // phase timeline (horizontal boxes)
    var phases=['incision','dissect','clip','extract','irrigate','suture','closure'];
    var pcols=[C.violet,C.cyan,C.amber,C.coral,C.cyan2,C.green,C.mut];
    var tlx=w*0.04,tly=h*0.30,tlw=w*0.57,tlh=28;
    var pw=tlw/phases.length;
    phases.forEach(function(ph,i){
      rrect(ctx,tlx+i*pw,tly,pw-2,tlh,3,hexA(pcols[i],0.5),hexA(pcols[i],0.08));
      if(pw>50)lab(ctx,ph,tlx+i*pw+pw/2,tly+tlh/2,pcols[i],8,'center');
    });
    // sliding classifier window
    var wp=saw(t,8);var wpos=tlx+wp*tlw-pw*0.7;
    rrect(ctx,wpos,tly-6,pw*1.4,tlh+12,5,hexA(C.ink,0.9),null);
    lab(ctx,'TCN\nwindow',wpos+pw*0.7/2,tly+tlh+18,C.ink,8,'center');
    // current active phase index
    var activeI=Math.floor(wp*phases.length);activeI=Math.min(activeI,phases.length-1);
    lab(ctx,'now: '+phases[activeI],tlx,tly-20,pcols[activeI],10);
    // probability bars on right
    var bx=w*0.67,by=h*0.28,bw=22,bh=100;
    lab(ctx,'P(phase)',bx,by-12,C.dim,8.5);
    phases.forEach(function(ph,i){
      var prob=(i===activeI)?0.82:Math.max(0.02,0.15*Math.sin(t*0.4+i*1.1)*Math.sin(t*0.4+i*1.1));
      rrect(ctx,bx+i*(bw+3),by+bh*(1-prob),bw,bh*prob,2,null,hexA(pcols[i],i===activeI?0.9:0.35));
    });
    lab(ctx,'TCN with 60 s receptive field; 89.3% frame accuracy; anticipates next phase 45 s ahead',14,h-12,C.mut,10);
  };

  /* F07 — mdf_suture_policy: bimanual graspers, needle piercing tissue, CBF envelope, tension */
  A.mdf_suture_policy=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Autonomous suturing: needle drive → thread pull → CBF keeps force/pose safe',14,16,C.dim,10.5);
    // tissue block
    var ty2=h*0.60;rrect(ctx,w*0.10,ty2,w*0.80,h*0.22,8,hexA(C.mut,0.25),hexA(C.mut,0.07));
    lab(ctx,'tissue (ex vivo porcine)',w*0.12,ty2+4,C.mut,8);
    // grasper left
    var g1x=w*0.25,g1y=h*0.52;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g1x-10,g1y-20);ctx.lineTo(g1x,g1y);ctx.lineTo(g1x+10,g1y-20);ctx.stroke();
    lab(ctx,'L grasper',g1x-18,g1y-28,C.cyan,8.5);
    // grasper right
    var g2x=w*0.72,g2y=h*0.52;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g2x-10,g2y-20);ctx.lineTo(g2x,g2y);ctx.lineTo(g2x+10,g2y-20);ctx.stroke();
    lab(ctx,'R grasper',g2x-14,g2y-28,C.cyan,8.5);
    // needle arc (3/8 circle, 17mm radius)
    var p=saw(t,4);var needleAng=-Math.PI+p*Math.PI*1.2;
    var ncx=w*0.48,ncy=h*0.58,nr=28;
    ctx.strokeStyle=C.amber;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(ncx,ncy,nr,-Math.PI,-Math.PI+p*Math.PI*1.2);ctx.stroke();
    dot(ctx,ncx+Math.cos(needleAng)*nr,ncy+Math.sin(needleAng)*nr,4,C.amber);
    lab(ctx,'needle\n17mm r',ncx+nr+4,ncy-8,C.amber,8.5);
    // thread
    ctx.strokeStyle=hexA(C.green,0.7);ctx.lineWidth=1.5;ctx.setLineDash([3,4]);
    ctx.beginPath();ctx.moveTo(g1x,g1y);ctx.lineTo(g2x,g2y);ctx.stroke();ctx.setLineDash([]);
    // thread tension value
    var tension=0.08+0.07*Math.sin(t*2.1);
    lab(ctx,'tension: '+(tension).toFixed(3)+' N / 0.15 N limit',w*0.35,h*0.46,C.green,8.5);
    // CBF safety envelope shaded region
    ctx.fillStyle=hexA(C.coral,0.07);ctx.strokeStyle=hexA(C.coral,0.4);ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.ellipse(ncx,ty2-8,w*0.25,h*0.10,0,0,TAU);ctx.fill();ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'CBF envelope\n(nerve > 2 mm)',ncx-34,ty2-38,C.coral,8.5);
    lab(ctx,'78% suture success ex vivo; CBF QP filter gates unsafe needle angles in real time',14,h-12,C.mut,10);
  };

  /* F08 — mdf_imaging_guided: OCT/US scan wave, segmented boundary, instrument tracking, safe zone */
  A.mdf_imaging_guided=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Imaging-guided robotics: live OCT/US segmentation → instrument in safe zone',14,16,C.dim,10.5);
    // scan region (left panel)
    var px=w*0.06,py=h*0.28,pw2=w*0.40,ph=h*0.46;
    rrect(ctx,px,py,pw2,ph,8,hexA(C.cyan2,0.3),hexA(C.cyan2,0.05));
    lab(ctx,'iOCT scan region',px+4,py+4,C.cyan2,8.5);
    // A-scan wave pattern
    for(var xi=0;xi<pw2-4;xi+=5){
      var wv=Math.sin(xi*0.18+t*3)*8+Math.sin(xi*0.07-t*1.5)*4;
      ctx.strokeStyle=hexA(C.cyan,0.5);ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(px+2+xi,py+ph/2);ctx.lineTo(px+2+xi,py+ph/2+wv);ctx.stroke();
    }
    // segmented tissue boundary (deforming with breath)
    var breathY=Math.sin(t*1.4)*8;
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();
    for(var xi2=0;xi2<pw2;xi2+=3){
      var by2=py+ph*0.55+breathY+Math.sin(xi2*0.09+t*0.6)*5;
      if(xi2===0)ctx.moveTo(px+xi2,by2);else ctx.lineTo(px+xi2,by2);
    }
    ctx.stroke();
    lab(ctx,'tissue boundary\n(tracking breath)',px+4,py+ph*0.55+breathY+18,C.green,8);
    // safe zone (above boundary) shaded
    ctx.fillStyle=hexA(C.green,0.06);ctx.fillRect(px+2,py+2,pw2-4,ph*0.55+breathY-2);
    ctx.fillStyle=hexA(C.coral,0.06);ctx.fillRect(px+2,py+ph*0.55+breathY,pw2-4,ph*0.45-breathY-2);
    // instrument tip tracking (right panel)
    var rx4=w*0.62,ry4=h*0.52;
    lab(ctx,'instrument tracking',rx4,h*0.28,C.ink,9);
    // instrument tip position relative to boundary
    var tipOff=Math.sin(t*0.8)*15-10;
    dot(ctx,rx4+w*0.15,ry4+tipOff,5,C.amber);ring(ctx,rx4+w*0.15,ry4+tipOff,10,hexA(C.amber,0.4));
    lab(ctx,'tool tip',rx4+w*0.15+12,ry4+tipOff-4,C.amber,8.5);
    // safe / unsafe label
    var safe=tipOff<5;lab(ctx,safe?'SAFE':'UNSAFE',rx4,ry4+tipOff,safe?C.green:C.coral,9);
    arrow(ctx,rx4+w*0.15,ry4+tipOff,rx4+w*0.15,ry4+20,hexA(C.mut,0.5),1);lab(ctx,'boundary',rx4+w*0.15+6,ry4+20,C.mut,8);
    lab(ctx,'breathing moves organ ~5 mm; deformable B-spline registration in 30 ms keeps plan aligned',14,h-12,C.mut,10);
  };

  /* F09 — mdf_us_palpation: probe on curved surface, contact force arrows, CNR quality bar */
  A.mdf_us_palpation=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Robotic ultrasound: probe contact + tilt controlled to maximize image CNR',14,16,C.dim,10.5);
    // curved body surface
    var surfx=w*0.15,surfy=h*0.50,surfW=w*0.55;
    ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=2;ctx.beginPath();
    for(var xi=0;xi<=surfW;xi+=2){
      var sy=surfy+Math.sin(xi/surfW*Math.PI)*25;
      if(xi===0)ctx.moveTo(surfx+xi,sy);else ctx.lineTo(surfx+xi,sy);
    }
    ctx.stroke();ctx.fillStyle=hexA(C.mut,0.07);ctx.fill();
    // probe rectangle (adapting tilt)
    var cntrX=surfx+surfW*0.45,cntrY=surfy+Math.sin(0.45*Math.PI)*25;
    var tilt=Math.sin(t*0.8)*0.18; // target: ±12°
    ctx.save();ctx.translate(cntrX,cntrY-22);ctx.rotate(tilt);
    rrect(ctx,-14,-18,28,36,4,C.cyan,hexA(C.cyan,0.15));
    lab(ctx,'US\nprobe',0,0,C.cyan,8.5,'center');
    ctx.restore();
    // contact force arrow
    var fmag=2.5+0.5*Math.sin(t*1.2);var flen=fmag*8;
    arrow(ctx,cntrX,cntrY-8,cntrX,cntrY+flen,C.amber,2);
    lab(ctx,(fmag).toFixed(1)+' N\n(target 3 N)',cntrX+6,cntrY+flen/2,C.amber,8.5);
    // tilt angle indicator
    lab(ctx,'tilt: '+(tilt*180/Math.PI).toFixed(1)+'°\n(±12° limit)',cntrX-60,cntrY-50,C.violet,8.5);
    // CNR quality bar (right side)
    var bx=w*0.78,by=h*0.30,bh=h*0.38;
    lab(ctx,'CNR\nquality',bx-4,by-20,C.ink,9,'center');
    var cnr=0.5+0.4*Math.cos(tilt*8);cnr=Math.max(0.1,Math.min(1.0,cnr));
    rrect(ctx,bx-10,by,20,bh,4,hexA(C.mut,0.3),null);
    rrect(ctx,bx-10,by+bh*(1-cnr),20,bh*cnr,4,null,hexA(cnr>0.5?C.green:C.coral,0.7));
    lab(ctx,cnr>0.5?'good':'poor',bx-12,by+bh+12,cnr>0.5?C.green:C.coral,8.5);
    lab(ctx,'admittance control at 500 N/m keeps probe on surface; CNR feedback drives tilt adjustment',14,h-12,C.mut,10);
  };

  /* F10 — mdf_emg_decode: forearm electrodes, 4-channel waveforms, CNN block, 5-finger output bars */
  A.mdf_emg_decode=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'EMG decoding: 8-channel surface signals → CNN-LSTM → 5 finger angles in 72 ms',14,16,C.dim,10.5);
    // forearm outline
    var fax=w*0.07,fay=h*0.32,faw=w*0.24,fah=h*0.36;
    rrect(ctx,fax,fay,faw,fah,fah/2,hexA(C.mut,0.3),hexA(C.mut,0.06));
    lab(ctx,'forearm',fax+faw/2,fay+fah+12,C.mut,8.5,'center');
    // electrode dots (4 shown)
    var ecols=[C.cyan,C.amber,C.violet,C.green];
    [[fax+faw*0.3,fay+fah*0.25],[fax+faw*0.6,fay+fah*0.25],[fax+faw*0.3,fay+fah*0.70],[fax+faw*0.6,fay+fah*0.70]].forEach(function(ep,i){
      dot(ctx,ep[0],ep[1],5,ecols[i]);ring(ctx,ep[0],ep[1],9,hexA(ecols[i],0.4));
    });
    // 4 waveforms
    var wx=w*0.36,wy=h*0.28,ww=w*0.26,wh=18;
    lab(ctx,'EMG channels (4 of 8)',wx,wy-12,C.dim,8.5);
    ecols.forEach(function(col,i){
      var cy2=wy+i*(wh+6);ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.beginPath();
      for(var xi=0;xi<ww;xi+=2){
        var v=Math.sin(xi*0.4+t*4+i*1.8)*6+Math.sin(xi*1.1+t*6.5+i)*3;
        if(xi===0)ctx.moveTo(wx+xi,cy2+wh/2+v);else ctx.lineTo(wx+xi,cy2+wh/2+v);
      }
      ctx.stroke();
    });
    // CNN block
    var cbx=w*0.66,cby=h*0.40;
    box(ctx,cbx,cby,w*0.12,h*0.20,'CNN\nLSTM',C.violet,hexA(C.violet,0.08));
    arrow(ctx,wx+ww+2,wy+wh*2,cbx,cby+h*0.10,hexA(C.mut,0.6),1.2);
    // 5 finger angle output bars
    var obx=w*0.82,oby=h*0.28,obw=14,obh=h*0.38;
    lab(ctx,'finger\nangles',obx+obw*2,oby-20,C.ink,8.5,'center');
    var fnames=['T','I','M','R','L'];
    fnames.forEach(function(fn,i){
      var ang=0.3+0.6*Math.sin(t*0.7+i*1.3)*Math.sin(t*0.7+i*1.3);
      rrect(ctx,obx+i*(obw+3),oby,obw,obh,3,hexA(C.green,0.3),null);
      rrect(ctx,obx+i*(obw+3),oby+obh*(1-ang),obw,obh*ang,3,null,hexA(C.green,0.7));
      lab(ctx,fn,obx+i*(obw+3)+obw/2,oby+obh+10,C.mut,8,'center');
    });
    arrow(ctx,cbx+w*0.12,cby+h*0.10,obx,oby+obh*0.5,hexA(C.mut,0.6),1.2);
    lab(ctx,'latency: 72 ms\nRMSE: 8.2°',obx+obw*5+6,oby+obh*0.3,C.amber,8.5);
    lab(ctx,'RMS features over 200 ms window; CNN-LSTM [8,50] input decodes 5 DOF simultaneously',14,h-12,C.mut,10);
  };

  /* F11 — mdf_microrobot_mag: 4 external coils, field lines, tiny capsule translating, flow */
  A.mdf_microrobot_mag=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Magnetic micro-robot: rotating external field (8 mT) drives untethered capsule',14,16,C.dim,10.5);
    var cx=w*0.50,cy=h*0.52;
    // workspace boundary
    ring(ctx,cx,cy,h*0.30,hexA(C.mut,0.2));
    // 4 external coils
    var coilPos=[[cx,cy-h*0.30-14],[cx+h*0.30+14,cy],[cx,cy+h*0.30+14],[cx-h*0.30-14,cy]];
    var coilLabs=['N','E','S','W'];
    coilPos.forEach(function(cp,i){
      rrect(ctx,cp[0]-12,cp[1]-8,24,16,4,hexA(C.amber,0.7),hexA(C.amber,0.12));
      lab(ctx,coilLabs[i],cp[0],cp[1],C.amber,8.5,'center');
    });
    // rotating magnetic field lines (4 arcs)
    var fieldAng=t*1.2; // 2 Hz → visual rotation
    for(var fi=0;fi<4;fi++){
      var fa=fieldAng+fi*Math.PI/2;
      ctx.strokeStyle=hexA(C.violet,0.35);ctx.lineWidth=1;ctx.beginPath();
      ctx.arc(cx,cy,h*0.18,fa,fa+Math.PI*0.55);ctx.stroke();
      // arrowhead hint
      var ae=fa+Math.PI*0.55;
      dot(ctx,cx+Math.cos(ae)*h*0.18,cy+Math.sin(ae)*h*0.18,2,hexA(C.violet,0.5));
    }
    lab(ctx,'B field\nrotating\n2 Hz / 8 mT',cx-20,cy-20,C.violet,8,'center');
    // capsule robot — translates in response to field
    var cap_ang=fieldAng*0.6;
    var cap_r=h*0.12;
    var capx=cx+Math.cos(cap_ang)*cap_r;var capy=cy+Math.sin(cap_ang)*cap_r;
    rrect(ctx,capx-10,capy-6,20,12,6,C.cyan,hexA(C.cyan,0.15));
    lab(ctx,'capsule\n~3 mm/s',capx-14,capy+14,C.cyan,8.5);
    // flow arrows
    ctx.strokeStyle=hexA(C.green,0.3);ctx.lineWidth=1;
    for(var i=0;i<4;i++){
      var fa2=i*Math.PI/2+t*0.3;
      arrow(ctx,cx+Math.cos(fa2)*h*0.08,cy+Math.sin(fa2)*h*0.08,cx+Math.cos(fa2)*h*0.24,cy+Math.sin(fa2)*h*0.24,hexA(C.green,0.25),1);
    }
    // Kalman filter label
    lab(ctx,'Kalman\ntracker\n0.3 mm RMS',w*0.78,h*0.62,C.green,8.5);dot(ctx,w*0.78,h*0.58,3,C.green);
    lab(ctx,'external coil array spins field; PINN predicts flow drift; Kalman tracks position to 0.3 mm',14,h-12,C.mut,10);
  };

  /* F12 — mdf_seg_register: preop CT | intraop US side by side, registration arrows, deform grid */
  A.mdf_seg_register=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Seg + registration: preop CT → deformable align → intraop mask in 2.1 s',14,16,C.dim,10.5);
    var lx=w*0.05,rx=w*0.52,pw2=w*0.41,ph=h*0.48,py=h*0.28;
    // left: preop CT
    rrect(ctx,lx,py,pw2,ph,8,hexA(C.mut,0.3),hexA(C.mut,0.06));
    lab(ctx,'preop CT',lx+4,py+4,C.mut,8.5);
    // draw CT-like ellipse (organ)
    ctx.fillStyle=hexA(C.cyan2,0.25);ctx.beginPath();ctx.ellipse(lx+pw2*0.5,py+ph*0.5,pw2*0.28,ph*0.35,0,0,TAU);ctx.fill();
    ctx.strokeStyle=hexA(C.cyan2,0.6);ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(lx+pw2*0.5,py+ph*0.5,pw2*0.28,ph*0.35,0,0,TAU);ctx.stroke();
    // deformation field: warped grid lines in between
    var gx=lx+pw2+4,gwid=rx-gx-4;
    lab(ctx,'deform\nfield',gx+gwid/2,py+ph/2-8,C.violet,8.5,'center');
    var gridN=5;
    for(var gi=0;gi<=gridN;gi++){
      var gfx=gi/gridN;
      ctx.strokeStyle=hexA(C.violet,0.25);ctx.lineWidth=0.8;ctx.beginPath();
      for(var gj=0;gj<=gridN;gj++){
        var gfy=gj/gridN;
        var bx2=gx+gfx*gwid+Math.sin((gfy+t*0.3)*Math.PI)*5*gfx;
        var by3=py+gfy*ph+Math.cos((gfx+t*0.2)*Math.PI)*4*gfy;
        if(gj===0)ctx.moveTo(bx2,by3);else ctx.lineTo(bx2,by3);
      }
      ctx.stroke();
    }
    arrow(ctx,lx+pw2*0.5+pw2*0.28,py+ph*0.5,rx-2,py+ph*0.5,hexA(C.violet,0.7),1.3);
    // right: intraop US + mask overlay
    rrect(ctx,rx,py,pw2,ph,8,hexA(C.amber,0.2),hexA(C.amber,0.04));
    lab(ctx,'intraop US',rx+4,py+4,C.amber,8.5);
    // US speckle pattern
    for(var i=0;i<40;i++){var sx=rx+15+Math.random()*pw2*0.85;var sy=py+10+Math.random()*ph*0.85;dot(ctx,sx,sy,0.8,hexA(C.mut,0.3));}
    // segmentation mask overlay
    var deformShift=Math.sin(t*1.4)*6;
    ctx.fillStyle=hexA(C.green,0.25);ctx.strokeStyle=hexA(C.green,0.8);ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(rx+pw2*0.5+deformShift,py+ph*0.5,pw2*0.28,ph*0.35,0,0,TAU);ctx.fill();ctx.stroke();
    lab(ctx,'mask (Dice 0.83)',rx+4,py+ph-12,C.green,8.5);
    lab(ctx,'SAM ViT-H frozen encoder + 10-shot adaptation; B-spline registration in 2.1 s on RTX 3090',14,h-12,C.mut,10);
  };

  /* F13 — mdf_pathology_wsi: gigapixel slide nested tiles, patch features aggregating, MIL pooling */
  A.mdf_pathology_wsi=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Pathology WSI: 1 gigapixel → 10k patches → MIL pooling → diagnosis',14,16,C.dim,10.5);
    // gigapixel slide (outer rect)
    var sx=w*0.04,sy=h*0.28,sw=w*0.36,sh=h*0.46;
    rrect(ctx,sx,sy,sw,sh,6,hexA(C.amber,0.4),hexA(C.amber,0.05));
    lab(ctx,'WSI 1 gigapixel\n40× magnification',sx+4,sy+4,C.amber,8.5);
    // nested tile levels — zooming in
    rrect(ctx,sx+sw*0.4,sy+sh*0.3,sw*0.45,sh*0.45,4,hexA(C.amber,0.4),hexA(C.amber,0.08));
    rrect(ctx,sx+sw*0.55,sy+sh*0.45,sw*0.25,sh*0.25,3,hexA(C.amber,0.5),hexA(C.amber,0.12));
    // 256×256 patch grid
    var pgx=sx+sw*0.55,pgy=sy+sh*0.45,pgw=sw*0.25,pgh=sh*0.25;
    var nc=3;var pc2=pgw/nc;
    for(var pi=0;pi<nc;pi++)for(var pj=0;pj<nc;pj++){
      var att=0.3+0.7*Math.sin(t*0.6+pi*1.4+pj*0.9)*Math.sin(t*0.6+pi*1.4+pj*0.9);
      rrect(ctx,pgx+pi*pc2+1,pgy+pj*pc2+1,pc2-2,pc2-2,2,null,hexA(C.coral,att*0.6));
    }
    lab(ctx,'256×256\npatches',pgx-2,pgy+pgh+10,C.coral,8,'center');
    // aggregation arrows
    var agg_x=w*0.47,agg_y=h*0.52;
    arrow(ctx,sx+sw,agg_y,agg_x-4,agg_y,hexA(C.mut,0.6),1.2);
    lab(ctx,'10k patch\nembeddings\n768-dim',agg_x-24,agg_y-28,C.dim,8.5);
    // MIL pooling block
    var mx=w*0.56,my=h*0.40;
    box(ctx,mx,my,w*0.16,h*0.24,'MIL\nattention\npooling',C.violet,hexA(C.violet,0.08));
    arrow(ctx,agg_x+48,agg_y,mx,my+h*0.12,hexA(C.mut,0.5),1.2);
    // topology annotation
    lab(ctx,'topo H0/H1\nBetti #s',agg_x-28,agg_y+30,C.green,8.5);
    // diagnosis output
    var outx=w*0.76,outy=h*0.44;
    arrow(ctx,mx+w*0.16,my+h*0.12,outx,outy,hexA(C.mut,0.5),1.2);
    rrect(ctx,outx,outy-18,w*0.18,36,6,C.green,hexA(C.green,0.08));
    lab(ctx,'LUAD vs LUSC\nAUC 0.94',outx+4,outy,C.green,9);
    lab(ctx,'attention-weighted MIL aggregates 768-dim CONCH embeddings; topological Betti features added',14,h-12,C.mut,10);
  };

  /* F14 — mdf_radiology_rl: CT scan grid, finding box, correct vs hallucinated, RL reward */
  A.mdf_radiology_rl=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Radiology VLM + RL: ground findings before stating; GRPO cuts hallucinations 18%→6%',14,16,C.dim,10.5);
    // CT slice grid (left)
    var gx=w*0.06,gy=h*0.28,gcols=3,grows=3,gcw=w*0.09,gch=h*0.14,gg=4;
    lab(ctx,'CT scan',gx,gy-12,C.mut,8.5);
    for(var gi=0;gi<gcols;gi++)for(var gj=0;gj<grows;gj++){
      rrect(ctx,gx+gi*(gcw+gg),gy+gj*(gch+gg),gcw,gch,3,hexA(C.mut,0.25),hexA(C.mut,0.06));
      // simulated CT content
      ctx.fillStyle=hexA(C.ink,0.12);ctx.beginPath();ctx.ellipse(gx+gi*(gcw+gg)+gcw/2,gy+gj*(gch+gg)+gch/2,gcw*0.3,gch*0.35,0,0,TAU);ctx.fill();
    }
    // finding bounding box (animating)
    var bx2=gx+(gcw+gg)*1,by2=gy+(gch+gg)*1;var bbox_p=saw(t,3);
    var bx3=bx2+Math.sin(bbox_p*TAU)*4,by3=by2+Math.cos(bbox_p*TAU)*2;
    rrect(ctx,bx3,by3,gcw*2+gg,gch,3,hexA(C.amber,0.8),null);
    lab(ctx,'finding box\nIoU>0.5 req',gx,gy+(gch+gg)*grows+8,C.amber,8.5);
    // VLM block
    var vx=w*0.44,vy=h*0.40;
    box(ctx,vx,vy,w*0.18,h*0.22,'LLaVA-Med\n7B\nGRPO RL',C.cyan,hexA(C.cyan,0.07));
    arrow(ctx,gx+gcols*(gcw+gg),gy+(gch+gg)*grows/2,vx,vy+h*0.11,hexA(C.mut,0.5),1.2);
    // correct output (green)
    var ox=w*0.68,oy=h*0.33;
    rrect(ctx,ox,oy,w*0.26,h*0.14,5,hexA(C.green,0.7),hexA(C.green,0.07));
    lab(ctx,'correct finding\n(grounded, IoU ok)',ox+4,oy+h*0.07,C.green,8.5);
    arrow(ctx,vx+w*0.18,vy+h*0.06,ox,oy+h*0.07,hexA(C.green,0.5),1.3);
    // hallucinated output (red)
    var hx=w*0.68,hy=h*0.55;
    rrect(ctx,hx,hy,w*0.26,h*0.14,5,hexA(C.coral,0.7),hexA(C.coral,0.07));
    lab(ctx,'hallucinated\n(no image evidence)',hx+4,hy+h*0.07,C.coral,8.5);
    arrow(ctx,vx+w*0.18,vy+h*0.16,hx,hy+h*0.07,hexA(C.coral,0.5),1.3);
    // RL reward signal
    var rp=saw(t,5);
    lab(ctx,'RL reward: +1 grounded\n        −1 hallucinated',ox,hy+h*0.16,C.violet,8.5);
    dot(ctx,ox-8,hy+h*0.165,3,C.violet);
    lab(ctx,'F1 0.71 vs 0.58 baseline; 27k training pairs; hallucination drops 3× after GRPO',14,h-12,C.mut,10);
  };

  /* F15 — mdf_med_diffusion: noise grid → denoising → anatomy; conditioning sketch; topology check */
  A.mdf_med_diffusion=function(ctx,w,h,t){
    ctx.fillStyle='#0C1218';ctx.fillRect(0,0,w,h);
    lab(ctx,'Medical diffusion: sketch → denoise 1000→50 DDIM steps → anatomically valid CT',14,16,C.dim,10.5);
    // conditioning sketch (left)
    var sx=w*0.05,sy=h*0.30,sw=w*0.16,sh=h*0.40;
    rrect(ctx,sx,sy,sw,sh,6,hexA(C.mut,0.3),hexA(C.mut,0.05));
    lab(ctx,'sketch\n(10 strokes)',sx+sw/2,sy+sh+12,C.mut,8.5,'center');
    // draw a few sketch strokes (rough liver outline)
    ctx.strokeStyle=hexA(C.ink,0.6);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(sx+sw*0.2,sy+sh*0.3);ctx.quadraticCurveTo(sx+sw*0.5,sy+sh*0.1,sx+sw*0.8,sy+sh*0.3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+sw*0.8,sy+sh*0.3);ctx.quadraticCurveTo(sx+sw*0.9,sy+sh*0.6,sx+sw*0.6,sy+sh*0.8);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+sw*0.6,sy+sh*0.8);ctx.quadraticCurveTo(sx+sw*0.3,sy+sh*0.9,sx+sw*0.2,sy+sh*0.6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+sw*0.2,sy+sh*0.6);ctx.quadraticCurveTo(sx+sw*0.1,sy+sh*0.45,sx+sw*0.2,sy+sh*0.3);ctx.stroke();
    arrow(ctx,sx+sw+2,sy+sh*0.5,w*0.25,sy+sh*0.5,hexA(C.mut,0.5),1.2);
    // denoising steps: 4 panels showing progression
    var steps=[0,0.25,0.60,1.0];var panW=w*0.13,panH=h*0.40;var panStart=w*0.25;
    steps.forEach(function(frac,i){
      var px=panStart+i*(panW+6),py=sy;
      rrect(ctx,px,py,panW,panH,5,hexA(C.mut,0.2),null);
      // fill with noise fading to anatomy
      var noise=1.0-frac;
      for(var ni=0;ni<panW*panH/8;ni++){
        var nx=px+Math.random()*panW,ny=py+Math.random()*panH;
        ctx.fillStyle=hexA(C.mut,noise*0.5);ctx.fillRect(nx,ny,1.5,1.5);
      }
      if(frac>0.1){
        // organ shape emerging
        ctx.fillStyle=hexA(C.cyan2,frac*0.4);ctx.strokeStyle=hexA(C.cyan2,frac*0.8);ctx.lineWidth=1.5;
        ctx.beginPath();ctx.ellipse(px+panW*0.5,py+panH*0.5,panW*0.35*frac,panH*0.38*frac,0,0,TAU);ctx.fill();ctx.stroke();
      }
      var stepLabel=i===0?'noise':i===3?'output':'step '+(Math.floor((1-frac)*50));
      lab(ctx,stepLabel,px+panW/2,py+panH+10,C.dim,8,'center');
      if(i<steps.length-1)arrow(ctx,px+panW+1,py+panH*0.5,px+panW+5,py+panH*0.5,hexA(C.mut,0.4),1);
    });
    // topology check (ring = connected component = 1)
    var tcx=w*0.84,tcy=h*0.48;
    ring(ctx,tcx,tcy,22,hexA(C.green,0.8));dot(ctx,tcx,tcy,4,C.green);
    lab(ctx,'topology:\n1 component\n(valid)',tcx-20,tcy+28,C.green,8.5);
    // DDIM step count
    lab(ctx,'50 DDIM\nsteps at\ninference',panStart+4*(panW+6)+4,sy+panH*0.3,C.amber,8.5);
    lab(ctx,'FID 18.4 vs 31.2 baseline; topology constraint forces exactly 1 connected organ component',14,h-12,C.mut,10);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.mdanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function fr(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(fr);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(fr);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-mdanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
