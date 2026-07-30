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

  /* gmf_diff_policy — observation + denoising steps → clean action trajectory */
  A.gmf_diff_policy=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Diffusion policy: denoise an action trajectory from noise — the observation steers each step',14,16,C.dim);
    const p=saw(t,4),step=Math.floor(p*8);
    box(ctx,14,h*0.3,w*0.18,32,'obs\n(camera)',C.amber,hexA(C.amber,0.08));
    arrow(ctx,14+w*0.18,h*0.3+16,14+w*0.18+12,h*0.3+16,C.amber,1.4);
    box(ctx,w*0.28,h*0.3,w*0.16,32,'denoiser\nεθ(z,k,obs)',C.violet,hexA(C.violet,0.08));
    const cx=w*0.68,cy=h*0.5,noiseLevel=1-p;
    for(let i=0;i<30;i++){const a=i*2.1,r=20+((i*7)%18);
      const ox=Math.cos(a)*r*noiseLevel*(0.5+0.5*Math.sin(t+i)),oy=Math.sin(a)*r*noiseLevel;
      dot(ctx,cx+ox,cy+oy,1.8,hexA(C.mut,0.4+0.4*(1-noiseLevel)));}
    ctx.strokeStyle=hexA(C.cyan,0.3+0.7*p);ctx.lineWidth=2;ctx.beginPath();
    for(let i=0;i<w*0.32;i++){const x=w*0.54+i,yy=cy+Math.sin(i*0.06)*18*(1-p*0.8);ctx.lineTo(x,yy);}
    ctx.stroke();
    lab(ctx,'step '+step+'/8',w*0.54,cy-28,C.violet,9);
    arrow(ctx,w*0.44,h*0.46,w*0.52,h*0.46,C.violet,1.4);
    lab(ctx,'each denoising step subtracts predicted noise; after 100 steps the trajectory is a clean action chunk',14,h-12,C.mut);
  };

  /* gmf_flow_match — straight ODE paths vs curved SDE paths noise→data */
  A.gmf_flow_match=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Flow matching learns straight paths from noise to data — fewer steps, same quality',14,16,C.dim);
    const p=saw(t,4);
    const pairs=[[w*0.12,h*0.38,w*0.42,h*0.42],[w*0.16,h*0.6,w*0.44,h*0.55],[w*0.09,h*0.5,w*0.40,h*0.48],[w*0.18,h*0.44,w*0.42,h*0.62]];
    pairs.forEach(function(pr,i){
      ctx.strokeStyle=hexA(C.cyan,0.35);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(pr[0],pr[1]);ctx.lineTo(pr[2],pr[3]);ctx.stroke();
      const travX=pr[0]+(pr[2]-pr[0])*p,travY=pr[1]+(pr[3]-pr[1])*p;
      dot(ctx,travX,travY,3,i===0?C.green:hexA(C.cyan,0.7));});
    lab(ctx,'noise\nz~N(0,I)',w*0.04,h*0.3,C.mut,9);
    for(let i=0;i<6;i++){dot(ctx,w*0.08+((i*37)%20),h*0.38+((i*11)%26),2.5,hexA(C.mut,0.6));}
    lab(ctx,'data\nx~p(data)',w*0.44,h*0.3,C.cyan,9);
    for(let i=0;i<6;i++){dot(ctx,w*0.42+((i*31)%20),h*0.40+((i*13)%28),2.5,hexA(C.cyan,0.6));}
    const bx=w*0.6,by=h*0.5;lab(ctx,'diffusion\n(curved)',bx,h*0.28,C.amber,9);
    ctx.strokeStyle=hexA(C.amber,0.4);ctx.lineWidth=1.2;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(bx+w*0.04,h*0.38);
    ctx.bezierCurveTo(bx+w*0.08,h*0.28,bx+w*0.18,h*0.7,bx+w*0.22,h*0.52);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'straight ODE (cyan): 10 steps; curved SDE (amber): 100+ — same endpoint, far less compute',14,h-12,C.mut);
  };

  /* gmf_diff_vision — parallel coarse+fine denoising tracks */
  A.gmf_diff_vision=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'DRiffusion: denoise coarse draft and fine residual on two parallel tracks',14,16,C.dim);
    const p=saw(t,5),step=Math.floor(p*10);
    const lx=w*0.04,rx=w*0.52,py=h*0.3,ht=38,ww=w*0.42;
    rrect(ctx,lx,py,ww,ht,6,C.violet,hexA(C.violet,0.06));
    lab(ctx,'COARSE TRACK — low-frequency (global structure)',lx+4,py-10,C.violet,9);
    const coarseReady=p;
    for(let i=0;i<8;i++){for(let j=0;j<3;j++){
      const v=coarseReady*(0.3+0.5*Math.sin(i+j*2));
      ctx.fillStyle=hexA(C.violet,0.15+v*0.6);ctx.fillRect(lx+6+i*w*0.048,py+6+j*9,w*0.045,8);}}
    rrect(ctx,lx,py+ht+14,ww,ht,6,C.cyan,hexA(C.cyan,0.06));
    lab(ctx,'FINE TRACK — high-frequency (edges, detail)',lx+4,py+ht+4,C.cyan,9);
    const fineReady=Math.max(0,p-0.2);
    for(let i=0;i<16;i++){for(let j=0;j<3;j++){
      const v=fineReady*(0.4+0.4*Math.sin(i*1.3+j));
      ctx.fillStyle=hexA(C.cyan,0.1+v*0.5);ctx.fillRect(lx+4+i*w*0.024,py+ht+20+j*9,w*0.022,8);}}
    arrow(ctx,lx+ww,py+ht*0.5,lx+ww+w*0.06,h*0.5,C.mut,1.3);
    arrow(ctx,lx+ww,py+ht*1.5+14,lx+ww+w*0.06,h*0.5,C.mut,1.3);
    rrect(ctx,rx,h*0.36,w*0.4,44,8,C.green,hexA(C.green,0.08));
    lab(ctx,'merged\noutput\nstep '+step+'/10',rx+8,h*0.4,C.green,9.5);
    lab(ctx,'two tracks run in parallel — coarse corrects global structure while fine refines edges simultaneously',14,h-12,C.mut);
  };

  /* gmf_flow_consist — multi-step teacher vs one-step student shortcut */
  A.gmf_flow_consist=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,"Consistency model: one step from noise to clean — the student skips the teacher's 50",14,16,C.dim);
    const noiseX=w*0.1,cleanX=w*0.82,midY=h*0.52;
    dot(ctx,noiseX,midY,7,C.mut);lab(ctx,'noise\nz_T',noiseX-14,midY+16,C.mut,9,'center');
    dot(ctx,cleanX,midY,7,C.green);lab(ctx,'clean\nz_0',cleanX-14,midY+16,C.green,9,'center');
    const N=10;ctx.strokeStyle=hexA(C.amber,0.5);ctx.lineWidth=1.2;ctx.setLineDash([2,2]);
    ctx.beginPath();ctx.moveTo(noiseX,midY);
    for(let i=1;i<=N;i++){const fx=i/N,xx=noiseX+(cleanX-noiseX)*fx,yy=midY+Math.sin(fx*Math.PI)*22;ctx.lineTo(xx,yy);}
    ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'teacher: 50 curved steps',w*0.3,midY+36,C.amber,9,'center');
    const p=saw(t,3);
    arrow(ctx,noiseX+8,midY-14,cleanX-8,midY-14,C.cyan,2);
    const sx=noiseX+8+(cleanX-noiseX-16)*p,sy=midY-14;
    dot(ctx,sx,sy,5,C.cyan);lab(ctx,'student: 1 step',w*0.46,midY-28,C.cyan,9,'center');
    const ex=w*0.4,ey=h*0.22;
    arrow(ctx,ex,ey,ex+w*0.2,ey,hexA(C.violet,0.7),1.4);
    arrow(ctx,ex+w*0.2,ey+8,ex,ey+8,hexA(C.violet,0.5),1.4);
    lab(ctx,'BiFM: forward + backward flows for inversion-free editing',ex,ey-12,C.violet,9);
    lab(ctx,'self-consistency: f(z_t)≈f(z_{t-Δ}) — any noisy point maps to the same clean image in one shot',14,h-12,C.mut);
  };

  /* gmf_t2i — text tokens → cross-attention spatial binding → output patch */
  A.gmf_t2i=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Text-to-image: each text token attends to spatial regions — binding prevents attribute blending',14,16,C.dim);
    const p=saw(t,4);
    const tokens=[['red mug',C.coral],['blue vase',C.cyan],['table',C.amber]];
    tokens.forEach(function(tk,i){rrect(ctx,14,h*0.32+i*28,w*0.17,22,5,tk[1],hexA(tk[1],0.1));lab(ctx,tk[0],14+4,h*0.32+i*28+11,tk[1],9.5);});
    const aop=0.3+0.4*Math.sin(t*1.2);
    arrow(ctx,14+w*0.17,h*0.32+11,w*0.46,h*0.38,hexA(C.coral,aop),1.2);
    arrow(ctx,14+w*0.17,h*0.32+39,w*0.46,h*0.52,hexA(C.cyan,aop),1.2);
    arrow(ctx,14+w*0.17,h*0.32+67,w*0.46,h*0.66,hexA(C.amber,aop),1.2);
    const gx=w*0.46,gy=h*0.26,cols=8,rows=6,cw=w*0.06,ch=14;
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
      const col=c<4?hexA(C.coral,0.15+0.25*p):hexA(C.cyan,0.12+0.2*p);
      ctx.fillStyle=col;ctx.fillRect(gx+c*cw,gy+r*ch,cw-1,ch-1);}}
    lab(ctx,'spatial feature map\n(64\xd764)',gx,gy-10,C.dim,8.5);
    const ox=w*0.78,oy=h*0.26,ow=w*0.18,oh=h*0.5;
    rrect(ctx,ox,oy,ow,oh,6,C.green,hexA(C.green,0.06));
    rrect(ctx,ox+4,oy+4,ow*0.5-6,oh*0.45,4,C.coral,hexA(C.coral,0.18));
    rrect(ctx,ox+ow*0.5+2,oy+4,ow*0.5-6,oh*0.45,4,C.cyan,hexA(C.cyan,0.18));
    lab(ctx,'output\nmug|vase',ox+4,oy+oh-18,C.green,8.5);
    lab(ctx,'layer-wise binding maps each token to a spatial region — mug (left) and vase (right) never blend',14,h-12,C.mut);
  };

  /* gmf_vae_latent — image → encoder → small latent → diffusion → decoder → image */
  A.gmf_vae_latent=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'VAE compresses 512→64 pixels; diffusion runs in the small latent; decoder fires once at the end',14,16,C.dim);
    const p=saw(t,4);
    const imgW=w*0.12,imgH=h*0.5,imgX=14,imgY=h*0.25;
    rrect(ctx,imgX,imgY,imgW,imgH,4,C.ink,hexA(C.ink,0.06));
    for(let i=0;i<6;i++){for(let j=0;j<8;j++){ctx.fillStyle=hexA(i%2?C.cyan:C.violet,0.12+0.1*((i+j)%3));ctx.fillRect(imgX+2+i*imgW/6.2,imgY+2+j*imgH/8.2,imgW/6.5,imgH/8.5);}}
    lab(ctx,'512\xd7512',imgX,imgY-10,C.dim,8.5);
    box(ctx,imgX+imgW+6,h*0.38,w*0.1,28,'encoder\n4\xd7↓',C.violet,hexA(C.violet,0.08));
    arrow(ctx,imgX+imgW,h*0.5,imgX+imgW+6,h*0.5,C.violet,1.3);
    const latX=imgX+imgW+w*0.1+14,latY=h*0.3,latW=w*0.12,latH=h*0.42,cell=latW/5;
    lab(ctx,'64\xd764\nlatent',latX,latY-10,C.violet,8.5);
    arrow(ctx,imgX+imgW+w*0.1+6,h*0.5,latX,h*0.5,C.violet,1.3);
    for(let i=0;i<5;i++){for(let j=0;j<7;j++){const v=0.2+0.6*Math.abs(Math.sin(t*0.8+i*1.3+j));ctx.fillStyle=hexA(C.violet,v*0.7);ctx.fillRect(latX+i*cell,latY+j*(latH/7),cell-1,latH/7-1);}}
    rrect(ctx,latX+latW+6,h*0.38,w*0.12,28,5,C.cyan,hexA(C.cyan,0.06));
    lab(ctx,'diffusion\n50 steps',latX+latW+10,h*0.45,C.cyan,9);
    const progBar=latX+latW+8;ctx.fillStyle=hexA(C.cyan,0.2);ctx.fillRect(progBar,h*0.48,w*0.11,5);
    ctx.fillStyle=C.cyan;ctx.fillRect(progBar,h*0.48,w*0.11*p,5);
    arrow(ctx,latX+latW,h*0.5,latX+latW+6,h*0.5,C.cyan,1.3);
    const decX=latX+latW+w*0.12+14;
    box(ctx,decX,h*0.38,w*0.1,28,'decoder\n4\xd7↑',C.green,hexA(C.green,0.08));
    arrow(ctx,latX+latW+w*0.12+6,h*0.5,decX,h*0.5,C.green,1.3);
    const outX=decX+w*0.1+8;
    rrect(ctx,outX,imgY,imgW,imgH,4,C.green,hexA(C.green,0.06));
    for(let i=0;i<6;i++){for(let j=0;j<8;j++){ctx.fillStyle=hexA(i%2?C.cyan:C.violet,0.18+0.12*((i+j)%3));ctx.fillRect(outX+2+i*imgW/6.2,imgY+2+j*imgH/8.2,imgW/6.5,imgH/8.5);}}
    lab(ctx,'512\xd7512\nout',outX,imgY-10,C.green,8.5);
    lab(ctx,'diffusion compute scales with latent size (64\xb2) not image size (512\xb2) — 64\xd7 cheaper per step',14,h-12,C.mut);
  };

  /* gmf_ctrl_gen — token-to-region attention masking */
  A.gmf_ctrl_gen=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Controllable generation: bind each text token to a spatial region — no blending across objects',14,16,C.dim);
    const p=saw(t,5);
    const toks=[['red ball',C.coral],['blue cube',C.cyan]];
    toks.forEach(function(tk,i){rrect(ctx,14,h*0.28+i*34,w*0.16,26,5,tk[1],hexA(tk[1],0.1));lab(ctx,tk[0],14+4,h*0.28+i*34+13,tk[1],9.5);});
    const gx=w*0.28,gy=h*0.22,gw=w*0.4,gh=h*0.55,cols=10,rows=8;
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
      const leftSide=c<5;
      const att=leftSide?(0.1+0.5*p):0.05;
      const rightAtt=!leftSide?(0.1+0.4*p):0.05;
      ctx.fillStyle=hexA(leftSide?C.coral:C.cyan,leftSide?att:rightAtt);
      ctx.fillRect(gx+c*(gw/cols),gy+r*(gh/rows),gw/cols-1,gh/rows-1);}}
    ctx.strokeStyle=hexA(C.ink,0.3);ctx.lineWidth=1;ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(gx+gw*0.5,gy);ctx.lineTo(gx+gw*0.5,gy+gh);ctx.stroke();ctx.setLineDash([]);
    lab(ctx,'feature map',gx,gy-10,C.dim,9);lab(ctx,'left→red',gx+4,gy+gh+10,C.coral,8.5);lab(ctx,'right→blue',gx+gw*0.5+4,gy+gh+10,C.cyan,8.5);
    arrow(ctx,14+w*0.16,h*0.35,gx,h*0.42,hexA(C.coral,0.5+0.3*Math.sin(t)),1.3);
    arrow(ctx,14+w*0.16,h*0.45+34,gx+gw*0.5,h*0.56,hexA(C.cyan,0.5+0.3*Math.cos(t)),1.3);
    const ox=gx+gw+14,ow=w*0.14,oh=h*0.55;
    rrect(ctx,ox,gy,ow,oh,6,C.green,hexA(C.green,0.05));
    rrect(ctx,ox+2,gy+2,ow*0.5-3,oh*0.45,4,C.coral,hexA(C.coral,0.25));
    rrect(ctx,ox+ow*0.5+1,gy+2,ow*0.5-3,oh*0.45,4,C.cyan,hexA(C.cyan,0.25));
    lab(ctx,'output:\nno blending',ox+4,gy+oh-16,C.green,8.5);
    lab(ctx,'masking cross-attention per token keeps attributes in the correct spatial region',14,h-12,C.mut);
  };

  /* gmf_img_edit — original → ODE path perturbation → edited output (no inversion) */
  A.gmf_img_edit=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Inversion-free editing: perturb the ODE mid-path — no 50-step inversion needed',14,16,C.dim);
    const p=saw(t,4);
    const iw=w*0.12,ih=h*0.44,iy=h*0.27;
    rrect(ctx,14,iy,iw,ih,5,C.amber,hexA(C.amber,0.08));
    for(let i=0;i<4;i++){for(let j=0;j<5;j++){ctx.fillStyle=hexA(C.amber,0.18+0.1*((i+j)%2));ctx.fillRect(16+i*iw/4,iy+2+j*ih/5,iw/4-1,ih/5-1);}}
    lab(ctx,'original\nz₀',14,iy-12,C.amber,8.5);
    const pathX1=w*0.23,pathX2=w*0.74,my=h*0.5;
    ctx.strokeStyle=hexA(C.mut,0.3);ctx.lineWidth=1;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(pathX1,my);ctx.lineTo(pathX2,my);ctx.stroke();ctx.setLineDash([]);
    const perturbY=my-28;
    ctx.strokeStyle=hexA(C.violet,0.7);ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(pathX1,my);
    ctx.quadraticCurveTo(w*0.46,perturbY,pathX2-w*0.14,perturbY);ctx.stroke();
    lab(ctx,'δv perturbation\n(edit direction)',w*0.38,perturbY-18,C.violet,9,'center');
    arrow(ctx,w*0.42,my-6,w*0.42,perturbY+2,C.violet,1.2);
    const tx=pathX1+(pathX2-w*0.14-pathX1)*p;
    const ty=my+(perturbY-my)*Math.min(1,p*3)*Math.min(1,(1-p)*3);
    dot(ctx,tx,ty,5,C.cyan);
    rrect(ctx,w*0.74,iy,iw,ih,5,C.green,hexA(C.green,0.08));
    for(let i=0;i<4;i++){for(let j=0;j<5;j++){ctx.fillStyle=hexA(i<2?C.green:C.cyan,0.18+0.1*((i+j)%2));ctx.fillRect(w*0.74+2+i*iw/4,iy+2+j*ih/5,iw/4-1,ih/5-1);}}
    lab(ctx,"edited\nz'₀",w*0.74,iy-12,C.green,8.5);
    lab(ctx,'10 ODE steps from t=0.3 — skip inversion (50 steps saved); temporal δv keeps video frames consistent',14,h-12,C.mut);
  };

  /* gmf_3d4d — triplane representation: three 2D planes query a 3D point */
  A.gmf_3d4d=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Triplane: three 2D feature maps index any 3D point — standard 2D diffusion can process them',14,16,C.dim);
    const pw=w*0.18,ph=h*0.36,gap=w*0.04;
    const planes=[['XY plane',C.cyan,w*0.06,h*0.28],['XZ plane',C.violet,w*0.06+pw+gap,h*0.28],['YZ plane',C.amber,w*0.06+(pw+gap)*2,h*0.28]];
    const prog=saw(t,4);
    planes.forEach(function(pl,idx){
      const px=pl[2],py=pl[3];
      rrect(ctx,px,py,pw,ph,5,pl[1],hexA(pl[1],0.06));
      for(let r=0;r<5;r++){for(let c=0;c<6;c++){
        const v=0.2+0.4*Math.abs(Math.sin(prog*2+r*1.4+c+idx*2.2));
        ctx.fillStyle=hexA(pl[1],v);ctx.fillRect(px+3+c*(pw-6)/6,py+3+r*(ph-6)/5,(pw-6)/6-1,(ph-6)/5-1);}}
      lab(ctx,pl[0],px+pw*0.5,py-10,pl[1],8.5,'center');});
    const qx=w*0.72,qy=h*0.36;
    dot(ctx,qx,qy,6,C.ink);lab(ctx,'3D point\n(x,y,z)',qx+8,qy-10,C.ink,9);
    arrow(ctx,planes[0][2]+pw,planes[0][3]+ph*0.5,qx-8,qy,hexA(C.cyan,0.6),1.2);
    arrow(ctx,planes[1][2]+pw,planes[1][3]+ph*0.5,qx-4,qy+4,hexA(C.violet,0.6),1.2);
    arrow(ctx,planes[2][2]+pw,planes[2][3]+ph*0.5,qx,qy+8,hexA(C.amber,0.6),1.2);
    lab(ctx,'↓ sum of 3\nprojections',qx+6,qy+18,C.green,8.5);
    const tlx=w*0.74,tly=h*0.78;
    ctx.strokeStyle=hexA(C.mut,0.5);ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(tlx-40,tly);ctx.lineTo(tlx+40,tly);ctx.stroke();
    dot(ctx,tlx-40+80*prog,tly,4,C.green);lab(ctx,'+ time axis for 4D',tlx-44,tly-12,C.dim,8.5);
    lab(ctx,'bilinear-interpolate from each plane; sum three features — compress 3D into 3\xd7 2D diffusion budget',14,h-12,C.mut);
  };

  /* gmf_distill — teacher 50-step curved path vs student 4-step shortcut */
  A.gmf_distill=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,"Distillation: compress 50 denoising steps into 4 — student matches teacher's output in one phase",14,16,C.dim);
    const noiseX=w*0.1,cleanX=w*0.86,midY=h*0.52;
    dot(ctx,noiseX,midY,7,C.mut);lab(ctx,'noise',noiseX,midY+14,C.mut,8.5,'center');
    dot(ctx,cleanX,midY,7,C.green);lab(ctx,'clean',cleanX,midY+14,C.green,8.5,'center');
    const N=10;
    ctx.strokeStyle=hexA(C.amber,0.45);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(noiseX,midY);
    for(let i=1;i<=N;i++){const fx=i/N,xx=noiseX+(cleanX-noiseX)*fx,yy=midY+Math.sin(fx*Math.PI)*28;ctx.lineTo(xx,yy);}
    ctx.stroke();
    for(let i=1;i<N;i++){const fx=i/N,xx=noiseX+(cleanX-noiseX)*fx,yy=midY+Math.sin(fx*Math.PI)*28;dot(ctx,xx,yy,2.5,hexA(C.amber,0.6));}
    lab(ctx,'teacher: 50 steps',w*0.48,midY+36,C.amber,8.5,'center');
    const p=saw(t,4),ssteps=4;
    for(let i=0;i<ssteps;i++){
      const x0=noiseX+(cleanX-noiseX)*(i/ssteps),x1=noiseX+(cleanX-noiseX)*((i+1)/ssteps);
      const active=i<Math.floor(p*ssteps+1);
      arrow(ctx,x0,midY-24,x1,midY-24,hexA(C.cyan,active?0.9:0.25),active?2.2:1);}
    for(let i=0;i<=ssteps;i++){const xx=noiseX+(cleanX-noiseX)*(i/ssteps);dot(ctx,xx,midY-24,3.5,i<=Math.floor(p*ssteps)?C.cyan:hexA(C.cyan,0.3));}
    lab(ctx,'student: 4 steps',w*0.48,midY-40,C.cyan,8.5,'center');
    rrect(ctx,w*0.74,h*0.22,w*0.12,22,4,C.violet,hexA(C.violet,0.08));
    lab(ctx,'reward\nalignment',w*0.74+4,h*0.22+4,C.violet,8.5);
    lab(ctx,'phase-by-phase matching: each 10-step segment distills to 2, then 1 — quality within FID 2 of teacher',14,h-12,C.mut);
  };

  /* gmf_gen_aug — real scene → generative model → synthetic variants → policy */
  A.gmf_gen_aug=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Generative augmentation: one real scene → many synthetic variants → policy trains on all',14,16,C.dim);
    const p=saw(t,5);
    rrect(ctx,14,h*0.28,w*0.13,h*0.44,5,C.amber,hexA(C.amber,0.08));
    lab(ctx,'real\n(\xd710)',14+4,h*0.28+8,C.amber,8.5);dot(ctx,14+w*0.065,h*0.52,10,hexA(C.amber,0.7));
    box(ctx,w*0.2,h*0.42,w*0.18,28,'generative\nmodel',C.violet,hexA(C.violet,0.08));
    arrow(ctx,14+w*0.13,h*0.5,w*0.2,h*0.5,C.amber,1.4);
    const variants=5,fanX=w*0.46,fanY=h*0.5;
    const colors=[C.cyan,C.coral,C.green,C.amber,C.violet];
    for(let i=0;i<variants;i++){
      const ang=-Math.PI*0.35+i*(Math.PI*0.7/(variants-1)),r=w*0.17;
      const vx=fanX+Math.cos(ang)*r*Math.min(1,p*2),vy=fanY+Math.sin(ang)*r*Math.min(1,p*2);
      const ready=p>(i*0.15);
      if(ready){rrect(ctx,vx-w*0.06,vy-14,w*0.12,28,4,colors[i],hexA(colors[i],0.12));dot(ctx,vx,vy,6,hexA(colors[i],0.7));
      lab(ctx,'\xd750',vx-6,vy+20,colors[i],8);}}
    arrow(ctx,fanX+w*0.17,fanY,w*0.72,fanY,C.cyan,1.6);
    box(ctx,w*0.73,h*0.42,w*0.2,28,'policy\n(trained on all)',C.green,hexA(C.green,0.08));
    lab(ctx,'real \xd710 + synthetic \xd7400 — policy success 62%→89% on unseen objects; no new collection',14,h-12,C.mut);
  };

  /* gmf_world_scene — state+action → imagined next state → planning chain */
  A.gmf_world_scene=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'World model: generate the next observation in imagination — plan by rolling out actions',14,16,C.dim);
    const p=saw(t,5),step=Math.floor(p*4);
    const cellW=w*0.13,cellH=h*0.4,baseY=h*0.3;
    function bev(sx,sy,highlight,agents){
      rrect(ctx,sx,sy,cellW,cellH,5,highlight?C.cyan:C.line,hexA(highlight?C.cyan:C.line,0.06));
      dot(ctx,sx+cellW*0.5,sy+cellH*0.7,5,C.amber);
      (agents||[]).forEach(function(a){dot(ctx,sx+a[0]*cellW,sy+a[1]*cellH,4,hexA(C.violet,0.8));});}
    const states=[{x:w*0.04,agents:[[0.3,0.3],[0.7,0.4]]},{x:w*0.23,agents:[[0.4,0.3],[0.6,0.35]]},{x:w*0.42,agents:[[0.5,0.28],[0.65,0.3]]},{x:w*0.61,agents:[[0.6,0.26],[0.7,0.28]]}];
    states.forEach(function(s,i){const vis=i===0||p>(i*0.22);bev(s.x,baseY,i===step&&vis,s.agents);
      if(vis&&i<3){arrow(ctx,s.x+cellW,baseY+cellH*0.5,s.x+cellW+w*0.04,baseY+cellH*0.5,i<step?C.cyan:hexA(C.cyan,0.3),1.4);
      lab(ctx,'a'+i,s.x+cellW+4,baseY+cellH*0.5-10,C.green,8.5);}});
    lab(ctx,'t='+step,states[Math.min(step,3)].x+4,baseY-12,C.cyan,8.5);
    lab(ctx,'imagined rollout (4 steps)',w*0.04,baseY+cellH+14,C.dim,9);
    rrect(ctx,w*0.76,h*0.28,w*0.2,28,5,C.green,hexA(C.green,0.08));lab(ctx,'score: collision?\nkeep top-5',w*0.76+4,h*0.32,C.green,8.5);
    lab(ctx,'diffusion transformer imagines next BEV in 50 steps — chain 8\xd7 → 4-second horizon, 18ms per step',14,h-12,C.mut);
  };

  /* gmf_grasp_synth — object + sampled grasp poses from distribution */
  A.gmf_grasp_synth=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Grasp synthesis: sample from the multimodal distribution of stable grasps — many valid, not one',14,16,C.dim);
    const p=saw(t,5);
    const ox=w*0.38,oy=h*0.5,or2=28;
    rrect(ctx,ox-or2,oy-or2*1.2,or2*2,or2*2.4,4,C.amber,hexA(C.amber,0.15));
    rrect(ctx,ox+or2-4,oy-or2*0.5,10,or2,4,C.amber,hexA(C.amber,0.2));
    lab(ctx,'object\n(mug)',ox-20,oy+or2*1.3,C.amber,8.5,'center');
    const N=8;
    for(let i=0;i<N;i++){
      const ang=(i/N)*TAU,r=or2+22;
      const visible=p>(i/(N+1));
      if(!visible)continue;
      const gx=ox+Math.cos(ang)*r,gy=oy+Math.sin(ang)*r;
      const quality=i%3===0?C.green:i%3===1?C.amber:C.coral;
      arrow(ctx,gx+Math.cos(ang)*14,gy+Math.sin(ang)*14,gx-Math.cos(ang)*4,gy-Math.sin(ang)*4,hexA(quality,0.8),1.6);
      dot(ctx,gx+Math.cos(ang)*16,gy+Math.sin(ang)*16,3.5,quality);}
    lab(ctx,'● good grasp\n● marginal\n● collision risk',w*0.64,h*0.32,C.green,8.5);
    rrect(ctx,w*0.64,h*0.44,8,8,2,C.amber,C.amber);rrect(ctx,w*0.64,h*0.54,8,8,2,C.coral,C.coral);
    box(ctx,w*0.04,h*0.38,w*0.26,28,'diffusion\nsampler (50 steps)',C.violet,hexA(C.violet,0.08));
    arrow(ctx,w*0.04+w*0.26,h*0.52,ox-or2-6,oy,C.violet,1.4);
    lab(ctx,'BODex: 8 approach directions \xd7 diffusion contact-point sampling → 3 valid grasps, 84% success on mugs',14,h-12,C.mut);
  };

  /* gmf_motion_gen — skeleton + text → diffusion → animated joint sequence */
  A.gmf_motion_gen=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Text-to-motion: denoise joint angles over 196 frames — part-level text tokens guide each limb',14,16,C.dim);
    const p=saw(t,4);
    rrect(ctx,12,h*0.3,w*0.22,22,5,C.violet,hexA(C.violet,0.1));
    lab(ctx,'"waves right hand enthusiastically"',14,h*0.3+11,C.violet,8.5);
    arrow(ctx,12+w*0.22,h*0.41,w*0.28,h*0.41,C.violet,1.3);
    box(ctx,w*0.28,h*0.34,w*0.16,28,'denoiser\n196\xd7263',C.cyan,hexA(C.cyan,0.08));
    const fx=w*0.6,fy=h*0.48;
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx,fy-30);ctx.lineTo(fx,fy+20);ctx.stroke();
    ring(ctx,fx,fy-36,10,C.ink);
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx,fy-20);ctx.lineTo(fx-20,fy+5);ctx.stroke();
    const waveAng=-0.5+Math.sin(t*2.5)*0.8*p,armLen=26;
    const rax=fx+Math.sin(waveAng)*armLen,ray=fy-20-Math.cos(waveAng)*armLen*0.5;
    ctx.strokeStyle=C.cyan;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(fx,fy-20);ctx.lineTo(rax,ray);ctx.stroke();
    dot(ctx,rax,ray,3,C.cyan);lab(ctx,'R arm\nanimated',rax+6,ray-10,C.cyan,8.5);
    ctx.strokeStyle=C.ink;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(fx,fy+20);ctx.lineTo(fx-14,fy+48);ctx.stroke();
    ctx.beginPath();ctx.moveTo(fx,fy+20);ctx.lineTo(fx+14,fy+48);ctx.stroke();
    const tlx=w*0.74,tly=h*0.28,tlw=w*0.22,tlh=h*0.14;
    lab(ctx,'joint angles (wrist)',tlx,tly-10,C.dim,8.5);
    ctx.strokeStyle=hexA(C.cyan,0.5);ctx.lineWidth=1.2;ctx.beginPath();
    for(let i=0;i<5;i++){const x=tlx+i*(tlw/5),y=tly+tlh*0.5+Math.sin(i*1.8+t*2)*tlh*0.4*p;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    for(let i=0;i<5;i++){const x=tlx+i*(tlw/5),y=tly+tlh*0.5+Math.sin(i*1.8+t*2)*tlh*0.4*p;dot(ctx,x,y,2.5,C.cyan);}
    lab(ctx,'FID 0.49 on HumanML3D — part-level tokens isolate right arm motion without disturbing others',14,h-12,C.mut);
  };

  /* gmf_autoreg — context tokens + next token prediction → robot action */
  A.gmf_autoreg=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Autoregressive: each next token predicted from all prior — demo tokens condition action tokens',14,16,C.dim);
    const p=saw(t,5);
    const tokW=w*0.055,tokH=28,tokY=h*0.38,startX=12;
    const demoN=8;
    for(let i=0;i<demoN;i++){rrect(ctx,startX+i*(tokW+3),tokY,tokW,tokH,3,C.mut,hexA(C.mut,0.12));lab(ctx,i<5?'v':'a',startX+i*(tokW+3)+tokW*0.5,tokY+tokH*0.5,C.mut,8,'center');}
    lab(ctx,'demo: 5 visual (v) + 3 action (a) tokens',startX,tokY-12,C.mut,8.5);
    ctx.strokeStyle=hexA(C.dim,0.4);ctx.lineWidth=1;ctx.setLineDash([2,2]);
    const sepX=startX+demoN*(tokW+3)+6;ctx.beginPath();ctx.moveTo(sepX,tokY-6);ctx.lineTo(sepX,tokY+tokH+6);ctx.stroke();ctx.setLineDash([]);
    const actN=7,actStart=sepX+8;
    for(let i=0;i<actN;i++){
      const generated=i<Math.floor(p*actN);
      rrect(ctx,actStart+i*(tokW+3),tokY,tokW,tokH,3,generated?C.cyan:hexA(C.mut,0.2),generated?hexA(C.cyan,0.14):null);
      if(generated)lab(ctx,'a'+(i+1),actStart+i*(tokW+3)+tokW*0.5,tokY+tokH*0.5,C.cyan,8,'center');}
    lab(ctx,'new action tokens (7-DOF command)',actStart,tokY-12,C.cyan,8.5);
    const curTok=Math.min(Math.floor(p*actN),actN-1);
    const curX=actStart+curTok*(tokW+3)+tokW*0.5;
    arrow(ctx,sepX-6,tokY+tokH+18,curX,tokY+tokH+18,hexA(C.cyan,0.5),1.3);
    lab(ctx,'← causal context window',startX,tokY+tokH+28,C.dim,8.5);
    rrect(ctx,startX+w*0.4,h*0.7,w*0.28,26,5,C.violet,hexA(C.violet,0.08));
    lab(ctx,'causal transformer (GPT-style) predicts next token',startX+w*0.4+6,h*0.7+13,C.violet,8.5);
    lab(ctx,'ICRT: 980 demo tokens → 7 action tokens, zero fine-tuning, 71% success on unseen objects',14,h-12,C.mut);
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
