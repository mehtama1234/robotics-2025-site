/* splat-viewer.js — a tiny self-contained WebGL2 Gaussian-splat viewer.
   Loads a standard .splat file, renders each Gaussian as a depth-sorted,
   view-facing billboard with a gaussian falloff (correct for the isotropic
   splats in our generated demo), premultiplied "over" blending, back-to-front.
   Orbit: drag to rotate, scroll/pinch to zoom. Degrades to a message on failure. */
(function(){
  const cv = document.getElementById('splatcanvas');
  const note = document.getElementById('splatnote');
  if(!cv) return;
  function fail(msg){ if(note){note.textContent = msg; note.style.display='block';} cv.style.display='none'; }
  let gl;
  try { gl = cv.getContext('webgl2', {antialias:false, premultipliedAlpha:true, alpha:true}); } catch(e){}
  if(!gl){ fail('Your browser has no WebGL2 — the fly-through video above shows the same scene.'); return; }

  const VS = `#version 300 es
  precision highp float;
  uniform mat4 u_view, u_proj;
  in vec2 a_corner; in vec3 a_center; in float a_scale; in vec4 a_color;
  out vec2 v_corner; out vec4 v_color;
  void main(){
    vec4 c = u_view * vec4(a_center, 1.0);
    c.xy += a_corner * (a_scale * 3.0);      // billboard, quad spans ~3 sigma
    gl_Position = u_proj * c;
    v_corner = a_corner; v_color = a_color;
  }`;
  const FS = `#version 300 es
  precision highp float;
  in vec2 v_corner; in vec4 v_color; out vec4 frag;
  void main(){
    float r2 = dot(v_corner, v_corner);      // corner in [-1,1] -> r2 in [0,2]
    float a = v_color.a * exp(-4.5 * r2);    // corner=1 == 3 sigma
    if(a < 0.004) discard;
    frag = vec4(v_color.rgb * a, a);         // premultiplied
  }`;

  function sh(type, src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ throw new Error(gl.getShaderInfoLog(s)); } return s; }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch(e){ fail('WebGL shader error — the fly-through video above shows the same scene.'); return; }

  const loc = n => gl.getAttribLocation(prog, n);
  const uni = n => gl.getUniformLocation(prog, n);

  fetch('assets/gaussian-splatting/demo.splat')
    .then(r => { if(!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(start)
    .catch(() => fail('Could not load the splat file — the fly-through video above shows the same scene.'));

  function start(ab){
    const bytes = new Uint8Array(ab);
    const N = Math.floor(bytes.length / 32);
    // source arrays
    const src = { cx:new Float32Array(N), cy:new Float32Array(N), cz:new Float32Array(N),
                  s:new Float32Array(N), r:new Uint8Array(N), g:new Uint8Array(N), b:new Uint8Array(N), a:new Uint8Array(N) };
    const dv = new DataView(ab);
    for(let i=0;i<N;i++){ const o=i*32;
      src.cx[i]=dv.getFloat32(o,true); src.cy[i]=dv.getFloat32(o+4,true); src.cz[i]=dv.getFloat32(o+8,true);
      src.s[i]=dv.getFloat32(o+12,true);
      src.r[i]=bytes[o+24]; src.g[i]=bytes[o+25]; src.b[i]=bytes[o+26]; src.a[i]=bytes[o+27];
    }

    // static quad (triangle strip corners)
    const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc('a_corner')); gl.vertexAttribPointer(loc('a_corner'),2,gl.FLOAT,false,0,0);

    // interleaved instance buffer: [cx cy cz scale | rgba] = 20 bytes/instance
    const STRIDE = 20;
    const inst = new ArrayBuffer(N*STRIDE);
    const instF = new Float32Array(inst);   // stride 5 floats
    const instB = new Uint8Array(inst);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, inst, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc('a_center')); gl.vertexAttribPointer(loc('a_center'),3,gl.FLOAT,false,STRIDE,0); gl.vertexAttribDivisor(loc('a_center'),1);
    gl.enableVertexAttribArray(loc('a_scale'));  gl.vertexAttribPointer(loc('a_scale'),1,gl.FLOAT,false,STRIDE,12); gl.vertexAttribDivisor(loc('a_scale'),1);
    gl.enableVertexAttribArray(loc('a_color'));  gl.vertexAttribPointer(loc('a_color'),4,gl.UNSIGNED_BYTE,true,STRIDE,16); gl.vertexAttribDivisor(loc('a_color'),1);

    // depth sort scratch
    const order = new Uint32Array(N); for(let i=0;i<N;i++) order[i]=i;
    const dist = new Float32Array(N);

    // camera state
    let yaw=0.7, pitch=0.5, distCam=4.2, needSort=true;
    const target=[0,0,0];
    function camPos(){ const cp=Math.cos(pitch); return [ target[0]+distCam*cp*Math.sin(yaw), target[1]+distCam*Math.sin(pitch), target[2]+distCam*cp*Math.cos(yaw) ]; }

    function sortAndUpload(){
      const cp=camPos();
      for(let i=0;i<N;i++){ const dx=src.cx[i]-cp[0],dy=src.cy[i]-cp[1],dz=src.cz[i]-cp[2]; dist[i]=dx*dx+dy*dy+dz*dz; }
      Array.prototype.sort.call(order,(a,b)=>dist[b]-dist[a]);   // farthest first (back-to-front)
      for(let p=0;p<N;p++){ const i=order[p]; const f=p*5, o=p*STRIDE;
        instF[f]=src.cx[i]; instF[f+1]=src.cy[i]; instF[f+2]=src.cz[i]; instF[f+3]=src.s[i];
        instB[o+16]=src.r[i]; instB[o+17]=src.g[i]; instB[o+18]=src.b[i]; instB[o+19]=src.a[i];
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst);
    }

    // matrices (column-major)
    function perspective(fovy,asp,n,f){ const t=1/Math.tan(fovy/2); return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]; }
    function lookAt(e,c,up){ let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]]; let zl=Math.hypot(...z)||1; z=z.map(v=>v/zl);
      let x=[up[1]*z[2]-up[2]*z[1], up[2]*z[0]-up[0]*z[2], up[0]*z[1]-up[1]*z[0]]; let xl=Math.hypot(...x)||1; x=x.map(v=>v/xl);
      let y=[z[1]*x[2]-z[2]*x[1], z[2]*x[0]-z[0]*x[2], z[0]*x[1]-z[1]*x[0]];
      return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]), -(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]), -(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]), 1]; }

    function resize(){ const dpr=Math.min(devicePixelRatio||1,2); const w=cv.clientWidth||640, h=cv.clientHeight||420;
      cv.width=w*dpr; cv.height=h*dpr; gl.viewport(0,0,cv.width,cv.height); }
    addEventListener('resize', resize); resize();

    gl.useProgram(prog);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function frame(){
      if(needSort){ sortAndUpload(); needSort=false; }
      gl.clearColor(0.047,0.070,0.094,1); gl.clear(gl.COLOR_BUFFER_BIT);
      const cp=camPos();
      const view=lookAt(cp,target,[0,1,0]);
      const proj=perspective(45*Math.PI/180, cv.width/cv.height, 0.01, 100);
      gl.uniformMatrix4fv(uni('u_view'),false,view);
      gl.uniformMatrix4fv(uni('u_proj'),false,proj);
      gl.bindVertexArray(vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, N);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // ---- controls ----
    let drag=false, lx=0, ly=0;
    cv.style.touchAction='none';
    cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId);});
    cv.addEventListener('pointermove',e=>{ if(!drag)return; yaw-=(e.clientX-lx)*0.006; pitch+=(e.clientY-ly)*0.006;
      pitch=Math.max(-1.45,Math.min(1.45,pitch)); lx=e.clientX; ly=e.clientY; needSort=true; });
    cv.addEventListener('pointerup',()=>{drag=false;});
    cv.addEventListener('pointercancel',()=>{drag=false;});
    cv.addEventListener('wheel',e=>{ e.preventDefault(); distCam*=(1+Math.sign(e.deltaY)*0.08); distCam=Math.max(1.8,Math.min(11,distCam)); needSort=true; },{passive:false});
    // gentle auto-spin until first interaction
    let spun=false;
    cv.addEventListener('pointerdown',()=>{spun=true;});
    (function spin(){ if(!spun){ yaw+=0.0035; needSort=true; requestAnimationFrame(spin);} })();
  }
})();
