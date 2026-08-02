import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

#define PI 3.14159265358979323846

// Simplex noise
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
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  
  float t = uTime * uSpeed * 0.35;
  
  // Base deep background canvas
  vec3 bgColor = vec3(0.035, 0.039, 0.055);
  
  // Vibrant Harmonic Palette
  vec3 electricCyan   = vec3(0.12, 0.78, 0.98);
  vec3 deepBlue       = vec3(0.15, 0.42, 0.95);
  vec3 neonViolet     = vec3(0.62, 0.30, 0.98);
  vec3 magentaPink    = vec3(0.88, 0.25, 0.72);
  vec3 coreWhiteGlow  = vec3(0.85, 0.95, 1.00);
  
  // Mouse interaction
  vec2 mouseNorm = uMouse / uResolution.xy;
  float mouseDist = distance(uv, mouseNorm);
  float mouseWave = exp(-mouseDist * 4.0) * 0.06;

  // ── Full-Screen Smooth Parabolic Ribbon ──
  // The arch spans the ENTIRE width with generous glow spread
  float xNormalized = (uv.x - 0.5) * 2.0;
  float baseArch = 0.30 + 0.32 * (xNormalized * xNormalized); 

  // Organic motion waves
  float waveNoise1 = snoise(vec2(uv.x * 2.0 + t * 0.3, t * 0.25)) * 0.12;
  float waveNoise2 = snoise(vec2(uv.x * 4.0 - t * 0.35, uv.y * 1.5)) * 0.05;
  float primaryWaveY = baseArch + waveNoise1 + waveNoise2 + mouseWave;

  // Layer 1: Primary Ribbon — wider glow spread for full-screen coverage
  float dist1 = abs(uv.y - primaryWaveY);
  float glow1 = exp(-dist1 * 5.0) * 1.2;       // wider spread (was 7.0)
  float softCore1 = exp(-dist1 * 16.0) * 0.9;   // softer core (was 20.0)

  // Layer 2: Secondary Echo Wave
  float waveNoise3 = snoise(vec2(uv.x * 2.6 - t * 0.2, t * 0.3 + 1.5)) * 0.14;
  float secondaryWaveY = baseArch - 0.08 + waveNoise3;
  float dist2 = abs(uv.y - secondaryWaveY);
  float glow2 = exp(-dist2 * 4.5) * 1.0;        // wider (was 6.0)
  float softCore2 = exp(-dist2 * 14.0) * 0.7;   // softer (was 18.0)

  // Layer 3: Deep Atmospheric Ambient — fills corners
  float waveNoise4 = snoise(vec2(uv.x * 1.4 + t * 0.15, uv.y * 1.2 - t * 0.1)) * 0.20;
  float ambientWaveY = baseArch + 0.06 + waveNoise4;
  float dist3 = abs(uv.y - ambientWaveY);
  float ambientGlow = exp(-dist3 * 2.5) * 0.8;  // very wide (was 3.8)

  // Dynamic Horizontal Color Blending
  float colorGradient = smoothstep(0.0, 1.0, uv.x + 0.15 * sin(t + uv.y * 2.0));
  vec3 ribbonColorA = mix(electricCyan, deepBlue, colorGradient);
  vec3 ribbonColorB = mix(neonViolet, magentaPink, 1.0 - colorGradient);
  vec3 mainRibbonColor = mix(ribbonColorA, ribbonColorB, smoothstep(primaryWaveY - 0.15, primaryWaveY + 0.15, uv.y));

  // Volumetric Lighting Composition
  vec3 finalColor = bgColor;
  float intensityFactor = uIntensity;

  finalColor += mainRibbonColor * glow1 * intensityFactor;
  finalColor += coreWhiteGlow * softCore1 * 0.4 * intensityFactor;

  finalColor += mix(deepBlue, neonViolet, colorGradient) * glow2 * 0.8 * intensityFactor;
  finalColor += coreWhiteGlow * softCore2 * 0.3 * intensityFactor;

  finalColor += mix(neonViolet, deepBlue, 0.5) * ambientGlow * 0.5 * intensityFactor;

  // ── Corner & Edge Ambient Fill ──
  // Subtle blue/violet ambient in ALL corners so nothing is pure black
  float cornerBL = smoothstep(0.6, 0.0, length(uv - vec2(0.0, 0.0)));
  float cornerBR = smoothstep(0.6, 0.0, length(uv - vec2(1.0, 0.0)));
  float cornerTL = smoothstep(0.5, 0.0, length(uv - vec2(0.0, 1.0)));
  float cornerTR = smoothstep(0.5, 0.0, length(uv - vec2(1.0, 1.0)));
  
  finalColor += deepBlue * cornerBL * 0.12 * intensityFactor;
  finalColor += neonViolet * cornerBR * 0.10 * intensityFactor;
  finalColor += deepBlue * cornerTL * 0.08 * intensityFactor;
  finalColor += neonViolet * cornerTR * 0.08 * intensityFactor;

  // Bottom ambient reflection — spans full width
  float bottomAmbient = smoothstep(0.5, 0.0, uv.y) * 0.20;
  finalColor += deepBlue * bottomAmbient * intensityFactor;

  // ── Dot Grid (subtle, spans full screen) ──
  float gridSize = 28.0;
  vec2 gridCoord = gl_FragCoord.xy;
  vec2 gridOffset = mod(gridCoord, gridSize) - vec2(gridSize * 0.5);
  float dotDistance = length(gridOffset);
  float dotRadius = 1.0;
  
  float dotShape = smoothstep(dotRadius + 0.4, dotRadius - 0.4, dotDistance);
  float totalIllumination = clamp((glow1 + glow2 * 0.7 + ambientGlow * 0.5), 0.0, 1.5);
  float dotBrightness = mix(0.06, 0.45, clamp(totalIllumination, 0.0, 1.0));
  vec3 dotTint = mix(vec3(0.3, 0.35, 0.50), vec3(0.9, 0.95, 1.0), clamp(totalIllumination, 0.0, 1.0));
  
  finalColor += dotTint * dotShape * dotBrightness;

  // Soft top fade for legible text
  float topReadability = smoothstep(1.0, 0.75, uv.y);
  finalColor = mix(finalColor, finalColor * 0.85, topReadability * 0.3);

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

