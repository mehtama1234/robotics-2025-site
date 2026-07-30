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

  /* --- family animators (wave 2) --- */

  /* ovf_clip_space — two spaces converging into one shared embedding. */
  A.ovf_clip_space=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Two separate spaces — train them to collapse into one',14,16,C.dim);
    const p=saw(t,5);
    // left: image space blobs
    const imgx=w*0.14,imgy=h*0.42;
    lab(ctx,'image space',imgx,h*0.24,C.mut,9,'center');
    [[0,-0.18,C.cyan],[0.12,0.12,C.cyan2],[-0.1,0.08,hexA(C.cyan,0.6)]].forEach((b,i)=>{
      dot(ctx,imgx+b[0]*60,imgy+b[1]*60,5,b[2]);});
    // right: text space tokens
    const txtx=w*0.86,txty=h*0.42;
    lab(ctx,'text space',txtx,h*0.24,C.mut,9,'center');
    ['"mug"','"laptop"','"plant"'].forEach((s,i)=>{
      rrect(ctx,txtx-22,txty+(i-1)*26-8,44,16,4,hexA(C.violet,0.7),null);
      lab(ctx,s,txtx,txty+(i-1)*26,C.violet,8,'center');});
    // shared circle in center — grows and absorbs both
    const cx=w*0.5,cy=h*0.5,r=55+p*10;
    ring(ctx,cx,cy,r,hexA(C.mut,0.35));
    lab(ctx,'shared space',cx,cy-r-9,C.mut,8.5,'center');
    // image dots drifting toward center
    const pull=Math.min(1,p*1.5);
    [[0,-0.18,C.cyan],[0.12,0.12,C.cyan2],[-0.1,0.08,hexA(C.cyan,0.6)]].forEach((b,i)=>{
      const sx=imgx+b[0]*60,sy=imgy+b[1]*60;
      const tx=cx+b[0]*r*0.55,ty=cy+(i-1)*14;
      dot(ctx,sx+(tx-sx)*pull,sy+(ty-sy)*pull,4,b[2]);});
    // text dots drifting toward center
    [0,1,2].forEach(i=>{
      const sy=txty+(i-1)*26,sx=txtx;
      const tx=cx+(i-1)*10,ty=cy+(i-1)*14+6;
      dot(ctx,sx+(tx-sx)*pull,sy+(ty-sy)*pull,3.5,C.violet);});
    // arrow suggesting direction of training
    arrow(ctx,imgx+30,imgy,cx-r-4,cy,hexA(C.cyan,0.5),1.2);
    arrow(ctx,txtx-30,txty,cx+r+4,cy,hexA(C.violet,0.5),1.2);
    lab(ctx,'a picture lands near the words that describe it; recognition becomes a nearest-neighbor lookup',14,h-12,C.mut);
  };

  /* ovf_ov_det — prompt cycles, matching region lights up with score bars. */
  A.ovf_ov_det=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Score every region proposal against any text prompt you type',14,16,C.dim);
    const sx=w*0.06,sy=h*0.28,sw=w*0.48,sh=h*0.52;
    rrect(ctx,sx,sy,sw,sh,6,hexA(C.line,0.8),hexA(C.cyan,0.03));
    const objs=[[sx+sw*0.18,sy+sh*0.28,'mug',C.amber],[sx+sw*0.6,sy+sh*0.48,'laptop',C.green],[sx+sw*0.32,sy+sh*0.72,'plant',C.violet]];
    const prompts=['mug','laptop','plant'];
    const p=saw(t,3.6);const which=Math.floor(p*3);
    // prompt box top right
    const px=w*0.60,py=sy;
    rrect(ctx,px,py,w*0.34,22,5,C.cyan,hexA(C.cyan,0.1));
    lab(ctx,'prompt: "'+prompts[which]+'"',px+8,py+11,C.cyan,9);
    // draw object boxes + score bars
    objs.forEach((o,i)=>{
      const on=(i===which);const bw=52,bh=38;
      ctx.save();ctx.strokeStyle=on?C.coral:hexA(C.mut,0.35);ctx.lineWidth=on?2.2:1;
      ctx.strokeRect(o[0]-bw/2,o[1]-bh/2,bw,bh);ctx.restore();
      dot(ctx,o[0],o[1],4,o[3]);
      if(on){lab(ctx,o[2]+' ✓',o[0]-bw/2,o[1]-bh/2-9,C.coral,9);}
      const sc=on?0.88:0.12+0.06*Math.sin(t*1.3+i);
      ctx.fillStyle=hexA(on?C.coral:C.mut,0.65);
      ctx.fillRect(px,py+30+i*22,sc*w*0.34,11);
      lab(ctx,o[2],px,py+27+i*22,C.mut,8);
    });
    lab(ctx,'no fixed class list — add any word at test time and matching boxes appear',14,h-12,C.mut);
  };

  /* ovf_ov_seg — patch grid with heatmap, query text cycles, mask emerges. */
  A.ovf_ov_seg=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Dense pixel scoring — every patch gets a cosine similarity with the query text',14,16,C.dim);
    const queries=['plant','mug','laptop'];
    const p=saw(t,4);const qi=Math.floor(p*3);
    // patch grid 7x5 in center-left
    const gx=w*0.08,gy=h*0.26,pw=w*0.5,gh=h*0.56;
    const cols=7,rows=5,cw=pw/cols,ch=gh/rows;
    // simple fixed heatmap patterns per query
    const patterns=[
      // plant: bottom-center patches hot
      [[2,3,0.9],[3,3,0.85],[4,3,0.8],[2,4,0.7],[3,4,0.95],[4,4,0.75],[1,4,0.5],[5,4,0.4]],
      // mug: top-left
      [[1,1,0.9],[2,1,0.85],[1,2,0.8],[2,2,0.88]],
      // laptop: right side
      [[4,1,0.9],[5,1,0.85],[6,1,0.7],[4,2,0.8],[5,2,0.9],[6,2,0.75]],
    ];
    const hotPat=patterns[qi];
    const hotSet=new Set(hotPat.map(p=>p[0]+','+p[1]));
    for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
      const hit=hotPat.find(hp=>hp[0]===c&&hp[1]===r);
      const score=hit?hit[2]*Math.min(1,p*1.5):0.05+0.05*Math.sin(t+r*cols+c);
      const bright=Math.floor(score*200);
      const col=hit?hexA(C.green,score):hexA(C.mut,score*0.8);
      ctx.fillStyle=col;ctx.fillRect(gx+c*cw+1,gy+r*ch+1,cw-2,ch-2);
    }}
    rrect(ctx,gx,gy,pw,gh,4,hexA(C.mut,0.3),null);
    lab(ctx,'patch cosine scores',gx+pw/2,gy-10,C.mut,8.5,'center');
    // query label top right
    const qx=w*0.64,qy=gy;
    rrect(ctx,qx,qy,w*0.3,22,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'query: "'+queries[qi]+'"',qx+8,qy+11,C.amber,9);
    // threshold label
    lab(ctx,'threshold 0.45 → mask',qx,qy+32,C.green,9);
    // hot patches outlined
    hotPat.forEach(hp=>{
      const sc=hp[2];if(sc>0.45){
        ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=1.5;
        ctx.strokeRect(gx+hp[0]*cw+1,gy+hp[1]*ch+1,cw-2,ch-2);ctx.restore();}});
    lab(ctx,'language directs a pixel-level mask, not just a bounding box',14,h-12,C.mut);
  };

  /* ovf_frozen_vlm — lock icon, feature grid cells light up on query. */
  A.ovf_frozen_vlm=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'A frozen model already speaks language — project its features directly to text, no training',14,16,C.dim);
    // frozen VLM block
    const bx=w*0.06,by=h*0.28,bw=w*0.28,bh=h*0.44;
    rrect(ctx,bx,by,bw,bh,10,hexA(C.violet,0.7),hexA(C.violet,0.06));
    lab(ctx,'frozen VLM',bx+bw/2,by+bh/2-8,C.violet,11,'center');
    lab(ctx,'🔒',bx+bw/2,by+bh/2+12,C.violet,14,'center');
    // image input arrow
    arrow(ctx,bx-2,by+bh*0.35,bx,by+bh*0.35,hexA(C.cyan,0.7),1.4);
    lab(ctx,'image',bx-30,by+bh*0.35-10,C.mut,8);
    // feature grid 4x4 on the right
    const gx=w*0.44,gy=h*0.26,gsize=14,ggap=4,gcols=4,grows=4;
    const gtot=gsize+ggap;
    lab(ctx,'feature grid (14×14)',gx+gcols*gtot/2,gy-10,C.mut,8,'center');
    // query text
    const qx=w*0.67,qy=h*0.28;
    rrect(ctx,qx,qy,w*0.28,22,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'query: "laptop"',qx+8,qy+11,C.amber,9);
    // arrow from vlm to grid
    arrow(ctx,bx+bw,by+bh*0.5,gx,gy+gcols*gtot/2,hexA(C.violet,0.6),1.3);
    // arrow from query to grid
    arrow(ctx,qx+w*0.14,qy+22,gx+gcols*gtot*0.6,gy+grows*gtot*0.3,hexA(C.amber,0.6),1.2);
    // draw cells with cosine heat
    const p=saw(t,4);
    const hotCells=[[2,1],[3,1],[2,2],[3,2]]; // laptop region
    for(let r=0;r<grows;r++){for(let c=0;c<gcols;c++){
      const isHot=hotCells.some(hc=>hc[0]===c&&hc[1]===r);
      const score=isHot?0.72*Math.min(1,p*1.6):0.08+0.04*Math.sin(t+r*4+c);
      ctx.fillStyle=isHot?hexA(C.green,score):hexA(C.mut,score*1.5);
      ctx.fillRect(gx+c*gtot,gy+r*gtot,gsize,gsize);
      if(isHot&&p>0.4){ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=1.2;ctx.strokeRect(gx+c*gtot,gy+r*gtot,gsize,gsize);ctx.restore();}
    }}
    lab(ctx,'high score → laptop region',gx,gy+grows*gtot+10,C.green,8.5);
    lab(ctx,'zero pixel-level labels needed — the VLM\'s alignment is already there',14,h-12,C.mut);
  };

  /* ovf_grounding — three mugs, filter by color then relation, one survives. */
  A.ovf_grounding=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Filter by attribute, verify by relation — one mug survives both tests',14,16,C.dim);
    lab(ctx,'"the red mug behind the laptop"',w*0.5,34,C.amber,10.5,'center');
    const p=saw(t,5);
    // phase 0-0.33: all mugs shown; 0.33-0.66: color filter dims blue+green; 0.66-1: relation filter dims remaining wrong one
    const phase=p<0.33?0:p<0.66?1:2;
    // laptop rect center
    const lx=w*0.5,ly=h*0.6;
    rrect(ctx,lx-36,ly-8,72,16,3,hexA(C.mut,0.5),hexA(C.mut,0.2));
    lab(ctx,'laptop',lx,ly,C.mut,8,'center');
    // mugs: [x, y, col, label, survives-color, survives-relation]
    const mugs=[
      [w*0.22,h*0.42,C.cyan,'blue mug',false,false],
      [w*0.5,h*0.4,C.coral,'red mug',true,false],  // red but NOT behind laptop (above)
      [w*0.5,h*0.76,C.coral,'red mug',true,true],   // red AND behind laptop
      [w*0.78,h*0.42,C.green,'green mug',false,false],
    ];
    mugs.forEach((m,i)=>{
      let alpha=1;
      if(phase>=1&&!m[4])alpha=0.18;
      if(phase>=2&&m[4]&&!m[5])alpha=0.18;
      const col=hexA(m[2],alpha);
      dot(ctx,m[0],m[1],9,col);
      lab(ctx,m[3],m[0]-20,m[1]+18,hexA(m[2],alpha*0.9),8);
      if(phase>=2&&m[5]){ring(ctx,m[0],m[1],15,C.amber);lab(ctx,'✓ this one',m[0]+18,m[1],C.amber,9);}
    });
    // filter labels
    if(phase>=1){lab(ctx,'step 1: color=red eliminates blue+green',14,h*0.18,hexA(C.cyan2,0.9),9);}
    if(phase>=2){lab(ctx,'step 2: behind(laptop) picks the lower one',14,h*0.18+14,hexA(C.green,0.9),9);}
    lab(ctx,'attributes + spatial geometry pick the exact referent among look-alikes',14,h-12,C.mut);
  };

  /* ovf_sam — click point, mask expands, three granularity options with scores. */
  A.ovf_sam=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'One click, three mask granularities — choose by confidence score',14,16,C.dim);
    const p=saw(t,4);
    // image area
    const ix=w*0.06,iy=h*0.26,iw=w*0.5,ih=h*0.55;
    rrect(ctx,ix,iy,iw,ih,6,hexA(C.line,0.6),hexA(C.cyan,0.03));
    // click point
    const cx=ix+iw*0.42,cy=iy+ih*0.46;
    dot(ctx,cx,cy,4,C.amber);
    lab(ctx,'click',cx+7,cy-8,C.amber,8.5);
    // mask expanding from click — mug outline as rrect
    const grow=Math.min(1,p*1.8);
    if(grow>0.1){
      ctx.save();ctx.globalAlpha=0.22*grow;ctx.fillStyle=C.cyan;
      ctx.beginPath();ctx.ellipse(cx,cy,30*grow,40*grow,0,0,TAU);ctx.fill();ctx.restore();
      ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=1.8;ctx.globalAlpha=0.7*grow;
      ctx.beginPath();ctx.ellipse(cx,cy,30*grow,40*grow,0,0,TAU);ctx.stroke();ctx.restore();
    }
    // three options on the right
    const ox=w*0.62,oy=iy+6;
    const options=[
      ['whole object',0.91,C.cyan],
      ['part',0.73,C.violet],
      ['subpart',0.44,C.mut],
    ];
    options.forEach((o,i)=>{
      const showScore=grow>0.3+i*0.25;
      rrect(ctx,ox,oy+i*52,w*0.32,40,7,hexA(o[2],showScore?0.8:0.3),hexA(o[2],showScore?0.1:0.04));
      lab(ctx,o[0],ox+8,oy+i*52+14,showScore?o[2]:hexA(o[2],0.4),10);
      if(showScore){lab(ctx,'IoU '+o[1],ox+8,oy+i*52+28,hexA(o[2],0.9),9);}
    });
    if(grow>0.5){
      // highlight winner
      ctx.save();ctx.strokeStyle=C.amber;ctx.lineWidth=2;ctx.strokeRect(ox-1,oy-1,w*0.32+2,42);ctx.restore();
      lab(ctx,'best',ox+w*0.32+4,oy+14,C.amber,8.5);
    }
    lab(ctx,'trained on 1 billion masks, SAM segments any object from any prompt, no category name needed',14,h-12,C.mut);
  };

  /* ovf_3d_scene — point cloud, query text, matching cluster lights up. */
  A.ovf_3d_scene=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Every 3D voxel carries a CLIP feature — query by text, get a 3D location',14,16,C.dim);
    const p=saw(t,4);
    // scattered point cloud in left region
    const pts=[
      [0.08,0.32],[0.14,0.28],[0.12,0.38],[0.18,0.34],[0.06,0.44],
      [0.24,0.42],[0.28,0.36],[0.32,0.44],[0.26,0.50],[0.34,0.50],
      // tv stand cluster (target)
      [0.42,0.54],[0.46,0.52],[0.50,0.56],[0.44,0.60],[0.48,0.58],
      [0.40,0.62],[0.52,0.60],[0.46,0.64],
      [0.16,0.62],[0.22,0.66],[0.26,0.60],[0.30,0.68],[0.34,0.64],
      [0.10,0.56],[0.38,0.72],[0.20,0.74],[0.42,0.76],[0.30,0.78],
    ];
    const targetIdx=[10,11,12,13,14,15,16,17]; // tv stand cluster
    pts.forEach((pt,i)=>{
      const isTarget=targetIdx.includes(i);
      const lit=isTarget&&p>0.4;
      dot(ctx,pt[0]*w*0.65+w*0.05,pt[1]*h,lit?4:2.5,lit?C.green:hexA(C.violet,0.5));
    });
    // bounding box around cluster when lit
    if(p>0.55){
      ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=1.8;ctx.setLineDash([4,3]);
      ctx.strokeRect(w*0.05+0.38*w*0.65,0.50*h,0.15*w*0.65,0.17*h);ctx.restore();
      lab(ctx,'tv stand',w*0.05+0.38*w*0.65,0.50*h-10,C.green,8.5);
    }
    lab(ctx,'point cloud\n(38k voxels)',w*0.05+0.25*w*0.65,h*0.24,C.mut,8.5,'center');
    // query box on right
    const qx=w*0.73,qy=h*0.34;
    rrect(ctx,qx,qy,w*0.24,22,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'query: "tv stand"',qx+6,qy+11,C.amber,9);
    if(p>0.4){arrow(ctx,qx,qy+11,w*0.05+0.5*w*0.65,0.58*h,hexA(C.amber,0.6),1.3);}
    lab(ctx,'open-vocabulary 3D scene understanding with no 3D labels',14,h-12,C.mut);
  };

  /* ovf_feat_field — Gaussians scattered, query hits, splats color up. */
  A.ovf_feat_field=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Distill 2D foundation features into every 3D Gaussian — the field itself is queryable',14,16,C.dim);
    const p=saw(t,4.5);
    // table surface
    rrect(ctx,w*0.08,h*0.72,w*0.55,8,3,hexA(C.mut,0.3),hexA(C.mut,0.12));
    // Gaussians as ellipses (splats) on the tabletop
    const splats=[
      // mug body
      {x:0.28,y:0.58,rx:16,ry:24,col:C.cyan,isHandle:false,score:0.2},
      {x:0.24,y:0.62,rx:14,ry:22,col:C.cyan,isHandle:false,score:0.18},
      {x:0.32,y:0.60,rx:12,ry:20,col:C.cyan,isHandle:false,score:0.22},
      // handle — the target
      {x:0.40,y:0.61,rx:6,ry:10,col:C.coral,isHandle:true,score:0.82},
      {x:0.42,y:0.64,rx:5,ry:8,col:C.coral,isHandle:true,score:0.78},
      {x:0.38,y:0.58,rx:4,ry:7,col:C.coral,isHandle:true,score:0.74},
      // other objects
      {x:0.18,y:0.60,rx:18,ry:12,col:C.violet,isHandle:false,score:0.1},
      {x:0.52,y:0.62,rx:20,ry:14,col:C.green,isHandle:false,score:0.08},
    ];
    splats.forEach(s=>{
      const lit=s.isHandle&&p>0.4;
      const alpha=lit?0.85:0.35;
      ctx.save();ctx.globalAlpha=alpha;
      ctx.fillStyle=s.col;
      ctx.beginPath();ctx.ellipse(s.x*w,s.y*h,s.rx,s.ry,0,0,TAU);ctx.fill();ctx.restore();
      if(lit){ctx.save();ctx.strokeStyle=C.amber;ctx.lineWidth=1.8;
        ctx.beginPath();ctx.ellipse(s.x*w,s.y*h,s.rx+2,s.ry+2,0,0,TAU);ctx.stroke();ctx.restore();}
    });
    // label objects
    lab(ctx,'mug body',0.28*w,h*0.44,hexA(C.cyan,0.7),8,'center');
    lab(ctx,'handle',0.40*w,h*0.44,p>0.4?C.amber:hexA(C.coral,0.5),8,'center');
    // query box
    const qx=w*0.66,qy=h*0.30;
    rrect(ctx,qx,qy,w*0.30,26,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'query:\n"handle of the mug"',qx+8,qy+9,C.amber,8.5);
    if(p>0.35){arrow(ctx,qx,qy+13,0.42*w,h*0.55,hexA(C.amber,0.7),1.3);}
    if(p>0.55){lab(ctx,'312 splats score > 0.55',qx,qy+36,C.green,8.5);}
    lab(ctx,'language-aligned features stored spatially — find the handle, not just the object',14,h-12,C.mut);
  };

  /* ovf_3d_ground — top-down map, desk labeled, left chair selected. */
  A.ovf_3d_ground=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Spatial reasoning over 3D instances — resolve "left of the desk" geometrically',14,16,C.dim);
    const p=saw(t,5);
    // room outline top-down view
    const rx=w*0.08,ry=h*0.26,rw=w*0.55,rh=h*0.56;
    rrect(ctx,rx,ry,rw,rh,6,hexA(C.line,0.6),hexA(C.cyan,0.02));
    lab(ctx,'top-down view',rx+rw/2,ry-10,C.mut,8,'center');
    // objects: desk, 3 chairs
    const desk={x:rx+rw*0.55,y:ry+rh*0.5,w:70,h:40,col:C.amber,label:'desk'};
    const chairs=[
      {x:rx+rw*0.25,y:ry+rh*0.38,r:12,col:C.violet,label:'chair #3',isLeft:false},
      {x:rx+rw*0.22,y:ry+rh*0.62,r:12,col:C.cyan,label:'chair #7',isLeft:true},  // left of desk
      {x:rx+rw*0.7,y:ry+rh*0.28,r:12,col:C.mut,label:'chair #1',isLeft:false},
    ];
    // draw desk
    rrect(ctx,desk.x-desk.w/2,desk.y-desk.h/2,desk.w,desk.h,5,hexA(desk.col,0.8),hexA(desk.col,0.15));
    lab(ctx,desk.label,desk.x,desk.y,desk.col,8.5,'center');
    if(p>0.2){lab(ctx,'CLIP: 0.73',desk.x,desk.y+14,hexA(desk.col,0.9),7.5,'center');}
    // draw chairs
    chairs.forEach(c=>{
      const lit=c.isLeft&&p>0.55;
      dot(ctx,c.x,c.y,c.r,lit?C.cyan:hexA(c.col,p>0.2?0.7:0.4));
      lab(ctx,c.label,c.x+16,c.y,hexA(c.col,0.8),8);
      if(p>0.2){lab(ctx,c.isLeft?'0.58':'0.61',c.x+16,c.y+12,hexA(c.col,0.7),7.5);}
      if(lit){ring(ctx,c.x,c.y,c.r+5,C.amber);}
    });
    // left/right arrow from desk
    if(p>0.4){
      arrow(ctx,desk.x-desk.w/2,desk.y,desk.x-desk.w/2-50,desk.y,C.green,1.4);
      lab(ctx,'left',desk.x-desk.w/2-70,desk.y,C.green,8.5,'center');
      arrow(ctx,desk.x+desk.w/2,desk.y,desk.x+desk.w/2+30,desk.y,hexA(C.mut,0.5),1.2);
      lab(ctx,'right',desk.x+desk.w/2+46,desk.y,hexA(C.mut,0.5),8.5,'center');
    }
    if(p>0.65){lab(ctx,'+87° → left ✓',chairs[1].x+16,chairs[1].y+24,C.amber,8);}
    // query
    const qx=w*0.68,qy=h*0.28;
    rrect(ctx,qx,qy,w*0.28,30,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'query:\n"chair left of desk"',qx+7,qy+9,C.amber,8.5);
    lab(ctx,'zero 3D labels — CLIP recognition in 3D + geometric relation → one referent',14,h-12,C.mut);
  };

  /* ovf_novel_cat — known boxes, unknown object, distance to threshold, cluster. */
  A.ovf_novel_cat=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Unknown object? Measure distance to all known features — above threshold = new category',14,16,C.dim);
    const p=saw(t,5);
    // known categories on left
    const known=[['crop',C.green,h*0.34],['soil',C.amber,h*0.50],['sky',C.cyan,h*0.66]];
    lab(ctx,'known categories',w*0.14,h*0.24,C.mut,8.5,'center');
    known.forEach(k=>{
      rrect(ctx,w*0.04,k[2]-11,w*0.20,22,5,hexA(k[1],0.7),hexA(k[1],0.12));
      lab(ctx,k[0],w*0.14,k[2],k[1],9,'center');
    });
    // unknown object coming in from right
    const ux=Math.max(w*0.50,w*0.90-p*w*0.36);
    const uy=h*0.50;
    rrect(ctx,ux-18,uy-14,36,28,6,C.coral,hexA(C.coral,0.2));
    lab(ctx,'?',ux,uy,C.coral,14,'center');
    lab(ctx,'unknown',ux,uy+22,hexA(C.coral,0.8),8,'center');
    // distance lines
    if(p>0.25){
      known.forEach(k=>{
        arrow(ctx,ux-18,uy,w*0.24,k[2],hexA(C.mut,0.4),1);
      });
      // nearest distance label
      const nearest=0.41;
      lab(ctx,'nearest: '+nearest+' (soil)',w*0.38,uy-14,C.mut,8.5,'center');
    }
    // threshold line
    if(p>0.35){
      const tx=w*0.36;
      ctx.save();ctx.strokeStyle=hexA(C.coral,0.7);ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
      ctx.beginPath();ctx.moveTo(tx,h*0.28);ctx.lineTo(tx,h*0.74);ctx.stroke();ctx.restore();
      lab(ctx,'threshold\n0.35',tx+4,h*0.30,hexA(C.coral,0.8),8);
    }
    // anomaly flag
    if(p>0.50){
      rrect(ctx,w*0.44,uy-14,w*0.18,28,6,C.coral,hexA(C.coral,0.2));
      lab(ctx,'ANOMALY',w*0.53,uy,C.coral,9,'center');
    }
    // new cluster forming
    if(p>0.70){
      lab(ctx,'new prototype:\n"weed-type-A"',w*0.68,uy-10,C.green,8.5,'center');
      ring(ctx,w*0.68,uy+18,12,C.green);
    }
    lab(ctx,'safe open-world perception flags the unknown rather than forcing a wrong label',14,h-12,C.mut);
  };

  /* ovf_parts — mug outline with colored part regions, 'handle' query activates handle. */
  A.ovf_parts=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Below the object: each part gets its own score against your description',14,16,C.dim);
    const p=saw(t,4);
    const queries=['handle of the mug','body of the mug','base of the mug'];
    const qi=Math.floor(saw(t,4.5)*3);
    // mug body as rectangle + handle bump
    const mx=w*0.28,my=h*0.32,mw=80,mh=120;
    // body
    rrect(ctx,mx,my,mw,mh,8,hexA(C.mut,0.5),hexA(C.mut,0.1));
    lab(ctx,'mug',mx+mw/2,my-10,C.mut,9,'center');
    // parts: handle (right bump), body (center), base (bottom strip)
    const parts=[
      {label:'handle',x:mx+mw,y:my+mh*0.32,w:22,h:36,col:C.cyan,qi:0},
      {label:'body',x:mx+4,y:my+8,w:mw-8,h:mh-30,col:C.violet,qi:1},
      {label:'base',x:mx+4,y:my+mh-22,w:mw-8,h:18,col:C.amber,qi:2},
    ];
    parts.forEach(part=>{
      const active=(part.qi===qi);
      const alpha=active?0.75:0.25;
      rrect(ctx,part.x,part.y,part.w,part.h,4,hexA(part.col,alpha),hexA(part.col,alpha*0.3));
      lab(ctx,part.label,part.x+part.w/2,part.y+part.h/2,hexA(part.col,active?1:0.5),8.5,'center');
      if(active){ring(ctx,part.x+part.w/2,part.y+part.h/2,Math.max(part.w,part.h)/2+4,C.amber);}
    });
    // query box
    const qx=w*0.56,qy=h*0.36;
    rrect(ctx,qx,qy,w*0.38,26,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'query:\n"'+queries[qi]+'"',qx+8,qy+8,C.amber,8.5);
    // score bars for each part
    const scores=[[0.0,0.82,0.18],[0.0,0.71,0.88],[0.0,0.44,0.12]];
    const sc=scores[qi];
    parts.forEach((part,i)=>{
      const barx=qx,bary=qy+36+i*22;
      ctx.fillStyle=hexA(i===qi?C.amber:C.mut,0.5);
      ctx.fillRect(barx,bary,sc[i]*w*0.36,10);
      lab(ctx,part.label,barx,bary-2,C.mut,7.5);
    });
    lab(ctx,'manipulation needs part-level precision — "handle" vs. "body" matters to a gripper',14,h-12,C.mut);
  };

  /* ovf_afford — mug outline, task text, handle + spout affordances light up. */
  A.ovf_afford=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Task text → grasp affordance: the VLM infers which part to hold and which way to tilt',14,16,C.dim);
    const p=saw(t,5);
    // mug
    const mx=w*0.30,my=h*0.28,mw=90,mh=130;
    rrect(ctx,mx,my,mw,mh,8,hexA(C.mut,0.4),hexA(C.mut,0.08));
    lab(ctx,'mug',mx+mw/2,my-10,C.mut,9,'center');
    // handle on right
    const hx=mx+mw+2,hy=my+mh*0.30,hw=24,hh=40;
    rrect(ctx,hx,hy,hw,hh,5,hexA(C.cyan,p>0.35?0.9:0.3),hexA(C.cyan,p>0.35?0.2:0.05));
    lab(ctx,'handle',hx+hw/2,hy-10,p>0.35?C.cyan:hexA(C.mut,0.4),8,'center');
    // spout on top
    const spx=mx+mw*0.55,spy=my-18,spw=28,sph=18;
    rrect(ctx,spx,spy,spw,sph,4,hexA(C.amber,p>0.5?0.9:0.3),hexA(C.amber,p>0.5?0.15:0.05));
    lab(ctx,'spout',spx+spw/2,spy+sph+10,p>0.5?C.amber:hexA(C.mut,0.4),8,'center');
    // grasp arrow from handle
    if(p>0.40){
      dot(ctx,hx+hw/2,hy+hh/2,5,C.cyan);
      arrow(ctx,hx+hw,hy+hh/2,hx+hw+36,hy+hh/2,C.cyan,1.6);
      lab(ctx,'grasp here',hx+hw+38,hy+hh/2,C.cyan,8.5);
    }
    // tilt arrow from spout
    if(p>0.55){
      dot(ctx,spx+spw/2,spy+sph/2,4,C.amber);
      arrow(ctx,spx+spw/2,spy,spx+spw/2+30,spy-22,C.amber,1.5);
      lab(ctx,'tilt 45°',spx+spw/2+32,spy-22,C.amber,8.5);
    }
    // task query
    const qx=w*0.08,qy=h*0.74;
    rrect(ctx,qx,qy,w*0.28,26,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'task: "pour the coffee"',qx+8,qy+13,C.amber,9);
    if(p>0.25){
      lab(ctx,'VLM: hold handle, tilt to spout',qx,qy+36,hexA(C.green,0.9),8.5);
    }
    lab(ctx,'language-driven affordance grounds task instructions to physical contact points',14,h-12,C.mut);
  };

  /* ovf_manip_nav — top-down room, robot dot navigates to counter, detection box appears. */
  A.ovf_manip_nav=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Navigate, find, grasp — all driven by one open-vocabulary instruction',14,16,C.dim);
    const p=saw(t,6);
    // room outline
    const rx=w*0.06,ry=h*0.26,rw=w*0.58,rh=h*0.56;
    rrect(ctx,rx,ry,rw,rh,6,hexA(C.line,0.6),hexA(C.cyan,0.02));
    // counter on the right wall of room
    const cx=rx+rw*0.7,cy=ry+rh*0.4,cw=rw*0.22,ch=rh*0.4;
    rrect(ctx,cx,cy,cw,ch,4,hexA(C.amber,0.6),hexA(C.amber,0.12));
    lab(ctx,'counter',cx+cw/2,cy-10,C.amber,8,'center');
    // items on counter
    [[cx+cw*0.2,cy+ch*0.35,C.green,'bottle'],[cx+cw*0.6,cy+ch*0.35,C.violet,'jar']].forEach(obj=>{
      dot(ctx,obj[0],obj[1],6,obj[2]);lab(ctx,obj[3],obj[0],obj[1]+14,hexA(obj[2],0.8),7.5,'center');
    });
    // robot start (bottom-left of room)
    const startX=rx+rw*0.12,startY=ry+rh*0.82;
    // robot destination near bottle
    const destX=cx+cw*0.2,destY=cy+ch*0.35;
    // animate robot moving
    const phase=Math.min(1,p*1.4);
    const robX=startX+(destX-startX)*phase,robY=startY+(destY-startY)*phase;
    dot(ctx,robX,robY,7,C.cyan);
    lab(ctx,'robot',robX+10,robY,C.cyan,8);
    // path dashed
    if(p>0.05){
      ctx.save();ctx.strokeStyle=hexA(C.cyan,0.3);ctx.lineWidth=1.2;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(robX,robY);ctx.stroke();ctx.restore();
    }
    // detection box around bottle when near
    if(p>0.65){
      const bx=destX-14,by=destY-16;
      ctx.save();ctx.strokeStyle=C.green;ctx.lineWidth=1.8;ctx.strokeRect(bx,by,28,32);ctx.restore();
      lab(ctx,'"green bottle" ✓',bx,by-10,C.green,8);
    }
    // grasp indicator
    if(p>0.82){
      arrow(ctx,robX,robY,destX,destY,C.amber,1.6);
      lab(ctx,'grasp',destX+10,destY-8,C.amber,8.5);
    }
    // instruction label
    const qx=w*0.68,qy=h*0.28;
    rrect(ctx,qx,qy,w*0.28,30,5,C.amber,hexA(C.amber,0.1));
    lab(ctx,'instruction:\n"fetch green bottle"',qx+7,qy+9,C.amber,8.5);
    lab(ctx,'open-vocab perception closes the loop: language in, robot action out',14,h-12,C.mut);
  };

  /* ovf_4d — timeline with sliding window, score peak, then frame+track. */
  A.ovf_4d=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'Ground language in time: which window, which object, which track',14,16,C.dim);
    const p=saw(t,5);
    // timeline bar
    const tx=w*0.06,ty=h*0.36,tw=w*0.88,th=10;
    rrect(ctx,tx,ty,tw,th,3,hexA(C.mut,0.4),hexA(C.mut,0.1));
    lab(ctx,'video timeline (3 min)',tx+tw/2,ty-10,C.mut,8.5,'center');
    // time tick marks
    for(let i=0;i<=6;i++){
      const x=tx+i*tw/6;
      ctx.save();ctx.strokeStyle=hexA(C.mut,0.4);ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x,ty);ctx.lineTo(x,ty+th);ctx.stroke();ctx.restore();
      lab(ctx,(i*30)+'s',x,ty+th+10,C.mut,7.5,'center');
    }
    // score trace above timeline
    const peakT=0.61; // peak at ~27s normalized
    for(let i=0;i<100;i++){
      const fx=tx+i*tw/100;
      const ft=i/100;
      const score=0.1+0.74*Math.exp(-Math.pow((ft-peakT)*8,2));
      const sy=ty-score*50;
      if(i===0){ctx.beginPath();ctx.moveTo(fx,ty);}else{ctx.lineTo(fx,ty-score*50);}
    }
    ctx.save();ctx.strokeStyle=hexA(C.green,0.6);ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
    // sliding window sweeping
    const winP=Math.min(peakT,p*0.9);
    const winW=tw*0.08;
    const winX=tx+winP*tw;
    ctx.save();ctx.fillStyle=hexA(C.cyan,0.15);ctx.fillRect(winX,ty-52,winW,th+52);
    ctx.strokeStyle=hexA(C.cyan,0.5);ctx.lineWidth=1.3;ctx.strokeRect(winX,ty-52,winW,th+52);ctx.restore();
    // score peak annotation
    const peakX=tx+peakT*tw;
    if(p>0.55){
      dot(ctx,peakX,ty-37,4,C.green);
      lab(ctx,'score 0.84',peakX+6,ty-44,C.green,8.5);
      rrect(ctx,peakX-winW/2,ty+22,winW*1.6,20,4,C.amber,hexA(C.amber,0.15));
      lab(ctx,'27.4s–31.8s',peakX-winW/2+4,ty+32,C.amber,8.5);
    }
    // within-window: bounding box on mug + track
    if(p>0.70){
      const fx=w*0.5,fy=h*0.68,fw=60,fh=50;
      rrect(ctx,fx,fy,fw,fh,4,hexA(C.line,0.5),hexA(C.cyan,0.04));
      // mug box inside frame
      rrect(ctx,fx+14,fy+10,32,30,3,C.green,hexA(C.green,0.15));
      lab(ctx,'mug',fx+30,fy+25,C.green,8,'center');
      // track line
      ctx.save();ctx.strokeStyle=hexA(C.amber,0.7);ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(fx+30,fy);
      for(let i=1;i<6;i++){ctx.lineTo(fx+30+i*8,fy-i*5);}ctx.stroke();ctx.restore();
      lab(ctx,'4.5s track',fx+72,fy-22,C.amber,8);
    }
    lab(ctx,'identity-aware temporal grounding finds the moment and the moving object',14,h-12,C.mut);
  };

  /* ovf_domain — 4 domain icons, CLIP scores before/after domain adaptation. */
  A.ovf_domain=function(ctx,w,h,t){clear(ctx,w,h);
    lab(ctx,'CLIP breaks on thermal, satellite, medical — adapt the features to the domain',14,16,C.dim);
    const p=saw(t,5);
    const adapted=p>0.55;
    const domains=[
      {label:'photo',emoji:'📷',col:C.cyan,before:0.82,after:0.82},
      {label:'satellite',emoji:'🛰',col:C.violet,before:0.21,after:0.68},
      {label:'thermal',emoji:'🌡',col:C.amber,before:0.18,after:0.61},
      {label:'medical',emoji:'🏥',col:C.coral,before:0.14,after:0.58},
    ];
    const bx=w*0.06,bw=w*0.18,bh=h*0.38,bgy=h*0.28;
    domains.forEach((d,i)=>{
      const x=bx+i*(bw+w*0.03);
      rrect(ctx,x,bgy,bw,bh,8,hexA(d.col,0.5),hexA(d.col,0.08));
      lab(ctx,d.label,x+bw/2,bgy+14,d.col,9,'center');
      // score bar below icon
      const score=adapted?d.after:d.before;
      const barh=(bh-28)*score;
      const barY=bgy+bh-12-barh;
      ctx.fillStyle=hexA(score>0.5?C.green:C.coral,0.75);
      ctx.fillRect(x+8,barY,bw-16,barh);
      lab(ctx,score.toFixed(2),x+bw/2,bgy+bh-8,score>0.5?C.green:C.coral,9,'center');
      // "before" label vs adapted
      if(i>0&&adapted&&p>0.65){
        const improv=((d.after-d.before)/d.before*100).toFixed(0);
        lab(ctx,'+'+improv+'%',x+bw/2,bgy+bh+14,C.green,8,'center');
      }
    });
    // label the two phases
    if(!adapted){
      lab(ctx,'off-the-shelf CLIP features',w*0.5,bgy+bh+22,hexA(C.coral,0.8),8.5,'center');
    } else {
      lab(ctx,'after domain-adapted distillation',w*0.5,bgy+bh+22,hexA(C.green,0.9),8.5,'center');
    }
    // adaptation arrow
    if(p>0.45&&p<0.70){
      lab(ctx,'↓ cross-modal distillation',w*0.5,bgy+bh+38,C.amber,9,'center');
    }
    lab(ctx,'cross-modal distillation transfers language alignment across the domain gap',14,h-12,C.mut);
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
