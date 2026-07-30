/* ov-anim.js — first-principles mechanism animators for the Open-Vocabulary Perception explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-ovanim="name". Self-contained boot. */
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

  /* 01 — WHY: a fixed label list can't name the thing it was never trained on. */
  A.ov_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A fixed list of labels breaks the moment the world shows it something new',14,16,C.dim);
    // closed-set classifier: fixed labels on left
    const lx=w*0.06,ly=h*0.32;lab(ctx,'trained labels:',lx,ly-10,C.mut,9);
    ['cup','chair','person','dog'].forEach((s,i)=>{rrect(ctx,lx,ly+i*24,72,18,4,hexA(C.cyan,0.6),null);lab(ctx,s,lx+8,ly+i*24+9,C.cyan,9);});
    // a novel object appears
    const ox=w*0.56,oy=h*0.5;rrect(ctx,ox-20,oy-16,40,40,8,C.amber,hexA(C.amber,0.2));lab(ctx,'?',ox,oy+2,C.amber,16,'center');
    lab(ctx,'a thing never in the list',ox-40,oy+40,C.amber,9);
    // classifier forced to pick wrong / unknown
    const p=saw(t,3);const guess=['cup?','chair?','dog?','??'][Math.floor(p*4)];
    arrow(ctx,ox+24,oy,w*0.78,oy,C.coral,1.4);box(ctx,w*0.78,oy-12,w*0.16,24,'must guess: '+guess,C.coral);
    lab(ctx,'the open world has endless categories — you cannot enumerate every object in advance',14,h-12,C.mut);
  };

  /* 02 — CLIP: map images and words into ONE space; name a thing by its nearest words. */
  A.ov_clip=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Put images and text in one shared space, then name by nearest neighbour',14,16,C.dim);
    // image encoder + text encoder -> shared space
    box(ctx,w*0.05,h*0.30,w*0.17,26,'image\nencoder',C.cyan,hexA(C.cyan,0.08));
    box(ctx,w*0.05,h*0.62,w*0.17,26,'text\nencoder',C.violet,hexA(C.violet,0.08));
    // shared embedding circle
    const cx=w*0.6,cy=h*0.52,r=70;ring(ctx,cx,cy,r,hexA(C.mut,0.4));lab(ctx,'shared embedding space',cx,cy-r-8,C.mut,9,'center');
    arrow(ctx,w*0.22,h*0.30+13,cx-r*0.7,cy-30,C.cyan,1.3);
    arrow(ctx,w*0.22,h*0.62+13,cx-r*0.7,cy+30,C.violet,1.3);
    // words placed in space
    const words=[['"a mug"',-0.3,-0.5,C.violet],['"a laptop"',0.6,-0.2,C.violet],['"a plant"',0.1,0.6,C.violet]];
    words.forEach(wd=>{const x=cx+wd[1]*r,y=cy+wd[2]*r;dot(ctx,x,y,3,C.violet);lab(ctx,wd[0],x+5,y,C.violet,8);});
    // an image embedding drifting to nearest word ("a mug")
    const p=saw(t,4);const ix=cx+(-0.3)*r*Math.min(1,p*1.3)+(1-Math.min(1,p*1.3))*0.5*r,iy=cy+(-0.5)*r*Math.min(1,p*1.3);
    dot(ctx,ix,iy,5,C.amber);lab(ctx,'image',ix+6,iy+10,C.amber,8);
    lab(ctx,'trained so a picture lands near the words that describe it — recognition becomes a text lookup',14,h-12,C.mut);
  };

  /* 03 — DETECT: score every region against ANY text prompt you type. */
  A.ov_detect=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Open-vocabulary detection: box anything you can describe in words',14,16,C.dim);
    // scene with a few objects
    const sx=w*0.06,sy=h*0.28,sw=w*0.5,sh=h*0.5;rrect(ctx,sx,sy,sw,sh,6,C.line,hexA(C.cyan,0.03));
    const objs=[[sx+40,sy+40,'mug',C.amber],[sx+150,sy+90,'laptop',C.green],[sx+70,sy+120,'plant',C.violet]];
    // prompt typed on the right cycles; matching box lights up
    const prompts=['mug','laptop','plant'];const p=saw(t,3);const which=Math.floor(p*3);
    rrect(ctx,w*0.62,sy,w*0.3,22,5,C.cyan,hexA(C.cyan,0.08));lab(ctx,'prompt: "'+prompts[which]+'"',w*0.63,sy+11,C.cyan,9);
    objs.forEach((o,i)=>{const on=(i===which);const bw=54,bh=40;
      ctx.strokeStyle=on?C.coral:hexA(C.mut,0.4);ctx.lineWidth=on?2:1;ctx.strokeRect(o[0]-bw/2,o[1]-bh/2,bw,bh);
      dot(ctx,o[0],o[1],4,o[3]);if(on){lab(ctx,o[2]+' ✓',o[0]-bw/2,o[1]-bh/2-8,C.coral,9);}
      // score bar
      const sc=on?0.9:0.15+0.1*Math.sin(t+i);ctx.fillStyle=hexA(on?C.coral:C.mut,0.7);ctx.fillRect(w*0.62,sy+34+i*20,sc*w*0.28,10);lab(ctx,o[2],w*0.62,sy+30+i*20,C.mut,8);});
    lab(ctx,'region proposals scored against free-text prompts — no fixed class list, add words at test time',14,h-12,C.mut);
  };

  /* 04 — GROUND: "the red mug behind the laptop" -> the exact one, via attributes + relations. */
  A.ov_ground=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Grounding: point to the ONE the words mean, not just the class',14,16,C.dim);
    lab(ctx,'"the red mug behind the laptop"',w*0.5,38,C.amber,11,'center');
    // three mugs, one red and behind a laptop
    const mugs=[[w*0.24,h*0.62,C.cyan,'blue mug'],[w*0.5,h*0.5,C.coral,'red mug'],[w*0.74,h*0.66,C.green,'green mug']];
    // laptop near the red mug
    rrect(ctx,w*0.5-6,h*0.5+22,44,10,2,hexA(C.mut,0.6),hexA(C.mut,0.3));lab(ctx,'laptop',w*0.5+16,h*0.5+40,C.mut,8);
    const p=saw(t,4);const sel=1; // resolves to red mug
    mugs.forEach((m,i)=>{const on=(i===sel && p>0.4);dot(ctx,m[0],m[1],on?11:8,m[2]);
      if(on){ring(ctx,m[0],m[1],16,C.amber);}lab(ctx,m[3],m[0]-18,m[1]+22,hexA(m[2],0.9),8);});
    if(p>0.4)lab(ctx,'← this one',mugs[sel][0]+22,mugs[sel][1],C.amber,9);
    // reasoning chips
    lab(ctx,'filter: color=red  ·  relation=behind(laptop)',w*0.5,h-30,C.mut,8.5,'center');
    lab(ctx,'attributes + spatial relations pick the exact referent among look-alikes',14,h-12,C.mut);
  };

  /* 05 — 3D FIELD: lift language-aligned features into a 3D map you can query by words. */
  A.ov_3d=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Bake language features into a 3D map, then ask it "where is the sink?"',14,16,C.dim);
    // 2D views -> lifted into a 3D point field
    box(ctx,w*0.05,h*0.3,w*0.14,24,'2D views\n+ CLIP',C.cyan,hexA(C.cyan,0.08));
    arrow(ctx,w*0.19,h*0.42,w*0.28,h*0.42,C.cyan,1.4);lab(ctx,'lift to 3D',w*0.20,h*0.34,C.mut,8);
    // 3D field of colored points (feature-colored)
    const cx=w*0.5,cy=h*0.52;
    for(let i=0;i<70;i++){const a=(i*2.4),r=40+((i*13)%50);const x=cx+Math.cos(a)*r*0.9,y=cy+Math.sin(a)*r*0.5;
      const near=(Math.cos(a)>0.3&&r>60);dot(ctx,x,y,near?3.5:2,near?C.green:hexA(C.violet,0.5));}
    lab(ctx,'3D feature field',cx-30,cy-46,C.mut,9);
    // query
    const p=saw(t,3);rrect(ctx,w*0.72,h*0.3,w*0.22,22,5,C.amber,hexA(C.amber,0.08));lab(ctx,'query: "the sink"',w*0.73,h*0.3+11,C.amber,9);
    if(p>0.4){const qx=cx+55,qy=cy-6;ring(ctx,qx,qy,18,C.green);arrow(ctx,w*0.83,h*0.3+22,qx+6,qy-14,C.green,1.3);lab(ctx,'found in space',qx+10,qy+22,C.green,8.5);}
    lab(ctx,'every 3D point carries a language-aligned feature — so a robot can locate things by name, in space',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.ovanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-ovanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
