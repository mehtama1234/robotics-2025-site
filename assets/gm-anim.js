/* gm-anim.js — first-principles mechanism animators for the Generative Models explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-gmanim="name". Self-contained boot. */
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

  /* 01 — WHY: learn the data distribution so you can SAMPLE new examples, not just label. */
  A.gm_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A discriminative model labels what is; a generative model learns to make more',14,16,C.dim);
    // left: discriminative (points -> boundary/label); right: generative (learn cloud -> sample new)
    const lx=w*0.24,ly=h*0.54;lab(ctx,'discriminative: draw the boundary',w*0.03,h*0.3,C.cyan,9);
    for(let i=0;i<18;i++){const a=i*1.1;dot(ctx,lx+Math.cos(a)*30-24,ly+Math.sin(a)*22,2.5,i%2?C.cyan:C.amber);}
    ctx.strokeStyle=hexA(C.mut,0.7);ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(lx-4,ly-40);ctx.lineTo(lx-40,ly+40);ctx.stroke();ctx.setLineDash([]);
    // right: generative
    const rx=w*0.72,ry=h*0.54;lab(ctx,'generative: learn the cloud, sample new',w*0.5,h*0.3,C.violet,9);
    for(let i=0;i<24;i++){const a=i*2.4,r=8+((i*11)%34);dot(ctx,rx+Math.cos(a)*r*0.9-30,ry+Math.sin(a)*r*0.6,2.2,hexA(C.violet,0.6));}
    const p=saw(t,2);const nx=rx+Math.cos(p*TAU)*24-30,ny=ry+Math.sin(p*TAU)*16;dot(ctx,nx,ny,5,C.green);lab(ctx,'new sample',nx+6,ny-8,C.green,8.5);
    lab(ctx,'model the whole distribution p(data) and you can draw fresh, plausible examples from it',14,h-12,C.mut);
  };

  /* 02 — DIFFUSION: add noise, then learn to reverse it — sample by denoising. */
  A.gm_diffusion=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Diffusion: destroy data with noise, then learn to walk the noise back',14,16,C.dim);
    const y=h*0.5,n=6,gap=(w*0.86)/n;
    // forward (noise) top row conceptually; here show a single denoising sweep left(noise)->right(clean)
    const p=saw(t,4);
    for(let k=0;k<=n;k++){const cx=w*0.07+k*gap;const noise=1-(k/n);
      // patch: clean = a shape, noisy = scattered dots
      const nn=Math.floor(4+noise*40);
      for(let i=0;i<nn;i++){const a=Math.random?0:0;const ox=(((k*7+i*13)%11)-5)/5*22*noise, oy=(((k*5+i*17)%11)-5)/5*22*noise;
        dot(ctx,cx+ox,y+oy,1.8,hexA(noise>0.5?C.mut:C.green,0.7));}
      if(k===n)ring(ctx,cx,y,9,C.green);}
    // arrow of denoising
    arrow(ctx,w*0.07,y+40,w*0.93,y+40,C.violet,1.4);lab(ctx,'reverse: denoise step by step → a sample',w*0.3,y+54,C.violet,9);
    lab(ctx,'noise →',w*0.05,y-40,C.mut,9);lab(ctx,'→ data',w*0.86,y-40,C.green,9);
    lab(ctx,'training is easy (predict the noise); sampling starts from pure noise and cleans it up',14,h-12,C.mut);
  };

  /* 03 — LATENT: generate in a small compressed space, then decode. */
  A.gm_latent=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Generate in a small compressed space, then decode to full resolution',14,16,C.dim);
    // big image -> encoder -> small latent grid -> generate there -> decoder -> big image
    box(ctx,w*0.04,h*0.4,w*0.12,30,'encoder',C.cyan,hexA(C.cyan,0.08));
    // latent grid (small)
    const gx=w*0.24,gy=h*0.4,cell=9;lab(ctx,'latent (tiny)',gx,gy-10,C.violet,9);
    for(let i=0;i<5;i++)for(let j=0;j<3;j++){const v=0.3+0.5*Math.sin(t*1.5+i+j);ctx.fillStyle=hexA(C.violet,0.2+v*0.6);ctx.fillRect(gx+i*cell,gy+j*cell,cell-1,cell-1);}
    box(ctx,w*0.44,h*0.4,w*0.14,30,'diffusion\nhere',C.violet,hexA(C.violet,0.08));
    box(ctx,w*0.64,h*0.4,w*0.12,30,'decoder',C.green,hexA(C.green,0.08));
    // output image
    rrect(ctx,w*0.8,h*0.36,w*0.14,42,4,C.green,hexA(C.green,0.06));lab(ctx,'image',w*0.87,h*0.57,C.green,8.5,'center');
    arrow(ctx,w*0.16,h*0.55,gx-2,h*0.55,C.cyan,1.2);arrow(ctx,w*0.36,h*0.55,w*0.44,h*0.55,C.violet,1.2);
    arrow(ctx,w*0.58,h*0.55,w*0.64,h*0.55,C.violet,1.2);arrow(ctx,w*0.76,h*0.55,w*0.8,h*0.55,C.green,1.2);
    lab(ctx,'a small latent is far cheaper to generate in — the trick that made high-res diffusion practical',14,h-12,C.mut);
  };

  /* 04 — CONDITION: steer generation with a prompt. */
  A.gm_condition=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Steer what gets made by conditioning on a prompt',14,16,C.dim);
    // prompt box -> pushes the sample toward matching region
    rrect(ctx,w*0.06,h*0.3,w*0.3,22,5,C.amber,hexA(C.amber,0.08));lab(ctx,'"a red mug on a table"',w*0.21,h*0.3+11,C.amber,9,'center');
    box(ctx,w*0.42,h*0.42,w*0.16,30,'generator',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.21,h*0.3+22,w*0.5,h*0.42,C.amber,1.3);
    // unconditioned: many random outputs (faint); conditioned: one matching (bright)
    const outs=[[-0.6,-0.5],[0.4,-0.6],[-0.3,0.6],[0.6,0.5],[0,0]];const cx=w*0.8,cy=h*0.5;
    outs.forEach((o,i)=>{const x=cx+o[0]*46,y=cy+o[1]*40;const on=(i===4);
      rrect(ctx,x-10,y-8,20,16,3,on?C.green:hexA(C.mut,0.4),on?hexA(C.green,0.12):null);});
    lab(ctx,'without prompt:\nanything plausible',cx-30,cy-52,C.mut,8);
    lab(ctx,'with prompt →\nthe matching one',cx+16,cy+2,C.green,8);
    arrow(ctx,w*0.58,h*0.5,cx-14,cy,C.violet,1.3);
    lab(ctx,'the same generator, aimed: text, an image, a sketch, or a class all narrow what it samples',14,h-12,C.mut);
  };

  /* 05 — FOR ROBOTS: generate the action / the future, not just a picture. */
  A.gm_forrobots=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'For robots, the thing generated is the move — or the future itself',14,16,C.dim);
    // three uses side by side: action, world-model rollout, data augmentation
    const cols=[[w*0.06,'generate the action','diffusion policy'],[w*0.38,'imagine the future','world model'],[w*0.7,'make more data','augmentation']];
    cols.forEach((c,k)=>{const x=c[0];box(ctx,x,h*0.34,w*0.26,26,c[1],C.violet,hexA(C.violet,0.06));lab(ctx,c[2],x,h*0.30,C.mut,8.5);});
    const p=saw(t,3);
    // action: a trajectory being denoised into shape under col1
    ctx.strokeStyle=C.green;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<w*0.24;i++){const x=w*0.07+i;ctx.lineTo(x,h*0.66+Math.sin(i*0.05+t)*8*(1-p));}ctx.stroke();
    // future: predicted frames under col2
    for(let i=0;i<4;i++){rrect(ctx,w*0.39+i*w*0.06,h*0.6,w*0.05,26,2,hexA(C.cyan,0.3+i*0.15),null);}
    // data: sample dots under col3
    for(let i=0;i<10;i++){dot(ctx,w*0.71+(i%5)*w*0.05,h*0.62+Math.floor(i/5)*14,2.5,hexA(C.amber,0.7));}
    lab(ctx,'the generative toolbox — sampling a whole distribution, committing to one — reused for control',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.gmanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-gmanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
