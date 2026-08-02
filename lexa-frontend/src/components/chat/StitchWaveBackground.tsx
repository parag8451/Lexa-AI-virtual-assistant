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
  
  float t = uTime * uSpeed * 0.28;
  
  // Base deep background canvas
  vec3 bgColor = vec3(0.030, 0.034, 0.046);
  
  // Harmonious Soft Palette (Restrained, elegant, non-blinding)
  vec3 electricCyan   = vec3(0.12, 0.70, 0.92);
  vec3 deepBlue       = vec3(0.16, 0.38, 0.88);
  vec3 neonViolet     = vec3(0.55, 0.28, 0.90);
  vec3 magentaPink    = vec3(0.78, 0.24, 0.65);
  vec3 coreWhiteGlow  = vec3(0.85, 0.92, 0.98);
  
  // ── Realistic Slow "On and Off" Breathing Cycle (~14-16s period) ──
  float slowCycle = 0.5 + 0.5 * sin(t * 0.38);
  // Smoothly pulses between a dim, calm black rest state (0.28) and a glowing state (0.92)
  float onOffBreathing = 0.28 + 0.64 * smoothstep(0.12, 0.88, slowCycle);
  
  // Dynamic black fade wave
  float blackFadeWave = 0.82 + 0.18 * sin(t * 0.22 + uv.x * 1.2);
  
  // Startup soft power-on ramp
  float powerOn = smoothstep(0.0, 2.0, uTime);

  // Mouse subtle interaction
  vec2 mouseNorm = uMouse / uResolution.xy;
  float mouseDist = distance(uv, mouseNorm);
  float mouseWave = exp(-mouseDist * 3.5) * 0.05;

  // ── Full-Screen Smooth Wave Geometry ──
  float xNormalized = (uv.x - 0.5) * 2.0;
  float baseArch = 0.28 + 0.30 * (xNormalized * xNormalized); 

  // Organic motion waves
  float waveNoise1 = snoise(vec2(uv.x * 1.8 + t * 0.25, t * 0.2)) * 0.10;
  float waveNoise2 = snoise(vec2(uv.x * 3.6 - t * 0.28, uv.y * 1.4)) * 0.04;
  float primaryWaveY = baseArch + waveNoise1 + waveNoise2 + mouseWave;

  // Layer 1: Primary Ribbon — softened glow
  float dist1 = abs(uv.y - primaryWaveY);
  float glow1 = exp(-dist1 * 5.2) * 0.85 * onOffBreathing;
  float softCore1 = exp(-dist1 * 16.0) * 0.45 * onOffBreathing;

  // Layer 2: Secondary Echo Wave
  float waveNoise3 = snoise(vec2(uv.x * 2.4 - t * 0.18, t * 0.25 + 1.2)) * 0.11;
  float secondaryWaveY = baseArch - 0.07 + waveNoise3;
  float dist2 = abs(uv.y - secondaryWaveY);
  float glow2 = exp(-dist2 * 4.6) * 0.65 * (1.2 - onOffBreathing * 0.3);
  float softCore2 = exp(-dist2 * 14.0) * 0.30 * (1.2 - onOffBreathing * 0.3);

  // Layer 3: Deep Atmospheric Ambient Fill
  float waveNoise4 = snoise(vec2(uv.x * 1.2 + t * 0.12, uv.y * 1.0 - t * 0.08)) * 0.16;
  float ambientWaveY = baseArch + 0.05 + waveNoise4;
  float dist3 = abs(uv.y - ambientWaveY);
  float ambientGlow = exp(-dist3 * 2.6) * 0.55 * blackFadeWave;

  // Horizontal Color Gradient
  float colorGradient = smoothstep(0.0, 1.0, uv.x + 0.15 * sin(t * 0.6 + uv.y * 1.8));
  vec3 ribbonColorA = mix(electricCyan, deepBlue, colorGradient);
  vec3 ribbonColorB = mix(neonViolet, magentaPink, 1.0 - colorGradient);
  vec3 mainRibbonColor = mix(ribbonColorA, ribbonColorB, smoothstep(primaryWaveY - 0.18, primaryWaveY + 0.18, uv.y));

  // Center column readability attenuation (makes center chat area softer while edges remain vibrant)
  float centerDist = abs(uv.x - 0.5);
  float centerSoftening = mix(0.70, 1.0, smoothstep(0.05, 0.48, centerDist));

  // Volumetric Lighting Composition
  vec3 finalColor = bgColor;
  float totalIntensity = uIntensity * powerOn * blackFadeWave * centerSoftening;

  finalColor += mainRibbonColor * glow1 * totalIntensity;
  finalColor += coreWhiteGlow * softCore1 * 0.22 * totalIntensity;

  finalColor += mix(deepBlue, neonViolet, colorGradient) * glow2 * 0.55 * totalIntensity;
  finalColor += coreWhiteGlow * softCore2 * 0.18 * totalIntensity;

  finalColor += mix(neonViolet, deepBlue, 0.5) * ambientGlow * 0.35 * totalIntensity;

  // ── Corner & Edge Ambient Fill ──
  float cornerBL = smoothstep(0.7, 0.0, length(uv - vec2(0.0, 0.0)));
  float cornerBR = smoothstep(0.7, 0.0, length(uv - vec2(1.0, 0.0)));
  float cornerTL = smoothstep(0.6, 0.0, length(uv - vec2(0.0, 1.0)));
  float cornerTR = smoothstep(0.6, 0.0, length(uv - vec2(1.0, 1.0)));
  
  finalColor += deepBlue * cornerBL * 0.10 * totalIntensity;
  finalColor += neonViolet * cornerBR * 0.09 * totalIntensity;
  finalColor += deepBlue * cornerTL * 0.06 * totalIntensity;
  finalColor += neonViolet * cornerTR * 0.06 * totalIntensity;

  // Bottom subtle ambient reflection
  float bottomAmbient = smoothstep(0.45, 0.0, uv.y) * 0.14;
  finalColor += deepBlue * bottomAmbient * totalIntensity;

  // ── Subtle Dot Matrix (Dim, delicate, non-interfering) ──
  float gridSize = 32.0;
  vec2 gridCoord = gl_FragCoord.xy;
  vec2 gridOffset = mod(gridCoord, gridSize) - vec2(gridSize * 0.5);
  float dotDistance = length(gridOffset);
  float dotRadius = 0.85;
  
  float dotShape = smoothstep(dotRadius + 0.3, dotRadius - 0.3, dotDistance);
  float totalIllumination = clamp((glow1 + glow2 * 0.6 + ambientGlow * 0.4), 0.0, 1.0);
  float dotBrightness = mix(0.02, 0.16, totalIllumination) * powerOn * onOffBreathing;
  vec3 dotTint = mix(vec3(0.25, 0.30, 0.45), vec3(0.75, 0.85, 0.95), totalIllumination);
  
  finalColor += dotTint * dotShape * dotBrightness;

  // Top header readability fade
  float topReadability = smoothstep(1.0, 0.70, uv.y);
  finalColor = mix(finalColor, finalColor * 0.82, topReadability * 0.35);

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

/**
 * Full-viewport WebGL background rendered via a React Portal
 * into document.body — immune to ancestor transform/opacity
 * with realistic slow on/off breathing & black fade dynamics.
 */
export function StitchWaveBackground({
  className = "",
  speed = 0.75,
  intensity = 0.55,
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
  // can break position:fixed
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
