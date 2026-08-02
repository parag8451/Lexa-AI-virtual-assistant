import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

interface StitchWaveBackgroundProps {
  className?: string;
  speed?: number;
  intensity?: number;
  enableMouse?: boolean;
}

const VERT_SHADER = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uSpeed;
uniform float uIntensity;

varying vec2 vUv;

#define PI 3.14159265359

// Simplex / Perlin noise helpers
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  
  // Normalized coordinates centered
  vec2 p = uv * 2.0 - 1.0;
  p.x *= aspect;

  float t = uTime * uSpeed * 0.4;
  
  // Base deep background color (#0c0d12)
  vec3 bgColor = vec3(0.047, 0.051, 0.071);
  
  // Vibrant Google Stitch Palette
  vec3 purpleViolet = vec3(0.65, 0.35, 0.98); // #A855F7
  vec3 deepViolet   = vec3(0.48, 0.22, 0.88); // #7C3AED
  vec3 stitchBlue   = vec3(0.24, 0.56, 0.98); // #38BDF8 / #4285F4
  vec3 cyanGlow     = vec3(0.18, 0.78, 0.95); // #22D3EE
  vec3 magentaFlare = vec3(0.85, 0.28, 0.75); // #D946EF

  // Mouse interaction influence
  vec2 mouseNorm = (uMouse / uResolution.xy) * 2.0 - 1.0;
  mouseNorm.x *= aspect;
  float mouseDist = length(p - mouseNorm);
  float mouseEffect = smoothstep(1.5, 0.0, mouseDist) * 0.08;

  // ── Stitch Arch Curved Horizon Geometry ──
  // The iconic curved parabolic ribbon that spans from bottom-center arching upward to the sides
  float archCurve = 0.55 - 0.45 * pow(sin(uv.x * PI), 1.2);
  
  // Layer 1: Primary Neon Violet/Cyan Wave Ribbon
  float n1 = snoise(vec2(uv.x * 2.5 + t * 0.3, t * 0.2)) * 0.12;
  float n2 = snoise(vec2(uv.x * 5.0 - t * 0.4, uv.y * 2.0)) * 0.06;
  float wave1Pos = archCurve + n1 + n2 + mouseEffect;
  
  float dist1 = abs(uv.y - wave1Pos);
  float glow1 = exp(-dist1 * 6.5) * 1.35;
  float core1 = exp(-dist1 * 22.0) * 1.8;

  // Layer 2: Secondary Supporting Fluid Wave (Cyan/Blue)
  float n3 = snoise(vec2(uv.x * 3.2 - t * 0.25, t * 0.35 + 2.0)) * 0.14;
  float wave2Pos = archCurve - 0.08 + n3;
  float dist2 = abs(uv.y - wave2Pos);
  float glow2 = exp(-dist2 * 5.5) * 1.1;
  float core2 = exp(-dist2 * 18.0) * 1.4;

  // Layer 3: Deep Atmospheric Ambient Flow
  float n4 = snoise(vec2(uv.x * 1.8 + t * 0.15, uv.y * 1.5 - t * 0.1)) * 0.2;
  float dist3 = abs(uv.y - (archCurve + 0.05 + n4));
  float ambientGlow = exp(-dist3 * 3.5) * 0.8;

  // Color composition along the x-axis & layers
  float colorShift = sin(uv.x * PI + t * 0.5) * 0.5 + 0.5;
  vec3 ribbonColor1 = mix(purpleViolet, magentaFlare, colorShift);
  vec3 ribbonColor2 = mix(stitchBlue, cyanGlow, 1.0 - colorShift);
  vec3 blendRibbon = mix(ribbonColor1, ribbonColor2, smoothstep(wave1Pos - 0.1, wave1Pos + 0.1, uv.y));

  // Volumetric combination
  vec3 finalColor = bgColor;
  finalColor += blendRibbon * (glow1 * 0.85 + core1 * 1.1) * uIntensity;
  finalColor += ribbonColor2 * (glow2 * 0.7 + core2 * 0.9) * uIntensity;
  finalColor += deepViolet * ambientGlow * 0.5 * uIntensity;

  // Bottom corner ambient flare
  float bottomFlare = smoothstep(1.0, 0.2, uv.y) * (0.15 + 0.05 * sin(t));
  finalColor += stitchBlue * bottomFlare * 0.3;

  // ── Dot Matrix Grid (Catching the light) ──
  vec2 gridCoord = gl_FragCoord.xy;
  float gridSize = 32.0;
  vec2 gridPos = mod(gridCoord, gridSize) - vec2(gridSize * 0.5);
  float dotDist = length(gridPos);
  float dotRadius = 1.25;
  
  // Base dot brightness + illuminated dots where the light ribbon passes
  float dotMask = smoothstep(dotRadius, dotRadius - 0.8, dotDist);
  float localLight = max(glow1, max(glow2, ambientGlow));
  float dotAlpha = mix(0.12, 0.45, clamp(localLight * 1.2, 0.0, 1.0));
  
  vec3 dotColor = mix(vec3(0.6, 0.65, 0.75), vec3(1.0, 1.0, 1.0), localLight);
  finalColor += dotColor * dotMask * dotAlpha;

  // Vignette & top gradient to preserve readability of top content
  float topVignette = smoothstep(1.0, 0.4, uv.y);
  float vignette = smoothstep(1.8, 0.5, length(p * 0.7));
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function StitchWaveBackground({
  className = "",
  speed = 1.0,
  intensity = 1.0,
  enableMouse = true,
}: StitchWaveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let gl: WebGLRenderingContext | null = null;
    let animationFrameId: number;

    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });

      gl = renderer.gl;
      if (!gl) return;

      container.appendChild(gl.canvas);
      gl.canvas.style.position = "absolute";
      gl.canvas.style.inset = "0";
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      gl.canvas.style.display = "block";
      gl.canvas.style.pointerEvents = "none";

      const geometry = new Triangle(gl);

      const program = new Program(gl, {
        vertex: VERT_SHADER,
        fragment: FRAG_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [window.innerWidth, window.innerHeight] },
          uMouse: { value: [window.innerWidth / 2, window.innerHeight / 2] },
          uSpeed: { value: speed },
          uIntensity: { value: intensity },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      const handleResize = () => {
        if (!container || !renderer || !gl) return;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        renderer.setSize(width, height);
        program.uniforms.uResolution.value = [width, height];
      };

      handleResize();
      window.addEventListener("resize", handleResize, { passive: true });

      let targetMouseX = window.innerWidth / 2;
      let targetMouseY = window.innerHeight / 2;
      let currentMouseX = targetMouseX;
      let currentMouseY = targetMouseY;

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableMouse) return;
        targetMouseX = e.clientX;
        targetMouseY = window.innerHeight - e.clientY;
      };

      if (enableMouse) {
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
      }

      let startTime = performance.now();

      const render = () => {
        if (!renderer || !gl) return;

        const elapsedTime = (performance.now() - startTime) * 0.001;
        program.uniforms.uTime.value = elapsedTime;

        if (enableMouse) {
          currentMouseX += (targetMouseX - currentMouseX) * 0.05;
          currentMouseY += (targetMouseY - currentMouseY) * 0.05;
          program.uniforms.uMouse.value = [currentMouseX, currentMouseY];
        }

        renderer.render({ scene: mesh });
        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        if (enableMouse) {
          window.removeEventListener("mousemove", handleMouseMove);
        }
        if (gl && gl.canvas && gl.canvas.parentElement) {
          gl.canvas.parentElement.removeChild(gl.canvas.parentElement);
        }
      };
    } catch (err) {
      console.warn("WebGL Stitch Wave background initialization failed:", err);
    }
  }, [speed, intensity, enableMouse]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0, backgroundColor: "#0c0d12" }}
      aria-hidden="true"
    />
  );
}

export default StitchWaveBackground;
