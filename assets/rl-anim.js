/* rl-anim.js — first-principles mechanism animators for the RL & Imitation explainer.
   A[name]=fn(ctx,w,h,t); canvases carry data-rlanim="name". Self-contained boot. */
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

  /* 01 — WHY: you can't hand-write every behavior; define a reward, let the robot discover the policy. */
  A.rl_why=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'You can\'t script every situation — so define what "good" means and let it discover how',14,16,C.dim);
    // left: hand-coded rules pile (brittle); right: reward + discovered policy
    const lx=w*0.06;lab(ctx,'hand-coded rules',lx,h*0.3,C.coral,10);
    ['if obstacle: turn','if slope: slow','if ... : ...','if ??? : ✗'].forEach((s,i)=>{rrect(ctx,lx,h*0.34+i*22,w*0.32,18,4,hexA(C.coral,0.5),null);lab(ctx,s,lx+8,h*0.34+i*22+9,i===3?C.coral:C.mut,9);});
    lab(ctx,'endless cases → brittle',lx,h*0.34+4*22+12,C.coral,9);
    // right: reward -> policy discovers
    const rx=w*0.56;box(ctx,rx,h*0.34,w*0.14,26,'reward:\n"go fast,\nstay safe"',C.green,hexA(C.green,0.08));
    arrow(ctx,rx+w*0.14,h*0.5,rx+w*0.2,h*0.5,C.green,1.4);
    box(ctx,rx+w*0.22,h*0.4,w*0.16,30,'discovered\npolicy',C.violet,hexA(C.violet,0.08));
    lab(ctx,'one goal → behavior found by trial and error',rx-6,h*0.78,C.mut,9);
    lab(ctx,'reinforcement learning trades writing the how for specifying the what — the reward',14,h-12,C.mut);
  };

  /* 02 — THE LOOP: state -> action -> reward -> repeat; maximize return. */
  A.rl_loop=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The loop: see the state, act, get a reward, and learn to earn more of it',14,16,C.dim);
    const cx=w*0.5,cy=h*0.54,R=Math.min(w*0.3,h*0.34);
    box(ctx,cx-R-w*0.09,cy-14,w*0.16,28,'agent\n(policy)',C.violet,hexA(C.violet,0.08));
    box(ctx,cx+R-w*0.07,cy-14,w*0.16,28,'environment',C.cyan,hexA(C.cyan,0.08));
    const p=saw(t,3);
    // action arrow top
    arrow(ctx,cx-R+w*0.09,cy-8,cx+R-w*0.07,cy-8,hexA(C.amber,0.8),1.6);lab(ctx,'action',cx-30,cy-24,C.amber,9);
    // state+reward arrow bottom
    arrow(ctx,cx+R-w*0.07,cy+8,cx-R+w*0.09,cy+8,hexA(C.green,0.8),1.6);lab(ctx,'new state + reward',cx-56,cy+26,C.green,9);
    // pulse moving around
    const px=(p<0.5)?(cx-R+w*0.09+(p/0.5)*(2*R-w*0.16)):(cx+R-w*0.07-((p-0.5)/0.5)*(2*R-w*0.16));
    dot(ctx,px,cy-8+(p<0.5?0:16),4,p<0.5?C.amber:C.green);
    lab(ctx,'maximize total future reward (return), not just the next step',14,h-12,C.mut);
  };

  /* 03 — EXPLORE vs EXPLOIT: try new things to find better, or cash in what works. */
  A.rl_explore=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'The dilemma: exploit the reward you know, or explore for a bigger one',14,16,C.dim);
    // a reward landscape (1D) with a small local peak (known) and a taller far peak (unknown)
    const gx=w*0.08,gw=w*0.84,base=h*0.72;
    ctx.strokeStyle=hexA(C.mut,0.7);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=gw;i++){const x=gx+i,fx=i/gw;const y=base-(Math.exp(-((fx-0.25)**2)/0.006)*40 + Math.exp(-((fx-0.75)**2)/0.01)*80);ctx.lineTo(x,y);}
    ctx.stroke();
    lab(ctx,'known small reward',gx+gw*0.12,base-52,C.amber,8.5);lab(ctx,'bigger reward, unexplored',gx+gw*0.58,base-96,C.green,8.5);
    // agent oscillates near local peak then jumps to explore
    const p=saw(t,5);let fx;if(p<0.6){fx=0.25+Math.sin(t*3)*0.03;}else{fx=0.25+(p-0.6)/0.4*0.5;}
    const ax=gx+fx*gw,ay=base-(Math.exp(-((fx-0.25)**2)/0.006)*40 + Math.exp(-((fx-0.75)**2)/0.01)*80);
    dot(ctx,ax,ay,6,p<0.6?C.amber:C.green);
    lab(ctx,'explore too little → stuck on the small peak; too much → never cash in',14,h-12,C.mut);
  };

  /* 04 — IMITATION: copy a few demos to skip the slow search. */
  A.rl_imitation=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Imitation: skip the search — copy a handful of expert demonstrations',14,16,C.dim);
    // expert trajectory (green) demonstrated; policy copies it
    const y0=h*0.5;const p=saw(t,4);
    lab(ctx,'expert demo',w*0.06,h*0.3,C.green,9.5);
    ctx.strokeStyle=hexA(C.green,0.8);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<=w*0.8;i++){const x=w*0.1+i;ctx.lineTo(x,y0-30+Math.sin(i*0.02)*22);}ctx.stroke();
    // learner dot follows, then drifts where no demo exists (distribution shift)
    const lx=w*0.1+p*w*0.8;const drift=p>0.7?(p-0.7)/0.3*30:0;
    const ly=y0-30+Math.sin((lx-w*0.1)*0.02)*22 + drift;
    dot(ctx,lx,ly,6,C.amber);
    if(p>0.7){lab(ctx,'off the demos → it drifts (distribution shift)',w*0.4,y0+40,C.coral,9);}
    lab(ctx,'cheap and fast, but a copy fails where no demo went — the fix is asking the expert there (DAgger)',14,h-12,C.mut);
  };

  /* 05 — SIM: millions of tries in a parallel dream, then transfer to reality. */
  A.rl_sim=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'RL needs millions of tries — so run them in fast, parallel simulation',14,16,C.dim);
    // grid of many sim robots learning in parallel
    const gx=w*0.06,gy=h*0.28,cols=8,rows=3,cw=(w*0.5)/cols,ch=(h*0.42)/rows;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const ph=saw(t*1.5 + (i*7+j*13)*0.05,1);
      rrect(ctx,gx+i*cw,gy+j*ch,cw-3,ch-3,3,hexA(C.cyan,0.5),null);
      dot(ctx,gx+i*cw+cw*0.2+ph*(cw-8),gy+j*ch+ch*0.5,2.2,C.cyan);}
    lab(ctx,'thousands of parallel sims',gx,gy-8,C.cyan,9);
    // transfer arrow to one real robot
    arrow(ctx,gx+w*0.5+4,h*0.5,w*0.72,h*0.5,C.green,1.6);lab(ctx,'transfer',w*0.60,h*0.44,C.green,9);
    box(ctx,w*0.76,h*0.42,w*0.16,30,'real robot',C.green,hexA(C.green,0.08));
    lab(ctx,'randomize the sim so reality is just one more variant it already handled',14,h-12,C.mut);
  };

  // ---- boot ----
  const running=new Map();
  function start(cv){if(running.has(cv))return;const anim=A[cv.dataset.rlanim];if(!anim)return;
    let dims=fit(cv),t0=performance.now(),raf;function frame(now){const t=(now-t0)/1000;anim(dims.ctx,dims.w,dims.h,t);raf=requestAnimationFrame(frame);}
    if(RM){anim(dims.ctx,dims.w,dims.h,3.0);}else{raf=requestAnimationFrame(frame);}
    running.set(cv,()=>cancelAnimationFrame(raf));cv._refit=()=>{dims=fit(cv);if(RM)anim(dims.ctx,dims.w,dims.h,3.0);};}
  function stop(cv){const s=running.get(cv);if(s){s();running.delete(cv);}}
  function init(){const cvs=[...document.querySelectorAll('canvas[data-rlanim]')];
    cvs.forEach(cv=>cv.setAttribute('height',cv.getAttribute('height')||'300'));
    const io=new IntersectionObserver(es=>{es.forEach(e=>{e.isIntersecting?start(e.target):stop(e.target);});},{threshold:0.12});
    cvs.forEach(cv=>io.observe(cv));let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>cvs.forEach(cv=>cv._refit&&cv._refit()),150);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
