"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The landing page's WebGL cloudscape (same fbm shader + brand palette),
 * ported as a fixed, blurred background band along the bottom of the dashboard.
 * Rendered at low resolution and fps-capped (it's blurred anyway) and paused
 * when the tab is hidden, so it stays cheap.
 */
const VERT = `attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colorBottom;
uniform vec3 u_colorMid;
uniform vec3 u_colorTop;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p); vec2 f=fract(p);
  f=f*f*f*(f*(f*6.0-15.0)+10.0);
  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0; float a=0.5; mat2 r=mat2(0.8,0.6,-0.6,0.8);
  for(int i=0;i<5;i++){ v+=a*noise(p); p=r*p*2.01+vec2(17.1,9.3); a*=0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (uv-0.5)*vec2(u_resolution.x/max(u_resolution.y,1.0),1.0);
  p = mat2(0.96,0.28,-0.28,0.96)*p;
  vec2 wind = vec2(u_time*0.085, u_time*0.024);
  float large = fbm(p*0.75 - wind*0.45);
  float midN = fbm(p*1.5 - wind + 3.7);
  float fine = fbm(p*2.6 - wind*1.2 + 8.0);
  float n = large*0.5 + midN*0.35 + fine*0.15;
  vec3 sky = mix(u_colorMid, u_colorBottom, uv.y*0.55);
  float cover = smoothstep(0.28,0.5,n);
  float peaks = smoothstep(0.42,0.65,n);
  float clouds = clamp(cover*0.9 + peaks*0.7, 0.0, 1.0);
  clouds *= mix(0.55, 1.0, smoothstep(0.0,0.45,uv.y));
  gl_FragColor = vec4(mix(sky, u_colorTop, clouds), 1.0);
}
`;

const COLORS = {
  bottom: [31 / 255, 87 / 255, 240 / 255], // #1f57f0
  mid: [79 / 255, 139 / 255, 255 / 255], // #4f8bff
  top: [1, 1, 1], // cloud highlights
};
const SCALE = 0.3; // render at 30% — heavily blurred, so detail is invisible
const FRAME_MS = 1000 / 12; // 12fps is plenty for a soft, slow drift

export default function CloudsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const firstDrawn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    gl.uniform3f(gl.getUniformLocation(program, "u_colorBottom"), ...COLORS.bottom as [number, number, number]);
    gl.uniform3f(gl.getUniformLocation(program, "u_colorMid"), ...COLORS.mid as [number, number, number]);
    gl.uniform3f(gl.getUniformLocation(program, "u_colorTop"), ...COLORS.top as [number, number, number]);

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!firstDrawn.current) {
        firstDrawn.current = true;
        setLoaded(true); // fade/blur the clouds in once the first frame exists
      }
    };

    // Respect reduced-motion (and save power): render a single static frame.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      draw(0);
      return () => {
        window.removeEventListener("resize", resize);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (now - last < FRAME_MS) return;
      last = now;
      draw((now - t0) / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[70vh]"
      style={{
        // Low-res render already softens the clouds; keep the CSS blur light
        // so it isn't re-run over a huge area every frame. It starts extra-blurred
        // and transparent, then eases in once the first frame is drawn.
        filter: loaded ? "blur(12px)" : "blur(34px)",
        opacity: loaded ? 0.6 : 0,
        transition: "opacity 900ms ease, filter 900ms ease",
        maskImage: "linear-gradient(to top, #000 15%, transparent 92%)",
        WebkitMaskImage: "linear-gradient(to top, #000 15%, transparent 92%)",
      }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
