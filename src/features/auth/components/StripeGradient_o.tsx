import { useEffect, useRef } from "react";

/**
 * Exact port of stripe-gradient.js by thelevicole
 * https://github.com/thelevicole/stripe-gradient
 *
 * Uses WebGL + Ashima simplex noise GLSL shaders to reproduce the
 * animated mesh gradient seen on stripe.com and the official demo.
 */

// ─── Exact demo colors ────────────────────────────────────────────────────────
// Soft, light palette: pale sky → gentle mid-blue + blush #ec3336 accent
// const COLORS = ['#a960ee', '#ff333d', '#90e0ff', '#ffcb57'];
const COLORS = [
  "#c1d2eb",
  "#99b5df",
  "#6c93ce",
  "#86d7ffff",
  "#87cdf8ff",
  "#fc7173ff",
  "#9afcffff",
];
//

// ─── GLSL Sources (extracted verbatim from the minified plugin) ───────────────

const NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const BLEND_GLSL = `
vec3 blendNormal(vec3 base, vec3 blend) { return blend; }
vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
  return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}
`;

// Number of wave layers = colors - 1
const N = COLORS.length - 1;

const VERTEX_GLSL = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec2 uvNorm;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 resolution;
uniform float aspectRatio;
uniform float u_time;
uniform float u_shadow_power;
uniform float u_darken_top;
uniform vec4  u_active_colors;
uniform vec2  u_global_noiseFreq;
uniform float u_global_noiseSpeed;
uniform float u_vertDeform_incline;
uniform float u_vertDeform_offsetTop;
uniform float u_vertDeform_offsetBottom;
uniform vec2  u_vertDeform_noiseFreq;
uniform float u_vertDeform_noiseAmp;
uniform float u_vertDeform_noiseSpeed;
uniform float u_vertDeform_noiseFlow;
uniform float u_vertDeform_noiseSeed;
uniform vec3  u_baseColor;

// Wave layers (unrolled for ${N} layers)
uniform vec3  u_waveColor[${N}];
uniform vec2  u_waveNoiseFreq[${N}];
uniform float u_waveNoiseSpeed[${N}];
uniform float u_waveNoiseFlow[${N}];
uniform float u_waveNoiseSeed[${N}];
uniform float u_waveNoiseFloor[${N}];
uniform float u_waveNoiseCeil[${N}];

varying vec3 v_color;
varying vec2 v_uvNorm;

${NOISE_GLSL}
${BLEND_GLSL}

