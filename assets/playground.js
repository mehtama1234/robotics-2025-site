/* playground.js — interactive first-principles math widgets. Each is the real math,
   driven by sliders. No framework; event-driven redraw + one shared rAF loop. */
(function(){
 var C={bg:'#0B0E1A',ink:'#E7EFF1',mut:'#8B9BA2',dim:'#5C6784',grid:'#1A2136',
        opt:'#F5A65B',dyn:'#FF6B8A',inf:'#5FD0BF',geo:'#B58CF0',good:'#6FCf7f',bad:'#FF6B5C',line:'#7A88D6'};
 var TAU=Math.PI*2;
 function ctxOf(id){var cv=document.getElementById(id);if(!cv)return null;
   function fit(){var dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=parseInt(cv.getAttribute('height'))||300;
     cv.width=w*dpr;cv.height=h*dpr;var x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);cv._w=w;cv._h=h;}
   fit();var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,150);});
   return cv;}
 function lab(x,s,px,py,col,sz,al){x.save();x.font=(sz||11)+'px ui-monospace,Menlo,monospace';x.textAlign=al||'left';
   x.textBaseline='middle';x.fillStyle=col;String(s).split('\n').forEach(function(l,i){x.fillText(l,px,py+i*((sz||11)+2));});x.restore();}
 function dot(x,px,py,r,col){x.fillStyle=col;x.beginPath();x.arc(px,py,r,0,TAU);x.fill();}
 function on(id,f){var e=document.getElementById(id);if(e)e.addEventListener('input',f);}
 function click(id,f){var e=document.getElementById(id);if(e)e.addEventListener('click',f);}
 function val(id){return parseFloat(document.getElementById(id).value);}
 function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
 var ticks=[];
 function raf(){ticks.forEach(function(t){try{t();}catch(e){}});requestAnimationFrame(raf);}

 /* ---------- 1. GRADIENT DESCENT ---------- */
 (function(){var cv=ctxOf('c_gd');if(!cv)return;var x=cv.getContext('2d');
  var xs=3.0,traj=[],stepT=0;
  function reset(){xs=3.0;traj=[xs];stepT=0;}
  reset();
  on('s_lr',function(){set('v_lr',val('s_lr').toFixed(2));reset();});
  on('s_k',function(){set('v_k',val('s_k').toFixed(1));reset();});
  click('b_gd',reset);
  ticks.push(function(){var w=cv._w,h=cv._h,lr=val('s_lr'),k=val('s_k');
   x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var cx=w/2,gy=h-40,sc=(w*0.42)/3.2,vsc=(h-70)/(0.5*3.2*3.2);
   function X(wx){return cx+wx*sc;} function Y(wy){return gy-wy*vsc;}
   // bowl f=0.5k x^2
   x.strokeStyle=C.grid;x.lineWidth=1;for(var gi=-3;gi<=3;gi++){x.beginPath();x.moveTo(X(gi),20);x.lineTo(X(gi),gy);x.stroke();}
   x.strokeStyle=C.dim;x.lineWidth=1.6;x.beginPath();
   for(var px=-3.2;px<=3.2;px+=0.05){var yy=0.5*k*px*px;var Yp=Y(yy);if(px<=-3.2+0.06)x.moveTo(X(px),Yp);else x.lineTo(X(px),Yp);}x.stroke();
   lab(x,'f(x) = &frac12; k x&sup2;'.replace('&frac12;','1/2').replace('&sup2;','^2'),14,18,C.mut,11);
   // step every ~26 frames
   stepT++;if(stepT>=26&&traj.length<60){stepT=0;var cur=traj[traj.length-1];var nx=cur-lr*(k*cur);traj.push(nx);}
   // draw trajectory
   for(var i=0;i<traj.length;i++){var wx=traj[i],wy=0.5*k*wx*wx;
     if(i>0){var pxw=traj[i-1],pyw=0.5*k*pxw*pxw;x.strokeStyle='rgba(245,166,91,0.5)';x.lineWidth=1.4;
       x.beginPath();x.moveTo(X(pxw),Y(pyw));x.lineTo(X(wx),Y(wy));x.stroke();}
     dot(x,X(wx),Y(wy),i===traj.length-1?6:3,i===traj.length-1?C.opt:'rgba(245,166,91,0.6)');}
   var prod=lr*k, r=document.getElementById('r_gd');
   var st=prod<1?'converging smoothly':(prod<2?'overshooting each step, still converging':(Math.abs(prod-2)<0.03?'marginal — it will not settle':'DIVERGING — flying out of the bowl'));
   var col=prod<1?C.good:(prod<2?C.opt:C.bad);
   if(r)r.innerHTML='&eta;&middot;k = <b>'+prod.toFixed(2)+'</b> &nbsp; step '+traj.length+' &nbsp; &rarr; <b style="color:'+col+'">'+st+'</b> &nbsp;&middot;&nbsp; the rule converges exactly when 0 &lt; &eta;k &lt; 2.';
  });})();

 /* ---------- 2. DIFFUSION SCORE WALK ---------- */
 (function(){var cv=ctxOf('c_df');if(!cv)return;var x=cv.getContext('2d');
  var seed=1,path=[],prog=0;
  function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
  var modes=[[-1.4,0.2],[1.4,-0.2]];
  function score(p,sig){ // grad log of 2-gaussian mixture with std sig
    var g=[0,0],ps=0,ws=[];
    for(var m=0;m<2;m++){var dx=p[0]-modes[m][0],dy=p[1]-modes[m][1];var d2=dx*dx+dy*dy;var wgt=Math.exp(-d2/(2*sig*sig));ws.push(wgt);ps+=wgt;}
    if(ps<1e-12)return[0,0];
    for(var m2=0;m2<2;m2++){var dx2=p[0]-modes[m2][0],dy2=p[1]-modes[m2][1];var a=ws[m2]/ps;g[0]+=a*(-dx2/(sig*sig));g[1]+=a*(-dy2/(sig*sig));}
    return g;}
  function build(){var steps=Math.round(val('s_st')),guid=val('s_g');
   seed=Math.round(1+seed*7)&0x7fffffff; // vary
   var p=[(rnd()*2-1)*2.6,(rnd()*2-1)*1.6];path=[p.slice()];
   for(var i=0;i<steps;i++){var sig=2.4*(1-i/steps)+0.05;var s=score(p,sig);
     var dt=1.4/steps;p=[p[0]+guid*s[0]*dt*sig*sig,p[1]+guid*s[1]*dt*sig*sig];path.push(p.slice());}
   prog=0;}
  function reseed(){seed=(seed*48271+1)&0x7fffffff;build();}
  build();
  on('s_st',function(){set('v_st',Math.round(val('s_st')));build();});
  on('s_g',function(){set('v_g',val('s_g').toFixed(1));build();});
  click('b_df',reseed);
  ticks.push(function(){var w=cv._w,h=cv._h;x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var cx=w/2,cy=h/2,sc=(w*0.32)/2.6;
   function X(p){return cx+p[0]*sc;}function Y(p){return cy+p[1]*sc*0.9;}
   // score field arrows (coarse)
   x.strokeStyle='rgba(95,208,191,0.22)';x.fillStyle='rgba(95,208,191,0.22)';x.lineWidth=1;
   for(var gx=-2.4;gx<=2.4;gx+=0.6)for(var gy2=-1.5;gy2<=1.5;gy2+=0.6){var s=score([gx,gy2],0.7);var mn=Math.hypot(s[0],s[1])+1e-6;
     var ux=s[0]/mn*10,uy=s[1]/mn*10;var ax=X([gx,gy2]),ay=Y([gx,gy2]);x.beginPath();x.moveTo(ax,ay);x.lineTo(ax+ux,ay+uy*0.9);x.stroke();}
   // modes
   for(var m=0;m<2;m++){x.strokeStyle='rgba(255,107,138,0.5)';x.lineWidth=1.5;x.beginPath();x.arc(X(modes[m]),Y(modes[m]),13,0,TAU);x.stroke();
     dot(x,X(modes[m]),Y(modes[m]),4,C.dyn);}
   lab(x,'two data modes; arrows = the score (toward denser data)',14,18,C.mut,10.5);
   // animate along path
   if(prog<path.length-1)prog+=0.6;
   var pi=Math.min(path.length-1,Math.floor(prog));
   x.strokeStyle='rgba(255,107,138,0.55)';x.lineWidth=1.6;x.beginPath();
   for(var i=0;i<=pi;i++){var P=path[i];if(i===0)x.moveTo(X(P),Y(P));else x.lineTo(X(P),Y(P));}x.stroke();
   dot(x,X(path[0]),Y(path[0]),3.5,C.dim);
   var cP=path[pi];dot(x,X(cP),Y(cP),6,C.ink);
   // verdict at end
   var r=document.getElementById('r_df');
   if(pi>=path.length-1){var end=path[path.length-1];var d0=Math.hypot(end[0]-modes[0][0],end[1]-modes[0][1]);
     var d1=Math.hypot(end[0]-modes[1][0],end[1]-modes[1][1]);var dm=Math.min(d0,d1);
     var landed=dm<0.35, mid=Math.abs(end[0])<0.5;
     var msg=landed?('landed in mode '+(d0<d1?'A (left)':'B (right)')):(mid?'STALLED in the empty middle — too few steps':'still drifting — needs more steps');
     var col=landed?C.good:C.bad;
     if(r)r.innerHTML='steps '+Math.round(val('s_st'))+' &nbsp; &rarr; <b style="color:'+col+'">'+msg+'</b> &nbsp;&middot;&nbsp; the walk follows the score into <b>one</b> mode, never the average of both.';}
   else if(r)r.innerHTML='walking noise &rarr; data along the score&hellip;';
  });})();

 /* ---------- 3. FEEDBACK CONTROL ---------- */
 (function(){var cv=ctxOf('c_fb');if(!cv)return;var x=cv.getContext('2d');
  var pos=1.2,vel=0,dt=0.03,hist=[];
  click('b_fb',function(){vel+=6;});
  on('s_K',function(){set('v_K',val('s_K').toFixed(1));});
  on('s_B',function(){set('v_B',val('s_B').toFixed(1));});
  ticks.push(function(){var w=cv._w,h=cv._h,K=val('s_K'),B=val('s_B');
   // integrate a couple substeps: xdd = -K x - B xd  (target 0)
   for(var s=0;s<2;s++){var acc=-K*pos-B*vel;vel+=acc*dt;pos+=vel*dt;}
   if(!isFinite(pos)){pos=0;vel=0;}
   pos=Math.max(-3,Math.min(3,pos));
   hist.push(pos);if(hist.length>Math.floor(cv._w*0.6))hist.shift();
   x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var midY=h*0.5,sc=(h*0.36)/3;
   x.strokeStyle=C.grid;x.beginPath();x.moveTo(0,midY);x.lineTo(w,midY);x.stroke();
   lab(x,'target',w-58,midY-10,C.dim,10);
   // history trace (right-aligned)
   var x0=w-hist.length;x.strokeStyle=C.inf;x.lineWidth=1.6;x.beginPath();
   for(var i=0;i<hist.length;i++){var py=midY-hist[i]*sc;if(i===0)x.moveTo(x0+i,py);else x.lineTo(x0+i,py);}x.stroke();
   // the mass at current pos (left gauge)
   var gx=70;dot(x,gx,midY-pos*sc,8,C.inf);x.strokeStyle=C.dim;x.beginPath();x.moveTo(gx,midY);x.lineTo(gx,midY-pos*sc);x.stroke();
   lab(x,'position error over time  (u = &minus;K&middot;e &minus; B&middot;rate)'.replace('&minus;','-').replace('&minus;','-').replace('&middot;','.').replace('&middot;','.'),14,18,C.mut,10.5);
   var zeta=B/(2*Math.sqrt(Math.max(K,1e-6)));
   var st=zeta<0.9?'underdamped — it overshoots and rings':(zeta<1.1?'~critically damped — fastest clean settle':'overdamped — sluggish, no overshoot');
   var col=zeta<0.9?C.opt:(zeta<1.1?C.good:C.dim);
   var r=document.getElementById('r_fb');
   if(r)r.innerHTML='damping ratio &zeta; = B/(2&#8730;K) = <b>'+zeta.toFixed(2)+'</b> &nbsp; &rarr; <b style="color:'+col+'">'+st+'</b> &nbsp;&middot;&nbsp; press <b>shove it</b> to kick the mass and watch it recover.';
  });})();

 /* ---------- 4. CBF SAFETY ---------- */
 (function(){var cv=ctxOf('c_cbf');if(!cv)return;var x=cv.getContext('2d');
  var path=[],prog=0,minD=99;
  var goal=[10,0],c=[5,0];
  function build(){var alpha=val('s_a'),r=val('s_r');var p=[0,0];path=[p.slice()];minD=99;
   var dt=0.06,k=1.2;
   for(var i=0;i<260;i++){var un=[k*(goal[0]-p[0]),k*(goal[1]-p[1])];
     var rel=[p[0]-c[0],p[1]-c[1]];var h=rel[0]*rel[0]+rel[1]*rel[1]-r*r;
     var lhs=2*(rel[0]*un[0]+rel[1]*un[1]);var rhs=-alpha*h;
     var u=un.slice();
     if(lhs<rhs){var nn=2*(rel[0]*rel[0]+rel[1]*rel[1])+1e-6;var d=(rhs-lhs)/nn;u=[un[0]+d*rel[0],un[1]+d*rel[1]];}
     p=[p[0]+u[0]*dt,p[1]+u[1]*dt];path.push(p.slice());
     var dc=Math.hypot(p[0]-c[0],p[1]-c[1]);if(dc<minD)minD=dc;
     if(Math.hypot(p[0]-goal[0],p[1]-goal[1])<0.2)break;}
   prog=0;}
  build();
  on('s_a',function(){set('v_a',val('s_a').toFixed(1));build();});
  on('s_r',function(){set('v_r',val('s_r').toFixed(1));build();});
  click('b_cbf',build);
  ticks.push(function(){var w=cv._w,h=cv._h,r=val('s_r');x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var ox=50,sc=(w-90)/10.5,cy=h/2;
   function X(p){return ox+p[0]*sc;}function Y(p){return cy-p[1]*sc;}
   // obstacle
   x.fillStyle='rgba(255,107,92,0.12)';x.beginPath();x.arc(X(c),Y(c),r*sc,0,TAU);x.fill();
   x.strokeStyle='rgba(255,107,92,0.7)';x.lineWidth=1.5;x.beginPath();x.arc(X(c),Y(c),r*sc,0,TAU);x.stroke();
   // nominal straight line
   x.strokeStyle='rgba(140,150,180,0.4)';x.setLineDash([4,4]);x.lineWidth=1.2;x.beginPath();x.moveTo(X([0,0]),Y([0,0]));x.lineTo(X(goal),Y(goal));x.stroke();x.setLineDash([]);
   // goal + start
   dot(x,X(goal),Y(goal),6,C.good);lab(x,'goal',X(goal)+9,Y(goal),C.mut,10);
   dot(x,X([0,0]),Y([0,0]),4,C.dim);
   // filtered path
   if(prog<path.length-1)prog+=1.4;var pi=Math.min(path.length-1,Math.floor(prog));
   x.strokeStyle=C.geo;x.lineWidth=2;x.beginPath();
   for(var i=0;i<=pi;i++){var P=path[i];if(i===0)x.moveTo(X(P),Y(P));else x.lineTo(X(P),Y(P));}x.stroke();
   dot(x,X(path[pi]),Y(path[pi]),6,C.ink);
   lab(x,'straight = what it wants; curve = the safety filter bending it',14,18,C.mut,10.5);
   var safe=minD>=r-0.02, graze=minD<r+0.15;
   var msg=!safe?'CLIPPED the obstacle':(graze?'grazing the edge — filter barely holds':'clears with a comfortable berth');
   var col=!safe?C.bad:(graze?C.opt:C.good);
   var rr=document.getElementById('r_cbf');
   if(rr)rr.innerHTML='min distance <b>'+minD.toFixed(2)+'</b> vs radius '+r.toFixed(2)+' &nbsp; &rarr; <b style="color:'+col+'">'+msg+'</b> &nbsp;&middot;&nbsp; bigger &alpha; lets it brake later and cut the corner closer.';
  });})();

 /* ---------- 5. ATTENTION TEMPERATURE ---------- */
 (function(){var cv=ctxOf('c_att');if(!cv)return;var x=cv.getContext('2d');
  var N=6,labels=['k1','k2','k3','k4','k5','k6'];
  var base=[2.4,1.7,1.4,0.7,0.1,-0.5];
  function reroll(){base=[];for(var i=0;i<N;i++){base.push(3.0*Math.random()-0.7);}base.sort(function(a,b){return b-a;});}
  click('b_att',reroll);
  on('s_T',function(){set('v_T',val('s_T').toFixed(2));});
  on('s_sp',function(){set('v_sp',val('s_sp').toFixed(2));});
  ticks.push(function(){var w=cv._w,h=cv._h,T=val('s_T'),sp=val('s_sp');
   x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var s=base.map(function(v){return v*sp;});
   var lg=s.map(function(v){return v/T;});
   var mx=Math.max.apply(null,lg);
   var ex=lg.map(function(v){return Math.exp(v-mx);});
   var Z=ex.reduce(function(a,b){return a+b;},0);
   var wts=ex.map(function(v){return v/Z;});
   var wmax=Math.max.apply(null,wts);
   var m=52,bw=(w-2*m)/N,gy=h-52,top=46;
   x.strokeStyle=C.grid;x.beginPath();x.moveTo(m,gy);x.lineTo(w-m,gy);x.stroke();
   for(var i=0;i<N;i++){var bwid=bw*0.62,bx=m+i*bw+(bw-bwid)/2;
     var hgt=(gy-top)*wts[i];var by=gy-hgt;
     x.fillStyle=(wts[i]===wmax)?C.line:'rgba(122,136,214,0.42)';
     x.fillRect(bx,by,bwid,hgt);
     lab(x,labels[i],bx+bwid/2,gy+13,C.mut,10.5,'center');
     lab(x,'s='+s[i].toFixed(1),bx+bwid/2,gy+25,C.dim,9,'center');
     lab(x,(wts[i]*100).toFixed(0)+'%',bx+bwid/2,by-8,(wts[i]===wmax)?C.ink:C.mut,10.5,'center');}
   lab(x,'attention weight per key   w_i = exp(s_i/T) / sum_j exp(s_j/T)',14,18,C.mut,10.5);
   var H=0;for(var j=0;j<N;j++){if(wts[j]>1e-9)H-=wts[j]*Math.log(wts[j]);}
   var eff=Math.exp(H);
   var st=eff<1.4?'razor focus — almost all on one key':(eff<3?'focused on a few keys':(eff<N-0.6?'spread across many keys':'nearly uniform — no focus left'));
   var col=eff<1.4?C.good:(eff<3?C.line:C.opt);
   var r=document.getElementById('r_att');
   if(r)r.innerHTML='T = <b>'+T.toFixed(2)+'</b> &nbsp; entropy H = <b>'+H.toFixed(2)+'</b> &nbsp; effective keys attended exp(H) = <b>'+eff.toFixed(2)+'</b> of '+N+' &nbsp; &rarr; <b style="color:'+col+'">'+st+'</b>';
  });})();

 /* ---------- 6. KALMAN FUSION ---------- */
 (function(){var cv=ctxOf('c_kf');if(!cv)return;var x=cv.getContext('2d');
  var est=0,P=1,hist=[],t=0;
  function gauss(){var u=Math.random()||1e-9,v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v);}
  function reset(){est=0;P=1;hist=[];t=0;}
  reset();
  click('b_kf',reset);
  on('s_R',function(){set('v_R',val('s_R').toFixed(2));});
  on('s_Q',function(){set('v_Q',val('s_Q').toFixed(3));});
  ticks.push(function(){var w=cv._w,h=cv._h,R=val('s_R'),Q=val('s_Q');
   t+=0.03;var truth=1.2*Math.sin(t*0.9)+0.5*Math.sin(t*0.37+1);
   var meas=truth+gauss()*Math.sqrt(R);
   P+=Q;var K=P/(P+R);est=est+K*(meas-est);P=(1-K)*P;
   hist.push([truth,meas,est]);var maxN=Math.floor(cv._w*0.55);if(hist.length>maxN)hist.shift();
   x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var midY=h*0.52,sc=(h*0.32)/2.2,x0=w-hist.length-24;
   x.strokeStyle=C.grid;x.beginPath();x.moveTo(0,midY);x.lineTo(w,midY);x.stroke();
   for(var i=0;i<hist.length;i++){dot(x,x0+i,midY-hist[i][1]*sc,1.4,'rgba(255,107,138,0.5)');}
   x.strokeStyle='rgba(140,150,180,0.6)';x.setLineDash([4,3]);x.lineWidth=1.3;x.beginPath();
   for(var i2=0;i2<hist.length;i2++){var py=midY-hist[i2][0]*sc;if(i2===0)x.moveTo(x0+i2,py);else x.lineTo(x0+i2,py);}x.stroke();x.setLineDash([]);
   x.strokeStyle=C.inf;x.lineWidth=1.9;x.beginPath();
   for(var i3=0;i3<hist.length;i3++){var py3=midY-hist[i3][2]*sc;if(i3===0)x.moveTo(x0+i3,py3);else x.lineTo(x0+i3,py3);}x.stroke();
   lab(x,'dashed = truth    dots = noisy sensor    teal = Kalman estimate',14,18,C.mut,10.5);
   var Kss=P/(P+R);
   var st=Kss<0.14?'trusts the model — smooth but lags the truth':(Kss<0.5?'balanced blend of model and sensor':'chases the sensor — responsive but jittery');
   var col=Kss<0.14?C.line:(Kss<0.5?C.good:C.opt);
   var r=document.getElementById('r_kf');
   if(r)r.innerHTML='steady-state gain K = &sigma;&sup2;/(&sigma;&sup2;+R) = <b>'+Kss.toFixed(2)+'</b> &nbsp; &rarr; <b style="color:'+col+'">'+st+'</b> &nbsp;&middot;&nbsp; more sensor noise R &rarr; smaller K &rarr; lean on the prediction.';
  });})();

 /* ---------- 7. CAPTURE POINT ---------- */
 (function(){var cv=ctxOf('c_cp');if(!cv)return;var x=cv.getContext('2d');
  var g=9.81,foot0=0,footHalf=0.12,path=[],prog=0,plantX=null,xi=0,fell=false;
  function build(){var v0=val('s_push'),L=val('s_L'),maxstep=val('s_reach');
   var om=Math.sqrt(g/L),xpos=foot0,v=v0,dt=0.02,pivot=foot0,planted=false,tt=0,react=0.18;
   path=[];plantX=null;fell=false;xi=xpos+v/om;
   for(var i=0;i<520;i++){tt+=dt;
     var acc=om*om*(xpos-pivot);v+=acc*dt;xpos+=v*dt;
     if(!planted&&tt>=react){var target=xpos+v/om;var maxT=foot0+footHalf+maxstep;
       plantX=(target<=maxT)?target:maxT;pivot=plantX;planted=true;}
     path.push([xpos,v,pivot,planted]);
     if(planted&&Math.abs(v)<0.02)break;
     if(xpos>foot0+maxstep+3){fell=true;break;}}
   prog=0;}
  build();
  click('b_cp',build);
  on('s_push',function(){set('v_push',val('s_push').toFixed(2));build();});
  on('s_reach',function(){set('v_reach',val('s_reach').toFixed(2));build();});
  on('s_L',function(){set('v_L',val('s_L').toFixed(2));build();});
  ticks.push(function(){var w=cv._w,h=cv._h,L=val('s_L');
   x.fillStyle=C.bg;x.fillRect(0,0,w,h);
   var ground=h-46,ox=w*0.26,sc=(w*0.52)/2.6;
   function X(wx){return ox+wx*sc;}
   x.strokeStyle=C.grid;x.beginPath();x.moveTo(0,ground);x.lineTo(w,ground);x.stroke();
   x.strokeStyle=C.mut;x.lineWidth=4;x.beginPath();x.moveTo(X(foot0-footHalf),ground);x.lineTo(X(foot0+footHalf),ground);x.stroke();
   lab(x,'stance foot',X(foot0),ground+14,C.dim,9,'center');
   x.strokeStyle=C.opt;x.setLineDash([3,3]);x.lineWidth=1.2;x.beginPath();x.moveTo(X(xi),ground);x.lineTo(X(xi),ground-78);x.stroke();x.setLineDash([]);
   dot(x,X(xi),ground,3.5,C.opt);lab(x,'capture pt',X(xi),ground+14,C.opt,9,'center');
   if(prog<path.length-1)prog+=1.5;var pi=Math.min(path.length-1,Math.floor(prog));
   var Pp=path[pi],xpos=Pp[0],v=Pp[1],pivot=Pp[2],planted=Pp[3];
   var comH=L*95,comX=X(xpos),comY=ground-comH;
   x.strokeStyle=C.dim;x.lineWidth=2;x.beginPath();x.moveTo(X(pivot),ground);x.lineTo(comX,comY);x.stroke();
   if(planted&&plantX!==null&&Math.abs(plantX-foot0)>footHalf){
     x.strokeStyle=C.dyn;x.lineWidth=4;x.beginPath();x.moveTo(X(plantX-footHalf),ground);x.lineTo(X(plantX+footHalf),ground);x.stroke();
     lab(x,'step',X(plantX),ground+26,C.dyn,9,'center');}
   dot(x,comX,comY,8,C.dyn);
   x.strokeStyle=C.ink;x.lineWidth=1.5;x.beginPath();x.moveTo(comX,comY);x.lineTo(comX+v*22,comY);x.stroke();
   lab(x,'shoved body = inverted pendulum;  capture point  xi = x + v/omega',14,18,C.mut,10.5);
   var inSupport=Math.abs(xi-foot0)<=footHalf+1e-6;
   var stepLen=(plantX!==null)?(plantX-(foot0+footHalf)):0;
   var msg,col;
   if(inSupport){msg='capture point inside the foot — the ankle holds, no step needed';col=C.good;}
   else if(!fell){msg='steps '+Math.max(0,stepLen).toFixed(2)+' m to the capture point &rarr; comes to rest';col=C.line;}
   else{msg='capture point beyond leg reach — the step falls short, it topples';col=C.bad;}
   var r=document.getElementById('r_cp');
   if(r)r.innerHTML='&omega; = &#8730;(g/L) = <b>'+Math.sqrt(g/L).toFixed(2)+'</b>/s &nbsp; capture point at <b>'+xi.toFixed(2)+'</b> m &nbsp; &rarr; <b style="color:'+col+'">'+msg+'</b> &nbsp;&middot;&nbsp; taller body (bigger L) falls slower, so &xi; sits nearer the foot.';
  });})();

 requestAnimationFrame(raf);
})();
