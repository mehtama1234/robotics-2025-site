/* ta-anim.js — first-principles mechanism animators for the Tactile & Force Sensing explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-taanim="name". Self-contained boot. */
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

  /* 01 — WHY: at the instant of contact, the camera is blocked and force is invisible. */
  A.ta_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The moment a hand touches an object, the eye can no longer see the contact',14,16,C.dim);
    // camera top-left
    const camx=w*0.14,camy=h*0.26;box(ctx,camx-24,camy-12,48,22,'camera',C.cyan);
    // object + fingertip covering it
    const ox=w*0.6,oy=h*0.6;ring(ctx,ox,oy,30,hexA(C.amber,0.9));lab(ctx,'object',ox,oy+2,C.amber,9,'center');
    // fingertip on top of contact region (occluding)
    const fx=ox-6,fy=oy-30;rrect(ctx,fx-14,fy-20,28,26,8,C.violet,hexA(C.violet,0.25));lab(ctx,'fingertip',fx+22,fy-8,C.violet,9);
    // blocked sight line
    ctx.strokeStyle=hexA(C.coral,0.6);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(camx,camy+10);ctx.lineTo(fx-12,fy-14);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'view blocked ✗',w*0.2,h*0.44,C.coral,9);
    // hidden force at contact
    const p=saw(t,2);arrow(ctx,fx,fy+8,fx,fy+8+14+Math.sin(t*3)*2,C.green,2);
    lab(ctx,'the force & tiny\nslips live here —\nonly touch feels them',ox+40,oy-6,C.green,8.5);
    lab(ctx,'touch senses exactly where and when vision goes blind — force, slip, texture, fine geometry',14,h-12,C.mut);
  };

  /* 02 — GEL SENSOR: a camera watching a soft skin deform gives a dense contact image. */
  A.ta_gel=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A vision-based tactile sensor: a camera films a soft gel skin as it deforms',14,16,C.dim);
    // cross-section: object presses into gel, camera below looks up
    const gx=w*0.30,gy=h*0.42,gw=190,gh=40;
    // gel slab
    rrect(ctx,gx,gy,gw,gh,6,hexA(C.cyan,0.8),hexA(C.cyan,0.12));lab(ctx,'soft gel skin',gx+4,gy-8,C.cyan,9);
    // object pressing in (bump)
    const press=6+Math.sin(t*1.5)*4;
    ctx.fillStyle=hexA(C.amber,0.85);ctx.beginPath();ctx.moveTo(gx+70,gy);ctx.quadraticCurveTo(gx+95,gy-30,gx+120,gy);ctx.closePath();ctx.fill();
    lab(ctx,'object',gx+80,gy-24,C.amber,9);
    // deformation dimple in gel top surface
    ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx,gy+2);ctx.lineTo(gx+70,gy+2);ctx.quadraticCurveTo(gx+95,gy+2+press,gx+120,gy+2);ctx.lineTo(gx+gw,gy+2);ctx.stroke();
    // camera below
    box(ctx,gx+gw/2-24,gy+gh+16,48,20,'camera',C.violet);
    arrow(ctx,gx+gw/2,gy+gh+16,gx+gw/2,gy+gh+2,C.violet,1.3);
    // output: contact image (force map) on right
    const mx=w*0.78,my=h*0.5;lab(ctx,'contact image',mx-30,my-40,C.green,9);
    for(let i=0;i<5;i++)for(let j=0;j<5;j++){const d=Math.hypot(i-2,j-2);const v=Math.max(0,1-d/2.4)*(0.5+0.5*Math.sin(t*1.5));
      ctx.fillStyle=hexA(C.green,0.15+v*0.7);ctx.fillRect(mx-30+i*12,my-28+j*12,10,10);}
    lab(ctx,'one squishy skin + one camera → a dense map of where and how hard it touched',14,h-12,C.mut);
  };

  /* 03 — SLIP: micro-shear signals warn the object is starting to slide — grip harder. */
  A.ta_slip=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Feel the object begin to slide before it falls, then tighten the grip',14,16,C.dim);
    const p=saw(t,4);const slipping=p>0.4&&p<0.7;
    // gripper holding object; object slips down a bit then grip tightens
    const ox=w*0.5,oy=h*0.5 + (slipping?(p-0.4)/0.3*22:(p>=0.7?0:0));
    rrect(ctx,ox-18,oy-26,36,52,4,hexA(C.amber,0.9),hexA(C.amber,0.15));
    const grip=slipping?20:14;
    ctx.strokeStyle=slipping?C.coral:C.green;ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(ox-18-6,oy-grip);ctx.lineTo(ox-18-6,oy+grip);ctx.moveTo(ox+18+6,oy-grip);ctx.lineTo(ox+18+6,oy+grip);ctx.stroke();
    // shear/vibration signal trace
    const sx=w*0.06,sy=h*0.30,sw=w*0.36;lab(ctx,'shear signal:',sx,sy-14,C.dim,9);
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.4;ctx.beginPath();
    for(let i=0;i<sw;i++){const near=(i/sw>0.4&&i/sw<0.7);const amp=near?9:1.5;ctx.lineTo(sx+i,sy+Math.sin(i*0.5+t*6)*amp);}
    ctx.stroke();
    lab(ctx,slipping?'▲ incipient slip detected → grip↑':'holding steady',w*0.55,sy,slipping?C.coral:C.green,9.5);
    lab(ctx,'a burst of micro-vibration/shear is the early warning — react in milliseconds, not after it drops',14,h-12,C.mut);
  };

  /* 04 — FUSION: eyes for the coarse reach, fingers for the fine seating. */
  A.ta_fusion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Vision gets you close; touch does the last millimetre',14,16,C.dim);
    const p=saw(t,5);
    // phase 1: vision guides gross approach (left), phase 2: touch seats (right)
    // vision panel
    const vx=w*0.06,vy=h*0.3,vw=w*0.38,vh=h*0.42;rrect(ctx,vx,vy,vw,vh,8,hexA(C.cyan,0.5),null);lab(ctx,'▸ vision: reach the hole',vx+4,vy-8,C.cyan,9.5);
    const px1=vx+20+p*(vw-60);dot(ctx,px1,vy+vh*0.5,7,C.amber);ring(ctx,vx+vw-24,vy+vh*0.5,10,hexA(C.cyan,0.8));
    lab(ctx,'coarse, fast, but\nblurs up close',vx+6,vy+vh-16,C.mut,8.5);
    // touch panel
    const tx=w*0.56,ty=vy,tw=w*0.38,th=vh;rrect(ctx,tx,ty,tw,th,8,hexA(C.green,0.5),null);lab(ctx,'▸ touch: seat it exactly',tx+4,ty-8,C.green,9.5);
    const jit=(1-p)*6;dot(ctx,tx+tw*0.5+Math.sin(t*8)*jit,ty+th*0.5,7,C.amber);ring(ctx,tx+tw*0.5,ty+th*0.5,10,hexA(C.green,0.9));
    lab(ctx,'nudges from contact\nforces close the gap',tx+6,ty+th-16,C.mut,8.5);
    lab(ctx,'the two senses are complementary — coarse-but-global sight, fine-but-local touch — so systems fuse them',14,h-12,C.mut);
  };

  /* 05 — FORCE CONTROL: command a target force, and comply to the surface, not a fixed position. */
  A.ta_force=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Wipe a curved surface: command a force into it, not a fixed height',14,16,C.dim);
    // wavy surface
    const sy=h*0.62;ctx.strokeStyle=hexA(C.mut,0.7);ctx.lineWidth=2;ctx.beginPath();
    for(let x=w*0.1;x<w*0.9;x++){ctx.lineTo(x,sy+Math.sin((x-w*0.1)*0.03)*20);}ctx.stroke();
    const p=saw(t,4);const ex=w*0.1+p*w*0.8;const surfY=sy+Math.sin((ex-w*0.1)*0.03)*20;
    // position-control ghost (fixed height) — either floats or crashes
    const fixedY=sy;ctx.globalAlpha=0.5;dot(ctx,ex,fixedY-14,6,C.coral);ctx.globalAlpha=1;
    ctx.strokeStyle=hexA(C.coral,0.4);ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(w*0.1,fixedY-14);ctx.lineTo(w*0.9,fixedY-14);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'fixed position → floats here, gouges there',w*0.12,sy-42,C.coral,8.5);
    // force-control tool: stays on surface with constant push
    dot(ctx,ex,surfY-8,7,C.green);arrow(ctx,ex,surfY-24,ex,surfY-10,C.green,2);
    lab(ctx,'target force',ex+8,surfY-22,C.green,8.5);
    lab(ctx,'controlling force lets the tool follow an unknown, uneven surface — the key to contact-rich tasks',14,h-12,C.mut);
  };

  /* ---- wave 2: per-family animators (taf_ prefix) ---- */

  /* taf_visgel — camera-in-gel: film skin deformation, output a dense contact map */
  A.taf_visgel=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Vision-based touch: camera films gel deformation → dense contact map',14,16,C.dim);
    var gx=w*0.10,gy=h*0.34,gw=w*0.52,gh=32;
    rrect(ctx,gx,gy,gw,gh,6,hexA(C.cyan,0.7),hexA(C.cyan,0.10));
    lab(ctx,'soft gel skin',gx+4,gy-9,C.cyan,9);
    var press=5+Math.sin(t*1.4)*4;
    ctx.fillStyle=hexA(C.amber,0.8);ctx.beginPath();ctx.moveTo(gx+gw*0.35,gy);ctx.quadraticCurveTo(gx+gw*0.5,gy-28,gx+gw*0.65,gy);ctx.closePath();ctx.fill();
    lab(ctx,'object',gx+gw*0.46,gy-20,C.amber,9);
    ctx.strokeStyle=C.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx,gy+3);ctx.lineTo(gx+gw*0.33,gy+3);ctx.quadraticCurveTo(gx+gw*0.5,gy+3+press,gx+gw*0.67,gy+3);ctx.lineTo(gx+gw,gy+3);ctx.stroke();
    box(ctx,gx+gw*0.5-22,gy+gh+14,44,18,'camera',C.violet,hexA(C.violet,0.12));
    arrow(ctx,gx+gw*0.5,gy+gh+14,gx+gw*0.5,gy+gh+2,C.violet,1.3);
    var mx=w*0.73,my=h*0.46;
    lab(ctx,'contact map',mx,my-32,C.green,9,'center');
    for(var i=0;i<5;i++)for(var j=0;j<5;j++){var d=Math.hypot(i-2,j-2);var v=Math.max(0,1-d/2.3)*(0.5+0.5*Math.sin(t*1.4));
      ctx.fillStyle=hexA(C.green,0.12+v*0.72);ctx.fillRect(mx-26+i*11,my-22+j*11,9,9);}
    arrow(ctx,gx+gw+4,gy+gh*0.5,mx-32,my-2,hexA(C.green,0.6),1.3);
    lab(ctx,'one gel + one camera → geometry, force, and slip all in one image',14,h-12,C.mut);
  };

  /* taf_softskin — elastic sleeve with embedded taxels; one taxel spikes on contact */
  A.taf_softskin=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Soft skin: elastic sleeve, embedded taxels report force anywhere on the surface',14,16,C.dim);
    var ax=w*0.38,ay=h*0.50,ar=44;
    ctx.fillStyle=hexA(C.dim,0.22);ctx.beginPath();ctx.arc(ax,ay,ar,0,TAU);ctx.fill();
    lab(ctx,'arm',ax,ay,C.mut,9,'center');
    ctx.strokeStyle=hexA(C.cyan,0.7);ctx.lineWidth=9;ctx.beginPath();ctx.arc(ax,ay,ar+9,0,TAU);ctx.stroke();
    lab(ctx,'elastic skin',ax,ay-ar-18,C.cyan,9,'center');
    var N=16;for(var i=0;i<N;i++){var a=i/N*TAU-Math.PI/2;var tx2=ax+Math.cos(a)*(ar+9);var ty2=ay+Math.sin(a)*(ar+9);
      var active=(i===Math.floor(saw(t,3)*N));dot(ctx,tx2,ty2,active?5:2.5,active?C.amber:hexA(C.green,0.6));}
    var fa=Math.PI*0.18;var fx=ax+Math.cos(fa)*(ar+30),fy=ay+Math.sin(fa)*(ar+30);
    arrow(ctx,fx,fy,ax+Math.cos(fa)*(ar+12),ay+Math.sin(fa)*(ar+12),C.amber,2);
    lab(ctx,'0.3 N\ntouch',fx+6,fy-6,C.amber,8.5);
    var bx=w*0.66,by=h*0.72;
    lab(ctx,'capacitance\nchange (fF)',bx,by-70,C.mut,8.5,'center');
    var vals=[2,3,12,4,2,1];vals.forEach(function(v,i){var hi=(i===2);ctx.fillStyle=hi?C.amber:hexA(C.green,0.6);ctx.fillRect(bx-13+i*9,by-v*4,7,v*4);});
    lab(ctx,'taxel index',bx,by+8,C.mut,8.5,'center');
    lab(ctx,'one taxel spikes 12 fF — neighbours identify contact location to ±25 mm',14,h-12,C.mut);
  };

  /* taf_forcetorque — motor current trace → LSTM → predicted grip force vs ground truth */
  A.taf_forcetorque=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Force estimation: motor current → LSTM → grip force within 0.2 N, no wrist sensor',14,16,C.dim);
    var tx=w*0.08,ty=h*0.38,tw=w*0.50,th=50;
    lab(ctx,'motor current (mA)',tx,ty-11,C.dim,9);
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.4;ctx.beginPath();
    for(var i=0;i<tw;i++){var frac=i/tw;var val=(frac<0.35?120:120+(frac-0.35)/0.65*220)+Math.sin(i*0.8+t*3)*4;ctx.lineTo(tx+i,ty+th*(1-val/360));}ctx.stroke();
    var cz=tw*0.35;ctx.strokeStyle=hexA(C.amber,0.5);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(tx+cz,ty-2);ctx.lineTo(tx+cz,ty+th+2);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'contact',tx+cz+3,ty-4,C.amber,8.5);
    var lx=w*0.65,ly=h*0.40;
    box(ctx,lx-32,ly-16,64,34,'LSTM\n50 ms window',C.violet,hexA(C.violet,0.10));
    arrow(ctx,tx+tw+4,ty+th*0.5,lx-32,ly,C.violet,1.4);
    var ox=lx,oy=h*0.70;
    dot(ctx,ox,oy-14,5,C.green);lab(ctx,'predicted  3.4 N',ox+8,oy-14,C.green,9);
    dot(ctx,ox,oy+4,5,C.amber);lab(ctx,'ground-truth  3.6 N',ox+8,oy+4,C.amber,9);
    lab(ctx,'error  0.2 N (5.6%)',ox,oy+22,hexA(C.green,0.8),9,'center');
    lab(ctx,'motor current carries grip force — no dedicated sensor, error under 6%',14,h-12,C.mut);
  };

  /* taf_slipgrip — shear burst flags incipient slip; controller tightens in <50 ms */
  A.taf_slipgrip=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Grip control: shear burst warns of slip — reflex tightens grip in 45 ms',14,16,C.dim);
    var p=saw(t,4);var slipping=(p>0.38&&p<0.65);
    var ox=w*0.50,oy=h*0.52+(slipping?(p-0.38)/0.27*16:0);
    rrect(ctx,ox-16,oy-28,32,56,5,hexA(C.amber,0.85),hexA(C.amber,0.12));
    lab(ctx,'jar',ox,oy,C.amber,8.5,'center');
    var gw2=slipping?5:3;
    ctx.strokeStyle=slipping?C.coral:C.green;ctx.lineWidth=gw2;
    ctx.beginPath();ctx.moveTo(ox-22,oy-20+gw2);ctx.lineTo(ox-22,oy+20-gw2);ctx.moveTo(ox+22,oy-20+gw2);ctx.lineTo(ox+22,oy+20-gw2);ctx.stroke();
    var sx=w*0.06,sy=h*0.26,sw2=w*0.38;
    lab(ctx,'shear:',sx,sy-12,C.dim,9);
    ctx.strokeStyle=C.cyan;ctx.lineWidth=1.3;ctx.beginPath();
    for(var i=0;i<sw2;i++){var frac=i/sw2;var burst=(frac>0.38&&frac<0.65);var amp=burst?9:1.2;ctx.lineTo(sx+i,sy+Math.sin(i*0.55+t*5)*amp);}ctx.stroke();
    lab(ctx,slipping?'slip detected — grip up':'holding steady',w*0.58,sy,slipping?C.coral:C.green,9.5);
    lab(ctx,'shear burst at t=15 ms → F_n raised to 3.0 N in 45 ms — jar never moved',14,h-12,C.mut);
  };

  /* taf_compliance — impedance control follows curved surface at constant force */
  A.taf_compliance=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Compliance: command a target force into the surface — position complies to any shape',14,16,C.dim);
    var p=saw(t,5);var ex=w*0.10+p*w*0.80;
    var sy=h*0.64;ctx.strokeStyle=hexA(C.mut,0.6);ctx.lineWidth=2;ctx.beginPath();
    for(var x=w*0.08;x<w*0.92;x++){ctx.lineTo(x,sy+Math.sin((x-w*0.08)*0.028)*22);}ctx.stroke();
    var surfY=sy+Math.sin((ex-w*0.08)*0.028)*22;
    ctx.globalAlpha=0.45;dot(ctx,ex,sy-12,5,C.coral);ctx.globalAlpha=1;
    ctx.strokeStyle=hexA(C.coral,0.35);ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(w*0.08,sy-12);ctx.lineTo(w*0.92,sy-12);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'fixed position → floats or crashes',w*0.12,sy-40,C.coral,8.5);
    dot(ctx,ex,surfY-8,7,C.green);
    arrow(ctx,ex,surfY-26,ex,surfY-10,C.green,2);
    lab(ctx,'F_n=5 N',ex+9,surfY-22,C.green,8.5);
    arrow(ctx,ex,sy-12,ex,surfY-8,hexA(C.cyan,0.7),1.2);
    lab(ctx,'K=800 N/m',ex+10,sy-5,hexA(C.cyan,0.8),8.5);
    lab(ctx,'impedance control: force stays within ±0.6 N of target over any surface shape',14,h-12,C.mut);
  };

  /* taf_vitafuse — vision gets near; touch closes the last mm under occlusion */
  A.taf_vitafuse=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Visuo-tactile fusion: vision approaches, touch finishes when camera is blocked',14,16,C.dim);
    var p=saw(t,5);
    var vx=w*0.04,vy=h*0.28,vw=w*0.38,vh=h*0.44;
    rrect(ctx,vx,vy,vw,vh,8,hexA(C.cyan,0.5),null);
    lab(ctx,'vision: coarse approach',vx+5,vy-9,C.cyan,9);
    var px1=vx+16+p*(vw-54);dot(ctx,px1,vy+vh*0.5,7,C.amber);
    ring(ctx,vx+vw-22,vy+vh*0.5,10,hexA(C.cyan,0.8));
    lab(ctx,'±1.8 mm at 50 mm',vx+5,vy+vh-14,C.mut,8.5);
    var tx3=w*0.58,ty3=vy,tpw=w*0.38,tph=vh;
    rrect(ctx,tx3,ty3,tpw,tph,8,hexA(C.green,0.5),null);
    lab(ctx,'touch: fine seating',tx3+5,ty3-9,C.green,9);
    var jit=(1-Math.min(p*2,1))*5;
    dot(ctx,tx3+tpw*0.5+Math.sin(t*7)*jit,ty3+tph*0.5,7,C.amber);
    ring(ctx,tx3+tpw*0.5,ty3+tph*0.5,10,hexA(C.green,0.9));
    lab(ctx,'±0.2 mm fused',tx3+5,ty3+tph-14,C.mut,8.5);
    arrow(ctx,vx+vw+4,vy+vh*0.5,tx3-4,ty3+tph*0.5,hexA(C.ink,0.5),1.4);
    lab(ctx,'20% vision-only',w*0.50,h*0.88,C.coral,9,'center');
    lab(ctx,'85% fused — VITaL result',w*0.50,h*0.78,C.green,9.5,'center');
    lab(ctx,'each sense covers exactly where the other fails',14,h-12,C.mut);
  };

  /* taf_tacrep — masked autoencoder compresses gel frames into a transferable latent code */
  A.taf_tacrep=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Representation learning: mask 75% of gel frame, reconstruct it, get a cross-sensor code',14,16,C.dim);
    var fx=w*0.06,fy=h*0.24,fw=96,fh=96;
    rrect(ctx,fx,fy,fw,fh,5,hexA(C.dim,0.5),hexA(C.dim,0.10));
    lab(ctx,'GelSight frame',fx+fw*0.5,fy-10,C.dim,9,'center');
    var seed=42+Math.floor(t);var sr=seed;
    for(var i=0;i<8;i++)for(var j=0;j<8;j++){sr=(sr*9301+49297)%233280;var r=sr/233280;
      ctx.fillStyle=(r>0.25)?hexA(C.cyan,0.5):'#0C1218';ctx.fillRect(fx+i*12,fy+j*12,11,11);}
    arrow(ctx,fx+fw+4,fy+fh*0.5,w*0.38,h*0.50,C.violet,1.4);
    box(ctx,w*0.38-30,h*0.44,60,24,'ViT\nEncoder',C.violet,hexA(C.violet,0.10));
    var lx2=w*0.52,ly2=h*0.50;
    for(var i=0;i<8;i++){var v=0.3+0.7*Math.abs(Math.sin(i*1.3+t*0.4));ctx.fillStyle=hexA(C.green,v);ctx.fillRect(lx2+i*7,ly2-10,5,20);}
    lab(ctx,'384-dim code',lx2+28,ly2-26,C.green,8.5,'center');
    arrow(ctx,lx2+60,ly2,w*0.72,h*0.44,C.cyan,1.4);
    rrect(ctx,w*0.72,h*0.38,80,24,5,hexA(C.cyan,0.6),hexA(C.cyan,0.10));
    lab(ctx,'reconstructed',w*0.72+40,h*0.42,C.cyan,8.5,'center');
    arrow(ctx,lx2+28,ly2+16,lx2+28,h*0.75,hexA(C.amber,0.8),1.4);
    lab(ctx,'fine-tune 20 labels',lx2+32,h*0.73,C.amber,8.5);
    lab(ctx,'78% success vs 60% scratch — 25× fewer labels',lx2+32,h*0.83,C.green,8.5);
    lab(ctx,'460 k frames self-supervised → code transfers across sensors with 25× fewer labels',14,h-12,C.mut);
  };

  /* taf_insert — contact-state machine detects jam; force-aware planner replans */
  A.taf_insert=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Insertion: contact-state machine detects jam at t=0.31 s before forces go dangerous',14,16,C.dim);
    var p=saw(t,5);var jammed=(p>0.30&&p<0.60);var replan=(p>=0.60);
    var hx=w*0.62,hy=h*0.30,hw=28,hh=80;
    rrect(ctx,hx,hy,hw,hh,3,hexA(C.mut,0.6),hexA(C.dim,0.10));
    lab(ctx,'hole\n0.05 mm\nclearance',hx+hw*0.5,hy-28,C.mut,8.5,'center');
    var pegY=h*0.24+p*h*0.45;
    rrect(ctx,hx+4,pegY,hw-8,44,2,jammed?C.coral:replan?C.green:C.cyan,jammed?hexA(C.coral,0.15):hexA(C.cyan,0.15));
    lab(ctx,'peg',hx+hw*0.5,pegY+22,jammed?C.coral:C.cyan,8.5,'center');
    var gx=w*0.08,gy=h*0.30,gw3=w*0.40,gh3=80;
    lab(ctx,'F_n (N)',gx,gy-11,C.dim,9);
    ctx.strokeStyle=jammed?C.coral:C.green;ctx.lineWidth=1.4;ctx.beginPath();
    for(var i=0;i<gw3;i++){var frac=i/gw3;var fval;if(frac<0.28){fval=frac*8;}else if(frac<0.60){fval=8+(frac-0.28)*60;}else{fval=8-(frac-0.60)*30;}fval=Math.max(0,fval);ctx.lineTo(gx+i,gy+gh3*(1-fval/30));}ctx.stroke();
    ctx.strokeStyle=hexA(C.amber,0.5);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(gx,gy+gh3*0.6);ctx.lineTo(gx+gw3,gy+gh3*0.6);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'jam limit',gx+gw3+3,gy+gh3*0.6,hexA(C.amber,0.8),8.5);
    lab(ctx,jammed?'JAM detected — back off + rotate 0.8°':replan?'replanned — 1.7 s, under 8 N':'approaching',hx-90,h*0.80,jammed?C.coral:replan?C.green:C.cyan,9);
    lab(ctx,'contact-state machine catches jam at 0.31 s — before the 12 N safe limit',14,h-12,C.mut);
  };

  /* taf_wholeskin — 48 taxels cover the arm; any contact → safety stop in 8 ms */
  A.taf_wholeskin=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Whole-body skin: 48 taxels detect any contact in 8 ms — arm stops before damage',14,16,C.dim);
    var ax=w*0.44,ay=h*0.50,aw=24,ah=120;
    rrect(ctx,ax-aw,ay-ah*0.5,aw*2,ah,10,hexA(C.dim,0.5),hexA(C.dim,0.18));
    lab(ctx,'arm',ax,ay,C.mut,9,'center');
    var taxCols=4,taxRows=8;
    for(var r=0;r<taxRows;r++){for(var c=0;c<taxCols;c++){var angle=(c/taxCols)*TAU;var ttx=ax+Math.cos(angle)*(aw+5);var tty=ay-ah*0.5+12+r*(ah-24)/taxRows;
      var active=(Math.floor(saw(t,4)*taxCols*taxRows)===(r*taxCols+c));dot(ctx,ttx,tty,active?5:2,active?C.amber:hexA(C.green,0.55));}}
    var hta=-0.4;var htx=ax+Math.cos(hta)*(aw+30),hty=ay-20;
    arrow(ctx,htx+8,hty-10,ax+Math.cos(hta)*(aw+8),hty,C.amber,2);
    lab(ctx,'human\n0.3 N',htx+10,hty-8,C.amber,8.5);
    var bx=w*0.70,by=h*0.45;
    lab(ctx,'reaction time',bx+30,by-10,C.dim,9,'center');
    var phase=saw(t,3);
    rrect(ctx,bx,by,60*phase,16,3,null,hexA(C.green,0.7));
    rrect(ctx,bx,by,60,16,3,hexA(C.green,0.4),null);
    lab(ctx,'8 ms',bx+30,by+8,C.green,8.5,'center');
    lab(ctx,'velocity to zero',bx+30,by+26,C.mut,8.5,'center');
    lab(ctx,'48 taxels, any body contact detected in 8 ms — meets ISO/TS 15066',14,h-12,C.mut);
  };

  /* taf_haptic — passivity filter clips reflected force for stable bilateral teleoperation */
  A.taf_haptic=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Haptic teleoperation: passivity filter clips reflected force — stable at 40 ms delay',14,16,C.dim);
    var ox=w*0.12,oy=h*0.50;
    box(ctx,ox-28,oy-14,56,28,'operator\nhand',C.cyan,hexA(C.cyan,0.10));
    var rx=w*0.82,ry=oy;
    box(ctx,rx-28,ry-14,56,28,'robot\nhand',C.violet,hexA(C.violet,0.10));
    arrow(ctx,ox+28,oy-6,rx-28,ry-6,hexA(C.cyan,0.7),1.4);
    lab(ctx,'motion cmd',w*0.50,oy-16,hexA(C.cyan,0.8),8.5,'center');
    arrow(ctx,rx-28,ry+6,ox+28,oy+6,hexA(C.amber,0.7),1.4);
    lab(ctx,'force reflection',w*0.50,oy+16,hexA(C.amber,0.8),8.5,'center');
    lab(ctx,'40 ms delay',w*0.50,oy+28,C.dim,8.5,'center');
    var fx2=w*0.50,fy2=h*0.70;
    box(ctx,fx2-40,fy2-14,80,28,'passivity\nfilter',C.green,hexA(C.green,0.10));
    arrow(ctx,fx2,fy2-14,fx2,ry+14,hexA(C.amber,0.5),1);
    var wave=Math.sin(t*2)*6;var raw=12+wave*1.2;var clipped=Math.min(raw,9.5);
    lab(ctx,'raw: '+raw.toFixed(1)+' N',fx2+44,fy2-8,C.coral,8.5);
    lab(ctx,'clipped: '+clipped.toFixed(1)+' N',fx2+44,fy2+8,C.green,8.5);
    lab(ctx,'passivity clips the reflected force — no chatter under 40 ms delay',14,h-12,C.mut);
  };

  /* taf_tacsim — wearable force capture bridges the tactile sim-to-real gap */
  A.taf_tacsim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Sim-to-real: capture real force from a human hand, train a policy on it',14,16,C.dim);
    var dx=w*0.18,dy=h*0.46;
    box(ctx,dx-30,dy-14,60,28,'human\ndemo',C.amber,hexA(C.amber,0.10));
    var ftx=w*0.06,fty=h*0.26,ftw=w*0.30,fth=50;
    lab(ctx,'force trace (N)',ftx,fty-10,C.dim,9);
    ctx.strokeStyle=C.amber;ctx.lineWidth=1.4;ctx.beginPath();
    for(var i=0;i<ftw;i++){var frac=i/ftw;var val=2+Math.sin(frac*Math.PI*3+t*2)*4+frac*6;ctx.lineTo(ftx+i,fty+fth*(1-val/14));}ctx.stroke();
    arrow(ctx,dx+30,dy,w*0.46,dy,hexA(C.amber,0.7),1.4);
    lab(ctx,'14 demos',w*0.37,dy-9,C.dim,8.5,'center');
    box(ctx,w*0.46-32,dy-14,64,28,'imitation\npolicy',C.violet,hexA(C.violet,0.10));
    arrow(ctx,w*0.46+32,dy,w*0.72,dy,hexA(C.violet,0.7),1.4);
    var rx2=w*0.74,ry2=h*0.38;
    lab(ctx,'vision-only:',rx2,ry2,C.coral,9);lab(ctx,'baseline',rx2+70,ry2,C.coral,9);
    lab(ctx,'force-imitation:',rx2,ry2+18,C.green,9);lab(ctx,'54.5% higher',rx2+70,ry2+18,C.green,9);
    var sw=w*0.70,swh=h*0.65;
    lab(ctx,'stage weights:',sw-50,swh-10,C.dim,9);
    var stages=[['peel-start','touch 0.7','vision 0.3'],['lift-off','touch 0.2','vision 0.8']];
    stages.forEach(function(s,i){lab(ctx,s[0],sw-50+i*120,swh+6,C.mut,8.5);lab(ctx,s[1],sw-50+i*120,swh+20,C.cyan,8.5);lab(ctx,s[2],sw-50+i*120,swh+34,C.amber,8.5);});
    lab(ctx,'real force capture bridges the tactile sim-to-real gap — 54.5% over vision-only',14,h-12,C.mut);
  };

  /* taf_stiffness — press at known force, measure deformation depth, fit Hertz → E */
  A.taf_stiffness=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Stiffness sensing: press → measure deformation → Hertz fit → E (invisible to cameras)',14,16,C.dim);
    var ox=w*0.32,oy=h*0.56,oow=w*0.40,ooh=44;
    rrect(ctx,ox,oy,oow*0.5,ooh,5,hexA(C.green,0.6),hexA(C.green,0.12));
    rrect(ctx,ox+oow*0.5,oy,oow*0.5,ooh,5,hexA(C.amber,0.6),hexA(C.amber,0.12));
    lab(ctx,'soft\n50 kPa',ox+oow*0.25,oy+ooh*0.5,C.green,8,'center');
    lab(ctx,'stiff\n200 kPa',ox+oow*0.75,oy+ooh*0.5,C.amber,8,'center');
    var probeX=ox+oow*0.25+saw(t,4)*oow*0.5;var onStiff=(probeX>ox+oow*0.5);
    var def=onStiff?3:8;
    arrow(ctx,probeX,oy-30,probeX,oy-def,onStiff?C.amber:C.green,2.5);
    lab(ctx,'F=0.5 N\nd='+def+' mm',probeX+6,oy-36,onStiff?C.amber:C.green,8);
    lab(ctx,'E* '+(onStiff?'198':'52')+' kPa',probeX+6,oy-18,onStiff?C.amber:C.green,9.5);
    var mx2=w*0.82,my2=h*0.42;
    lab(ctx,'stiffness\nmap',mx2,my2-22,C.dim,8.5,'center');
    for(var i=0;i<4;i++)for(var j=0;j<4;j++){var hard=(i>=2);ctx.fillStyle=hard?hexA(C.amber,0.7):hexA(C.green,0.7);ctx.fillRect(mx2-22+i*12,my2-10+j*12,10,10);}
    lab(ctx,'28 probe sites → 90% accuracy; active exploration beats random by 3×',14,h-12,C.mut);
  };

  /* taf_contactmode — diffusion samples mode hypotheses; MPC plans over stick/slide */
  A.taf_contactmode=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Contact modes: identify stick vs slide, plan across mode switches',14,16,C.dim);
    var bx2=w*0.38+saw(t,5)*w*0.18,by2=h*0.50,bw2=90,bh2=34;
    rrect(ctx,bx2,by2,bw2,bh2,4,hexA(C.amber,0.8),hexA(C.amber,0.12));
    lab(ctx,'book 0.3 kg',bx2+bw2*0.5,by2+bh2*0.5,C.amber,8.5,'center');
    var cx2=bx2+bw2*0.5,cy2=by2+bh2;
    var mu2=0.28;var coneH2=32;
    ctx.strokeStyle=hexA(C.violet,0.55);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx2,cy2);ctx.lineTo(cx2-coneH2*mu2,cy2+coneH2);ctx.moveTo(cx2,cy2);ctx.lineTo(cx2+coneH2*mu2,cy2+coneH2);ctx.stroke();
    lab(ctx,'μ=0.28\nfriction cone',cx2+30,cy2+14,C.violet,8.5);
    var forceX=14;
    arrow(ctx,cx2,cy2,cx2+forceX,cy2-8,C.cyan,2);
    lab(ctx,'push',cx2+20,cy2-10,C.cyan,8.5);
    var inCone=(Math.abs(forceX)<mu2*5*10);
    lab(ctx,inCone?'mode: STICK':'mode: SLIDE',cx2,by2-16,inCone?C.green:C.coral,9,'center');
    var ds=w*0.06,dy4=h*0.26;
    lab(ctx,'CDM: 50 hypotheses → contact centroid ±8 mm',ds,dy4,C.dim,8.5);
    for(var i=0;i<10;i++){var x4=ds+i*14+Math.sin(t*2+i)*3;dot(ctx,x4,dy4+16,2.5,hexA(C.violet,0.5+i*0.04));}
    dot(ctx,ds+62,dy4+16,4.5,C.cyan);
    lab(ctx,'MPC plans stick→slide→stick in 0.15 s, 4 mm final position error',14,h-12,C.mut);
  };

  /* taf_touchvision — infer haptics from 3DGS scene; floor pressure decodes body motion */
  A.taf_touchvision=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Touch from vision: infer haptics and body motion from visual or pressure data',14,16,C.dim);
    var sx2=w*0.10,sy2=h*0.32,sr2=28;
    for(var i=0;i<7;i++){var a=i*0.9+t*0.2;
      rrect(ctx,sx2+Math.cos(a)*sr2-8,sy2+Math.sin(a)*sr2-5,16,10,3,hexA(i%2?C.cyan:C.violet,0.6),hexA(i%2?C.cyan:C.violet,0.15));}
    lab(ctx,'3DGS\nscene',sx2,sy2+sr2+14,C.dim,8.5,'center');
    arrow(ctx,sx2+72,sy2-16,sx2+Math.cos(-0.5)*sr2+10,sy2+Math.sin(-0.5)*sr2-4,C.amber,1.5);
    lab(ctx,'contact',sx2+74,sy2-18,C.amber,8.5);
    box(ctx,sx2+82,sy2-6,72,24,'Haptic\nNeural Field',C.green,hexA(C.green,0.10));
    lab(ctx,'180 Hz, 0.12 g\n5% freq error',sx2+118,sy2+26,C.green,8.5,'center');
    var px2=w*0.52,py2=h*0.38;
    lab(ctx,'floor pressure (16 sensors)',px2+44,py2-10,C.dim,8.5,'center');
    for(var i=0;i<8;i++){var v=0.3+0.7*Math.abs(Math.sin(i*1.4+t*1.5));ctx.fillStyle=hexA(C.cyan,v);ctx.fillRect(px2+i*11,py2,9,16);}
    arrow(ctx,px2+44,py2+16,px2+44,py2+40,hexA(C.cyan,0.7),1.4);
    box(ctx,px2+4,py2+40,80,22,'GNN decoder',C.violet,hexA(C.violet,0.10));
    lab(ctx,'4.3° joint error',px2+44,py2+72,C.green,8.5,'center');
    lab(ctx,'AT-VLA gate: 0.04 s closed loop (8× faster); ForceVLA2: 18 N → 6 N peak',w*0.52,h*0.82,C.amber,8.5,'center');
    lab(ctx,'infer touch from vision: haptic fields, pressure-to-motion, force-aware VLA policies',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.taanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-taanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