/**
 * Full-viewport WebGL background rendered via a React Portal
 * into document.body — immune to ancestor transform/opacity
 * breaking position:fixed (caused by framer-motion wrappers).
 */
export function StitchWaveBackground({
  className = "",
  speed = 0.85,
  intensity = 0.85,
  enableMouse = true,
}: StitchWaveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let gl: WebGLRenderingContext | null = null;
    let animationFrameId: number;

    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer = new Renderer({
        dpr,
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
        if (!renderer || !gl) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        program.uniforms.uResolution.value = [w, h];
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

      const startTime = performance.now();

      const render = () => {
        if (!renderer || !gl) return;

        const elapsedTime = (performance.now() - startTime) * 0.001;
        program.uniforms.uTime.value = elapsedTime;

        if (enableMouse) {
          currentMouseX += (targetMouseX - currentMouseX) * 0.04;
          currentMouseY += (targetMouseY - currentMouseY) * 0.04;
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
          gl.canvas.parentElement.removeChild(gl.canvas);
        }
      };
    } catch (err) {
      console.warn("WebGL wave background initialization failed:", err);
    }
  }, [speed, intensity, enableMouse]);

  // Render via Portal into document.body so no ancestor transform
  // (framer-motion, etc.) can break position:fixed
  const bgElement = (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#090a0e",
      }}
      aria-hidden="true"
    />
  );

  return createPortal(bgElement, document.body);
}

export default StitchWaveBackground;