void main() {
  v_uvNorm = uvNorm;
  float time = u_time * u_global_noiseSpeed;
  // Rotate UV 45° so colour bands flow top-left → bottom-right
  float diagU = (uvNorm.x - uvNorm.y) * 0.70711;
  float diagV = (uvNorm.x + uvNorm.y) * 0.70711;
  vec2 noiseCoord = resolution * vec2(diagU, diagV) * u_global_noiseFreq;


  float tilt    = resolution.y / 2.0 * uvNorm.y;
  float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform_incline;
  float offset  = resolution.x / 2.0 * u_vertDeform_incline *
                  mix(u_vertDeform_offsetBottom, u_vertDeform_offsetTop, uv.y);

  float noise = snoise(vec3(
    noiseCoord.x * u_vertDeform_noiseFreq.x + time * u_vertDeform_noiseFlow,
    noiseCoord.y * u_vertDeform_noiseFreq.y,
    time * u_vertDeform_noiseSpeed + u_vertDeform_noiseSeed
  )) * u_vertDeform_noiseAmp;

  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);
  noise = max(0.0, noise);

  vec3 pos = vec3(
    position.x,
    position.y + tilt + incline + noise - offset,
    position.z
  );

  if (u_active_colors[0] == 1.0) { v_color = u_baseColor; }

  for (int i = 0; i < ${N}; i++) {
    if (u_active_colors[i + 1] == 1.0) {
      float wn = smoothstep(
        u_waveNoiseFloor[i],
        u_waveNoiseCeil[i],
        snoise(vec3(
          noiseCoord.x * u_waveNoiseFreq[i].x + time * u_waveNoiseFlow[i],
          noiseCoord.y * u_waveNoiseFreq[i].y,
          time * u_waveNoiseSpeed[i] + u_waveNoiseSeed[i]
        )) / 2.0 + 0.5
      );
      // Lower exponent = softer band edges (4.0 reads as a hard cut on one side of the stripe)
      v_color = blendNormal(v_color, u_waveColor[i], pow(wn, 2.6));
    }
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT_GLSL = `
precision mediump float;

uniform vec2  resolution;
uniform float u_darken_top;
uniform float u_shadow_power;

varying vec3 v_color;
varying vec2 v_uvNorm;

void main() {
  vec3 color = v_color;
  if (u_darken_top == 1.0) {
    vec2 stScr = gl_FragCoord.xy / resolution.xy;
    color.g -= pow(stScr.y + sin(-12.0) * stScr.x, u_shadow_power) * 0.4;
  }

  // Match LoginPage primary-50 (#f0f4fa) so edges dissolve into the page, not a mismatched white.
  vec3 pageBg = vec3(240.0 / 255.0, 244.0 / 255.0, 250.0 / 255.0);
  vec2 st = v_uvNorm * 0.5 + 0.5;

  // Soft general vignette (all sides)
  float edge = min(min(st.x, 1.0 - st.x), min(st.y, 1.0 - st.y));
  float vignette = smoothstep(0.0, 0.22, edge);

  // Extra falloff toward top-right where the stripe often reads as a hard line
  float tr = smoothstep(0.42, 0.98, st.x) * smoothstep(0.38, 0.98, st.y);
  float trFalloff = tr * tr * 0.55;

  float keep = clamp(vignette * (1.0 - trFalloff), 0.0, 1.0);
  color = mix(pageBg, color, keep);

  gl_FragColor = vec4(color, 1.0);
}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255,
  ];
}

function makeOrtho(w: number, h: number): number[] {
  return [
    2 / w,
    0,
    0,
    0,
    0,
    2 / h,
    0,
    0,
    0,
    0,
    2 / (-2000 - 2000),
    0,
    0,
    0,
    0,
    1,
  ];
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StripeGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Explicitly check for WebGL support
    // alpha:false + page-colored clear avoids dark fringe at viewport edges (transparent black + premultiplied quirks).
    const gl =
      canvas.getContext("webgl", {
        antialias: true,
        alpha: false,
        premultipliedAlpha: true,
      }) || (canvas.getContext("experimental-webgl") as WebGLRenderingContext);

    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    // ── Compile program ────────────────────────────────────────────────
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_GLSL);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_GLSL);

    if (!vs || !fs) return;

    const prg = gl.createProgram();
    if (!prg) return;

    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prg));
      return;
    }

    gl.useProgram(prg);

    // ── Helpers ────────────────────────────────────────────────────────
    const uloc = (n: string) => gl.getUniformLocation(prg, n);
    const aloc = (n: string) => gl.getAttribLocation(prg, n);
    const u1f = (n: string, v: number) => gl.uniform1f(uloc(n), v);
    const u2fv = (n: string, v: number[]) => gl.uniform2fv(uloc(n), v);
    const u3fv = (n: string, v: number[]) => gl.uniform3fv(uloc(n), v);
    const u4fv = (n: string, v: number[]) => gl.uniform4fv(uloc(n), v);
    const umtx = (n: string, v: number[]) =>
      gl.uniformMatrix4fv(uloc(n), false, v);

    // ── Parse colors ───────────────────────────────────────────────────
    const cols = COLORS.map(hexToVec3);
    const seed = 5;
    const angle = Math.PI / 4; // 45° → top-left to bottom-right
    const freqX = 14e-5,
      freqY = 29e-5;

    // ── Geometry builders ──────────────────────────────────────────────
    let W = 0,
      H = 0,
      xSeg = 0,
      ySeg = 0;
    const density = [0.06, 0.16];

    const posBuf = gl.createBuffer()!;
    const uvBuf = gl.createBuffer()!;
    const uvnBuf = gl.createBuffer()!;
    const idxBuf = gl.createBuffer()!;

    function buildMesh(w: number, h: number, xs: number, ys: number) {
      const vc = (xs + 1) * (ys + 1);
      const pos = new Float32Array(3 * vc);
      const uv = new Float32Array(2 * vc);
      const uvn = new Float32Array(2 * vc);
      const idx = new Uint16Array(6 * xs * ys);

      for (let j = 0; j <= ys; j++) {
        for (let i = 0; i <= xs; i++) {
          const v = j * (xs + 1) + i;
          const pu = i / xs,
            pv = 1 - j / ys;
          uv[2 * v] = pu;
          uv[2 * v + 1] = pv;
          uvn[2 * v] = pu * 2 - 1;
          uvn[2 * v + 1] = pv * 2 - 1;
          pos[3 * v] = -w / 2 + i * (w / xs);
          pos[3 * v + 1] = -(-h / 2 + j * (h / ys));
          pos[3 * v + 2] = 0;
        }
      }
      for (let j = 0; j < ys; j++) {
        for (let i = 0; i < xs; i++) {
          const q = j * xs + i;
          const r = j * (xs + 1) + i;
          idx[6 * q] = r;
          idx[6 * q + 1] = r + 1 + xs;
          idx[6 * q + 2] = r + 1;
          idx[6 * q + 3] = r + 1;
          idx[6 * q + 4] = r + 1 + xs;
          idx[6 * q + 5] = r + 2 + xs;
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvnBuf);
      gl.bufferData(gl.ARRAY_BUFFER, uvn, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

      return idx.length;
    }

    function bindAttribs() {
      const posLoc = aloc("position");
      const uvLoc = aloc("uv");
      const uvnLoc = aloc("uvNorm");

      if (posLoc !== -1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      }
      if (uvLoc !== -1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);
      }
      if (uvnLoc !== -1) {
        gl.bindBuffer(gl.ARRAY_BUFFER, uvnBuf);
        gl.enableVertexAttribArray(uvnLoc);
        gl.vertexAttribPointer(uvnLoc, 2, gl.FLOAT, false, 0, 0);
      }
    }

    // ── Static uniforms ────────────────────────────────────────────────
    function setStaticUniforms(w: number, h: number) {
      umtx("modelViewMatrix", [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      umtx("projectionMatrix", makeOrtho(w, h));
      u2fv("resolution", [w, h]);
      u1f("aspectRatio", w / h);
      u1f("u_darken_top", 0);
      u1f("u_shadow_power", w < 600 ? 5 : 6);
      u4fv("u_active_colors", [1, 1, 1, 1]);
      u2fv("u_global_noiseFreq", [freqX, freqY]);
      u1f("u_global_noiseSpeed", 5e-6);
      u1f("u_vertDeform_incline", Math.sin(angle) / Math.cos(angle) || 0);
      u1f("u_vertDeform_offsetTop", -0.5);
      u1f("u_vertDeform_offsetBottom", -0.5);
      u2fv("u_vertDeform_noiseFreq", [3, 4]);
      u1f("u_vertDeform_noiseAmp", 320);
      u1f("u_vertDeform_noiseSpeed", 10);
      u1f("u_vertDeform_noiseFlow", 3);
      u1f("u_vertDeform_noiseSeed", seed);
      u3fv("u_baseColor", cols[0]);

      // Wave layers
      const waveColors: number[] = [];
      const waveNoiseFreqs: number[] = [];
      const waveNoiseSpeeds: number[] = [];
      const waveNoiseFlows: number[] = [];
      const waveNoiseSeeds: number[] = [];
      const waveNoiseFloors: number[] = [];
      const waveNoiseCeils: number[] = [];

      for (let i = 1; i < cols.length; i++) {
        waveColors.push(...cols[i]);
        waveNoiseFreqs.push(2 + i / cols.length, 3 + i / cols.length);
        waveNoiseSpeeds.push(11 + 0.3 * i);
        waveNoiseFlows.push(6.5 + 0.3 * i);
        waveNoiseSeeds.push(seed + 10 * i);
        waveNoiseFloors.push(0.1);
        waveNoiseCeils.push(0.63 + 0.07 * i);
      }
      gl.uniform3fv(uloc("u_waveColor"), waveColors);
      gl.uniform2fv(uloc("u_waveNoiseFreq"), waveNoiseFreqs);
      gl.uniform1fv(uloc("u_waveNoiseSpeed"), waveNoiseSpeeds);
      gl.uniform1fv(uloc("u_waveNoiseFlow"), waveNoiseFlows);
      gl.uniform1fv(uloc("u_waveNoiseSeed"), waveNoiseSeeds);
      gl.uniform1fv(uloc("u_waveNoiseFloor"), waveNoiseFloors);
      gl.uniform1fv(uloc("u_waveNoiseCeil"), waveNoiseCeils);
    }

    // ── Resize ─────────────────────────────────────────────────────────
    let idxCount = 0;
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, Math.round(canvas.offsetWidth));
      const cssH = Math.max(1, Math.round(canvas.offsetHeight));
      const bufW = Math.max(1, Math.round(cssW * dpr));
      const bufH = Math.max(1, Math.round(cssH * dpr));
      canvas.width = bufW;
      canvas.height = bufH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      W = cssW;
      H = cssH;
      if (W === 0 || H === 0) return;

      gl.viewport(0, 0, bufW, bufH);
      xSeg = Math.ceil(W * density[0]);
      ySeg = Math.ceil(H * density[1]);
      idxCount = buildMesh(W, H, xSeg, ySeg);
      bindAttribs();
      setStaticUniforms(W, H);
    }

    // ── Animaton ───────────────────────────────────────────────────────
    let time = 1253106; // matches plugin's initial time value
    let lastFrame = performance.now();

    function animate(now: number) {
      const delta = now - lastFrame;
      lastFrame = now;

      // Cap delta to avoid jumps on tab switch
      time += Math.min(delta, 100);

      u1f("u_time", time);
      // Match LoginPage primary-50 (#f0f4fa) — never clear to transparent black (shows as a black border on some GPUs).
      gl.clearColor(240 / 255, 244 / 255, 250 / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.drawElements(gl.TRIANGLES, idxCount, gl.UNSIGNED_SHORT, 0);
      rafRef.current = requestAnimationFrame(animate);
    }

    // ── Boot ───────────────────────────────────────────────────────────
    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(uvBuf);
      gl.deleteBuffer(uvnBuf);
      gl.deleteBuffer(idxBuf);
      gl.deleteProgram(prg);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-0 overflow-hidden pointer-events-none bg-primary-50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block bg-primary-50"
        aria-hidden="true"
      />
      {/* High-compatibility CSS overlay mask */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          // Match primary-50 (#f0f4fa) + radial at top-right to soften the stripe cutoff.
          background:
            "radial-gradient(ellipse 95% 70% at 92% 6%, rgba(240, 244, 250, 0.92) 0%, rgba(240, 244, 250, 0.45) 38%, rgba(240, 244, 250, 0) 62%), " +
            "linear-gradient(135deg, rgba(240, 244, 250, 1) 0%, rgba(240, 244, 250, 1) 22%, rgba(240, 244, 250, 0.78) 30%, rgba(240, 244, 250, 0.12) 42%, rgba(240, 244, 250, 0) 52%, rgba(240, 244, 250, 0) 62%, rgba(240, 244, 250, 0.1) 70%, rgba(240, 244, 250, 0.42) 80%, rgba(240, 244, 250, 0.78) 90%, rgba(240, 244, 250, 1) 100%)",
        }}
      />
    </div>
  );
}
